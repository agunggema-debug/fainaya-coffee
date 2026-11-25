// Seed data for Faianaya Coffee - Accounting (Chart of Accounts & Period)
import { PrismaClient, AccountType } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

export async function seedAccounting(branches: any[]) {
  const accountTemplates = [
    { code: '1-1-01', name: 'Kas Kasir (Cash on Hand)', type: AccountType.ASSET, description: 'Uang tunai kasir' },
    { code: '1-1-02', name: 'Bank BCA Operasional Kedai', type: AccountType.ASSET, description: 'Rekening penerimaan QRIS & EDC' },
    { code: '1-2-01', name: 'Persediaan Bahan Baku (Inventory)', type: AccountType.ASSET, description: 'Stok biji kopi, susu, sirup, dll' },
    { code: '2-1-01', name: 'Utang Pajak Restoran (PB1 / Tax Payable)', type: AccountType.LIABILITY, description: 'Pajak restoran 11%' },
    { code: '3-1-01', name: 'Modal Disetor Pemilik Fainaya', type: AccountType.EQUITY, description: 'Modal awal ekuitas' },
    { code: '4-01-01', name: 'Pendapatan Penjualan Makanan & Minuman', type: AccountType.REVENUE, description: 'Pendapatan transaksi POS' },
    { code: '5-01-01', name: 'Harga Pokok Penjualan (HPP / COGS)', type: AccountType.EXPENSE, description: 'HPP pemakaian bahan baku BOM' },
    { code: '6-01-01', name: 'Beban Gaji & Upah Karyawan', type: AccountType.EXPENSE, description: 'Gaji barista, kasir, waiter' },
    { code: '6-01-02', name: 'Beban Utilitas (Listrik, Air & WiFi)', type: AccountType.EXPENSE, description: 'Biaya operasional bulanan' },
  ];

  for (const branch of branches) {
    for (const acc of accountTemplates) {
      const existing = await prisma.account.findFirst({
        where: { branchId: branch.id, code: acc.code },
      });
      if (!existing) {
        await prisma.account.create({
          data: {
            id: uuid(),
            branchId: branch.id,
            code: acc.code,
            name: acc.name,
            type: acc.type,
            description: acc.description,
            isActive: true,
          },
        });
      }
    }

    // Accounting Period
    const now = new Date();
    const periodName = `Periode ${now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const existingPeriod = await prisma.accountingPeriod.findFirst({
      where: { branchId: branch.id, name: periodName },
    });
    if (!existingPeriod) {
      await prisma.accountingPeriod.create({
        data: {
          id: uuid(),
          branchId: branch.id,
          name: periodName,
          startDate: startOfMonth,
          endDate: endOfMonth,
          isClosed: false,
        },
      });
    }
  }
}
