// Seed data for Faianaya Coffee - Shifts & Attendance
import { PrismaClient, ShiftStatus, Prisma } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

export async function seedShiftsAndAttendance(branches: any[], users: any[]) {
  const [hqBranch, depokBranch] = branches;

  const depokManager = users.find((u) => u.email === 'manager@faianaya.coffee');
  const depokKasir = users.find((u) => u.email === 'kasir@faianaya.coffee');
  const depokBarista = users.find((u) => u.email === 'barista@faianaya.coffee');
  const depokWaiter = users.find((u) => u.email === 'waiter@faianaya.coffee');

  if (!depokManager || !depokKasir) return;

  const today = new Date();
  const todayMorningStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 0, 0);
  const todayMorningEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0, 0);

  const existingShift = await prisma.shift.findFirst({
    where: { branchId: depokBranch.id, name: 'Shift Pagi (Opening)' },
  });

  if (!existingShift) {
    const shiftPagi = await prisma.shift.create({
      data: {
        id: uuid(),
        branchId: depokBranch.id,
        userId: depokManager.id,
        name: 'Shift Pagi (Opening)',
        startTime: todayMorningStart,
        endTime: todayMorningEnd,
        status: ShiftStatus.IN_PROGRESS,
        totalSales: new Prisma.Decimal(450000),
        orderCount: 15,
        notes: 'Shift pagi lancar, persiapan opening selesai',
      },
    });

    // Attendances for Kasir, Barista, Waiter
    const staffList = [depokKasir, depokBarista, depokWaiter].filter(Boolean);
    for (const staff of staffList) {
      await prisma.attendance.create({
        data: {
          id: uuid(),
          shiftId: shiftPagi.id,
          userId: staff.id,
          clockIn: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 6, 50, 0),
          clockInPin: staff.pin || '1234',
          totalHours: new Prisma.Decimal(6.5),
        },
      });
    }

    // Scheduled Afternoon Shift
    const afternoonStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30, 0);
    const afternoonEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 30, 0);

    await prisma.shift.create({
      data: {
        id: uuid(),
        branchId: depokBranch.id,
        userId: depokManager.id,
        name: 'Shift Siang (Closing)',
        startTime: afternoonStart,
        endTime: afternoonEnd,
        status: ShiftStatus.SCHEDULED,
        notes: 'Shift siang & closing kedai',
      },
    });
  }
}
