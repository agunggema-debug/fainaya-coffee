import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { KdsService } from './kds.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('kds')
@ApiBearerAuth()
@Controller('kds')
export class KdsController {
  constructor(private kdsService: KdsService) {}

  @Get('station')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.BARISTA,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pesanan aktif untuk stasiun KDS (barista/kitchen)' })
  getOrdersByStation(
    @CurrentUser() user: any,
    @Query('station') station: string,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.kdsService.getOrdersByStation(targetBranchId, station);
  }

  @Get('orders')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.BARISTA,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Semua pesanan aktif di KDS' })
  getAllOrders(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.kdsService.getAllOrders(targetBranchId);
  }

  @Patch('items/:id/status')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.BARISTA,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update status item pesanan (preparing/ready/served)' })
  updateItemStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: { status: string },
    @CurrentUser() user: any,
  ) {
    return this.kdsService.updateItemStatus(id, dto.status, user.id);
  }
}
