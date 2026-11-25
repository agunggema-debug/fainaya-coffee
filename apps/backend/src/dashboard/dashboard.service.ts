import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(branchId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, totalRevenue, todayOrders, pendingOrders] =
      await Promise.all([
        this.prisma.order.count({ where: { branchId } }),
        this.prisma.order.aggregate({
          where: { branchId, status: 'COMPLETED' },
          _sum: { totalAmount: true },
        }),
        this.prisma.order.count({
          where: { branchId, createdAt: { gte: today } },
        }),
        this.prisma.order.count({
          where: { branchId, status: 'PENDING' },
        }),
      ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      todayOrders,
      pendingOrders,
    };
  }

  async getSalesChart(branchId: string, days: number = 7) {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: {
        branchId,
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { totalAmount: true, createdAt: true },
    });

    const chart: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      chart[dateStr] = 0;
    }

    orders.forEach((order) => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (chart[dateStr] !== undefined) {
        chart[dateStr] += Number(order.totalAmount);
      }
    });

    return Object.entries(chart).map(([date, value]) => ({ date, value }));
  }

  async getTopProducts(branchId: string, limit: number = 10) {
    return this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: { branchId, status: 'COMPLETED' },
      },
      _sum: { quantity: true },
      _avg: { price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });
  }
}