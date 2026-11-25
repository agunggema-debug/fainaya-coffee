'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Package, AlertCircle, Plus } from 'lucide-react';
import { NeumorphicButton } from '@/components/NeumorphicButton';
import { NeumorphicCard } from '@/components/NeumorphicCard';
import { NeumorphicInput } from '@/components/NeumorphicInput';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  [lowStock];

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const [itemsData, lowData] = await Promise.all([
        api.get('/inventory?branchId=MAIN-001'),
        api.get('/inventory/low-stock?branchId=MAIN-001'),
      ]);
      setItems(itemsData);
      setLowStock(lowData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const adjustStock = async (id: string, type: 'IN' | 'OUT', quantity: number) => {
    try {
      await api.post('/inventory/adjust', {
        inventoryId: id,
        quantity,
        type,
        reason: 'Manual adjustment',
      });
      loadInventory();
    } catch (err) {
      alert('Gagal menyesuaikan stok');
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
          <h1 className="text-2xl font-bold text-coffee-900">Inventaris Bahan Baku</h1>
          <p className="text-coffee-600">Pengelolaan stok dan peringatan stok rendah</p>
        </div>
        <NeumorphicButton
          onClick={() => alert('Fitur tambah stok akan segera hadir')}
          className="bg-coffee-700 text-white"
        >
          <Plus size={18} /> Tambah Stok
        </NeumorphicButton>
      </div>

      {lowStock.length > 0 && (
        <NeumorphicCard className="border-2 border-orange-400 bg-orange-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={20} className="text-orange-600" />
            <h3 className="text-coffee-900 font-semibold">Peringatan Stok Rendah</h3>
          </div>
          <div className="space-y-2">
            {lowStock.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-coffee-700">{item.product.name}</span>
                <span className="text-orange-600 font-medium">
                  Stok: {item.currentStock} {item.unit} (Min: {item.minStock} {item.unit})
                </span>
              </div>
            ))}
          </div>
        </NeumorphicCard>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b border-coffee-300">
              <th className="py-3 px-4 text-coffee-600 text-sm font-medium">Produk</th>
              <th className="py-3 px-4 text-coffee-600 text-sm font-medium">Stok Saat Ini</th>
              <th className="py-3 px-4 text-coffee-600 text-sm font-medium">Stok Minimum</th>
              <th className="py-3 px-4 text-coffee-600 text-sm font-medium">Satuan</th>
              <th className="py-3 px-4 text-coffee-600 text-sm font-medium">Status</th>
              <th className="py-3 px-4 text-coffee-600 text-sm font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-coffee-200 hover:bg-white/50 transition-colors">
                <td className="py-3 px-4 text-coffee-900 font-medium">{item.product.name}</td>
                <td className="py-3 px-4 text-coffee-700">{item.currentStock} {item.unit}</td>
                <td className="py-3 px-4 text-coffee-700">{item.minStock} {item.unit}</td>
                <td className="py-3 px-4 text-coffee-600 text-sm">{item.unit}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      Number(item.currentStock) <= Number(item.minStock)
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {Number(item.currentStock) <= Number(item.minStock) ? 'Rendah' : 'Aman'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <NeumorphicButton
                      onClick={() => adjustStock(item.id, 'IN', 10)}
                      className="px-2 py-1 text-xs text-green-600"
                    >
                        +10
                    </NeumorphicButton>
                    <NeumorphicButton
                      onClick={() => adjustStock(item.id, 'OUT', 5)}
                      className="px-2 py-1 text-xs text-red-600"
                    >
                        -5
                    </NeumorphicButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}