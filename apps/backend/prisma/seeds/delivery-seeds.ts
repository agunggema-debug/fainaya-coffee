// Seed data for Faianaya Coffee - Delivery Platform Configs
import { PrismaClient, DeliveryPlatform, Prisma } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

export async function seedDeliveryConfigs(branches: any[]) {
  const configs = [
    { platform: DeliveryPlatform.GOFOOD, markupPercent: new Prisma.Decimal(0.20) }, // 20% markup
    { platform: DeliveryPlatform.GRABFOOD, markupPercent: new Prisma.Decimal(0.20) }, // 20% markup
    { platform: DeliveryPlatform.SHOPEEFOOD, markupPercent: new Prisma.Decimal(0.15) }, // 15% markup
  ];

  for (const branch of branches) {
    for (const c of configs) {
      const existing = await prisma.deliveryPlatformConfig.findFirst({
        where: { branchId: branch.id, platform: c.platform },
      });
      if (!existing) {
        await prisma.deliveryPlatformConfig.create({
          data: {
            id: uuid(),
            branchId: branch.id,
            platform: c.platform,
            markupPercent: c.markupPercent,
            syncEnabled: true,
            isActive: true,
          },
        });
      }
    }
  }
}
