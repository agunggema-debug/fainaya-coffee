// Seed data for Faianaya Coffee - Customers & Loyalty Tiers
import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

export async function seedCustomersAndLoyalty(branches: any[]) {
  const tiers = [
    { name: 'Bronze', minPoints: 0, pointsMultiplier: 1.0 },
    { name: 'Silver', minPoints: 100, pointsMultiplier: 1.2 },
    { name: 'Gold', minPoints: 300, pointsMultiplier: 1.5 },
  ];

  const customerTemplates = [
    {
      name: 'Budi Santoso',
      phone: '081234567001',
      email: 'budi.santoso@gmail.com',
      loyaltyPoints: 350,
      loyaltyTier: 'Gold',
      isMember: true,
      totalVisits: 24,
      totalSpent: 920000,
      notes: 'Pelanggan setia - suka Latte less sugar',
    },
    {
      name: 'Siti Rahma',
      phone: '081234567002',
      email: 'siti.rahma@yahoo.com',
      loyaltyPoints: 160,
      loyaltyTier: 'Silver',
      isMember: true,
      totalVisits: 12,
      totalSpent: 450000,
      notes: 'Suka duduk di outdoor garden',
    },
    {
      name: 'Andi Wijaya',
      phone: '081234567003',
      email: 'andi.wijaya@outlook.com',
      loyaltyPoints: 65,
      loyaltyTier: 'Bronze',
      isMember: true,
      totalVisits: 5,
      totalSpent: 185000,
      notes: 'Sering pesan takeaway Cold Brew',
    },
    {
      name: 'Dewi Lestari',
      phone: '081234567004',
      email: 'dewi.lestari@gmail.com',
      loyaltyPoints: 30,
      loyaltyTier: 'Bronze',
      isMember: true,
      totalVisits: 2,
      totalSpent: 95000,
      notes: 'Penikmat manual brew V60',
    },
    {
      name: 'Rizky Pratama',
      phone: '081234567005',
      email: 'rizky.pratama@gmail.com',
      loyaltyPoints: 0,
      loyaltyTier: 'Bronze',
      isMember: false,
      totalVisits: 1,
      totalSpent: 42000,
      notes: 'Pelanggan baru',
    },
  ];

  for (const branch of branches) {
    // 1. Tiers
    for (const t of tiers) {
      const existing = await prisma.customerLoyaltyTier.findFirst({
        where: { branchId: branch.id, name: t.name },
      });
      if (!existing) {
        await prisma.customerLoyaltyTier.create({
          data: {
            id: uuid(),
            branchId: branch.id,
            name: t.name,
            minPoints: t.minPoints,
            pointsMultiplier: t.pointsMultiplier,
            isActive: true,
          },
        });
      }
    }

    // 2. Customers
    for (const c of customerTemplates) {
      // Modify phone per branch to satisfy unique constraint
      const phone =
        branch.code === 'MAIN-001'
          ? c.phone
          : c.phone.replace('081234567', '081299999');

      const existing = await prisma.customer.findFirst({
        where: { phone },
      });

      if (!existing) {
        await prisma.customer.create({
          data: {
            id: uuid(),
            branchId: branch.id,
            name: c.name,
            phone,
            email: c.email,
            loyaltyPoints: c.loyaltyPoints,
            loyaltyTier: c.loyaltyTier,
            isMember: c.isMember,
            memberSince: c.isMember ? new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) : null,
            totalVisits: c.totalVisits,
            totalSpent: c.totalSpent,
            notes: c.notes,
          },
        });
      }
    }
  }
}
