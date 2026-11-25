function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3001/api`;
  }
  return 'http://localhost:3001/api';
}

export class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('faianaya_token', token);
      document.cookie = `faianaya_token=${encodeURIComponent(token)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      const fromStorage = localStorage.getItem('faianaya_token');
      if (fromStorage) return fromStorage;
      const match = document.cookie.match(new RegExp('(^| )faianaya_token=([^;]+)'));
      if (match) return decodeURIComponent(match[2]);
    }
    return null;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('faianaya_token');
      document.cookie = 'faianaya_token=; path=/; max-age=0; SameSite=Lax';
    }
  }

  private async request(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(`${getApiUrl()}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Terjadi kesalahan');
    }

    return response.json();
  }

  get(endpoint: string, params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`${endpoint}${query}`);
  }

  post(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
  }
}

export const api = new ApiClient();