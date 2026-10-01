# HRIS Management System (Indonesia Enterprise Edition)

Sistem Informasi Sumber Daya Manusia (HRIS) tingkat *enterprise* yang dirancang secara khusus untuk memenuhi kepatuhan regulasi ketenagakerjaan, perpajakan, dan jaminan sosial di Indonesia, termasuk penanganan kondisi operasional kompleks (*real-world edge cases*).

Dibangun dengan arsitektur modern TypeScript monorepo berbasis Clean Architecture & Domain-Driven Design:
- **Backend**: Hono + oRPC (type-safe RPC & OpenAPI) + Effect-TS + Drizzle ORM + PostgreSQL.
- **Frontend**: React 19 + TanStack Router (Dedicated Full-Page Navigation) + TanStack Query + Tailwind CSS v4 + shadcn/ui.
- **Asinkron & Kualitas**: RabbitMQ + Redis Cache + Biome + Vitest + Playwright.

---

## Modul & Fitur Utama

### 1. Kepegawaian & Manajemen Kontrak (Core HR)
- **Kepatuhan PP 35/2021 & UU Cipta Kerja**:
  - Pengelolaan Perjanjian Kerja Waktu Tertentu (PKWT) dan Waktu Tidak Tertentu (PKWTT).
  - Pelacakan akumulasi durasi kontrak PKWT (maksimal 5 tahun) beserta sistem peringatan dini jatuh tempo (H-60 dan H-30).
  - Kalkulasi otomatis **Uang Kompensasi Pengakhiran/Perpanjangan Kontrak PKWT**:
    $$\text{Uang Kompensasi} = \frac{\text{Masa Kerja (Bulan)}}{12} \times \text{Upah Sebulan}$$
  - Validasi pencegahan masa percobaan (*probation*) ilegal pada kontrak PKWT (demi hukum batal jika diterapkan pada PKWT).
- **Hierarki Organisasi & Karir**:
  - Struktur Departemen, Posisi/Jabatan, dan Atasan Langsung (*Reporting Manager*).
  - Mutasi jabatan, promosi, dan penyesuaian gaji dengan jejak riwayat karir.
- **Perlindungan Data Pribadi (UU PDP No. 27/2022)**:
  - Enkripsi dan kontrol akses data sensitif (NIK/KTP, NPWP, Rekening Payroll, BPJS Kesehatan & Ketenagakerjaan).
  - Jejak persetujuan privasi data (*consent audit trail*).

### 2. Waktu, Absensi, Cuti & Lembur (Time & Attendance)
- **Presensi Harian Multi-Status**:
  - Pencatatan jam kerja aktual, clock-in, clock-out, menit keterlambatan (*late minutes*), dan durasi kerja efektif.
  - Klasifikasi status: Hadir (*Present*), Sakit (*Sick*), Izin Resmi (*Permitted*), Cuti (*Leave*), Mangkir (*Absent*), Libur (*Holiday/Off*).
- **Manajemen Cuti & Regulasi Terpadu**:
  - **UU Kesejahteraan Ibu dan Anak (UU KIA No. 4/2024)**: Cuti melahirkan 3 bulan pertama bergaji 100%, dapat diperpanjang hingga bulan ke-4 s.d. ke-6 dengan gaji 75% atas rekomendasi dokter.
  - **Sakit Berkepanjangan (Pasal 93 UU Ketenagakerjaan)**: Upah bertingkat (Bulan 1–4: 100%, Bulan 5–8: 75%, Bulan 9–12: 50%, Bulan 13+: 25%).
  - Cuti khusus berbayar: Cuti haid, cuti keguguran, cuti menikah, cuti khitanan/baptis, duka cita keluarga.
  - Kuota Cuti Tahunan & kebijakan hangus otomatis (*forfeiture*) per 30 Juni untuk saldo *carry-over*.
- **Surat Perintah Lembur (SPL) & PP 35/2021**:
  - Kalkulasi upah per jam standar Kemnaker: $\frac{1}{173} \times \text{Upah Sebulan}$.
  - Pengali bertingkat resmi:
    - *Hari Kerja*: Jam ke-1 = $1.5\times$, Jam ke-2 dst = $2.0\times$.
    - *Hari Libur Mingguan / Nasional (5 hari kerja)*: Jam 1–8 = $2.0\times$, Jam ke-9 = $3.0\times$, Jam ke-10 dst = $4.0\times$.
    - *Hari Libur Mingguan / Nasional (6 hari kerja)*: Jam 1–7 = $2.0\times$, Jam ke-8 = $3.0\times$, Jam ke-9 dst = $4.0\times$.
  - **Compliance Alert**: Peringatan otomatis apabila penugasan lembur melebihi batas legal 4 jam/hari atau 18 jam/minggu.
