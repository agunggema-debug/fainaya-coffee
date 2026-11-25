import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  // ===== Suppliers =====
  async getSuppliers(branchId: string) {
    return this.prisma.supplier.findMany({
      where: { branchId },
      orderBy: { name: 'asc' },
    });
  }

  async getSupplier(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: { purchaseOrders: true },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier tidak ditemukan');
    }
    return supplier;
  }

  async createSupplier(branchId: string, data: any) {
    return this.prisma.supplier.create({
      data: { ...data, branchId },
    });
  }

  async updateSupplier(id: string, data: any) {
    return this.prisma.supplier.update({ where: { id }, data });
  }

  async removeSupplier(id: string) {
    return this.prisma.supplier.delete({ where: { id } });
  }

  // ===== Purchase Orders =====
  async getPurchaseOrders(branchId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { branchId },
      include: { supplier: true, items: true, createdBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPurchaseOrder(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: { include: { product: true } },
        createdBy: true,
      },
    });
    if (!po) {
      throw new NotFoundException('Purchase Order tidak ditemukan');
    }
    return po;
  }

  async createPurchaseOrder(branchId: string, data: any, userId: string) {
    const { items, ...poData } = data;

    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`;

    let totalAmount = 0;

    return this.prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.create({
        data: {
          ...poData,
          branchId,
          poNumber,
          createdById: userId,
        },
      });

      for (const item of items) {
        const itemTotal = Number(item.quantity) * Number(item.unitPrice);
        totalAmount += itemTotal;

        await tx.purchaseOrderItem.create({
          data: {
            purchaseOrderId: po.id,
            productId: item.productId,
            quantity: new Decimal(item.quantity),
            unitPrice: new Decimal(item.unitPrice),
            totalPrice: new Decimal(itemTotal),
            receivedQuantity: new Decimal(0),
          },
        });
      }

      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { totalAmount: new Decimal(totalAmount) },
      });

      return po;
    });
  }

  async receivePurchaseOrder(id: string, userId: string, receivedItems: { itemId: string; quantity: number }[]) {
    return this.prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id },
        include: { items: true, branch: true },
      });

      if (!po) {
        throw new NotFoundException('Purchase Order tidak ditemukan');
      }

      for (const received of receivedItems) {
        const item = po.items.find((i) => i.id === received.itemId);
        if (!item) {
          throw new NotFoundException(`Item ${received.itemId} tidak ditemukan`);
        }

        if (Number(received.quantity) > Number(item.quantity) - Number(item.receivedQuantity)) {
          throw new BadRequestException('Quantity melebihi yang dipesan');
        }

        // Update received quantity
        await tx.purchaseOrderItem.update({
          where: { id: item.id },
          data: {
            receivedQuantity: {
              increment: new Decimal(received.quantity),
            },
          },
        });

        // Find the inventory item (no composite unique key, so query by productId + branchId)
        const inventory = await tx.inventory.findFirst({
          where: { productId: item.productId, branchId: po.branchId },
        });

        // Restock inventory
        if (inventory) {
          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              currentStock: {
                increment: new Decimal(received.quantity),
              },
            },
          });

          // Create stock movement
          await tx.stockMovement.create({
            data: {
              inventoryId: inventory.id,
              branchId: po.branchId,
              userId,
              type: 'IN',
              quantity: new Decimal(received.quantity),
              quantityBefore: new Decimal(Number(inventory.currentStock)),
              quantityAfter: new Decimal(
                Number(inventory.currentStock) + received.quantity,
              ),
              reason: `Penerimaan PO ${po.poNumber}`,
              referenceId: po.id,
              referenceType: 'PURCHASE_ORDER',
            },
          });
        }
      }

      // Check if fully received
      const allReceived = po.items.every(
        (item) => Number(item.receivedQuantity) >= Number(item.quantity),
      );

      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status: allReceived ? 'received' : 'partial' },
      });

      return po;
    });
  }
}
