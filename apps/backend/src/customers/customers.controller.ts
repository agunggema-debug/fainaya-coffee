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
import { CustomersService } from './customers.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isMember?: boolean;
}

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR, UserRole.WAITER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar pelanggan cabang' })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  findAll(
    @CurrentUser() user: any,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.customersService.findAll(targetBranchId, user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR, UserRole.WAITER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detail pelanggan berdasarkan ID' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: any,
  ) {
    return this.customersService.findOne(id, user);
  }

  @Get('phone/:phone')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR, UserRole.WAITER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cari pelanggan berdasarkan nomor telepon' })
  findByPhone(
    @Param('phone') phone: string,
    @CurrentUser() user: any,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.customersService.findByPhone(targetBranchId, phone, user);
  }

  @Post()
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tambah pelanggan baru (POS & CRM)' })
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateCustomerDto,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.customersService.create(targetBranchId, dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update data pelanggan' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser() user: any,
  ) {
    return this.customersService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus data pelanggan' })
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: any,
  ) {
    return this.customersService.remove(id, user);
  }
}
