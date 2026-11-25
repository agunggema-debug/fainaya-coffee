'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { Coffee, ChefHat } from 'lucide-react';
import { OrderCard } from '@/components/OrderCard';

export default function KDSPage() {
  const [station, setStation] = useState<'barista' | 'kitchen' | 'all'>('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { socket } = useSocket('MAIN-001', (data: any) => {
    setLoading(false);
  });

  useEffect(() => {
    loadOrders();
  }, [station]);

  const loadOrders = async () => {
    try {
      const data = await api.get(`/kds/station?branchId=MAIN-001&station=${station}`);
      setLoading(false);
      setOrders(data || []);
    } catch (err) {
      setLoading(false);
    }
  };

  const updateStatus = async (itemId: string, newStatus: string) => {
    try {
      await api.patch(`/kds/items/${itemId}/status`, { status: newStatus });
      loadOrders();
    } catch (err) {
      alert('Gagal memperbarui status');
    }
  };

  const isSlaBreached = (item: any) => {
    const mins = Math.floor((Date.now() - new Date(item.order.createdAt).getTime()) / 60000);
    return mins > 15;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-700"></div>
      </div>
    );
  }

  const baristaOrders = orders.filter((o) => o.station === 'barista');
  const kitchenOrders = orders.filter((o) => o.station === 'kitchen');

  return (
    <div className="h-screen p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-coffee-900">Kitchen Display System</h1>
          <p className="text-coffee-600">Pantauan pesanan dapur & barista secara real-time</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStation('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium neumorphic-btn ${station === 'all' ? 'text-coffee-900' : 'text-coffee-600'}`}
          >
            Semua
          </button>
          <button
            onClick={() => setStation('barista')}
            className={`px-4 py-2 rounded-lg text-sm font-medium neumorphic-btn ${station === 'barista' ? 'text-coffee-900' : 'text-coffee-600'}`}
          >
            <Coffee size={16} className="mr-1" /> Barista
          </button>
          <button
            onClick={() => setStation('kitchen')}
            className={`px-4 py-2 rounded-lg text-sm font-medium neumorphic-btn ${station === 'kitchen' ? 'text-coffee-900' : 'text-coffee-600'}`}
          >
            <ChefHat size={16} className="mr-1" /> Dapur
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {station !== 'kitchen' && (
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Coffee size={20} className="text-coffee-700" />
              <h2 className="text-coffee-900 font-semibold">Stasiun Barista</h2>
              <span className="ml-auto text-xs text-coffee-500">{baristaOrders.length} pesanan</span>
            </div>
            <div className="space-y-3">
              {baristaOrders.length === 0 ? (
                <div className="text-center py-8 text-coffee-600">
                  <p>Tidak ada pesanan barista</p>
                </div>
              ) : (
                baristaOrders.map((item) => (
                  <OrderCard
                    key={item.id}
                    item={item}
                    onUpdate={updateStatus}
                    isSlaBreached={isSlaBreached(item)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {station !== 'barista' && (
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <ChefHat size={20} className="text-coffee-700" />
              <h2 className="text-coffee-900 font-semibold">Stasiun Dapur</h2>
              <span className="ml-auto text-xs text-coffee-500">{kitchenOrders.length} pesanan</span>
            </div>
            <div className="space-y-3">
              {kitchenOrders.length === 0 ? (
                <div className="text-center py-8 text-coffee-600">
                  <p>Tidak ada pesanan dapur</p>
                </div>
              ) : (
                kitchenOrders.map((item) => (
                  <OrderCard
                    key={item.id}
                    item={item}
                    onUpdate={updateStatus}
                    isSlaBreached={isSlaBreached(item)}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}