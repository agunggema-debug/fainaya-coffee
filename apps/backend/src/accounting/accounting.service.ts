import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  // ===== Chart of Accounts =====
  async getAccounts(branchId: string) {
    return this.prisma.account.findMany({
      where: { branchId },
      orderBy: { code: 'asc' },
    });
  }

  async createAccount(branchId: string, data: any) {
    return this.prisma.account.create({
      data: { ...data, branchId },
    });
  }

  // ===== Journal Entries =====
  async getJournalEntries(branchId: string, options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    const where: any = { branchId };
    if (options?.startDate && options?.endDate) {
      where.transactionDate = {
        gte: new Date(options.startDate),
        lte: new Date(options.endDate),
      };
    }
    return this.prisma.journalEntry.findMany({
      where,
      include: { account: true, createdBy: true },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 100,
    });
  }

  // ===== Auto-journal: Record a sale transaction =====
  async recordSale(order: any, userId?: string) {
    const branchId = order.branchId;
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const staff = await this.prisma.user.findFirst({
        where: { branchId },
      });
      effectiveUserId = staff?.id;
    }
    if (!effectiveUserId) return;

    // Find default accounts for the branch
    const cashAccount = await this.prisma.account.findFirst({
      where: { branchId, code: '1-1-01' },
    });
    const salesAccount = await this.prisma.account.findFirst({
      where: { branchId, code: '4-01-01' },
    });
    const taxAccount = await this.prisma.account.findFirst({
      where: { branchId, code: '2-1-01' },
    });
    const cogsAccount = await this.prisma.account.findFirst({
      where: { branchId, code: '5-01-01' },
    });
    const inventoryAccount = await this.prisma.account.findFirst({
      where: { branchId, code: '1-2-01' },
    });

    const Dec = Prisma.Decimal;
    const entries: any[] = [];

    // Debit: Cash (asset increases)
    if (cashAccount) {
      entries.push({
        branchId,
        accountId: cashAccount.id,
        entryType: 'SALES',
        description: `Penjualan ${order.orderNumber}`,
        debitAmount: new Dec(order.paidAmount || order.totalAmount),
        creditAmount: new Dec(0),
        referenceId: order.id,
        referenceType: 'ORDER',
        transactionDate: new Date(),
        createdById: effectiveUserId,
      });
    }

    // Credit: Sales Revenue
    if (salesAccount) {
      entries.push({
        branchId,
        accountId: salesAccount.id,
        entryType: 'SALES',
        description: `Penjualan ${order.orderNumber}`,
        debitAmount: new Dec(0),
        creditAmount: new Dec(order.totalAmount),
        referenceId: order.id,
        referenceType: 'ORDER',
        transactionDate: new Date(),
        createdById: effectiveUserId,
      });
    }

    // Credit: Tax Payable
    if (taxAccount && Number(order.taxAmount) > 0) {
      entries.push({
        branchId,
        accountId: taxAccount.id,
        entryType: 'SALES',
        description: `Pajak ${order.orderNumber}`,
        debitAmount: new Dec(0),
        creditAmount: new Dec(order.taxAmount),
        referenceId: order.id,
        referenceType: 'ORDER',
        transactionDate: new Date(),
        createdById: effectiveUserId,
      });
    }

    // COGS entries
    if (cogsAccount && inventoryAccount && order._cogs) {
      entries.push({
        branchId,
        accountId: cogsAccount.id,
        entryType: 'COST_OF_SALES',
        description: `HPP ${order.orderNumber}`,
        debitAmount: new Dec(order._cogs),
        creditAmount: new Dec(0),
        referenceId: order.id,
        referenceType: 'ORDER',
        transactionDate: new Date(),
        createdById: effectiveUserId,
      });

      entries.push({
        branchId,
        accountId: inventoryAccount.id,
        entryType: 'COST_OF_SALES',
        description: `Pengurangan stok ${order.orderNumber}`,
        debitAmount: new Dec(0),
        creditAmount: new Dec(order._cogs),
        referenceId: order.id,
        referenceType: 'ORDER',
        transactionDate: new Date(),
        createdById: effectiveUserId,
      });
    }

    // Create all journal entries in a transaction
    for (const entry of entries) {
      await this.prisma.journalEntry.create({ data: entry });
    }

    return entries;
  }

  // ===== Financial Reports =====
  async getProfitAndLoss(branchId: string, options?: { startDate?: Date; endDate?: Date }) {
    const entries = await this.prisma.journalEntry.findMany({
      where: {
        branchId,
        ...(options?.startDate && options?.endDate
          ? { transactionDate: { gte: options.startDate, lte: options.endDate } }
          : {}),
      },
    });

    const revenue = entries
      .filter((e) => e.entryType === 'SALES')
      .reduce((sum, e) => sum + Number(e.creditAmount), 0);

    const cogs = entries
      .filter((e) => e.entryType === 'COST_OF_SALES')
      .reduce((sum, e) => sum + Number(e.debitAmount), 0);

    const expenses = entries
      .filter((e) => e.entryType === 'EXPENSE')
      .reduce((sum, e) => sum + Number(e.debitAmount), 0);

    return {
      totalRevenue: revenue,
      totalCOGS: cogs,
      grossProfit: revenue - cogs,
      totalExpenses: expenses,
      netProfit: revenue - cogs - expenses,
    };
  }

  async getBalanceSheet(branchId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { branchId },
    });

    const entries = await this.prisma.journalEntry.findMany({
      where: { branchId },
    });

    const balances: Record<string, number> = {};
    accounts.forEach((a) => {
      balances[a.id] = 0;
    });

    entries.forEach((e) => {
      if (balances[e.accountId] !== undefined) {
        balances[e.accountId] += Number(e.debitAmount) - Number(e.creditAmount);
      }
    });

    const assets = accounts
      .filter((a) => a.type === 'ASSET')
      .reduce((sum, a) => sum + (balances[a.id] || 0), 0);

    const liabilities = accounts
      .filter((a) => a.type === 'LIABILITY')
      .reduce((sum, a) => sum + (balances[a.id] || 0), 0);

    const equity = accounts
      .filter((a) => a.type === 'EQUITY')
      .reduce((sum, a) => sum + (balances[a.id] || 0), 0);

    return {
      assets,
      liabilities,
      equity,
      totalLiabilitiesAndEquity: liabilities + equity,
      accounts: accounts.map((a) => ({
        ...a,
        balance: balances[a.id] || 0,
      })),
    };
  }
}