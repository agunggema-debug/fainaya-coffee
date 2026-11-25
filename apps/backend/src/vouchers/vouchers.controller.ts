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
import { VouchersService } from './vouchers.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('vouchers')
@ApiBearerAuth()
@Controller('vouchers')
export class VouchersController {
  constructor(private vouchersService: VouchersService) {}

  @Get()
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar semua voucher promo' })
  findAll(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.vouchersService.findAll(targetBranchId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detail voucher berdasarkan ID' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.vouchersService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat voucher promo baru' })
  create(
    @CurrentUser() user: any,
    @Body() dto: any,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.vouchersService.create(targetBranchId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update voucher' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: any,
  ) {
    return this.vouchersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus voucher' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.vouchersService.remove(id);
  }

  @Post('validate')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validasi voucher diskon di POS' })
  validate(
    @CurrentUser() user: any,
    @Body() dto: { code: string; orderId?: string; orderTotal?: number },
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.vouchersService.validateVoucher(targetBranchId, dto.code, dto.orderId);
  }

  @Post('apply')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gunakan voucher pada pesanan' })
  apply(
    @CurrentUser() user: any,
    @Body()
    dto: {
      code: string;
      orderId: string;
      orderTotal: number;
    },
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.vouchersService.applyVoucher(
      targetBranchId,
      dto.code,
      dto.orderId,
      dto.orderTotal,
    );
  }
}
