import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TableStatus, UserRole } from '@prisma/client';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId?: string, currentUser?: any) {
    const where: any = { isActive: true };
    if (currentUser && currentUser.role !== UserRole.ADMIN_HQ) {
      where.branchId = currentUser.branchId;
    } else if (branchId) {
      where.branchId = branchId;
    }

    return this.prisma.table.findMany({
      where,
      orderBy: { tableNumber: 'asc' },
      include: { currentOrder: true },
    });
  }

  async findOne(id: string, currentUser?: any) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        currentOrder: {
          include: { orderItems: true },
        },
      },
    });
    if (!table) {
      throw new NotFoundException('Meja tidak ditemukan');
    }

    if (
      currentUser &&
      currentUser.role !== UserRole.ADMIN_HQ &&
      currentUser.branchId &&
      table.branchId !== currentUser.branchId
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses ke meja cabang lain');
    }

    return table;
  }

  async create(data: any, currentUser?: any) {
    const targetBranchId =
      currentUser && currentUser.role !== UserRole.ADMIN_HQ
        ? currentUser.branchId
        : data.branchId;

    return this.prisma.table.create({
      data: {
        ...data,
        branchId: targetBranchId,
      },
    });
  }

  async update(id: string, data: any, currentUser?: any) {
    const table = await this.prisma.table.findUnique({ where: { id } });
    if (!table) {
      throw new NotFoundException('Meja tidak ditemukan');
    }

    if (
      currentUser &&
      currentUser.role !== UserRole.ADMIN_HQ &&
      currentUser.branchId &&
      table.branchId !== currentUser.branchId
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses ke meja cabang lain');
    }

    return this.prisma.table.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: TableStatus, currentUser?: any) {
    const table = await this.prisma.table.findUnique({ where: { id } });
    if (!table) {
      throw new NotFoundException('Meja tidak ditemukan');
    }

    if (
      currentUser &&
      currentUser.role !== UserRole.ADMIN_HQ &&
      currentUser.branchId &&
      table.branchId !== currentUser.branchId
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses ke meja cabang lain');
    }

    return this.prisma.table.update({ where: { id }, data: { status } });
  }

  async remove(id: string, currentUser?: any) {
    const table = await this.prisma.table.findUnique({ where: { id } });
    if (!table) {
      throw new NotFoundException('Meja tidak ditemukan');
    }

    if (
      currentUser &&
      currentUser.role !== UserRole.ADMIN_HQ &&
      currentUser.branchId &&
      table.branchId !== currentUser.branchId
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses ke meja cabang lain');
    }

    return this.prisma.table.delete({ where: { id } });
  }
}
