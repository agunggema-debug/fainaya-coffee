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
import { InventoryService } from './inventory.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.BARISTA,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar inventaris bahan baku' })
  findAll(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.inventoryService.findAll(targetBranchId, user);
  }

  @Get('low-stock')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.BARISTA,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Peringatan stok bahan baku menipis' })
  getLowStock(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.inventoryService.getLowStock(targetBranchId, user);
  }

  @Post()
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tambah item inventaris baru' })
  create(@Body() dto: any, @CurrentUser() user: any) {
    return this.inventoryService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update inventaris' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.update(id, dto, user);
  }

  @Post('adjust')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.BARISTA,
    UserRole.KASIR,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Penyesuaian stok (Stock Opname / Waste)' })
  adjustStock(
    @Body()
    dto: {
      inventoryId: string;
      quantity: number;
      type: string;
      reason?: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.adjustStock(
      dto.inventoryId,
      dto.quantity,
      dto.type,
      user.id,
      dto.reason,
      user,
    );
  }
}
