'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart3, CreditCard, FileText, Plus } from 'lucide-react';
import { NeumorphicButton } from '@/components/NeumorphicButton';
import { NeumorphicCard } from '@/components/NeumorphicCard';
import { NeumorphicInput } from '@/components/NeumorphicInput';

const BRANCH_ID = 'MAIN-001';

export default function AccountingPage() {
  const [summary, setSummary] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [journal, setJournal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    try {
      const [sumData, accData, jourData] = await Promise.all([
        api.get('/accounting/financial-summary?branchId=' + BRANCH_ID),
        api.get('/accounting/accounts?branchId=' + BRANCH_ID),
        api.get('/accounting/journal-entries?branchId=' + BRANCH_ID + (startDate ? '&startDate=' + startDate : '') + (endDate ? '&endDate=' + endDate : '')),
      ]);
      setSummary(sumData);
      setAccounts(accData || []);
      setJournal(jourData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-700"></div>
      </div>
    );
  }

  const pnl = summary?.profitAndLoss || {};
  const bs = summary?.balanceSheet || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-coffee-900">Akuntansi & Keuangan</h1>
          <p className="text-coffee-600">Laporan laba rugi, neraca, dan jurnal transaksi</p>
        </div>
        <NeumorphicButton className="bg-coffee-700 text-white"><Plus size={18} /> Transaksi Baru</NeumorphicButton>
      </div>

      <NeumorphicInput label="Tanggal Awal" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <NeumorphicInput label="Tanggal Akhir" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NeumorphicCard className="p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-coffee-900 font-bold text-lg">Laba Bersih</h2>
              <p className="text-coffee-600 text-sm">P&amp;L - Keseluruhan</p>
            </div>
            <FileText size={24} className="text-green-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-coffee-900">Rp {Number(pnl.netProfit || 0).toLocaleString('id-ID')}</div>
            <div className="text-sm text-coffee-600">Pendapatan: Rp {Number(pnl.totalRevenue || 0).toLocaleString('id-ID')} | HPP: Rp {Number(pnl.totalCOGS || 0).toLocaleString('id-ID')}</div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard className="p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-coffee-900 font-bold text-lg">Aset</h2>
              <p className="text-coffee-600 text-sm">Neraca - Aset</p>
            </div>
            <CreditCard size={24} className="text-blue-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-coffee-900">Rp {Number(bs.assets || 0).toLocaleString('id-ID')}</div>
            <div className="text-sm text-coffee-600">Liabilitas: Rp {Number(bs.liabilities || 0).toLocaleString('id-ID')} | Ekuitas: Rp {Number(bs.equity || 0).toLocaleString('id-ID')}</div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard className="p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-coffee-900 font-bold text-lg">Total Transaksi</h2>
              <p className="text-coffee-600 text-sm">Jurnal Entri</p>
            </div>
            <BarChart3 size={24} className="text-yellow-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-coffee-900">{journal.length}</div>
            <div className="text-sm text-coffee-600">Entri jurnal terbaru</div>
          </div>
        </NeumorphicCard>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NeumorphicCard>
          <h2 className="text-lg font-bold text-coffee-900 mb-4">Chart of Accounts</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-coffee-300">
                  <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Kode</th>
                  <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Nama Akun</th>
                  <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Tipe</th>
                  <th className="py-3 px-4 text-right text-coffee-600 text-sm font-medium">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-b border-coffee-200">
                    <td className="py-3 px-4 text-coffee-700 text-sm font-mono">{a.code}</td>
                    <td className="py-3 px-4 text-coffee-900 font-medium">{a.name}</td>
                    <td className="py-3 px-4 text-coffee-700 text-sm capitalize">{a.type}</td>
                    <td className="py-3 px-4 text-right text-coffee-700 text-sm">Rp 0</td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-coffee-600">Tidak ada akun</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </NeumorphicCard>

        <NeumorphicCard>
          <h2 className="text-lg font-bold text-coffee-900 mb-4">Jurnal Entri Terbaru</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-coffee-300">
                  <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Tanggal</th>
                  <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Akun</th>
                  <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Tipe</th>
                  <th className="py-3 px-4 text-right text-coffee-600 text-sm font-medium">Debet</th>
                  <th className="py-3 px-4 text-right text-coffee-600 text-sm font-medium">Kredit</th>
                </tr>
              </thead>
              <tbody>
                {journal.map((j) => (
                  <tr key={j.id} className="border-b border-coffee-200">
                    <td className="py-3 px-4 text-coffee-700 text-sm">{new Date(j.transactionDate).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 px-4 text-coffee-900 font-medium">{j.account?.name || j.accountId}</td>
                    <td className="py-3 px-4 text-coffee-700 text-sm capitalize">{j.entryType}</td>
                    <td className="py-3 px-4 text-right text-coffee-700 text-sm">Rp {Number(j.debitAmount || 0).toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 text-right text-coffee-700 text-sm">Rp {Number(j.creditAmount || 0).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {journal.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-coffee-600">Tidak ada entri jurnal</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
}
