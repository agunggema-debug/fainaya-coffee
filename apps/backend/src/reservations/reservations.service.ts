import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { KdsGateway } from '../kds/kds.gateway';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private kdsGateway: KdsGateway,
  ) {}

  async findAll(branchId: string) {
    return this.prisma.reservation.findMany({
      where: { branchId },
      include: { table: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { table: true, user: true, order: true },
    });
    if (!reservation) {
      throw new NotFoundException('Reservasi tidak ditemukan');
    }
    return reservation;
  }

  async create(branchId: string, data: any) {
    // Check if table is available for the requested time
    const table = await this.prisma.table.findFirst({
      where: { id: data.tableId, branchId },
    });
    if (!table) {
      throw new NotFoundException('Meja tidak ditemukan');
    }

    const reservation = await this.prisma.reservation.create({
      data: {
        ...data,
        branchId,
      },
      include: { table: true },
    });

    // Emit real-time update
    this.kdsGateway.emitOrderUpdate(branchId, {
      type: 'reservation-created',
      data: reservation,
    });

    return reservation;
  }

  async update(id: string, data: any) {
    return this.prisma.reservation.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: string) {
    const reservation = await this.prisma.reservation.update({
      where: { id },
      data: { status: status as ReservationStatus },
      include: { table: true, branch: true },
    });

    if (reservation) {
      this.kdsGateway.emitOrderUpdate(reservation.branchId, {
        type: 'reservation-status',
        data: reservation,
      });
    }

    return reservation;
  }

  async remove(id: string) {
    return this.prisma.reservation.delete({ where: { id } });
  }

  // ===== Queue Management (Waiting List) =====

  async getQueue(branchId: string) {
    return this.prisma.queue.findMany({
      where: { branchId },
      include: { order: { include: { orderItems: true } } },
      orderBy: { position: 'asc' },
    });
  }

  async addToQueue(branchId: string, orderId: string) {
    const lastPosition = await this.prisma.queue.findFirst({
      where: { branchId },
      orderBy: { position: 'desc' },
    });

    const position = lastPosition ? lastPosition.position + 1 : 1;

    return this.prisma.queue.create({
      data: {
        branchId,
        orderId,
        position,
      },
    });
  }

  async callNext(branchId: string) {
    const next = await this.prisma.queue.findFirst({
      where: { branchId, status: 'waiting' },
      orderBy: { position: 'asc' },
    });

    if (!next) {
      return null;
    }

    const updated = await this.prisma.queue.update({
      where: { id: next.id },
      data: { status: 'calling', calledAt: new Date() },
    });

    this.kdsGateway.emitOrderUpdate(branchId, {
      type: 'queue-called',
      data: updated,
    });

    return updated;
  }

  async markServed(queueId: string) {
    const queue = await this.prisma.queue.update({
      where: { id: queueId },
      data: { status: 'served', servedAt: new Date() },
    });
    return queue;
  }
}
