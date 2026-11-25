import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('delivery')
@ApiBearerAuth()
@Controller('delivery')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Get('configs')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar konfigurasi integrasi delivery (Grab/Gojek/Shopee)' })
  getConfigs(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.deliveryService.getConfigs(targetBranchId);
  }

  @Get('configs/:id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detail konfigurasi delivery berdasarkan ID' })
  getConfig(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.deliveryService.getConfig(id);
  }

  @Post('configs/upsert')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Simpan konfigurasi platform delivery' })
  upsertConfig(
    @CurrentUser() user: any,
    @Body() dto: any,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.deliveryService.upsertConfig(targetBranchId, dto);
  }

  @Patch('configs/:id/markup')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update persentase markup harga untuk delivery app' })
  updateMarkup(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: { markupPercent: number },
  ) {
    return this.deliveryService.updateMarkup(id, dto.markupPercent);
  }

  @Get('orders')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar pesanan dari platform delivery' })
  getDeliveryOrders(
    @CurrentUser() user: any,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.deliveryService.getDeliveryOrders(targetBranchId);
  }

  @Post('orders')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat pesanan delivery baru' })
  createDeliveryOrder(
    @CurrentUser() user: any,
    @Body() dto: any,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.deliveryService.createDeliveryOrder(targetBranchId, dto);
  }

  @Patch('orders/:id/status')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update status pesanan delivery' })
  updateDeliveryStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: { status: string },
  ) {
    return this.deliveryService.updateDeliveryStatus(id, dto.status);
  }
}
