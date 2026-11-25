import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId: string) {
    return this.prisma.voucher.findMany({
      where: { branchId },
      include: { products: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id },
      include: { products: { include: { product: true } } },
    });
    if (!voucher) {
      throw new NotFoundException('Voucher tidak ditemukan');
    }
    return voucher;
  }

  async create(branchId: string, data: any) {
    const { products, ...voucherData } = data;
    const result = await this.prisma.$transaction(async (tx) => {
      const voucher = await tx.voucher.create({
        data: {
          ...voucherData,
          branchId,
        },
      });

      if (products && products.length > 0) {
        await tx.voucherProduct.createMany({
          data: products.map((productId: string) => ({
            voucherId: voucher.id,
            productId,
          })),
        });
      }

      return { ...voucher, products: products || [] };
    });

    return result;
  }

  async update(id: string, data: any) {
    return this.prisma.voucher.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.voucher.delete({ where: { id } });
  }

  async validateVoucher(branchId: string, code: string, orderId?: string) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { code },
    });

    if (!voucher || !voucher.isActive || voucher.branchId !== branchId) {
      throw new BadRequestException('Voucher tidak valid');
    }

    // Check date range
    const now = new Date();
    if (voucher.startDate && now < voucher.startDate) {
      throw new BadRequestException('Voucher belum berlaku');
    }
    if (voucher.endDate && now > voucher.endDate) {
      throw new BadRequestException('Voucher sudah kadaluarsa');
    }

    if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
      throw new BadRequestException('Voucher sudah habis');
    }

    return voucher;
  }

  async applyVoucher(branchId: string, code: string, orderId: string, orderTotal: number) {
    const voucher = await this.validateVoucher(branchId, code, orderId);

    const discount = this.calculateDiscount(voucher, orderTotal);

    await this.prisma.voucher.update({
      where: { id: voucher.id },
      data: { usageCount: { increment: 1 } },
    });

    await this.prisma.voucherUsage.create({
      data: {
        voucherId: voucher.id,
        orderId,
        discountAmount: new Decimal(discount),
      },
    });

    return { voucherId: voucher.id, discountAmount: discount };
  }

  private calculateDiscount(voucher: any, orderTotal: number): number {
    let discount = 0;
    if (voucher.type === 'percentage') {
      discount = (orderTotal * Number(voucher.discountValue)) / 100;
    } else {
      discount = Number(voucher.discountValue);
    }

    if (Number(voucher.maxDiscount) > 0 && discount > Number(voucher.maxDiscount)) {
      discount = Number(voucher.maxDiscount);
    }

    if (orderTotal < Number(voucher.minSpend)) {
      return 0;
    }

    return discount;
  }
}
