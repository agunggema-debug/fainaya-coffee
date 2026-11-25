'use client';

import React, { useEffect, useState } from 'react';
import { useUser, User } from '@/lib/useUser';
import { Bell, LogOut, Moon, Sun, LayoutDashboard, UserIcon } from 'lucide-react';
import { api } from '@/lib/api';

export function TopBar() {
  const { user, loading } = useUser();
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore error
    } finally {
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <header className="h-16 neumorphic-card border-b border-coffee-300 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-coffee-900 font-semibold">Faianaya Coffee</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="neumorphic-card w-10 h-10 rounded-full flex items-center justify-center text-coffee-700 font-medium">
            <UserIcon size={20} />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 neumorphic-card border-b border-coffee-300 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button className="neumorphic-btn p-2 rounded-lg text-coffee-600">
          <LayoutDashboard size={24} />
        </button>
        <div className="hidden md:flex items-center gap-1 text-coffee-700 text-sm font-medium">
          <span className="text-coffee-900">Faianaya Coffee</span>
          <span>/</span>
          <span>Cabang Utama</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="neumorphic-btn p-2 rounded-lg text-coffee-600 hidden md:block">
          <Moon size={20} />
        </button>
        <button
          onClick={handleLogout}
          className="neumorphic-btn p-2 rounded-lg text-coffee-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
        </button>
        <div className="neumorphic-card w-10 h-10 rounded-full flex items-center justify-center text-coffee-700 font-medium shadow-[4px_4px_8px_#d1c9bd,_-4px_-4px_8px_#ffffff]">
          <UserIcon size={20} />
        </div>
      </div>
    </header>
  );
}