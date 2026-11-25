// Seed data for Faianaya Coffee - Reservations & Queue
import { PrismaClient, ReservationStatus } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

export async function seedReservationsAndQueue(branches: any[]) {
  const [hqBranch, depokBranch] = branches;

  const vipTable = await prisma.table.findFirst({
    where: { branchId: depokBranch.id, name: { contains: 'VIP' } },
  });

  if (vipTable) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0);

    const existingRes = await prisma.reservation.findFirst({
      where: { branchId: depokBranch.id, customerName: 'Ibu Ratna (Arisan)' },
    });

    if (!existingRes) {
      await prisma.reservation.create({
        data: {
          id: uuid(),
          branchId: depokBranch.id,
          tableId: vipTable.id,
          customerName: 'Ibu Ratna (Arisan)',
          customerPhone: '081288889999',
          customerEmail: 'ratna.arisan@gmail.com',
          guestCount: 6,
          reservationDate: tomorrow,
          status: ReservationStatus.CONFIRMED,
          notes: 'Acara arisan keluarga, minta meja disiapkan jam 18.45',
        },
      });
    }
  }

  // Active queue entry
  const order3 = await prisma.order.findFirst({
    where: { branchId: depokBranch.id, status: 'PREPARING' },
  });

  if (order3) {
    const existingQueue = await prisma.queue.findFirst({
      where: { orderId: order3.id },
    });

    if (!existingQueue) {
      await prisma.queue.create({
        data: {
          id: uuid(),
          branchId: depokBranch.id,
          orderId: order3.id,
          position: 1,
          status: 'preparing',
          estimatedTime: 10,
          calledAt: new Date(),
        },
      });
    }
  }
}
