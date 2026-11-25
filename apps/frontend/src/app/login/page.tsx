'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Coffee, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { NeumorphicButton } from '@/components/NeumorphicButton';
import { NeumorphicCard } from '@/components/NeumorphicCard';
import { NeumorphicInput } from '@/components/NeumorphicInput';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateForm = () => {
    if (!email.trim()) {
      setServerError('Email wajib diisi');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setServerError('Format email tidak valid');
      return false;
    }
    if (password.length < 6) {
      setServerError('Password minimal 6 karakter');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setServerError('');
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res && res.access_token) {
        api.setToken(res.access_token);
      }
      window.location.href = '/dashboard';
    } catch (err: any) {
      setServerError(err.message || 'Login gagal');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen neumorphic-bg flex items-center justify-center px-4">
      <NeumorphicCard className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-coffee-700 flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_8px_#d1c9bd,_-4px_-4px_8px_#ffffff]">
            <Coffee size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-coffee-900">Faianaya Coffee</h1>
          <p className="text-coffee-600 text-sm">Sistem Manajemen Kedai Kopi</p>
        </div>

        {serverError && (
          <div className="mb-6 p-3 rounded-xl text-red-600 text-sm bg-red-50 border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} />
            {serverError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <NeumorphicInput
            label="Email"
            type="email"
            placeholder="admin@faianaya.coffee"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <NeumorphicInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <NeumorphicButton
            type="submit"
            disabled={loading}
            className="w-full bg-coffee-700 text-white hover:bg-coffee-800 shadow-[4px_4px_8px_#d1c9bd,_-4px_-4px_8px_#ffffff]"
          >
            {loading ? 'Memuat...' : 'Masuk'}
            <ArrowRight size={18} className="ml-2" />
          </NeumorphicButton>
        </form>

        <div className="mt-8 pt-6 border-t border-coffee-300 text-center">
          <p className="text-coffee-600 text-sm mb-3">Klik akun demo untuk isi otomatis:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => { setEmail('admin@faianaya.coffee'); setPassword('admin123'); setServerError(''); }}
              className="p-2.5 rounded-xl text-left bg-coffee-100 hover:bg-coffee-200 border border-coffee-300 transition"
            >
              <span className="font-semibold block text-coffee-900">Admin HQ</span>
              <span className="text-[11px] text-coffee-600">admin@faianaya.coffee</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('kasir@faianaya.coffee'); setPassword('kasir123'); setServerError(''); }}
              className="p-2.5 rounded-xl text-left bg-coffee-100 hover:bg-coffee-200 border border-coffee-300 transition"
            >
              <span className="font-semibold block text-coffee-900">Kasir</span>
              <span className="text-[11px] text-coffee-600">kasir@faianaya.coffee</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('barista@faianaya.coffee'); setPassword('barista123'); setServerError(''); }}
              className="p-2.5 rounded-xl text-left bg-coffee-100 hover:bg-coffee-200 border border-coffee-300 transition"
            >
              <span className="font-semibold block text-coffee-900">Barista</span>
              <span className="text-[11px] text-coffee-600">barista@faianaya.coffee</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('waiter@faianaya.coffee'); setPassword('waiter123'); setServerError(''); }}
              className="p-2.5 rounded-xl text-left bg-coffee-100 hover:bg-coffee-200 border border-coffee-300 transition"
            >
              <span className="font-semibold block text-coffee-900">Waiter</span>
              <span className="text-[11px] text-coffee-600">waiter@faianaya.coffee</span>
            </button>
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
}