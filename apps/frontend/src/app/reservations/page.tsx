'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus } from 'lucide-react';
import { NeumorphicButton } from '@/components/NeumorphicButton';
import { NeumorphicCard } from '@/components/NeumorphicCard';
import { NeumorphicInput } from '@/components/NeumorphicInput';

const BRANCH_ID = 'MAIN-001';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resData, tableData] = await Promise.all([
        api.get('/reservations?branchId=' + BRANCH_ID),
        api.get('/tables?branchId=' + BRANCH_ID),
      ]);
      setReservations(resData);
      setTables(tableData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = reservations.filter(
    (r) => statusFilter === 'ALL' || r.status === statusFilter,
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reservations', {
        tableId: (e.target as any).elements.tableId.value,
        customerName: (e.target as any).elements.customerName.value,
        customerPhone: (e.target as any).elements.customerPhone.value,
        guestCount: Number((e.target as any).elements.guestCount.value) || 1,
        reservationDate: (e.target as any).elements.reservationDate.value,
        notes: (e.target as any).elements.notes.value,
        branchId: BRANCH_ID,
      });
      setFormOpen(false);
      loadData();
    } catch (err) {
      alert('Gagal membuat reservasi');
    }
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await api.patch('/reservations/' + id + '/status', { status });
      loadData();
    } catch (err) {
      alert('Gagal mengubah status');
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
      case 'SEATED': return 'bg-green-100 text-green-700';
      case 'COMPLETED': return 'bg-green-200 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'NO_SHOW': return 'bg-gray-100 text-gray-700';
      default: return 'bg-coffee-100 text-coffee-700';
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
          <h1 className="text-2xl font-bold text-coffee-900">Reservasi & Antrean</h1>
          <p className="text-coffee-600">Kelola reservasi meja dan daftar tunggu pelanggan</p>
        </div>
        <NeumorphicButton onClick={() => setFormOpen(true)} className="bg-coffee-700 text-white">
          <Plus size={18} /> Reservasi Baru
        </NeumorphicButton>
      </div>

      <div className="flex gap-2">
        {['ALL', 'PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={
              statusFilter === s
                ? 'neumorphic-pressed bg-coffee-700 text-white border-coffee-700'
                : 'neumorphic-btn text-coffee-600 border-coffee-300'
            }
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
