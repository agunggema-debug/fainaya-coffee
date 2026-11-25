import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId?: string, currentUser?: any) {
    const where: any = {};
    if (currentUser && currentUser.role !== UserRole.ADMIN_HQ) {
      where.branchId = currentUser.branchId;
    } else if (branchId) {
      where.branchId = branchId;
    }

    return this.prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        loyaltyTransactions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findOne(id: string, currentUser?: any) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        loyaltyTransactions: {
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!customer) {
      throw new NotFoundException('Pelanggan tidak ditemukan');
    }

    if (
      currentUser &&
      currentUser.role !== UserRole.ADMIN_HQ &&
      currentUser.branchId &&
      customer.branchId !== currentUser.branchId
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses ke pelanggan cabang lain');
    }

    return customer;
  }

  async findByPhone(branchId: string, phone: string, currentUser?: any) {
    const targetBranchId =
      currentUser && currentUser.role !== UserRole.ADMIN_HQ
        ? currentUser.branchId
        : branchId;

    return this.prisma.customer.findFirst({
      where: {
        phone,
        ...(targetBranchId ? { branchId: targetBranchId } : {}),
      },
    });
  }

  async create(branchId: string, data: any, currentUser?: any) {
    const targetBranchId =
      currentUser && currentUser.role !== UserRole.ADMIN_HQ
        ? currentUser.branchId
        : branchId;

    return this.prisma.customer.create({
      data: {
        ...data,
        branchId: targetBranchId,
      },
    });
  }

  async update(id: string, data: any, currentUser?: any) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Pelanggan tidak ditemukan');
    }

    if (
      currentUser &&
      currentUser.role !== UserRole.ADMIN_HQ &&
      currentUser.branchId &&
      customer.branchId !== currentUser.branchId
    ) {
      throw new ForbiddenException('Anda tidak memiliki izin mengedit pelanggan cabang lain');
    }

    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, currentUser?: any) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Pelanggan tidak ditemukan');
    }

    if (
      currentUser &&
      currentUser.role !== UserRole.ADMIN_HQ &&
      currentUser.branchId &&
      customer.branchId !== currentUser.branchId
    ) {
      throw new ForbiddenException('Anda tidak memiliki izin menghapus pelanggan cabang lain');
    }

    return this.prisma.customer.delete({ where: { id } });
  }

  async addLoyaltyPoints(
    customerId: string,
    orderId: string | null,
    points: number,
    type: 'earn' | 'redeem',
    description?: string,
    staffUserId?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
        select: { id: true, loyaltyPoints: true, branchId: true },
      });
      if (!customer) {
        throw new NotFoundException('Pelanggan tidak ditemukan');
      }

      const newPoints =
        type === 'earn'
          ? customer.loyaltyPoints + points
          : Math.max(0, customer.loyaltyPoints - points);

      const updated = await tx.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: newPoints },
      });

      // Find staff user to associate the loyalty audit log with
      let userId = staffUserId;
      if (!userId) {
        const staff = await tx.user.findFirst({
          where: { branchId: customer.branchId },
        });
        userId = staff?.id;
      }

      if (userId) {
        await tx.loyaltyTransaction.create({
          data: {
            userId,
            customerId,
            orderId,
            points,
            type,
            description,
          },
        });
      }

      return updated;
    });
  }
}
