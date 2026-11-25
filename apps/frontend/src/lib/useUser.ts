import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  branchId?: string;
}

/**
 * Hook untuk mendapatkan informasi pengguna yang sedang login.
 * Mengambil data dari /auth/profile (JWT dari cookie).
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/auth/profile')
      .then((data: User) => {
        setUser(data);
      })
      .catch(() => {
        // Tidak terautentikasi / token sudah tidak valid
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { user, loading };
}