- **Kalender Hari Libur Nasional & Cuti Bersama**:
  - Pendaftaran hari libur resmi berdasarkan SKB 3 Menteri dengan integrasi otomatis ke perhitungan payroll dan SPL.

### 3. Penggajian & Pajak Penghasilan (Payroll & Tax)
- **Kalkulasi PPh 21 TER (PMK 168/2023)**:
  - Penentuan otomatis Kategori Tarif Efektif Rata-rata (TER A, TER B, atau TER C) berdasarkan status PTKP.
  - Metode pemotongan pajak fleksibel: Gross, Gross-Up (Tunjangan Pajak ditanggung perusahaan), dan Nett.
- **Iuran Jaminan Sosial (BPJS)**:
  - BPJS Ketenagakerjaan: JKK (sesuai tingkat risiko lingkungan kerja I s.d. V), JKM (0.30%), JHT (3.70% perusahaan, 2% karyawan), dan JP (2% perusahaan, 1% karyawan dengan batas plafon upah maksimal tahunan).
  - BPJS Kesehatan: 4% perusahaan dan 1% karyawan dengan batas plafon upah maksimal Rp 12.000.000.
- **Rekonsiliasi PPh 21 Tahunan (Pasal 17 UU HPP)**:
  - Perhitungan pajak tahunan di masa Desember dan penanganan otomatis kondisi Lebih Bayar (LB) / Kurang Bayar (KB).

### 4. Keamanan, RBAC & Audit Trail
- **Dynamic Role-Based Access Control (RBAC)**: Matriks perizinan (*permission matrix*) granular untuk membatasi hak akses modul (Read, Manage, Approve).
- **Audit Trail Komprehensif (`activity`)**: Pencatatan jejak audit setiap aksi CRUD, mutasi karyawan, approval cuti, dan kalkulasi penggajian.

---

## Arsitektur Teknologi

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Monorepo Manager** | moon + pnpm workspaces | Manajemen dependensi terpadu via catalog `pnpm-workspace.yaml` |
| **Backend API** | Hono + oRPC + Effect-TS | Type-safe RPC, Clean Architecture, Domain Driven Design |
| **Database & ORM** | PostgreSQL + Drizzle ORM | Schema type-safe, migration versioning otomatis |
| **Autentikasi** | Better-Auth | Sesi terautentikasi first-party cookie |
| **Antrian & Cache** | RabbitMQ + Redis | Pemrosesan tugas latar belakang dan rate limiting |
| **Frontend Web** | React 19 + TanStack Suite | TanStack Router (SPA), Query, Form, Store |
| **Styling & UI** | Tailwind CSS v4 + shadcn/ui | Desain premium, dark mode, aksesibilitas penuh |
| **Pengujian & Kualitas** | Biome, Vitest, Playwright | Linting super cepat, unit test, dan validasi arsitektur ketat |

---

## Struktur Monorepo

```
hris-management-ts/
├── apps/
│   ├── api/            # Layanan Backend API (Hono + Effect-TS + Drizzle)
│   ├── api-e2e/        # Pengujian Integrasi API E2E
│   ├── web/            # Aplikasi Frontend SPA (TanStack Router + Tailwind v4)
│   └── web-e2e/        # Pengujian E2E Browser (Playwright)
├── packages/
│   ├── schemas/        # Definisi skema Zod bersama (Shared DTOs & Validation)
│   ├── components/     # UI primitive components (shadcn/ui), guards, & layout
│   ├── permissions/    # Katalog izin (Permissions) & pemetaan role
│   ├── activity/       # Konstanta dan pustaka audit trail log
│   ├── queue/          # RabbitMQ message broker client
│   ├── cache/          # Redis cache layer & rate limiter
│   ├── mail/           # Modul pengiriman email (SMTP/Nodemailer)
│   ├── storage/        # Adaptor penyimpanan objek S3-compatible
│   ├── logger/         # Structured logger factory (Pino)
│   ├── format/         # Formatter mata uang Rupiah, tanggal, & angka
│   ├── messages/       # Kamus pesan & notifikasi multi-bahasa
│   ├── migrations/     # Shared database migration runner
│   └── version/        # Sumber kebenaran versi aplikasi (Root package.json)
└── docker-compose.dev.yml # PostgreSQL, Redis, RabbitMQ, Mailpit
```

---

## Panduan Memulai (*Getting Started*)

