import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, UserRole, Prisma } from '@prisma/client';
import { KdsGateway } from '../kds/kds.gateway';
import { AccountingService } from '../accounting/accounting.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private kdsGateway: KdsGateway,
    private accountingService: AccountingService,
  ) {}

  async create(data: any) {
    const {
      items,
      tableId,
      customerName,
      customerPhone,
      customerEmail,
      orderType,
      notes,
      branchId,
      userId,
      customerId,
    } = data;

    if (!branchId) {
      throw new BadRequestException('Cabang (branchId) diperlukan');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Order harus memiliki minimal 1 item');
    }

    // Get branch for tax/service charge rates (PRD 4.1)
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch) {
      throw new NotFoundException('Cabang tidak ditemukan');
    }

    // Calculate totals with branch price overrides (PRD 3.7)
    let subtotal = 0;
    const processedItems: any[] = [];

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: { ingredients: { include: { ingredient: true } } },
      });
      if (!product) {
        throw new NotFoundException(`Produk ${item.productId} tidak ditemukan`);
      }

      // Check for branch price override (PRD 3.7)
      const priceOverride = await this.prisma.branchPriceOverride.findFirst({
        where: { branchId, productId: product.id, isActive: true },
      });
      const itemPrice = priceOverride
        ? Number(priceOverride.sellingPrice)
        : Number(product.sellingPrice);

      const itemTotal = itemPrice * (item.quantity || 1);
      subtotal += itemTotal;

      processedItems.push({
        productId: item.productId,
        name: item.name || product.name,
        price: new Prisma.Decimal(itemPrice),
        quantity: item.quantity || 1,
        notes: item.notes,
        station: item.station || product.station,
      });
    }

    const taxRate = Number(branch.taxRate);
    const serviceChargeRate = Number(branch.serviceCharge);
    const taxAmount = subtotal * taxRate;
    const serviceChargeAmount = subtotal * serviceChargeRate;
    const totalAmount = subtotal + taxAmount + serviceChargeAmount;

    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `INV-${todayStr}-${randNum}`;

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          branchId,
          orderNumber,
          userId,
          customerId,
          tableId,
          customerName,
          customerPhone,
          customerEmail,
          orderType: orderType || 'DINE_IN',
          notes,
          subtotal: new Prisma.Decimal(subtotal),
          taxAmount: new Prisma.Decimal(taxAmount),
          serviceChargeAmount: new Prisma.Decimal(serviceChargeAmount),
          totalAmount: new Prisma.Decimal(totalAmount),
          status: OrderStatus.PENDING,
          orderItems: {
            create: processedItems,
          },
        },
        include: { orderItems: true, table: true, user: true },
      });

      // Update table status if dine-in
      if (tableId && (orderType === 'DINE_IN' || !orderType)) {
        await tx.table.update({
          where: { id: tableId },
          data: { status: 'OCCUPIED', currentOrderId: order.id },
        });
      }

      // Emit KDS WebSocket event (PRD 3.8)
      this.kdsGateway.emitOrderUpdate(branchId, {
        type: 'order-created',
        data: order,
      });

      // Emit table status update for real-time floor plan (PRD 3.6)
      if (tableId) {
        this.kdsGateway.emitOrderUpdate(branchId, {
          type: 'table-status-update',
          data: { tableId, status: 'OCCUPIED', orderId: order.id },
        });
      }

      return order;
    });
  }

  async findAll(branchId?: string, status?: OrderStatus, currentUser?: any) {
    const where: any = {};

    if (currentUser && currentUser.role !== UserRole.ADMIN_HQ) {
      where.branchId = currentUser.branchId;
    } else if (branchId) {
      where.branchId = branchId;
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        orderItems: { include: { product: true } },
        table: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, currentUser?: any) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: { include: { product: true } },
        table: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        payments: true,
        customer: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan');
    }

    if (
      currentUser &&
      currentUser.role !== UserRole.ADMIN_HQ &&
      currentUser.branchId &&
      order.branchId !== currentUser.branchId
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses ke pesanan cabang lain');
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus, currentUser?: any) {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
    });
    if (!existingOrder) {
      throw new NotFoundException('Order tidak ditemukan');
    }

    if (
      currentUser &&
      currentUser.role !== UserRole.ADMIN_HQ &&
      currentUser.branchId &&
      existingOrder.branchId !== currentUser.branchId
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses ke pesanan cabang lain');
    }

    // Role-specific status transitions (RBAC)
    if (currentUser) {
      const role = currentUser.role as UserRole;
      if (role === UserRole.BARISTA) {
        const allowed: OrderStatus[] = [OrderStatus.PREPARING, OrderStatus.READY];
        if (!allowed.includes(status)) {
          throw new ForbiddenException(
            'Barista hanya dapat memperbarui status pesanan menjadi PREPARING atau READY',
          );
        }
      } else if (role === UserRole.WAITER) {
        const allowed: OrderStatus[] = [OrderStatus.SERVED];
        if (!allowed.includes(status)) {
          throw new ForbiddenException(
            'Waiter hanya dapat memperbarui status pesanan menjadi SERVED',
          );
        }
      }
    }

    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status,
        ...(status === OrderStatus.COMPLETED && { completedAt: new Date() }),
        ...(status === OrderStatus.SERVED && { servedAt: new Date() }),
      },
      include: { orderItems: true, branch: true },
    });

    // Auto-reduce inventory (BOM) when order is completed (PRD 3.3)
    if (status === OrderStatus.COMPLETED) {
      await this.reduceInventoryBOM(order, currentUser?.id || order.userId);

      // Create accounting journal entries (PRD 3.10)
      await this.accountingService.recordSale(
        { ...order, _cogs: 0 },
        currentUser?.id || order.userId,
      );
    }

    // Emit KDS WebSocket event (PRD 3.8)
    this.kdsGateway.emitOrderUpdate(order.branchId, {
      type: 'order-status-update',
      data: order,
    });

    // Emit table status update for real-time floor plan (PRD 3.6)
    if (order.tableId) {
      const newTableStatus = status === OrderStatus.COMPLETED ? 'NEEDS_CLEANING' : 'OCCUPIED';
      await this.prisma.table.update({
        where: { id: order.tableId },
        data: {
          status: newTableStatus,
          ...(status === OrderStatus.COMPLETED ? { currentOrderId: null } : {}),
        },
      });

      this.kdsGateway.emitOrderUpdate(order.branchId, {
        type: 'table-status-update',
        data: {
          tableId: order.tableId,
          status: newTableStatus,
        },
      });
    }

    return order;
  }

  async processPayment(
    orderId: string,
    data: {
      method: string;
      amount: number;
      transactionId?: string;
      mdrRate?: number;
    },
    currentUser?: any,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { branch: true },
    });
    if (!order) {
      throw new NotFoundException('Order tidak ditemukan');
    }

    if (
      currentUser &&
      currentUser.role !== UserRole.ADMIN_HQ &&
      currentUser.branchId &&
      order.branchId !== currentUser.branchId
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses ke pesanan cabang lain');
    }

    // Calculate MDR for non-cash payments (PRD 3.11)
    let mdrAmount: number | null = null;
    if (data.method !== 'CASH' && data.mdrRate) {
      mdrAmount = (Number(order.totalAmount) * data.mdrRate) / 100;
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId,
          method: data.method as any,
          amount: new Prisma.Decimal(data.amount),
          status: 'PAID',
          paidAt: new Date(),
          transactionId: data.transactionId,
          mdrRate: data.mdrRate ? new Prisma.Decimal(data.mdrRate) : undefined,
          mdrAmount: mdrAmount ? new Prisma.Decimal(mdrAmount) : undefined,
          qrisNominal:
            data.method === 'QRIS'
              ? new Prisma.Decimal(data.amount)
              : undefined,
          qrisExpiredAt:
            data.method === 'QRIS'
              ? new Date(Date.now() + 5 * 60 * 1000)
              : undefined,
        },
      });

      const updatedPaidAmount = Number(order.paidAmount) + Number(data.amount);
      const isFullyPaid = updatedPaidAmount >= Number(order.totalAmount);

      // Update order paid amount and status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paidAmount: new Prisma.Decimal(updatedPaidAmount),
          status: isFullyPaid ? OrderStatus.COMPLETED : order.status,
          completedAt: isFullyPaid && !order.completedAt ? new Date() : order.completedAt,
        },
      });

      // If fully paid, trigger BOM reduction and accounting
      if (isFullyPaid && order.status !== OrderStatus.COMPLETED) {
        await this.reduceInventoryBOM(order, currentUser?.id || order.userId);
        await this.accountingService.recordSale(
          { ...updatedOrder, _cogs: 0 },
          currentUser?.id || order.userId,
        );
      }

      return { payment, order: updatedOrder };
    });
  }

  // ===== BOM: Auto-reduce inventory when order is completed (PRD 3.3) =====
  private async reduceInventoryBOM(order: any, fallbackUserId?: string) {
    let effectiveUserId = fallbackUserId || order.userId;
    if (!effectiveUserId) {
      const staff = await this.prisma.user.findFirst({
        where: { branchId: order.branchId },
      });
      effectiveUserId = staff?.id;
    }

    const orderWithItems = await this.prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                ingredients: { include: { ingredient: true } },
              },
            },
          },
        },
      },
    });

    if (!orderWithItems) return;

    for (const item of orderWithItems.orderItems) {
      const product = item.product;
      if (product && product.ingredients && product.ingredients.length > 0) {
        for (const ing of product.ingredients) {
          const inventory = await this.prisma.inventory.findFirst({
            where: { productId: ing.ingredientId, branchId: order.branchId },
          });

          if (inventory && effectiveUserId) {
            const reduction = Number(ing.quantity) * item.quantity;
            await this.prisma.inventory.update({
              where: { id: inventory.id },
              data: {
                currentStock: {
                  decrement: new Prisma.Decimal(reduction),
                },
              },
            });

            // Create stock movement record
            await this.prisma.stockMovement.create({
              data: {
                inventoryId: inventory.id,
                branchId: order.branchId,
                userId: effectiveUserId,
                type: 'OUT',
                quantity: new Prisma.Decimal(reduction),
                quantityBefore: new Prisma.Decimal(Number(inventory.currentStock)),
                quantityAfter: new Prisma.Decimal(Number(inventory.currentStock) - reduction),
                reason: `BOM untuk order ${order.orderNumber}`,
                referenceId: order.id,
                referenceType: 'ORDER',
              },
            });
          }
        }
      }
    }
  }
}
