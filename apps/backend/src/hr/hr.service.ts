import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  // ===== Shifts =====
  async getShifts(branchId: string) {
    return this.prisma.shift.findMany({
      where: { branchId },
      include: { user: true, attendances: true },
      orderBy: { startTime: 'desc' },
    });
  }

  async getShift(id: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: { user: true, attendances: true },
    });
    if (!shift) {
      throw new NotFoundException('Shift tidak ditemukan');
    }
    return shift;
  }

  async createShift(branchId: string, data: any) {
    return this.prisma.shift.create({
      data: { ...data, branchId },
    });
  }

  async updateShift(id: string, data: any) {
    return this.prisma.shift.update({ where: { id }, data });
  }

  async removeShift(id: string) {
    return this.prisma.shift.delete({ where: { id } });
  }

  // ===== Attendance / Clock In-Out =====
  async clockIn(shiftId: string, userId: string, pin?: string, photo?: string) {
    // Verify user belongs to the shift
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
      include: { user: true },
    });
    if (!shift) {
      throw new NotFoundException('Shift tidak ditemukan');
    }

    // Optional PIN verification
    if (shift.user.pin && pin && shift.user.pin !== pin) {
      throw new BadRequestException('PIN tidak valid');
    }

    // Create or update attendance
    const existing = await this.prisma.attendance.findFirst({
      where: { shiftId, userId },
    });

    if (existing) {
      // Update clock-out
      const clockIn = existing.clockIn || shift.startTime;
      const clockOut = new Date();
      const totalHours = this.calculateHours(clockIn, clockOut);

      return this.prisma.attendance.update({
        where: { id: existing.id },
        data: {
          clockOut,
          clockOutPin: pin,
          clockOutPhoto: photo,
          totalHours: new Decimal(totalHours),
        },
      });
    }

    return this.prisma.attendance.create({
      data: {
        shiftId,
        userId,
        clockIn: new Date(),
        clockInPin: pin,
        clockInPhoto: photo,
      },
    });
  }

  async clockOut(shiftId: string, userId: string, pin?: string) {
    const attendance = await this.prisma.attendance.findFirst({
      where: { shiftId, userId, clockOut: null },
    });
    if (!attendance) {
      throw new NotFoundException('Clock-in tidak ditemukan');
    }

    const clockOut = new Date();
    const totalHours = this.calculateHours(attendance.clockIn!, clockOut);

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOut,
        clockOutPin: pin,
        totalHours: new Decimal(totalHours),
      },
    });
  }

  async getAttendances(branchId: string, shiftId?: string) {
    return this.prisma.attendance.findMany({
      where: {
        shift: shiftId ? { id: shiftId, branchId } : { branchId },
      },
      include: { shift: { include: { user: true } }, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAttendanceReport(branchId: string) {
    // Aggregate attendance by user
    const attendances = await this.prisma.attendance.findMany({
      where: { shift: { branchId } },
      include: { user: true, shift: true },
    });

    const report: Record<string, any> = {};
    attendances.forEach((a) => {
      const userId = a.userId;
      if (!report[userId]) {
        report[userId] = {
          userId: a.userId,
          userName: a.user.name,
          userRole: a.user.role,
          totalHours: 0,
          totalShifts: 0,
          totalSales: 0,
        };
      }
      report[userId].totalHours += Number(a.totalHours || 0);
      report[userId].totalShifts += 1;
    });

    return Object.values(report);
  }

  private calculateHours(clockIn: Date, clockOut: Date): number {
    const diffMs = clockOut.getTime() - new Date(clockIn).getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }
}
