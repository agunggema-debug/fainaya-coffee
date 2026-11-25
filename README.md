# Faianaya Coffee - Sistem Manajemen Kedai Kopi Terpadu (Open Source)

![Faianaya Coffee Architecture](https://img.shields.io/badge/Next.js-14_(App_Router)-black?style=flat&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10-ea2845?style=flat&logo=nestjs)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Neumorphism-38bdf8?style=flat&logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1?style=flat&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

**Versi:** 1.1.0  
**Status:** MVP / Production-Ready Development  

**Faianaya Coffee** adalah platform *open-source* berbasis web modern yang dirancang untuk operasional kedai kopi tunggal maupun multi-cabang. Sistem ini mengintegrasikan seluruh alur bisnis F&B: **Point of Sale (POS)**, **Kitchen Display System (KDS)**, **Floor Plan & Meja**, **Katalog Menu & Resep (BOM)**, **Manajemen Pelanggan & Loyalty**, **Shift & Absensi Karyawan**, **Voucher Diskon**, serta **Akuntansi Terpadu** dalam antarmuka *Soft UI / Neumorphism*.

---

## 🚀 Tech Stack Modern

| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| **Frontend** | Next.js 14 (App Router) + React 18 | Server-Side Rendering (SSR) & Client Components |
| **Styling** | Tailwind CSS v3 | Desain *Neumorphism / Soft UI* yang nyaman untuk tablet & desktop |
| **Backend** | NestJS v10 (Node.js) + TypeScript | Arsitektur modular dengan Global Guards, Pipes, dan Filters |
| **Database** | PostgreSQL 16 | Basis data relasional dengan indeks performa tinggi |
| **ORM** | Prisma v5.22 | Type-safe query engine & data migrations |
| **Real-time** | Socket.io v4 (WebSockets) | Sinkronisasi instan POS $\leftrightarrow$ KDS Barista & Dapur |
| **Security** | JWT + Passport + Bcrypt + Helmet | HttpOnly Cookies, RBAC Guards, Rate Limiting (Throttler) |
| **Cache/Queue**| Redis 7 | Antrean transaksi dan optimasi performa |

---

## 📋 Fitur Utama Sistem

- ☕ **Point of Sale (POS Web)**: Pencarian cepat, barcode scanning, hitung kembalian, diskon voucher, split/combine bill, dan dukungan Cash, QRIS, serta Kartu.
- 👨‍🍳 **Kitchen Display System (KDS)**: Tampilan pesanan real-time untuk barista dan kitchen, timer status pesanan (*Preparing*, *Ready*, *Served*).
- 🪑 **Manajemen Meja & Denah (Floor Plan)**: Tata letak visual interaktif (Indoor, Outdoor Garden, Bar Counter) dengan status meja real-time.
- 📦 **Inventaris & Resep (BOM - Bill of Materials)**: Pengurangan otomatis stok bahan baku (biji kopi, susu, cup, sirup) setiap kali pesanan selesai disajikan.
- 👥 **Role-Based Access Control (RBAC)**: Otorisasi bertingkat untuk **Admin HQ**, **Manager Cabang**, **Kasir**, **Barista**, dan **Waiter**.
- 🎁 **CRM & Loyalty Points**: Pengumpulan poin, tingkatan tier (Bronze, Silver, Gold), dan voucher promo.
- ⏰ **HR & Shift Karyawan**: Penjadwalan shift, absensi masuk/keluar (*clock-in / clock-out*) menggunakan PIN rahasia.
- 📊 **Akuntansi & Dashboard**: Jurnal otomatis untuk setiap transaksi, neraca saldo, HPP/COGS, laba rugi, dan tren penjualan.
- 🛵 **Integrasi Delivery App**: Konfigurasi penyesuaian markup harga untuk GrabFood, GoFood, dan ShopeeFood.

---

## 🛠️ Panduan Menjalankan Secara Lokal (Local Access Guide)

### 1. Persyaratan Sistem
Pastikan telah terpasang di komputer Anda:
- **Node.js** v18.x atau v20.x ([Unduh Node.js](https://nodejs.org/))
- **Docker Desktop** (untuk PostgreSQL dan Redis) ([Unduh Docker](https://www.docker.com/products/docker-desktop/))
- **Git**

---

### 2. Langkah Cepat (Quick Start)

#### Langkah 1: Clone Repository & Install Dependencies
Buka terminal dan jalankan:
```bash
git clone https://github.com/your-username/faianaya-coffee.git
cd faianaya-coffee

# Install seluruh dependency monorepo (frontend, backend, shared)
npm install
```

#### Langkah 2: Jalankan Basis Data (PostgreSQL & Redis via Docker)
Pastikan Docker Desktop sudah aktif, lalu jalankan:
```bash
npm run docker:up
```
> *Layanan PostgreSQL (port `5432`) dan Redis (port `6379`) akan berjalan di latar belakang.*

#### Langkah 3: Setup Basis Data & Dummy Data Otomatis
Jalankan satu perintah berikut untuk sinkronisasi skema Prisma dan mengisi data dummy lengkap (14 modul):
```bash
npm run setup:local
```
Perintah di atas akan mengeksekusi:
1. `npm run db:push` (Sinkronisasi tabel database PostgreSQL)
2. `npm run db:seed` (Mengisi data dummy 2 cabang, 8 user ter-enkripsi, produk, meja, bahan baku, voucher, dan transaksi KDS)

#### Langkah 4: Jalankan Aplikasi (Satu Perintah untuk Backend + Frontend)
```bash
npm run dev
```
Aplikasi backend dan frontend akan berjalan secara bersamaan dengan prefix warna:
- **Backend API**: `http://localhost:3001`
- **Frontend POS & Dashboard**: `http://localhost:3000`
- **Dokumentasi Interaktif Swagger**: `http://localhost:3001/api/docs`
- **WebSocket KDS Gateway**: `ws://localhost:3001/kds`

---

### 3. Skrip Perintah di Root Workspace

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan Backend (`:3001`) dan Frontend (`:3000`) secara bersamaan |
| `npm run dev:backend` | Menjalankan hanya backend NestJS dalam mode watch |
| `npm run dev:frontend` | Menjalankan hanya frontend Next.js |
| `npm run setup:local` | Melakukan migrasi basis data dan seeding data dummy |
| `npm run db:push` | Sinkronisasi skema Prisma ke PostgreSQL |
| `npm run db:seed` | Mengisi data awal dummy realistis |
| `npm run db:generate` | Menghasilkan Prisma Client terbaru |
| `npm run build` | Melakukan build production pada backend dan frontend |
| `npm run docker:up` | Menyalakan container PostgreSQL & Redis |
| `npm run docker:down` | Menghentikan container PostgreSQL & Redis |

---

## 📱 Akses Jaringan Lokal (Akses dari Tablet POS / KDS via Wi-Fi)

Backend dan Frontend telah dikonfigurasi untuk mendengarkan alamat `0.0.0.0`, sehingga perangkat tablet kasir atau monitor barista dalam jaringan Wi-Fi yang sama dapat mengakses sistem tanpa konfigurasi proxy tambahan.

1. Temukan alamat IP lokal komputer server:
   - **Windows**: Jalankan `ipconfig` di Command Prompt (contoh: `192.168.1.15`)
   - **macOS / Linux**: Jalankan `ifconfig` atau `ip a`
2. Buka browser di tablet POS atau iPad KDS dan akses:
   - **POS / Web App**: `http://192.168.1.15:3000`
   - **Swagger Docs**: `http://192.168.1.15:3001/api/docs`
3. API Client dan WebSocket client secara otomatis mengenali hostname lokal (`window.location.hostname`) dan mengarahkan lalu lintas ke port 3001 backend.

---

## 🔑 Akun Demo & Hak Akses (RBAC)

Semua password di bawah telah di-hash secara aman menggunakan **Bcrypt** di basis data:

| Peran (Role) | Email | Password | PIN Presensi | Hak Akses Utama |
|---|---|---|---|---|
| **Admin HQ** | `admin@faianaya.coffee` | `Admin@123` | `1234` | **Superadmin**: Akses ke seluruh cabang, manajemen akun karyawan, hapus produk, pengaturan multi-cabang. |
| **Manager Depok** | `manager@faianaya.coffee` | `Manager@123` | `5678` | **Manajer Cabang**: Kelola pesanan, stok inventaris, denah meja, shift karyawan, voucher, dan laporan laba rugi cabang Depok. |
| **Kasir Depok** | `kasir@faianaya.coffee` | `Kasir@123` | `1111` | **POS & Kasir**: Pemesanan POS, proses pembayaran (Cash/QRIS), input voucher, pendaftaran pelanggan, antrean. |
| **Barista Depok** | `barista@faianaya.coffee` | `Barista@123` | `2222` | **KDS Barista**: Memantau tiket pesanan kopi masuk, update status (*Preparing* $\rightarrow$ *Ready*), stok opname. |
| **Waiter Depok** | `waiter@faianaya.coffee` | `Waiter@123` | `3333` | **Layanan Meja**: Pemesanan dine-in, status kebersihan meja (*Needs Cleaning* $\rightarrow$ *Available*), sajikan pesanan (*Served*). |
| **Manager HQ** | `manager.hq@faianaya.coffee` | `Manager@123` | `9988` | Manajer operasional cabang HQ Jakarta Pusat. |
| **Kasir HQ** | `kasir.hq@faianaya.coffee` | `Kasir@123` | `4444` | Kasir operasional cabang HQ Jakarta Pusat. |
| **Barista HQ** | `barista.hq@faianaya.coffee` | `Barista@123` | `5555` | Barista operasional cabang HQ Jakarta Pusat. |

---

## 📁 Struktur Monorepo Proyek

```
faianaya-coffee/
├── package.json                # Root monorepo scripts & workspaces
├── docker-compose.yml          # PostgreSQL 16 + Redis 7 Docker services
├── docker-compose.local.yml    # Full-stack containerized compose
├── apps/
│   ├── backend/                # NestJS API (Port 3001)
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # PostgreSQL Schema & Relasi (BOM, RBAC, POS)
│   │   │   ├── seed.ts         # Seed runner entry point
│   │   │   └── seeds/          # 14 modul dummy data realistis
│   │   ├── src/
│   │   │   ├── auth/           # Passport JWT & Local strategies, guards
│   │   │   ├── common/         # Decorators (@Public, @Roles, @CurrentUser), filters
│   │   │   ├── users/          # CRUD Karyawan & User
│   │   │   ├── products/       # Menu katalog & varian
│   │   │   ├── orders/         # Transaksi POS, pembayaran, auto-BOM reduction
│   │   │   ├── tables/         # Denah meja & status meja
│   │   │   ├── inventory/      # Bahan baku & stock opname
│   │   │   ├── kds/            # KDS Barista & Socket.io Gateway
│   │   │   ├── accounting/     # Jurnal penjualan & laporan keuangan
│   │   │   ├── customers/      # Database pelanggan & loyalty points
│   │   │   ├── reservations/   # Reservasi meja & antrean (waiting list)
│   │   │   ├── hr/             # Shift kerja & absensi PIN
│   │   │   ├── vouchers/       # Kupon diskon & validasi promo
│   │   │   ├── suppliers/      # Pemasok & Purchase Orders (PO)
│   │   │   └── delivery/       # Markup harga GrabFood/GoFood/ShopeeFood
│   │   └── .env.example
│   └── frontend/               # Next.js 14 Web App (Port 3000)
│       ├── src/
│       │   ├── app/            # Next.js App Router pages
│       │   │   ├── (auth)/login/
│       │   │   ├── dashboard/  # Ringkasan penjualan & statistik
│       │   │   ├── pos/        # Layar Kasir POS Neumorphic
│       │   │   ├── kds/        # Layar Kitchen Display Barista
│       │   │   ├── tables/     # Editor denah & meja
│       │   │   ├── products/   # Manajemen produk
│       │   │   ├── inventory/  # Inventaris stok bahan
│       │   │   ├── customers/  # CRM pelanggan
│       │   │   ├── accounting/ # Buku kas & jurnal
│       │   │   ├── hr/         # Presensi & shift
│       │   │   ├── queue/      # Antrean pesanan
│       │   │   ├── reservations/# Reservasi meja
│       │   │   └── users/      # Manajemen hak akses karyawan
│       │   ├── components/     # Komponen UI Neumorphism
│       │   ├── hooks/          # useSocket (Socket.io)
│       │   └── lib/            # ApiClient (JWT cookie & Bearer)
│       └── .env.local.example
└── packages/
    └── shared/                 # Shared TypeScript models & types
```

---

## 🔌 Dokumentasi REST API & WebSocket

### 1. Swagger UI Interaktif
Saat backend berjalan, kunjungi [http://localhost:3001/api/docs](http://localhost:3001/api/docs) untuk mencoba seluruh endpoint langsung dari browser:
- **Autentikasi**: Klik tombol **Authorize** dan masukkan token JWT (atau login via endpoint `/api/auth/login` yang otomatis menyuntikkan cookie).

### 2. Contoh Endpoint Populer
```http
POST   /api/auth/login              # Login dengan email & password
GET    /api/auth/profile            # Profil staf terotentikasi
GET    /api/products                # Daftar menu kopi & makanan
POST   /api/orders                  # Membuat transaksi POS baru
POST   /api/orders/:id/payment      # Pembayaran pesanan (CASH, QRIS, DEBIT)
GET    /api/kds/station?station=barista # Antrean tiket pesanan barista
PATCH  /api/orders/:id/status       # Transisi status pesanan
GET    /api/tables                  # Status seluruh meja cabang
POST   /api/hr/attendance/clock-in  # Presensi karyawan dengan PIN
POST   /api/vouchers/validate       # Cek validitas kupon promo
```

### 3. WebSocket Real-time Event
- **Namespace**: `/kds`
- **Events**:
  - `join-branch` $\rightarrow$ Mendaftarkan koneksi ke room cabang tertentu (`branch-<branchId>`).
  - `order-update` $\rightarrow$ Dikirim otomatis saat pesanan baru dibuat atau status item diperbarui.
  - `order-ready` $\rightarrow$ Notifikasi pesanan siap disajikan kepada pelanggan.

---

## 🔒 Konfigurasi Keamanan (OWASP & Best Practices)

- **Helmet**: Perlindungan header HTTP (XSS, clickjacking, sniff protection).
- **Throttler (Rate Limiting)**: Mencegah brute-force pada endpoint otentikasi (maksimal 10 percobaan/menit) dan batas 120 req/menit untuk API umum.
- **Strict DTO Validation**: Semua input disanitasi menggunakan `class-validator` dengan opsi `whitelist: true`.
- **CORS Fleksibel**: Mengizinkan akses dari `localhost`, `127.0.0.1`, dan IP privat LAN (`192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`).

---

## 📄 Lisensi

Platform ini dirilis di bawah lisensi **MIT**. Bebas digunakan, dipelajari, dimodifikasi, dan disebarluaskan untuk kebutuhan komersial maupun non-komersial.

Dibuat dengan ❤️ untuk kemajuan ekosistem F&B dan teknologi kedai kopi di Indonesia.
