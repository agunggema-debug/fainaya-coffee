'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { NeumorphicCard } from '@/components/NeumorphicCard';
import {
  ShoppingCart,
  Table,
  Clock,
  Users,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/summary', { branchId: 'MAIN-001' })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-coffee-600">
        Memuat dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-coffee-900">Dashboard</h1>
        <p className="text-coffee-600 text-sm">
          Selamat datang di Faianaya Coffee Management System
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Pesanan"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          color="text-coffee-700"
        />
        <StatCard
          title="Pendapatan"
          value={`Rp ${(stats?.totalRevenue || 0).toLocaleString('id-ID')}`}
          icon={TrendingUp}
          color="text-green-600"
        />
        <StatCard
          title="Pesanan Hari Ini"
          value={stats?.todayOrders || 0}
          icon={Clock}
          color="text-blue-600"
        />
        <StatCard
          title="Antrian Pending"
          value={stats?.pendingOrders || 0}
          icon={AlertCircle}
          color="text-orange-600"
        />
        <StatCard
          title="Meja Terisi"
          value={stats?.occupiedTables || 0}
          icon={Table}
          color="text-red-600"
        />
        <StatCard
          title="Karyawan Aktif"
          value={stats?.activeStaff || 0}
          icon={Users}
          color="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <NeumorphicCard className="lg:col-span-2">
          <h3 className="text-coffee-900 font-semibold mb-4">Grafik Penjualan 7 Hari</h3>
          <div className="h-64 neumorphic-card p-4">
            <div className="flex items-end justify-between h-full gap-2">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, i) => (
                <div key={day} className="flex flex-col items-center">
                  <span className="text-xs text-coffee-600 mb-2">{day}</span>
                  <div
                    className="w-full bg-coffee-700 rounded-t-md transition-all hover:bg-coffee-900"
                    style={{ height: `${30 + i * 10}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard>
          <h3 className="text-coffee-900 font-semibold mb-4">Produk Terlaris</h3>
          <div className="space-y-3">
            {['Espresso', 'Latte', 'Cappuccino', 'Matcha Latte', 'Americano'].map(
              (item, i) => (
                <div key={item} className="flex items-center justify-between py-2 border-b border-coffee-200 last:border-0">
                  <span className="text-coffee-700 font-medium">{item}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-coffee-600">{100 - i * 10}</span>
                    <span className="text-coffee-500">pesan</span>
                  </div>
                </div>
              ),
            )}
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  return (
    <NeumorphicCard>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-coffee-600 text-sm">{title}</p>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-coffee-100 flex items-center justify-center text-coffee-700 shadow-[2px_2px_4px_#d1c9bd,_-2px_-2px_4px_#ffffff]">
          <Icon size={20} />
        </div>
      </div>
    </NeumorphicCard>
  );
}