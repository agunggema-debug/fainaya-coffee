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
import { UsersService, RequestUser } from './users.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar semua user dengan pagination dan filter' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search: string = '',
    @Query('branchId') branchId: string = '',
  ) {
    const currentUser: RequestUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
    };
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    return this.usersService.findAll(
      { page: pageNum, limit: limitNum, search, branchId },
      currentUser,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR, UserRole.BARISTA, UserRole.WAITER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detail user berdasarkan ID' })
  findOne(
    @CurrentUser() user: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const currentUser: RequestUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
    };
    return this.usersService.findById(id, currentUser);
  }

  @Post()
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat user baru (ADMIN_HQ atau MANAGER_BRANCH untuk staff cabangnya)' })
  create(@CurrentUser() user: any, @Body() dto: CreateUserDto) {
    const currentUser: RequestUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
    };
    return this.usersService.create(dto, currentUser);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR, UserRole.BARISTA, UserRole.WAITER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update data user' })
  update(
    @CurrentUser() user: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const currentUser: RequestUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
    };
    return this.usersService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_HQ)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus user (hanya ADMIN_HQ)' })
  remove(
    @CurrentUser() user: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const currentUser: RequestUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
    };
    return this.usersService.remove(id, currentUser);
  }
}
