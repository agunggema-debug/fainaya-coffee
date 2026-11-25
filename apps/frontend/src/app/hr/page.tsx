'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Clock, Users, Plus, FileText } from 'lucide-react';
import { NeumorphicButton } from '@/components/NeumorphicButton';
import { NeumorphicCard } from '@/components/NeumorphicCard';

const BRANCH_ID = 'MAIN-001';

const SHIFT_LABELS = {
  SCHEDULED: 'Terjadwal',
  IN_PROGRESS: 'Sedang Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

export default function HrPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [shiftData, attData] = await Promise.all([
        api.get('/hr/shifts?branchId=' + BRANCH_ID),
        api.get('/hr/attendance?branchId=' + BRANCH_ID),
      ]);
      setShifts(shiftData || []);
      setAttendances(attData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-coffee-900">Manajemen Karyawan & Shift</h1>
          <p className="text-coffee-600">Shift, absensi, dan kinerja karyawan</p>
        </div>
        <NeumorphicButton className="bg-coffee-700 text-white"><Plus size={18} /> Tambah Shift</NeumorphicButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NeumorphicCard className="p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-coffee-900 font-bold text-lg">Total Karyawan</h2>
              <p className="text-coffee-600 text-sm">Data karyawan aktif</p>
            </div>
            <Users size={24} className="text-blue-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-coffee-900">{shifts.length}</div>
            <div className="text-sm text-coffee-600">Shift tercatat</div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard className="p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-coffee-900 font-bold text-lg">Hadir Hari Ini</h2>
              <p className="text-coffee-600 text-sm">Karyawan yang clock-in</p>
            </div>
            <Clock size={24} className="text-green-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-coffee-900">{attendances.filter((a) => a.clockIn).length}</div>
            <div className="text-sm text-coffee-600">Dari {attendances.length} absensi</div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard className="p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-coffee-900 font-bold text-lg">Shift Aktif</h2>
              <p className="text-coffee-600 text-sm">Sedang berlangsung</p>
            </div>
            <FileText size={24} className="text-yellow-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-coffee-900">{shifts.filter((s) => s.status === 'IN_PROGRESS').length}</div>
            <div className="text-sm text-coffee-600">Shift dalam progres</div>
          </div>
        </NeumorphicCard>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NeumorphicCard>
          <h2 className="text-lg font-bold text-coffee-900 mb-4">Daftar Shift</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-coffee-300">
                  <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Nama Shift</th>
                  <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Tanggal</th>
                  <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Status</th>
                  <th className="py-3 px-4 text-right text-coffee-600 text-sm font-medium">Total Jam</th>
                  <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s) => (
                  <tr key={s.id} className="border-b border-coffee-200">
                    <td className="py-3 px-4 text-coffee-900 font-medium">{s.name || 'Shift #' + s.id.slice(0, 6)}</td>
                    <td className="py-3 px-4 text-coffee-700 text-sm">{s.startDate ? new Date(s.startDate).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={getStatusClass(s.status) + ' px-2 py-1 rounded text-xs font-bold'}>
                        {SHIFT_LABELS[s.status as keyof typeof SHIFT_LABELS] || s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-coffee-700 text-sm">{s.totalHours || '-'} jam</td>
                    <td className="py-3 px-4 text-coffee-700 text-sm">{s.notes || '-'}</td>
                  </tr>
                ))}
                {shifts.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-coffee-600">Tidak ada shift</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </NeumorphicCard>

        <NeumorphicCard>
          <h2 className="text-lg font-bold text-coffee-900 mb-4">Absensi Karyawan</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-coffee-300">
                  <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Karyawan</th>
                  <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Clock In</th>
                  <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Clock Out</th>
                  <th className="py-3 px-4 text-left text-coffee-600 text-sm font-medium">Metode</th>
                  <th className="py-3 px-4 text-right text-coffee-600 text-sm font-medium">Total Jam</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((a) => (
                  <tr key={a.id} className="border-b border-coffee-200">
                    <td className="py-3 px-4 text-coffee-900 font-medium">{a.user?.name || 'Karyawan'}</td>
                    <td className="py-3 px-4 text-coffee-700 text-sm">{a.clockIn ? new Date(a.clockIn).toLocaleTimeString('id-ID') : '-'}</td>
                    <td className="py-3 px-4 text-coffee-700 text-sm">{a.clockOut ? new Date(a.clockOut).toLocaleTimeString('id-ID') : '-'}</td>
                    <td className="py-3 px-4 text-coffee-700 text-sm capitalize">{a.clockInPin ? 'PIN' : 'Foto'}</td>
                    <td className="py-3 px-4 text-right text-coffee-700 text-sm">{a.totalHours || '-'} jam</td>
                  </tr>
                ))}
                {attendances.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-coffee-600">Tidak ada absensi</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
}

function getStatusClass(status: string) {
  if (status === 'IN_PROGRESS') return 'bg-green-100 text-green-700';
  if (status === 'COMPLETED') return 'bg-blue-100 text-blue-700';
  return 'bg-coffee-100 text-coffee-700';
}
