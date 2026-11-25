import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { OrderStatus, UserRole } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR, UserRole.WAITER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat order baru (POS / Dine-In / Takeaway)' })
  create(@Body() dto: any, @CurrentUser() user: any) {
    // Branch scoping: non-ADMIN_HQ uses their own branch
    const branchId =
      user.role === UserRole.ADMIN_HQ && dto.branchId
        ? dto.branchId
        : user.branchId || dto.branchId;

    return this.ordersService.create({
      ...dto,
      branchId,
      userId: user.id,
    });
  }

  @Get()
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.BARISTA,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar order berdasarkan cabang dan status' })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  findAll(
    @CurrentUser() user: any,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;

    return this.ordersService.findAll(targetBranchId, status as OrderStatus, user);
  }

  @Get(':id')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.BARISTA,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detail order berdasarkan ID' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.findOne(id, user);
  }

  @Patch(':id/status')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.BARISTA,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update status pesanan sesuai peran / role' })
  updateStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: { status: string },
    @CurrentUser() user: any,
  ) {
    return this.ordersService.updateStatus(id, dto.status as OrderStatus, user);
  }

  @Post(':id/payment')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Proses pembayaran pesanan (Cash, QRIS, Kartu, e-Wallet)' })
  processPayment(
    @Param('id', new ParseUUIDPipe({ version: '4' })) orderId: string,
    @Body()
    dto: {
      method: string;
      amount: number;
      transactionId?: string;
      mdrRate?: number;
    },
    @CurrentUser() user: any,
  ) {
    return this.ordersService.processPayment(orderId, dto, user);
  }
}
