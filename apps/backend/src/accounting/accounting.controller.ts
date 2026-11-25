import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('accounting')
@ApiBearerAuth()
@Controller('accounting')
export class AccountingController {
  constructor(private accountingService: AccountingService) {}

  @Get('accounts')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar bagan akun akuntansi (Chart of Accounts)' })
  getAccounts(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.accountingService.getAccounts(targetBranchId);
  }

  @Post('accounts')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat akun akuntansi baru' })
  createAccount(
    @CurrentUser() user: any,
    @Body() dto: any,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.accountingService.createAccount(targetBranchId, dto);
  }

  @Get('journal-entries')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Daftar jurnal transaksi' })
  getJournalEntries(
    @CurrentUser() user: any,
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    return this.accountingService.getJournalEntries(targetBranchId, {
      startDate,
      endDate,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('financial-summary')
  @Roles(UserRole.ADMIN_HQ, UserRole.MANAGER_BRANCH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ringkasan laporan laba rugi dan neraca keuangan' })
  async getFinancialSummary(
    @CurrentUser() user: any,
    @Query('branchId') branchId?: string,
  ) {
    const targetBranchId =
      user.role === UserRole.ADMIN_HQ && branchId
        ? branchId
        : user.branchId || branchId;
    const [pnl, balanceSheet] = await Promise.all([
      this.accountingService.getProfitAndLoss(targetBranchId),
      this.accountingService.getBalanceSheet(targetBranchId),
    ]);
    return { profitAndLoss: pnl, balanceSheet };
  }
}
