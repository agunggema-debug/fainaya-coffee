'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, User } from '@/lib/useUser';
import {
  LayoutDashboard,
  ShoppingCart,
  Table,
  ChefHat,
  Package,
  Users,
  BarChart3,
  LogOut,
  Coffee,
  Settings,
  Calendar,
  Clock,
  CreditCard,
  Home,
  Minus,
  HelpCircle,
  Bell,
} from 'lucide-react';
import { api } from '@/lib/api';

// Definisikan menu dengan role yang diperbolehkan (PRD 4.3 - RBAC)
interface NavItem {
  name: string;
  href: string;
  icon: typeof Home;
  roles: string[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN_HQ', 'MANAGER_BRANCH', 'KASIR', 'BARISTA', 'WAITER'] },
  { name: 'POS', href: '/pos', icon: ShoppingCart, roles: ['ADMIN_HQ', 'MANAGER_BRANCH', 'KASIR'] },
  { name: 'Meja', href: '/tables', icon: Table, roles: ['ADMIN_HQ', 'MANAGER_BRANCH', 'KASIR', 'WAITER'] },
  { name: 'Reservasi', href: '/reservations', icon: Calendar, roles: ['ADMIN_HQ', 'MANAGER_BRANCH'] },
  { name: 'Antrean', href: '/queue', icon: Clock, roles: ['ADMIN_HQ', 'MANAGER_BRANCH', 'KASIR', 'BARISTA'] },
  { name: 'KDS Dapur', href: '/kds', icon: ChefHat, roles: ['ADMIN_HQ', 'MANAGER_BRANCH', 'BARISTA'] },
  { name: 'Inventaris', href: '/inventory', icon: Package, roles: ['ADMIN_HQ', 'MANAGER_BRANCH'] },
  { name: 'Produk', href: '/products', icon: Coffee, roles: ['ADMIN_HQ', 'MANAGER_BRANCH', 'KASIR'] },
  { name: 'Pelanggan', href: '/customers', icon: Users, roles: ['ADMIN_HQ', 'MANAGER_BRANCH', 'KASIR'] },
  { name: 'Akuntansi', href: '/accounting', icon: CreditCard, roles: ['ADMIN_HQ', 'MANAGER_BRANCH'] },
  { name: 'Karyawan', href: '/users', icon: Users, roles: ['ADMIN_HQ'] },
  { name: 'HR & Shift', href: '/hr', icon: Clock, roles: ['ADMIN_HQ'] },
  { name: 'Laporan', href: '/dashboard', icon: BarChart3, roles: ['ADMIN_HQ', 'MANAGER_BRANCH'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutError, setLogoutError] = useState('');

  // Fetch user data
  React.useEffect(() => {
    api
      .get('/auth/profile')
      .then((data: User) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore error
    } finally {
      window.location.href = '/login';
    }
  };

  const filteredNavItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false,
  );

  return (
    <aside className="w-64 neumorphic-card border-r border-coffee-300 flex flex-col p-4 shrink-0">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-coffee-700 flex items-center justify-center text-white shadow-[4px_4px_8px_#d1c9bd,_-4px_-4px_8px_#ffffff]">
          <Coffee size={24} />
        </div>
        <span className="text-coffee-900 font-bold text-xl tracking-tight">
          Faianaya
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'neumorphic-pressed bg-coffee-200 text-coffee-900'
                  : 'neumorphic-btn text-coffee-600 hover:bg-coffee-200'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-coffee-300">
        {user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl neumorphic-btn bg-coffee-200">
              <Users size={18} />
              <span className="text-sm font-medium text-coffee-900">
                {user.name}
              </span>
            </div>
            <div className="px-4 py-2 text-xs text-coffee-500">
              {user.role.replace(/_/g, ' ')}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl neumorphic-btn text-red-600 hover:bg-red-50 transition-colors w-full"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Keluar</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => (window.location.href = '/login')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl neumorphic-btn text-coffee-600 hover:bg-coffee-200 transition-colors w-full"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Keluar / Login</span>
          </button>
        )}
      </div>
    </aside>
  );
}