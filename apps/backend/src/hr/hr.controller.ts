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
import { HrService } from './hr.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('hr')
@ApiBearerAuth()
@Controller('hr')
export class HrController {
  constructor(private hrService: HrService) {}

  // ===== Shifts =====
  @Get('shifts')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.BARISTA,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar jadwal shift kerja' })
  getShifts(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.hrService.getShifts(targetBranchId);
  }

  @Get('shifts/:id')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.BARISTA,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detail shift' })
  getShift(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.hrService.getShift(id);
  }

  @Post('shifts')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat shift kerja baru' })
  createShift(
    @CurrentUser() user: any,
    @Body() dto: any,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.hrService.createShift(targetBranchId, dto);
  }

  @Patch('shifts/:id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update shift' })
  updateShift(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: any,
  ) {
    return this.hrService.updateShift(id, dto);
  }

  @Delete('shifts/:id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus shift' })
  removeShift(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.hrService.removeShift(id);
  }

  // ===== Attendance / Clock In-Out =====
  @Post('attendance/clock-in')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.BARISTA,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Presensi masuk (Clock In) dengan PIN karyawan' })
  clockIn(
    @Body() dto: { shiftId: string; pin?: string },
    @CurrentUser() user: any,
  ) {
    return this.hrService.clockIn(dto.shiftId, user.id, dto.pin);
  }

  @Post('attendance/clock-out')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.BARISTA,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Presensi keluar (Clock Out) dengan PIN karyawan' })
  clockOut(
    @Body() dto: { shiftId: string; pin?: string },
    @CurrentUser() user: any,
  ) {
    return this.hrService.clockOut(dto.shiftId, user.id, dto.pin);
  }

  @Get('attendance/history')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Riwayat absensi karyawan' })
  getAttendanceHistory(
    @CurrentUser() user: any,
    @Query('branchId') branchId?: string,
    @Query('shiftId') shiftId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.hrService.getAttendances(targetBranchId, shiftId);
  }

  @Get('performance')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Laporan kinerja dan jam kerja karyawan' })
  getStaffPerformance(
    @CurrentUser() user: any,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.hrService.getAttendanceReport(targetBranchId);
  }
}
