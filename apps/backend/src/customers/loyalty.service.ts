import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from './customers.service';

@Injectable()
export class LoyaltyService {
  constructor(
    private prisma: PrismaService,
    private customersService: CustomersService,
  ) {}

  async getTiers(branchId: string) {
    return this.prisma.customerLoyaltyTier.findMany({
      where: { branchId, isActive: true },
      orderBy: { minPoints: 'asc' },
    });
  }

  async createTier(branchId: string, data: any) {
    return this.prisma.customerLoyaltyTier.create({
      data: { ...data, branchId },
    });
  }

  async updateTier(id: string, data: any) {
    return this.prisma.customerLoyaltyTier.update({ where: { id }, data });
  }

  async addPoints(
    dto: {
      customerId: string;
      orderId?: string;
      points: number;
      type: string;
      description?: string;
    },
    currentUser?: any,
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException('Pelanggan tidak ditemukan');
    }
    return this.customersService.addLoyaltyPoints(
      dto.customerId,
      dto.orderId || null,
      dto.points,
      dto.type as 'earn' | 'redeem',
      dto.description,
      currentUser?.id,
    );
  }
}
