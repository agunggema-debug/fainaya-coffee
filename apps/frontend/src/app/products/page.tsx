'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Coffee, Plus, Edit, Trash2 } from 'lucide-react';
import { NeumorphicButton } from '@/components/NeumorphicButton';
import { NeumorphicCard } from '@/components/NeumorphicCard';
import { NeumorphicInput } from '@/components/NeumorphicInput';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products?branchId=MAIN-001').then(setProducts).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-700"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-coffee-900">Manajemen Produk</h1>
          <p className="text-coffee-600">Katalog menu kedai kopi</p>
        </div>
        <NeumorphicButton className="bg-coffee-700 text-white"><Plus size={18} /> Tambah Produk</NeumorphicButton>
      </div>

      <NeumorphicCard>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-coffee-300">
                <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Nama Produk</th>
                <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Kategori</th>
                <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Harga Jual</th>
                <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">HPP/COGS</th>
                <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Stasiun</th>
                <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-coffee-200">
                  <td className="py-3 px-4 text-coffee-900 font-medium">{p.name}</td>
                  <td className="py-3 px-4 text-coffee-700">{p.category?.name || '-'}</td>
                  <td className="py-3 px-4 text-coffee-700">Rp {Number(p.sellingPrice || 0).toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4 text-coffee-700">Rp {Number(p.costPrice || 0).toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4 text-coffee-700 text-capitalize">{p.station || 'barista'}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <NeumorphicButton onClick={() => alert('Edit ' + p.name)} className="px-2 py-1 text-xs text-blue-600"><Edit size={14} /></NeumorphicButton>
                      <NeumorphicButton onClick={() => alert('Hapus ' + p.name)} className="px-2 py-1 text-xs text-red-600"><Trash2 size={14} /></NeumorphicButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NeumorphicCard>
    </div>
  );
}