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
import { LoyaltyService } from './loyalty.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('loyalty')
@ApiBearerAuth()
@Controller('loyalty')
export class LoyaltyController {
  constructor(private loyaltyService: LoyaltyService) {}

  @Get('tiers')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar loyalty tiers' })
  getTiers(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.loyaltyService.getTiers(targetBranchId);
  }

  @Post('tiers')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat tier loyalitas baru' })
  createTier(
    @CurrentUser() user: any,
    @Body() dto: any,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.loyaltyService.createTier(targetBranchId, dto);
  }

  @Patch('tiers/:id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tier loyalitas' })
  updateTier(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: any,
  ) {
    return this.loyaltyService.updateTier(id, dto);
  }

  @Post('points')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tambah / gunakan loyalty points pelanggan' })
  addPoints(
    @Body()
    dto: {
      customerId: string;
      orderId?: string;
      points: number;
      type: string;
      description?: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.loyaltyService.addPoints(dto, user);
  }
}
