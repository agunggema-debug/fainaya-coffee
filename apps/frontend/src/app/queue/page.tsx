'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Clock, User, CheckCircle, Plus } from 'lucide-react';
import { NeumorphicButton } from '@/components/NeumorphicButton';
import { NeumorphicCard } from '@/components/NeumorphicCard';

const BRANCH_ID = 'MAIN-001';

export default function QueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const data = await api.get('/reservations/queue/all?branchId=' + BRANCH_ID);
      setQueue(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const callNext = async () => {
    try {
      await api.post('/reservations/queue/call-next?branchId=' + BRANCH_ID, {});
      loadQueue();
    } catch (err) {
      alert('Gagal memanggil antrean berikutnya');
    }
  };

  const markServed = async (id: string) => {
    try {
      await api.patch('/reservations/queue/' + id + '/serve', {});
      loadQueue();
    } catch (err) {
      alert('Gagal menandai selesai');
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
          <h1 className="text-2xl font-bold text-coffee-900">Layar Antrean</h1>
          <p className="text-coffee-600">Daftar tunggu pelanggan dan status pesanan</p>
        </div>
        <NeumorphicButton onClick={callNext} className="bg-coffee-700 text-white">
          <Plus size={18} /> Panggil Berikutnya
        </NeumorphicButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NeumorphicCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-coffee-900 font-bold text-lg">Antrean Aktif</h2>
              <p className="text-coffee-600 text-sm">{queue.length} antrean</p>
            </div>
            <Clock size={24} className="text-coffee-700" />
          </div>
          <div className="space-y-3">
            {queue.length === 0 ? (
              <div className="text-center py-8 text-coffee-600">
                <p>Tidak ada antrean aktif</p>
              </div>
            ) : (
              queue.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-coffee-200 bg-white/30">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-coffee-700 text-white flex items-center justify-center text-sm font-bold">
                      {item.position}
                    </span>
                    <div>
                      <div className="text-coffee-900 font-medium">{item.order?.orderNumber || 'Order #' + item.id.slice(0, 8)}</div>
                      <div className="text-xs text-coffee-500">{item.order?.customerName || 'Pelanggan'}</div>
                    </div>
                  </div>
                  <NeumorphicButton
                    onClick={() => markServed(item.id)}
                    className="px-3 py-1 text-xs text-green-600"
                  >
                    <CheckCircle size={14} /> Selesai
                  </NeumorphicButton>
                </div>
              ))
            )}
          </div>
        </NeumorphicCard>

        <NeumorphicCard className="p-6">
          <h2 className="text-coffee-900 font-bold text-lg mb-4">Tindakan Antrean</h2>
          <div className="space-y-3">
            <NeumorphicButton
              onClick={callNext}
              className="w-full bg-coffee-700 text-white py-2 rounded-lg font-medium"
            >
              Panggil Antrean Berikutnya
            </NeumorphicButton>
            <NeumorphicButton
              onClick={() => alert('Fitur tambah ke antrean akan segera hadir')}
              className="w-full neumorphic-btn py-2 rounded-lg font-medium text-coffee-600 border border-coffee-300"
            >
              Tambah Pesanan ke Antrean
            </NeumorphicButton>
          </div>
        </NeumorphicCard>

        <NeumorphicCard className="p-6">
          <h2 className="text-coffee-900 font-bold text-lg mb-4">Informasi</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-coffee-600 text-sm">Total Antrean</span>
              <span className="text-coffee-900 font-bold">{queue.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-coffee-600 text-sm">Menunggu Dipanggil</span>
              <span className="text-coffee-900 font-bold">{queue.filter((q) => q.status === 'waiting').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-coffee-600 text-sm">Sedang Dipanggil</span>
              <span className="text-coffee-900 font-bold">{queue.filter((q) => q.status === 'calling').length}</span>
            </div>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
}
