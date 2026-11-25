// Seed data for Faianaya Coffee - Vouchers & Promos
import { PrismaClient, Prisma } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

export async function seedVouchers(branches: any[]) {
  const [hqBranch, depokBranch] = branches;

  const vouchers = [
    {
      branchId: hqBranch.id,
      code: 'WELCOMEHQ20',
      name: 'Diskon Selamat Datang 20%',
      description: 'Diskon 20% untuk pelanggan baru di HQ Jakarta',
      type: 'percentage',
      discountValue: new Prisma.Decimal(20),
      minSpend: new Prisma.Decimal(30000),
      maxDiscount: new Prisma.Decimal(15000),
      usageLimit: 500,
      usageCount: 18,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
    {
      branchId: depokBranch.id,
      code: 'WELCOMEDPK20',
      name: 'Diskon Selamat Datang Depok 20%',
      description: 'Diskon 20% untuk pelanggan di cabang Depok',
      type: 'percentage',
      discountValue: new Prisma.Decimal(20),
      minSpend: new Prisma.Decimal(30000),
      maxDiscount: new Prisma.Decimal(15000),
      usageLimit: 500,
      usageCount: 35,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
    {
      branchId: depokBranch.id,
      code: 'KOPIHEMAT10',
      name: 'Potongan Langsung Rp 10.000',
      description: 'Potongan langsung Rp 10.000 minimal belanja Rp 45.000',
      type: 'fixed',
      discountValue: new Prisma.Decimal(10000),
      minSpend: new Prisma.Decimal(45000),
      usageLimit: 200,
      usageCount: 42,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
    {
      branchId: depokBranch.id,
      code: 'HAPPYHOUR15',
      name: 'Promo Sore Happy Hour 15%',
      description: 'Diskon 15% untuk transaksi jam 14.00 - 17.00',
      type: 'percentage',
      discountValue: new Prisma.Decimal(15),
      minSpend: new Prisma.Decimal(25000),
      maxDiscount: new Prisma.Decimal(20000),
      usageLimit: 300,
      usageCount: 15,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
  ];

  for (const v of vouchers) {
    const existing = await prisma.voucher.findUnique({
      where: { code: v.code },
    });
    if (!existing) {
      await prisma.voucher.create({
        data: {
          id: uuid(),
          ...v,
        },
      });
    }
  }
}