### Prasyarat Sistem
- **Node.js**: Versi 24+
- **pnpm**: Versi 11+
- **Docker & Docker Compose**: Untuk menjalankan PostgreSQL, Redis, RabbitMQ, dan Mailpit lokal.
- *(Opsional)*: [moon](https://moonrepo.dev/docs/install) + [proto](https://moonrepo.dev/proto).

### Instalasi & Menjalankan Aplikasi

1. **Kloning Repositori & Instalasi Dependensi**:
   ```sh
   pnpm install
   ```

2. **Konfigurasi Environment**:
   Salin berkas konfigurasi template untuk API dan Web:
   ```sh
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```
   *Sesuaikan variabel environment pada berkas `.env` masing-masing sesuai lingkungan yang Anda gunakan.*

3. **Inisialisasi Layanan & Database**:
   Jalankan container pendukung (Postgres, Redis, RabbitMQ, Mailpit), jalankan migrasi skema database, dan inisialisasi data awal:
   ```sh
   make setup
   ```

4. **Jalankan Aplikasi (Development)**:
   ```sh
   make up
   ```
   Aplikasi akan aktif pada:
   - **Frontend Web**: `http://localhost:5173`
   - **Backend API**: `http://localhost:3001`
   - **Mailpit (In-dev Mail Catcher)**: `http://localhost:8025`

Atau jalankan masing-masing proses secara terpisah:
```sh
make api     # Menjalankan API backend pada port 3001
make web     # Menjalankan frontend web pada port 5173
make worker  # Menjalankan background worker (RabbitMQ consumer)
```

---

## Pemeriksaan Versi & Health Check

| Endpoint / Surface | Keterangan | Respon |
|---|---|---|
| `GET /api/health` / `health.check` RPC | Pengecekan status operasional aplikasi | `{ status: "ok", version }` |
| `GET /healthz` | Kubernetes liveness probe | `{ status, version }` |
| `GET /ready` | Readiness probe (memeriksa kesiapan DB, Redis, RabbitMQ) | `{ status, version, dependencies }` (503 jika dependensi down) |
| `GET /metrics` | Prometheus metrics text format | Jumlah request, latensi, memory usage |
| Rute `/health` di Web | Antarmuka visual pemantauan status sistem | Status sinkronisasi versi Web dan API |

---

## Perintah Utama (*Commands*)

Semua perintah standar monorepo dapat dieksekusi melalui `make` atau `moon`:

```sh
make help                             # Menampilkan seluruh target make yang tersedia
make setup                            # Menyiapkan container docker, migrasi DB, dan seed
make services                         # Menjalankan container Docker (PostgreSQL, Redis, RabbitMQ, Mailpit)
make services-stop                    # Menghentikan container Docker
make db-migrate                       # Menjalankan migrasi Drizzle
make db-studio                        # Membuka UI Drizzle Studio untuk inspeksi database
make check                            # Menjalankan Biome check (linter dan formatter)
make lint                             # Menjalankan linting kode
make test                             # Menjalankan unit tests (Vitest)
make build                            # Membangun produksi bundle & validasi tipe TypeScript
make e2e                              # Menjalankan pengujian E2E (API + Web)
make ci                               # Menjalankan seluruh pipeline validasi CI
```

Menggunakan perintah `moon`:
```sh
moon run :check                       # Menjalankan Biome check di seluruh workspace
moon run :build                       # Type-check TypeScript di semua packages dan apps
moon run :test                        # Menjalankan seluruh unit tests
moon run api:db-generate              # Menghasilkan migrasi baru Drizzle saat ada perubahan tabel
```

---

## Alur Rilis & Tata Kelola Kode (*Engineering Standards*)

- **Trunk-Based Development**: Seluruh pengembangan berbasis branch pendek yang digabungkan (*squash-merge*) ke branch utama setelah seluruh pipeline CI lolos.
- **Strict Quality Gates**:
  1. *Biome Lint & Formatting*: Kode terformat rapi secara seragam tanpa peringatan lint yang tidak terselesaikan.
  2. *Strict Architecture Rules*: Aturan isolasi dependensi antar-lapisan (*domain, application, infrastructure, presentation*) diverifikasi otomatis oleh skrip penguji arsitektur.
  3. *Type Safety*: Validasi skema Zod ujung-ke-ujung menjamin integritas kontrak data antara API dan Frontend.
- **Pembaruan Dependensi**: Dipelihara secara terpusat melalui `catalog` pnpm workspace untuk menghindari fragmentasi versi pustaka.

---

## Dokumentasi Pendukung

| Dokumen | Deskripsi |
|---|---|
| [AGENTS.md](AGENTS.md) | Panduan kontributor dan agen AI mengenai konvensi kode dan struktur proyek |
| [docs/adding-a-module.md](docs/adding-a-module.md) | Langkah-langkah penambahan modul, endpoint RPC, dan permission baru |
| [docs/effect-services.md](docs/effect-services.md) | Panduan arsitektur Effect-TS, service layer, dan error handling |
| [docs/operations/](docs/operations/) | Dokumentasi operasional, deployment, backup, alerting, dan metrik |
