import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UserRole } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId?: string, currentUser?: any) {
    const where: any = {};
    if (currentUser && currentUser.role !== UserRole.ADMIN_HQ) {
      where.branchId = currentUser.branchId;
    } else if (branchId) {
      where.branchId = branchId;
    }

    return this.prisma.inventory.findMany({
      where,
      include: { product: true },
      orderBy: { product: { name: 'asc' } },
    });
  }

  async getLowStock(branchId?: string, currentUser?: any) {
    const where: any = {};
    if (currentUser && currentUser.role !== UserRole.ADMIN_HQ) {
      where.branchId = currentUser.branchId;
    } else if (branchId) {
      where.branchId = branchId;
    }

    return this.prisma.inventory.findMany({
      where: {
        ...where,
        currentStock: { lt: this.prisma.inventory.fields.minStock },
      },
      include: { product: true },
    });
  }

  async create(data: any, currentUser?: any) {
    const targetBranchId =
      currentUser && currentUser.role !== UserRole.ADMIN_HQ
        ? currentUser.branchId
        : data.branchId;

    return this.prisma.inventory.create({
      data: {
        ...data,
        branchId: targetBranchId,
      },
      include: { product: true },
    });
  }

  async update(id: string, data: any, currentUser?: any) {
    const inventory = await this.prisma.inventory.findUnique({ where: { id } });
    if (!inventory) {
      throw new NotFoundException('Inventory tidak ditemukan');
    }

    if (
      currentUser &&
      currentUser.role !== UserRole.ADMIN_HQ &&
      currentUser.branchId &&
      inventory.branchId !== currentUser.branchId
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses ke inventaris cabang lain');
    }

    return this.prisma.inventory.update({
      where: { id },
      data,
      include: { product: true },
    });
  }

  async adjustStock(
    inventoryId: string,
    quantity: number,
    type: string,
    userId: string,
    reason?: string,
    currentUser?: any,
  ) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id: inventoryId },
    });
    if (!inventory) {
      throw new NotFoundException('Inventory tidak ditemukan');
    }

    if (
      currentUser &&
      currentUser.role !== UserRole.ADMIN_HQ &&
      currentUser.branchId &&
      inventory.branchId !== currentUser.branchId
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses ke inventaris cabang lain');
    }

    const quantityBefore = Number(inventory.currentStock);
    let quantityAfter: number;
    if (type === 'IN') {
      quantityAfter = quantityBefore + quantity;
    } else if (type === 'OUT') {
      quantityAfter = Math.max(0, quantityBefore - quantity);
    } else {
      quantityAfter = quantity;
    }

    return this.prisma.$transaction([
      this.prisma.inventory.update({
        where: { id: inventoryId },
        data: { currentStock: new Prisma.Decimal(quantityAfter) },
      }),
      this.prisma.stockMovement.create({
        data: {
          inventoryId,
          branchId: inventory.branchId,
          userId,
          type: type as any,
          quantity: new Prisma.Decimal(quantity),
          quantityBefore: new Prisma.Decimal(quantityBefore),
          quantityAfter: new Prisma.Decimal(quantityAfter),
          reason,
        },
      }),
    ]);
  }
}
