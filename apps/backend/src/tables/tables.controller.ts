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
import { TablesService } from './tables.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TableStatus, UserRole } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('tables')
@ApiBearerAuth()
@Controller('tables')
export class TablesController {
  constructor(private tablesService: TablesService) {}

  @Get()
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.WAITER,
    UserRole.BARISTA,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar semua meja cabang' })
  findAll(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.tablesService.findAll(targetBranchId, user);
  }

  @Get(':id')
  @Roles(
    UserRole.ADMIN_HQ,
    UserRole.MANAGER_BRANCH,
    UserRole.KASIR,
    UserRole.WAITER,
    UserRole.BARISTA,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detail meja berdasarkan ID' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: any,
  ) {
    return this.tablesService.findOne(id, user);
  }

  @Post()
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat meja baru' })
  create(@Body() dto: any, @CurrentUser() user: any) {
    return this.tablesService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update posisi / detail meja' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.tablesService.update(id, dto, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH, UserRole.KASIR, UserRole.WAITER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update status meja (AVAILABLE, OCCUPIED, NEEDS_CLEANING, etc.)' })
  updateStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: { status: string },
    @CurrentUser() user: any,
  ) {
    return this.tablesService.updateStatus(id, dto.status as TableStatus, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus meja' })
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: any,
  ) {
    return this.tablesService.remove(id, user);
  }
}
