import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('reservations')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Get()
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar semua reservasi' })
  findAll(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.reservationsService.findAll(targetBranchId);
  }

  @Get(':id')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detail reservasi berdasarkan ID' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.reservationsService.findOne(id);
  }

  @Post()
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat reservasi meja baru' })
  create(
    @CurrentUser() user: any,
    @Body() dto: any,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.reservationsService.create(targetBranchId, dto);
  }

  @Patch(':id')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update data reservasi' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: any,
  ) {
    return this.reservationsService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update status reservasi (CONFIRMED, SEATED, CANCELLED, etc.)' })
  updateStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: { status: string },
  ) {
    return this.reservationsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus reservasi' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.reservationsService.remove(id);
  }

  // ===== Queue Endpoints =====

  @Get('queue/all')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.BARISTA,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar antrean waiting list' })
  getQueue(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.reservationsService.getQueue(targetBranchId);
  }

  @Post('queue/add')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tambah pesanan ke antrean' })
  addToQueue(
    @CurrentUser() user: any,
    @Body() dto: { orderId: string },
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.reservationsService.addToQueue(targetBranchId, dto.orderId);
  }
}
