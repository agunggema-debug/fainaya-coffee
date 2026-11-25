// Seed data for Faianaya Coffee - Tables (Floor Plan)
import { PrismaClient, TableStatus, Prisma } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

export async function seedTables(branches: any[]) {
  const tableTemplates = [
    // Indoor Area
    { tableNumber: 1, name: 'Meja T-01', capacity: 2, area: 'indoor', positionX: 50, positionY: 50, status: TableStatus.AVAILABLE },
    { tableNumber: 2, name: 'Meja T-02', capacity: 2, area: 'indoor', positionX: 160, positionY: 50, status: TableStatus.AVAILABLE },
    { tableNumber: 3, name: 'Meja T-03', capacity: 4, area: 'indoor', positionX: 270, positionY: 50, status: TableStatus.AVAILABLE },
    { tableNumber: 4, name: 'Meja T-04', capacity: 4, area: 'indoor', positionX: 50, positionY: 180, status: TableStatus.AVAILABLE },
    { tableNumber: 5, name: 'Meja T-05', capacity: 4, area: 'indoor', positionX: 160, positionY: 180, status: TableStatus.AVAILABLE },
    { tableNumber: 6, name: 'Meja VIP T-06', capacity: 6, area: 'indoor', positionX: 280, positionY: 180, status: TableStatus.AVAILABLE },

    // Outdoor Garden
    { tableNumber: 7, name: 'Meja O-01', capacity: 4, area: 'outdoor', positionX: 420, positionY: 50, status: TableStatus.AVAILABLE },
    { tableNumber: 8, name: 'Meja O-02', capacity: 4, area: 'outdoor', positionX: 530, positionY: 50, status: TableStatus.AVAILABLE },
    { tableNumber: 9, name: 'Meja O-03', capacity: 4, area: 'outdoor', positionX: 420, positionY: 180, status: TableStatus.AVAILABLE },
    { tableNumber: 10, name: 'Meja O-04', capacity: 6, area: 'outdoor', positionX: 530, positionY: 180, status: TableStatus.AVAILABLE },

    // Bar Area
    { tableNumber: 11, name: 'Bar Stool 1', capacity: 1, area: 'bar', positionX: 100, positionY: 300, status: TableStatus.AVAILABLE },
    { tableNumber: 12, name: 'Bar Stool 2', capacity: 1, area: 'bar', positionX: 160, positionY: 300, status: TableStatus.AVAILABLE },
    { tableNumber: 13, name: 'Bar Stool 3', capacity: 1, area: 'bar', positionX: 220, positionY: 300, status: TableStatus.AVAILABLE },
  ];

  for (const branch of branches) {
    for (const t of tableTemplates) {
      const existing = await prisma.table.findFirst({
        where: { branchId: branch.id, tableNumber: t.tableNumber },
      });
      if (!existing) {
        await prisma.table.create({
          data: {
            id: uuid(),
            branchId: branch.id,
            name: t.name,
            tableNumber: t.tableNumber,
            capacity: t.capacity,
            area: t.area,
            positionX: new Prisma.Decimal(t.positionX),
            positionY: new Prisma.Decimal(t.positionY),
            status: t.status,
            isActive: true,
          },
        });
      }
    }
  }
}
