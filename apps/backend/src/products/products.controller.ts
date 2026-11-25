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
import { ProductsService } from './products.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.BARISTA,
    UserRole.WAITER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar produk menu' })
  findAll(
    @CurrentUser() user: any,
    @Query('branchId') branchId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.productsService.findAll(targetBranchId, categoryId);
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
  @ApiOperation({ summary: 'Detail produk berdasarkan ID' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat produk baru' })
  create(@Body() dto: any, @CurrentUser() user: any) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && dto.branchId
        ? dto.branchId
        : user.branchId || dto.branchId;
    return this.productsService.create({ ...dto, branchId: targetBranchId });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update produk' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: any,
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_HQ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus produk (hanya ADMIN_HQ)' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.productsService.remove(id);
  }
}
