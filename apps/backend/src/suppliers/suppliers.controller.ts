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
import { SuppliersService } from './suppliers.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  // ===== Suppliers =====
  @Get()
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar pemasok bahan baku' })
  getSuppliers(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.suppliersService.getSuppliers(targetBranchId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detail pemasok berdasarkan ID' })
  getSupplier(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.suppliersService.getSupplier(id);
  }

  @Post()
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tambah pemasok baru' })
  createSupplier(
    @CurrentUser() user: any,
    @Body() dto: any,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.suppliersService.createSupplier(targetBranchId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update data pemasok' })
  updateSupplier(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: any,
  ) {
    return this.suppliersService.updateSupplier(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus pemasok' })
  removeSupplier(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.suppliersService.removeSupplier(id);
  }

  // ===== Purchase Orders =====
  @Get('purchase-orders/list')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar pesanan pembelian bahan baku (PO)' })
  getPurchaseOrders(
    @CurrentUser() user: any,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.suppliersService.getPurchaseOrders(targetBranchId);
  }

  @Post('purchase-orders')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat PO bahan baku baru' })
  createPurchaseOrder(
    @CurrentUser() user: any,
    @Body() dto: any,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.suppliersService.createPurchaseOrder(
      targetBranchId,
      dto,
      user.id,
    );
  }
}
