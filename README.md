# Sistem Manajemen Stok Barang

Aplikasi web untuk mengelola data inventaris, transaksi barang masuk dan keluar, serta menghasilkan laporan stok secara real-time.

## Tech Stack

| Bagian | Teknologi |
| --- | --- |
| Frontend | Next.js 15+ |
| Styling | Tailwind CSS |
| UI Component | shadcn/ui |
| Backend | Next.js Server Actions |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Deployment | Vercel |

## Fitur

### MVP (Sprint 1)

- **Authentication** - Login/Logout dengan Supabase Auth, Role-Based Access Control (Admin & Petugas)
- **Dashboard** - Ringkasan data: total barang, supplier, barang masuk/keluar hari ini, stok menipis, grafik bulanan
- **CRUD Barang** - Tambah, edit, hapus, detail barang dengan pencarian dan filter (nama, SKU, barcode, kategori, supplier)
- **Barang Masuk** - Pencatatan barang masuk dengan update stok otomatis
- **Barang Keluar** - Pencatatan barang keluar dengan validasi stok
- **Laporan** - Laporan barang masuk, keluar, dan persediaan dengan filter tanggal dan export CSV
- **Kategori & Supplier** - CRUD kategori dan supplier

### Role-Based Access

| Fitur | Admin | Petugas |
| --- | --- | --- |
| Login | ✅ | ✅ |
| Dashboard | ✅ | ✅ |
| CRUD Barang | ✅ | ❌ |
| CRUD Kategori | ✅ | ❌ |
| CRUD Supplier | ✅ | ❌ |
| Barang Masuk | ✅ | ✅ |
| Barang Keluar | ✅ | ✅ |
| Cari Barang | ✅ | ✅ |
| Laporan | ✅ | ❌ |

## Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/inventory-management.git
cd inventory-management
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buat akun di [Supabase](https://supabase.com)
2. Buat project baru
3. Buka SQL Editor di dashboard Supabase
4. Jalankan file `database/schema.sql` untuk membuat tabel

### 4. Konfigurasi Environment

Buat file `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Struktur Folder

```
src/
├── app/
│   ├── (auth)/login/          # Halaman login
│   ├── (dashboard)/           # Layout dengan sidebar
│   │   ├── dashboard/         # Dashboard
│   │   ├── products/          # CRUD Barang
│   │   ├── categories/        # CRUD Kategori
│   │   ├── suppliers/         # CRUD Supplier
│   │   ├── stock-in/          # Barang Masuk
│   │   ├── stock-out/         # Barang Keluar
│   │   └── reports/           # Laporan
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Redirect ke login
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── layout/                # Sidebar, MobileSidebar
│   ├── charts/                # Grafik
│   ├── tables/                # Komponen tabel
│   └── *.tsx                  # Komponen reusable
├── lib/
│   ├── actions/               # Server Actions
│   ├── supabase/              # Supabase client setup
│   └── utils.ts               # Utility functions
├── types/                     # TypeScript types
└── middleware.ts               # Auth middleware
```

## Database

File SQL untuk setup database ada di `database/schema.sql`. Tabel yang dibuat:

- **profiles** - Data pengguna (extends auth.users)
- **categories** - Kategori barang
- **suppliers** - Data supplier
- **products** - Data barang/inventaris
- **stock_in** - Transaksi barang masuk
- **stock_out** - Transaksi barang keluar

## Build & Deploy

```bash
# Build
npm run build

# Start production
npm start
```

Deploy ke Vercel:
1. Push ke GitHub
2. Import project di Vercel
3. Set environment variables
4. Deploy otomatis
