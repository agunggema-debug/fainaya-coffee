'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User, Plus, Search } from 'lucide-react';
import { NeumorphicButton } from '@/components/NeumorphicButton';
import { NeumorphicCard } from '@/components/NeumorphicCard';
import { NeumorphicInput } from '@/components/NeumorphicInput';

const BRANCH_ID = 'MAIN-001';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await api.get('/customers?branchId=' + BRANCH_ID);
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search),
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      await api.post('/customers', {
        name: (form.elements as any).customerName.value,
        phone: (form.elements as any).customerPhone.value,
        email: (form.elements as any).customerEmail.value || undefined,
        notes: (form.elements as any).customerNotes.value || undefined,
        branchId: BRANCH_ID,
      });
      setFormOpen(false);
      loadCustomers();
    } catch (err) {
      alert('Gagal menambahkan pelanggan');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-coffee-900">Manajemen Pelanggan</h1>
          <p className="text-coffee-600">CRM, data pelanggan, dan program loyalitas</p>
        </div>
        <NeumorphicButton onClick={() => setFormOpen(true)} className="bg-coffee-700 text-white">
          <User size={18} /> Pelanggan Baru
        </NeumorphicButton>
      </div>

      <NeumorphicInput
        label="Cari pelanggan"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Nama atau telepon"
      />

      {formOpen && (
        <NeumorphicCard className="p-6">
          <h2 className="text-lg font-bold text-coffee-900 mb-4">Tambah Pelanggan</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <NeumorphicInput
                label="Nama Lengkap"
                value=""
                onChange={() => {}}
                placeholder="Nama pelanggan"
              />
            </div>
            <div>
              <NeumorphicInput
                label="Telepon"
                type="tel"
                value=""
                onChange={() => {}}
                placeholder="0812..."
              />
            </div>
            <div>
              <NeumorphicInput
                label="Email"
                type="email"
                value=""
                onChange={() => {}}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <NeumorphicInput
                label="Catatan"
                value=""
                onChange={() => {}}
                placeholder="Catatan tambahan"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-coffee-700 text-white py-2 rounded-lg font-medium"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="flex-1 neumorphic-btn py-2 rounded-lg font-medium text-coffee-600"
              >
                Batal
              </button>
            </div>
          </form>
        </NeumorphicCard>
      )}


      <NeumorphicCard>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-coffee-300">
                <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Nama</th>
                <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Telepon</th>
                <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Email</th>
                <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Kunjungan</th>
                <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Total Belanja</th>
                <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Poin Loyalitas</th>
                <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Status Member</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-coffee-200">
                  <td className="py-3 px-4 text-coffee-900 font-medium">{c.name}</td>
                  <td className="py-3 px-4 text-coffee-700">{c.phone}</td>
                  <td className="py-3 px-4 text-coffee-700">{c.email || '-'}</td>
                  <td className="py-3 px-4 text-coffee-700">{c.totalVisits}</td>
                  <td className="py-3 px-4 text-coffee-700">Rp {Number(c.totalSpent || 0).toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4 text-coffee-700">{c.loyaltyPoints}</td>
                  <td className="py-3 px-4">
                    <span className={
                      c.isMember
                        ? 'bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold'
                        : 'bg-coffee-100 text-coffee-700 px-2 py-1 rounded text-xs font-bold'
                    }>
                      {c.isMember ? 'Member' : 'Umum'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-coffee-600">
                    Tidak ada pelanggan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </NeumorphicCard>
    </div>
  );
}
