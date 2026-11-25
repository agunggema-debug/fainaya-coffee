import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KdsGateway } from '../kds/kds.gateway';
import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DeliveryService {
  constructor(
    private prisma: PrismaService,
    private kdsGateway: KdsGateway,
  ) {}

  // ===== Delivery Platform Config =====
  async getConfigs(branchId: string) {
    return this.prisma.deliveryPlatformConfig.findMany({
      where: { branchId },
      orderBy: { platform: 'asc' },
    });
  }

  async getConfig(id: string) {
    const config = await this.prisma.deliveryPlatformConfig.findUnique({
      where: { id },
    });
    if (!config) {
      throw new NotFoundException('Konfigurasi delivery tidak ditemukan');
    }
    return config;
  }

  async upsertConfig(branchId: string, data: any) {
    return this.prisma.deliveryPlatformConfig.upsert({
      where: {
        branchId_platform: {
          branchId,
          platform: data.platform,
        },
      },
      update: data,
      create: { ...data, branchId },
    });
  }

  async updateMarkup(id: string, markupPercent: number) {
    return this.prisma.deliveryPlatformConfig.update({
      where: { id },
      data: { markupPercent: new Decimal(markupPercent) },
    });
  }

  // ===== Delivery Orders =====
  async getDeliveryOrders(branchId: string) {
    return this.prisma.deliveryOrder.findMany({
      where: { branchId },
      include: { order: { include: { orderItems: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDeliveryOrder(branchId: string, data: any) {
    const { items, customerName, customerPhone, customerAddress, platform, autoConfirm = true } = data;

    // Calculate total with markup
    const config = await this.prisma.deliveryPlatformConfig.findFirst({
      where: { branchId, platform },
    });

    let subtotal = 0;
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(`Produk ${item.productId} tidak ditemukan`);
      }
      const basePrice = Number(product.sellingPrice);
      const markup = config ? (basePrice * Number(config.markupPercent)) / 100 : 0;
      item.markupPrice = basePrice + markup;
      subtotal += item.markupPrice * item.quantity;
    }

    const taxAmount = subtotal * 0.11;
    const totalAmount = subtotal + taxAmount;

    // Create the order as a DELIVERY order
    const orderNumber = `DLV-${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          branchId,
          orderNumber,
          userId: data.userId,
          customerName,
          customerPhone,
          orderType: 'DELIVERY',
          subtotal: new Decimal(subtotal),
          taxAmount: new Decimal(taxAmount),
          totalAmount: new Decimal(totalAmount),
          status: autoConfirm ? 'CONFIRMED' : 'PENDING',
          orderItems: {
            create: items.map((item: any) => ({
              productId: item.productId,
              name: item.name || '',
              price: new Decimal(item.markupPrice),
              quantity: item.quantity,
              notes: item.notes,
              station: item.station || 'barista',
            })),
          },
        },
        include: { orderItems: true },
      });

      // Create delivery order record
      const deliveryOrder = await tx.deliveryOrder.create({
        data: {
          branchId,
          platform,
          platformOrderId: data.platformOrderId,
          platformCustomerName: customerName,
          platformCustomerPhone: customerPhone,
          platformCustomerAddress: customerAddress,
          platformFee: new Decimal(data.platformFee || 0),
          markupAmount: new Decimal(data.markupAmount || 0),
          status: 'CONFIRMED',
          orderId: order.id,
          rawPayload: data.rawPayload || undefined,
        },
      });

      // Emit KDS event
      this.kdsGateway.emitOrderUpdate(branchId, {
        type: 'order-created',
        data: order,
      });

      return { order, deliveryOrder };
    });
  }

  async updateDeliveryStatus(id: string, status: string) {
    const deliveryOrder = await this.prisma.deliveryOrder.findUnique({
      where: { id },
      include: { order: true, branch: true },
    });

    if (!deliveryOrder) {
      throw new NotFoundException('Delivery Order tidak ditemukan');
    }

    const updated = await this.prisma.deliveryOrder.update({
      where: { id },
      data: { status: status as any },
    });

    // Sync order status
    if (!deliveryOrder.orderId) {
      throw new NotFoundException('Delivery Order belum terhubung ke pesanan');
    }
    await this.prisma.order.update({
      where: { id: deliveryOrder.orderId },
      data: { status: this.mapDeliveryStatusToOrderStatus(status) },
    });

    // Emit KDS event
    this.kdsGateway.emitOrderUpdate(deliveryOrder.branchId, {
      type: 'delivery-status-update',
      data: updated,
    });

    return updated;
  }

  private mapDeliveryStatusToOrderStatus(status: string) {
    const map: Record<string, string> = {
      PENDING: 'PENDING',
      CONFIRMED: 'CONFIRMED',
      PREPARING: 'PREPARING',
      READY: 'READY',
      OUT_FOR_DELIVERY: 'SERVED',
      DELIVERED: 'COMPLETED',
      CANCELLED: 'CANCELLED',
      REFUNDED: 'REFUNDED',
    };
    return (map[status] || 'PENDING') as OrderStatus;
  }
}
