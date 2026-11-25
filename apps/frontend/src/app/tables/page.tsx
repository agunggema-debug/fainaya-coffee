'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Table, Plus } from 'lucide-react';
import { NeumorphicButton } from '@/components/NeumorphicButton';
import { NeumorphicCard } from '@/components/NeumorphicCard';
import { NeumorphicInput } from '@/components/NeumorphicInput';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 border-green-300',
  OCCUPIED: 'bg-red-100 text-red-800 border-red-300',
  RESERVED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  NEEDS_CLEANING: 'bg-blue-100 text-blue-800 border-blue-300',
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Kosong',
  OCCUPIED: 'Terisi',
  RESERVED: 'Reservasi',
  NEEDS_CLEANING: 'Bersihkan',
};

export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', tableNumber: 1, capacity: 2, area: 'indoor' });

  useEffect(() => {
    api.get('/tables?branchId=MAIN-001').then(setTables).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/tables/${id}/status`, { status });
      setTables((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
    } catch (err) {
      alert('Gagal memperbarui status');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-700"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-coffee-900">Manajemen Meja</h1>
          <p className="text-coffee-600">Tata ruang dan status meja</p>
        </div>
        <NeumorphicButton onClick={() => setShowForm(true)} className="bg-coffee-700 text-white">
          <Plus size={18} /> Tambah
        </NeumorphicButton>
      </div>

      {showForm && (
        <NeumorphicCard>
          <h3 className="text-coffee-900 font-semibold mb-4">Tambah Meja</h3>
          <form className="space-y-4">
            <NeumorphicInput label="Nama Meja" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Meja 1" />
            <NeumorphicInput label="Kapasitas" type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 2 })} placeholder="2" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="neumorphic-btn text-coffee-600 px-4 py-2">Batal</button>
              <NeumorphicButton type="submit" className="bg-coffee-700 text-white">Simpan</NeumorphicButton>
            </div>
          </form>
        </NeumorphicCard>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map((table) => (
          <NeumorphicCard key={table.id} className="p-4 cursor-pointer" onClick={() => updateStatus(table.id, table.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE')}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-coffee-900">{table.name}</h4>
              <span className={`px-2 py-1 rounded text-xs font-bold border ${STATUS_COLORS[table.status]}`}>{STATUS_LABELS[table.status]}</span>
            </div>
            <div className="text-xs text-coffee-600">Kapasitas: {table.capacity} org</div>
          </NeumorphicCard>
        ))}
      </div>
    </div>
  );
}