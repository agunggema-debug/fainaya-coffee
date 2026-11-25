import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Daftar halaman yang memerlukan autentikasi (PRD 4.3 - Keamanan)
const protectedPages = [
  '/dashboard',
  '/pos',
  '/kds',
  '/tables',
  '/queue',
  '/inventory',
  '/products',
  '/customers',
  '/accounting',
  '/users',
  '/hr',
  '/reservations',
];

/**
 * Middleware untuk proteksi route (Route Protection)
 * - Mencegah akses halaman tanpa JWT cookie
 * - Mengarahkan ke /login jika belum terautentikasi
 * - Melewati API routes, static files, dan halaman publik
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('faianaya_token');
  const pathname = request.nextUrl.pathname;

  // Cek apakah pathname berada di dalam halaman terproteksi
  const isProtectedPage = protectedPages.some((page) =>
    pathname.startsWith(page),
  );

  // Redirect halaman terproteksi ke /login jika belum ada token
  if (isProtectedPage && !token) {
    const loginUrl = new URL('/login', request.url);
    // Simpan halaman asal untuk redirect setelah login
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah terautentikasi dan mengakses /login, redirect ke dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

/**
 * Konfigurasi matcher untuk middleware.
 * - Melewati API routes, Next.js static files, dan image optimization
 */
export const config = {
  matcher: [
    /*
     * Match semua halaman terendpoint (kecuali API routes, static files,
     * Next.js internals, dan file dengan ekstensi (CSS, JSON, dll.)
     */
    '/((?!api/|_next/static|_next/image|.*\\..*).*)',
  ],
};