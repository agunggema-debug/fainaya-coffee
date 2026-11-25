import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ringkasan performa penjualan dan pendapatan' })
  getSummary(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.dashboardService.getSummary(targetBranchId);
  }

  @Get('sales-chart')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Grafik tren penjualan per hari' })
  getSalesChart(
    @CurrentUser() user: any,
    @Query('branchId') branchId?: string,
    @Query('days') days?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.dashboardService.getSalesChart(
      targetBranchId,
      days ? parseInt(days, 10) : 7,
    );
  }

  @Get('top-products')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar produk paling laris' })
  getTopProducts(
    @CurrentUser() user: any,
    @Query('branchId') branchId?: string,
    @Query('limit') limit?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.dashboardService.getTopProducts(
      targetBranchId,
      limit ? parseInt(limit, 10) : 10,
    );
  }
}
