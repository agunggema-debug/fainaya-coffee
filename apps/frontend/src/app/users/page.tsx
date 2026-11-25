'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  Search,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { NeumorphicButton } from '@/components/NeumorphicButton';
import { NeumorphicCard } from '@/components/NeumorphicCard';
import { NeumorphicInput } from '@/components/NeumorphicInput';

const ROLE_LABELS: Record<string, string> = {
  ADMIN_HQ: 'Admin HQ',
  MANAGER_BRANCH: 'Manager Cabang',
  KASIR: 'Kasir',
  BARISTA: 'Barista',
  WAITER: 'Waiter',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN_HQ: 'bg-purple-100 text-purple-700 border-purple-300',
  MANAGER_BRANCH: 'bg-blue-100 text-blue-700 border-blue-300',
  KASIR: 'bg-green-100 text-green-700 border-green-300',
  BARISTA: 'bg-orange-100 text-orange-700 border-orange-300',
  WAITER: 'bg-indigo-100 text-indigo-700 border-indigo-300',
};

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  branchId?: string;
  isActive: boolean;
  commissionRate?: number;
  branch?: { id: string; name: string; code: string };
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'KASIR',
    pin: '',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: PaginatedResponse<User> = await api.get(
        `/users?page=${page}&limit=10&search=${encodeURIComponent(search)}`,
      );
      setUsers(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalUsers(res.pagination?.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'KASIR',
      pin: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: user.role,
      pin: '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      alert(err?.message || 'Gagal menghapus user');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload: any = { ...formData };
        if (!payload.password) delete payload.password;
        if (!payload.pin) delete payload.pin;
        await api.patch(`/users/${editingUser.id}`, payload);
      } else {
        await api.post('/users', formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err?.message || 'Gagal menyimpan user');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-coffee-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-coffee-700" />
            Manajemen Karyawan & User
          </h1>
          <p className="text-coffee-600 text-sm mt-1">
            Kelola hak akses dan peran (Admin HQ, Manager Cabang, Kasir, Barista, Waiter)
          </p>
        </div>
        <NeumorphicButton
          variant="default"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 text-coffee-800"
        >
          <Plus size={18} />
          Tambah Karyawan
        </NeumorphicButton>
      </div>

      {/* Filter and Search */}
      <NeumorphicCard className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" />
          <NeumorphicInput
            type="text"
            placeholder="Cari nama, email, atau telepon..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 w-full"
          />
        </div>
        <div className="text-sm text-coffee-600">
          Total: <span className="font-semibold text-coffee-900">{totalUsers}</span> karyawan terdaftar
        </div>
      </NeumorphicCard>

      {/* Error notification */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Users Table */}
      <NeumorphicCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-coffee-200 bg-coffee-50/50 text-xs font-semibold text-coffee-700 uppercase tracking-wider">
                <th className="py-3 px-4">Nama & Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Cabang</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-coffee-500">
                    Memuat data karyawan...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-coffee-500">
                    Tidak ada karyawan yang ditemukan.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-coffee-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-coffee-900">{user.name}</div>
                      <div className="text-xs text-coffee-500 flex items-center gap-1 mt-0.5">
                        <Mail size={12} /> {user.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${
                          ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-coffee-700">
                      <div className="flex items-center gap-1 text-xs">
                        <Building2 size={13} className="text-coffee-500" />
                        {user.branch?.name || 'Kantor Pusat (HQ)'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-coffee-700 text-xs">
                      {user.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-coffee-500" /> {user.phone}
                        </span>
                      ) : (
                        <span className="text-coffee-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
                          <CheckCircle size={14} /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                          <XCircle size={14} /> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 rounded-lg text-coffee-600 hover:text-coffee-900 hover:bg-coffee-200/50 transition-colors"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                        title="Hapus User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-coffee-200 flex items-center justify-between">
            <span className="text-xs text-coffee-600">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="neumorphic-btn p-2 text-coffee-700 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="neumorphic-btn p-2 text-coffee-700 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </NeumorphicCard>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <NeumorphicCard className="w-full max-w-md p-6 bg-coffee-100">
            <h2 className="text-lg font-bold text-coffee-900 mb-4">
              {editingUser ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-coffee-700 mb-1">
                  Nama Lengkap
                </label>
                <NeumorphicInput
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama karyawan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-coffee-700 mb-1">Email</label>
                <NeumorphicInput
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@faianaya.coffee"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-coffee-700 mb-1">
                  Password {editingUser && '(Kosongkan jika tidak ingin mengubah)'}
                </label>
                <NeumorphicInput
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 karakter"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-coffee-700 mb-1">No. HP</label>
                  <NeumorphicInput
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-coffee-700 mb-1">
                    PIN Presensi (4 digit)
                  </label>
                  <NeumorphicInput
                    type="password"
                    maxLength={4}
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    placeholder="1234"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-coffee-700 mb-1">Peran (Role)</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-coffee-50 border border-coffee-300 rounded-xl text-sm text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                >
                  <option value="KASIR">Kasir</option>
                  <option value="BARISTA">Barista</option>
                  <option value="WAITER">Waiter</option>
                  <option value="MANAGER_BRANCH">Manager Cabang</option>
                  <option value="ADMIN_HQ">Admin HQ</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <NeumorphicButton
                  type="button"
                  variant="default"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </NeumorphicButton>
                <NeumorphicButton type="submit" variant="default" className="text-coffee-900 font-bold">
                  {editingUser ? 'Simpan Perubahan' : 'Buat Karyawan'}
                </NeumorphicButton>
              </div>
            </form>
          </NeumorphicCard>
        </div>
      )}
    </div>
  );
}
