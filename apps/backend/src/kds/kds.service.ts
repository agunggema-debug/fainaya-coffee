import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KdsService {
  constructor(private prisma: PrismaService) {}

  async getOrdersByStation(branchId: string, station: string) {
    return this.prisma.orderItem.findMany({
      where: {
        order: { branchId },
        station,
        status: { in: ['pending', 'preparing', 'ready'] },
      },
      include: {
        order: {
          include: {
            table: true,
            user: true,
            payments: true,
          },
        },
        product: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateItemStatus(
    itemId: string,
    status: string,
    userId: string,
  ) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: true },
    });
    if (!item) {
      throw new NotFoundException('Order item tidak ditemukan');
    }

    const updated = await this.prisma.orderItem.update({
      where: { id: itemId },
      data: {
        status,
        ...(status === 'preparing' && { preparedAt: new Date() }),
        ...(status === 'served' && { servedAt: new Date() }),
      },
    });

    return updated;
  }

  async getAllOrders(branchId: string) {
    return this.prisma.order.findMany({
      where: { branchId },
      include: {
        orderItems: { include: { product: true } },
        table: true,
        user: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}