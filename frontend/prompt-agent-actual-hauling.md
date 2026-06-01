# AI Agent Prompt — PalmTrack Cloud: Actual Hauling Feature Update

> **Petunjuk penggunaan:**
> Prompt ini dibagi menjadi dua bagian terpisah.
> Eksekusi **BAGIAN 1 (Frontend)** terlebih dahulu hingga selesai dan diverifikasi,
> lalu lanjutkan **BAGIAN 2 (Backend)** setelahnya.
> Setiap bagian bersifat self-contained dan dapat dijalankan mandiri oleh agent.

---

---

# ═══════════════════════════════════════════
# BAGIAN 1 — FRONTEND
# ═══════════════════════════════════════════

## Konteks Sistem

Kamu adalah AI agent yang bertugas mengimplementasikan fitur frontend pada aplikasi **PalmTrack Cloud**, sebuah sistem manajemen rantai pasok sawit berbasis web.

**Stack frontend yang digunakan:**
- Framework: React (atau Next.js — sesuaikan dengan yang sudah ada di project)
- Styling: Tailwind CSS
- State management: React Query (untuk server state) + Zustand atau Context API (untuk UI state)
- HTTP client: Axios
- Form management: React Hook Form + Zod (untuk validasi schema)
- Tabel: TanStack Table v8
- Notifikasi: react-hot-toast atau sonner
- Icon: Lucide React
- Date picker: react-day-picker atau date-fns

> Jika stack berbeda dari yang disebutkan di atas, sesuaikan implementasi dengan stack yang sudah ada. Jangan mengganti atau menambah library baru tanpa alasan teknis yang kuat.

**Base URL API (mock/placeholder):**
```
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
```

Endpoint yang akan digunakan (backend belum tersedia, buat mock/placeholder):
```
GET    /api/hauling-transactions       → list transaksi (dengan query params)
POST   /api/hauling-transactions       → tambah transaksi
PUT    /api/hauling-transactions/:id   → edit transaksi
DELETE /api/hauling-transactions/:id   → hapus transaksi
GET    /api/vendors                    → list vendor untuk dropdown
GET    /api/blocks                     → list blok/area untuk dropdown
```

---

## Referensi UI yang Ada

Dari screenshot yang sudah ada, halaman **Actual Hauling** saat ini memiliki:
- Header: judul "Actual Hauling" + tombol "Add Transaction" di kanan atas
- Filter bar: input "Cari Ticket No", dropdown "Filter Vendor", dropdown "Filter Block", tombol "Reset Filters"
- Tabel dengan kolom: No. | Ticket No | Vehicle Plate | Vendor Name | Block Code | Weight In (ton) | Weight Out (ton) | Net Weight (ton) | Date | Actions
- Empty state: ilustrasi truk + teks "Belum ada transaksi hauling"
- Tema: dark mode aktif (dark background), dengan toggle light/dark di sidebar

**Bug yang harus diperbaiki sekaligus:**
- Error message "Input should be less than or equal to 100" pada field Cari Ticket No terlalu teknis. Ganti dengan: `"Pencarian maksimal 100 karakter"` dan tampilkan sebagai hint kecil di bawah input, bukan sebagai banner error merah.

---

## Tugas yang Harus Diimplementasikan

### TASK F-1 — Perbaikan Filter Bar

**File:** `components/hauling/HaulingFilterBar.tsx` (atau sesuaikan dengan struktur project)

**Spesifikasi:**

1. **Input "Cari Ticket No"**
   - Tipe: text input
   - Max length: 100 karakter (attribute `maxLength={100}`)
   - Perilaku: debounce 400ms sebelum trigger pencarian ke API
   - Validasi: tampilkan karakter counter `{n}/100` di pojok kanan bawah input saat user mulai mengetik
   - Hapus banner error merah yang ada; ganti dengan hint inline

2. **Dropdown "Filter Vendor"**
   - Data: fetch dari `GET /api/vendors`
   - Default option: "Semua vendor"
   - Loading state: tampilkan skeleton/spinner di dalam dropdown saat fetch
   - Jika fetch gagal: tampilkan option "Gagal memuat vendor" (disabled) dan log error

3. **Dropdown "Filter Block"**
   - Data: fetch dari `GET /api/blocks`
   - Default option: "Semua blok"
   - Perilaku sama dengan Filter Vendor di atas

4. **Tambahan filter baru — Date Range Picker**
   - Tambahkan satu filter baru: "Filter Tanggal"
   - Komponen: dua input date (Dari — Sampai) atau single date range picker
   - Format tampilan: `DD/MM/YYYY`
   - Format kirim ke API: ISO 8601 (`date_from=2025-01-01&date_to=2025-01-31`)
   - Posisi: setelah dropdown Filter Block, sebelum tombol Reset Filters

5. **Tombol "Reset Filters"**
   - Reset semua filter ke nilai default (kosong / "Semua")
   - Juga clear URL query params jika menggunakan URL state

**Query params yang dikirim ke API:**
```
GET /api/hauling-transactions?
  ticket_no=...
  &vendor_id=...
  &block_id=...
  &date_from=...
  &date_to=...
  &page=1
  &per_page=20
  &sort_by=date
  &sort_dir=desc
```

---

### TASK F-2 — Tabel Transaksi dengan Pagination & Sorting

**File:** `components/hauling/HaulingTable.tsx`

**Spesifikasi kolom:**

| Kolom | Key data | Sortable | Keterangan |
|---|---|---|---|
| No. | — | ✗ | Nomor urut (bukan ID), dimulai dari ((page-1) × per_page) + 1 |
| Ticket No | `ticket_no` | ✓ | Klik untuk lihat detail |
| Vehicle Plate | `vehicle_plate` | ✗ | Uppercase otomatis |
| Vendor Name | `vendor.name` | ✓ | |
| Block Code | `block.code` | ✓ | |
| Weight In (ton) | `weight_in` | ✓ | Format: `XX.XXX` (3 desimal) |
| Weight Out (ton) | `weight_out` | ✓ | Format: `XX.XXX` (3 desimal) |
| Net Weight (ton) | `net_weight` | ✓ | Format: `XX.XXX`, warna hijau jika > 0, merah jika ≤ 0 |
| Date | `transaction_date` | ✓ | Format: `DD MMM YYYY` (contoh: `01 Jun 2025`) |
| Actions | — | ✗ | Tombol Edit dan Delete |

**Perilaku sorting:**
- Klik header kolom: sort ascending
- Klik lagi: sort descending
- Klik lagi: kembali ke default (tidak ada sort)
- Tampilkan ikon `↑` / `↓` / `↕` di header kolom yang aktif
- Sorting dilakukan server-side (kirim `sort_by` dan `sort_dir` ke API)

**Pagination:**
- Server-side pagination
- Tampilkan: "Menampilkan 1–20 dari 150 transaksi"
- Tombol: Pertama | Prev | [halaman] | Next | Terakhir
- Dropdown per halaman: 10 / 20 / 50 / 100
- Simpan state halaman di URL query param `?page=1&per_page=20`

**Loading state:**
- Tampilkan skeleton rows (5 baris) saat data sedang di-fetch
- Skeleton harus mengikuti lebar kolom yang ada

**Empty state:**
- Pertahankan ilustrasi truk + teks "Belum ada transaksi hauling" yang sudah ada
- Jika filter aktif tapi tidak ada hasil: tampilkan teks berbeda "Tidak ada transaksi yang sesuai filter"

**Error state:**
- Jika API gagal: tampilkan pesan error + tombol "Coba lagi"

---

### TASK F-3 — Modal Add Transaction

**File:** `components/hauling/AddTransactionModal.tsx`

**Trigger:** Tombol "Add Transaction" di kanan atas halaman

**Komponen:** Modal/Dialog (bukan page baru)

**Field dalam form:**

| Field | Tipe input | Validasi | Keterangan |
|---|---|---|---|
| Ticket No | Text | Required, max 100 char, unik (cek via API) | Auto-uppercase |
| Vehicle Plate | Text | Required, max 20 char | Auto-uppercase, format plat Indonesia (opsional regex) |
| Vendor | Select/Combobox | Required | Data dari `GET /api/vendors` |
| Block/Area | Select/Combobox | Required | Data dari `GET /api/blocks` |
| Weight In (ton) | Number | Required, min 0, max 9999.999, 3 desimal | |
| Weight Out (ton) | Number | Required, min 0, max 9999.999, 3 desimal, harus ≤ Weight In | |
| Net Weight (ton) | Number (readonly) | Auto-kalkulasi: Weight In − Weight Out | Tampilkan dengan highlight, tidak bisa diedit manual |
| Tanggal Transaksi | Date | Required, tidak boleh masa depan | Default: hari ini |
| Catatan | Textarea | Optional, max 500 char | |

**Validasi form (client-side dengan Zod):**
```typescript
// Contoh schema — sesuaikan dengan kebutuhan
const schema = z.object({
  ticket_no: z.string().min(1, "Ticket No wajib diisi").max(100),
  vehicle_plate: z.string().min(1).max(20),
  vendor_id: z.string().uuid("Vendor wajib dipilih"),
  block_id: z.string().uuid("Blok wajib dipilih"),
  weight_in: z.number().min(0).max(9999.999),
  weight_out: z.number().min(0).max(9999.999),
  transaction_date: z.string().refine(val => !isFuture(parseISO(val)), {
    message: "Tanggal tidak boleh masa depan"
  }),
  notes: z.string().max(500).optional(),
}).refine(data => data.weight_out <= data.weight_in, {
  message: "Weight Out tidak boleh melebihi Weight In",
  path: ["weight_out"],
});
```

**Perilaku UX:**
- Net Weight ter-update secara real-time saat Weight In atau Weight Out berubah
- Jika Net Weight negatif atau 0: tampilkan warning kuning "Periksa kembali berat timbang"
- Submit button disabled saat form tidak valid atau sedang loading
- Saat submit berhasil: tutup modal, tampilkan toast success, refresh tabel
- Saat submit gagal karena duplikat ticket: tampilkan error inline di field Ticket No
- Konfirmasi sebelum menutup modal jika form sudah diisi (ada perubahan)

---

### TASK F-4 — Modal Edit Transaction

**File:** `components/hauling/EditTransactionModal.tsx`

**Trigger:** Tombol "Edit" di kolom Actions pada setiap baris tabel

**Spesifikasi:**
- Sama dengan Add Transaction Modal, tapi pre-filled dengan data existing
- Fetch data transaksi saat modal dibuka: `GET /api/hauling-transactions/:id`
- Tampilkan loading skeleton saat fetch data
- Kirim `PUT /api/hauling-transactions/:id` saat submit
- Tampilkan badge "Terakhir diubah: [timestamp] oleh [user]" di footer modal (data dari field `updated_at` dan `updated_by` response API)

---

### TASK F-5 — Delete Confirmation

**File:** Bisa inline di `HaulingTable.tsx` atau komponen `DeleteConfirmDialog.tsx`

**Trigger:** Tombol "Delete" (ikon trash) di kolom Actions

**Perilaku:**
- Tampilkan dialog konfirmasi (bukan browser `confirm()`, gunakan komponen Dialog)
- Teks konfirmasi: `"Hapus transaksi tiket [TICKET_NO]? Tindakan ini tidak dapat dibatalkan."`
- Dua tombol: "Batal" dan "Ya, Hapus" (warna merah)
- Saat "Ya, Hapus" diklik: kirim `DELETE /api/hauling-transactions/:id`
- Loading state pada tombol saat proses delete
- Saat berhasil: tutup dialog, toast success, refresh tabel
- Saat gagal: tampilkan error message di dalam dialog (jangan tutup dialog)

---

### TASK F-6 — Export Data

**File:** `components/hauling/ExportButton.tsx`

**Posisi:** Tambahkan tombol "Export" di sebelah kiri tombol "Add Transaction"

**Opsi export:**
- Dropdown dengan dua pilihan: "Export Excel (.xlsx)" dan "Export PDF"
- Export mengikuti filter yang sedang aktif (ticket_no, vendor, block, date range)
- Endpoint: `GET /api/hauling-transactions/export?format=xlsx&[filter params]`
- Response: file download (blob)
- Saat download berlangsung: tampilkan loading indicator di tombol
- Nama file default: `hauling-transactions-[YYYY-MM-DD].xlsx`

> Untuk sementara, jika endpoint belum tersedia, tampilkan toast: "Fitur export sedang dalam pengembangan"

---

### TASK F-7 — Perbaikan UX Global

1. **Pesan error yang manusiawi:**
   - Semua pesan error API harus diterjemahkan ke Bahasa Indonesia yang ramah
   - Hindari menampilkan raw error message dari server langsung ke user
   - Contoh mapping:
     ```
     "Network Error" → "Gagal terhubung ke server. Periksa koneksi internet Anda."
     "401 Unauthorized" → "Sesi Anda telah berakhir. Silakan login kembali."
     "500 Internal Server Error" → "Terjadi kesalahan pada server. Coba beberapa saat lagi."
     ```

2. **Akses keyboard:**
   - Semua modal bisa ditutup dengan tombol `Escape`
   - Form bisa di-submit dengan `Ctrl+Enter`
   - Focus trap di dalam modal saat modal terbuka

3. **Responsive:**
   - Tabel pada layar < 1024px: gunakan horizontal scroll dengan kolom-kolom prioritas tetap terlihat (No., Ticket No, Net Weight, Actions)
   - Modal full-screen pada layar < 640px

---

## Struktur File yang Diharapkan

```
src/
├── components/
│   └── hauling/
│       ├── HaulingPage.tsx               ← container utama
│       ├── HaulingFilterBar.tsx          ← F-1
│       ├── HaulingTable.tsx              ← F-2
│       ├── AddTransactionModal.tsx       ← F-3
│       ├── EditTransactionModal.tsx      ← F-4
│       ├── DeleteConfirmDialog.tsx       ← F-5
│       ├── ExportButton.tsx              ← F-6
│       └── TransactionFormFields.tsx     ← shared form fields antara Add & Edit
├── hooks/
│   └── useHaulingTransactions.ts        ← React Query hooks
├── services/
│   └── haulingService.ts                ← Axios API calls
├── types/
│   └── hauling.ts                       ← TypeScript interfaces
└── utils/
    └── haulingValidation.ts             ← Zod schemas
```

---

## TypeScript Interfaces

```typescript
// types/hauling.ts

export interface Vendor {
  id: string;
  name: string;
  code: string;
}

export interface Block {
  id: string;
  name: string;
  code: string;
  area_ha?: number;
}

export interface HaulingTransaction {
  id: string;
  ticket_no: string;
  vehicle_plate: string;
  vendor: Vendor;
  block: Block;
  weight_in: number;   // dalam ton, 3 desimal
  weight_out: number;  // dalam ton, 3 desimal
  net_weight: number;  // dalam ton, 3 desimal
  transaction_date: string; // ISO 8601 date string
  notes?: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
}

export interface HaulingListResponse {
  data: HaulingTransaction[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export interface HaulingFilters {
  ticket_no?: string;
  vendor_id?: string;
  block_id?: string;
  date_from?: string;
  date_to?: string;
  page: number;
  per_page: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}
```

---

## Mock Data untuk Development

Jika backend belum tersedia, gunakan mock data berikut untuk development:

```typescript
// utils/mockData.ts
export const mockTransactions: HaulingTransaction[] = [
  {
    id: "uuid-001",
    ticket_no: "TBS-2025-001",
    vehicle_plate: "KT 1234 AB",
    vendor: { id: "v-1", name: "CV Maju Bersama", code: "CMB" },
    block: { id: "b-1", name: "Blok A1", code: "A1" },
    weight_in: 28.450,
    weight_out: 2.100,
    net_weight: 26.350,
    transaction_date: "2025-06-01",
    created_at: "2025-06-01T08:30:00Z",
    created_by: "agus"
  },
  // ... tambahkan 9 data lainnya untuk mock
];
```

---

## Checklist Sebelum Selesai (Frontend)

Sebelum menyatakan implementasi frontend selesai, pastikan:

- [ ] Semua TASK F-1 s/d F-7 sudah diimplementasikan
- [ ] Tidak ada TypeScript error (`tsc --noEmit` clean)
- [ ] Tidak ada console.error saat halaman dimuat
- [ ] Filter berfungsi dan mengirim query params yang benar ke API
- [ ] Pagination berfungsi dan state tersimpan di URL
- [ ] Form validation bekerja untuk semua field
- [ ] Net Weight terhitung otomatis dan real-time
- [ ] Modal Add, Edit, Delete semuanya berfungsi
- [ ] Toast notification muncul saat operasi sukses/gagal
- [ ] Loading state tersedia di semua operasi async
- [ ] Tampilan konsisten dengan tema dark/light yang sudah ada
- [ ] Responsive di layar 1920px, 1280px, 768px, dan 375px

---

---

# ═══════════════════════════════════════════
# BAGIAN 2 — BACKEND
# ═══════════════════════════════════════════

> **Catatan:** Jalankan bagian ini setelah frontend selesai diverifikasi.
> Frontend sudah menggunakan endpoint dan contract yang didefinisikan di bawah.
> Pastikan response shape dari backend PERSIS sama dengan yang diharapkan frontend.

---

## Konteks Sistem

Kamu adalah AI agent yang bertugas mengimplementasikan fitur backend pada aplikasi **PalmTrack Cloud**.

**Stack backend yang digunakan:**
- Runtime: Node.js dengan Express.js / Fastify (atau Laravel PHP — sesuaikan dengan yang ada)
- ORM: Prisma (Node.js) atau Eloquent (Laravel)
- Database: PostgreSQL
- Autentikasi: JWT (middleware sudah ada)
- Validasi: Zod (Node) atau Laravel Form Request
- File export: ExcelJS (xlsx) + PDFKit atau puppeteer (PDF)

> Jika stack berbeda, sesuaikan. Jangan ganti stack yang sudah ada.

---

## Database Schema

### Tabel yang sudah ada (jangan diubah strukturnya):
- `users` — data user/operator
- `vendors` — master data kontraktor/vendor
- `blocks` — master data blok/area kebun

### Tabel baru yang harus dibuat:

```sql
-- Migration: create_hauling_transactions_table

CREATE TABLE hauling_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_no         VARCHAR(100) NOT NULL UNIQUE,
  vehicle_plate     VARCHAR(20) NOT NULL,
  vendor_id         UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  block_id          UUID NOT NULL REFERENCES blocks(id) ON DELETE RESTRICT,
  weight_in         NUMERIC(10, 3) NOT NULL CHECK (weight_in >= 0),
  weight_out        NUMERIC(10, 3) NOT NULL CHECK (weight_out >= 0),
  net_weight        NUMERIC(10, 3) GENERATED ALWAYS AS (weight_in - weight_out) STORED,
  transaction_date  DATE NOT NULL,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID NOT NULL REFERENCES users(id),
  updated_at        TIMESTAMPTZ,
  updated_by        UUID REFERENCES users(id),
  deleted_at        TIMESTAMPTZ,     -- soft delete
  deleted_by        UUID REFERENCES users(id)
);

-- Indexes untuk performa query filter & sort
CREATE INDEX idx_hauling_ticket_no       ON hauling_transactions(ticket_no);
CREATE INDEX idx_hauling_vendor_id       ON hauling_transactions(vendor_id);
CREATE INDEX idx_hauling_block_id        ON hauling_transactions(block_id);
CREATE INDEX idx_hauling_transaction_date ON hauling_transactions(transaction_date DESC);
CREATE INDEX idx_hauling_deleted_at      ON hauling_transactions(deleted_at) WHERE deleted_at IS NULL;
```

```sql
-- Tabel audit trail terpisah

CREATE TABLE hauling_transaction_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID NOT NULL REFERENCES hauling_transactions(id),
  action          VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
  changed_fields  JSONB,       -- field apa saja yang berubah
  old_values      JSONB,       -- nilai sebelum perubahan
  new_values      JSONB,       -- nilai sesudah perubahan
  performed_by    UUID NOT NULL REFERENCES users(id),
  performed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address      INET,
  user_agent      TEXT
);

CREATE INDEX idx_logs_transaction_id ON hauling_transaction_logs(transaction_id);
```

---

## API Endpoints yang Harus Diimplementasikan

Semua endpoint di bawah memerlukan autentikasi (Bearer token JWT). Gunakan middleware auth yang sudah ada.

---

### B-1: GET /api/hauling-transactions

**Deskripsi:** List transaksi hauling dengan filter, sorting, dan pagination.

**Query parameters:**
```
ticket_no   string   optional   Pencarian partial (ILIKE %...%)
vendor_id   uuid     optional   Filter exact match
block_id    uuid     optional   Filter exact match
date_from   date     optional   Format: YYYY-MM-DD, inklusif
date_to     date     optional   Format: YYYY-MM-DD, inklusif
page        integer  optional   Default: 1, min: 1
per_page    integer  optional   Default: 20, min: 5, max: 100
sort_by     string   optional   Default: transaction_date
            Nilai valid: ticket_no, vendor_name, block_code,
                         weight_in, weight_out, net_weight, transaction_date
sort_dir    string   optional   Default: desc, nilai: asc | desc
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "ticket_no": "TBS-2025-001",
      "vehicle_plate": "KT 1234 AB",
      "vendor": {
        "id": "uuid",
        "name": "CV Maju Bersama",
        "code": "CMB"
      },
      "block": {
        "id": "uuid",
        "name": "Blok A1",
        "code": "A1"
      },
      "weight_in": 28.450,
      "weight_out": 2.100,
      "net_weight": 26.350,
      "transaction_date": "2025-06-01",
      "notes": null,
      "created_at": "2025-06-01T08:30:00Z",
      "created_by": "agus",
      "updated_at": null,
      "updated_by": null
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "total_pages": 8
  }
}
```

**Catatan implementasi:**
- Query harus menggunakan soft delete: `WHERE deleted_at IS NULL`
- Sorting `vendor_name` harus JOIN ke tabel vendors
- Sorting `block_code` harus JOIN ke tabel blocks
- Gunakan `COUNT(*) OVER()` atau query count terpisah untuk total

---

### B-2: POST /api/hauling-transactions

**Deskripsi:** Buat transaksi hauling baru.

**Request body:**
```json
{
  "ticket_no": "TBS-2025-001",
  "vehicle_plate": "KT 1234 AB",
  "vendor_id": "uuid-vendor",
  "block_id": "uuid-block",
  "weight_in": 28.450,
  "weight_out": 2.100,
  "transaction_date": "2025-06-01",
  "notes": "Opsional"
}
```

**Validasi server-side:**
- `ticket_no`: required, max 100, unique (case-insensitive)
- `vehicle_plate`: required, max 20, uppercase sebelum simpan
- `vendor_id`: required, must exist di tabel vendors dan tidak di-soft-delete
- `block_id`: required, must exist di tabel blocks dan tidak di-soft-delete
- `weight_in`: required, numeric, min 0, max 9999.999
- `weight_out`: required, numeric, min 0, max 9999.999, harus ≤ weight_in
- `transaction_date`: required, format date valid, tidak boleh masa depan
- `net_weight`: TIDAK diterima dari request — dihitung database (generated column) atau aplikasi

**`created_by`:** ambil dari JWT token yang sudah terautentikasi.

**Response 201:**
```json
{
  "success": true,
  "message": "Transaksi berhasil disimpan",
  "data": { /* objek transaksi lengkap seperti format GET */ }
}
```

**Response 422 (validation error):**
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {
    "ticket_no": ["Nomor tiket sudah digunakan"],
    "weight_out": ["Weight Out tidak boleh melebihi Weight In"]
  }
}
```

**Setelah sukses simpan:** catat ke `hauling_transaction_logs` dengan action `CREATE`.

---

### B-3: PUT /api/hauling-transactions/:id

**Deskripsi:** Update transaksi hauling.

**Parameter:** `:id` adalah UUID transaksi.

**Request body:** sama dengan POST (semua field opsional untuk partial update, tapi validasi relasi tetap berlaku)

**Validasi tambahan:**
- Jika transaksi tidak ditemukan atau sudah di-soft-delete: return 404
- `ticket_no` unik, kecuali untuk record yang sedang diedit sendiri (exclude self)

**`updated_by`** dan **`updated_at`**: set otomatis dari JWT dan timestamp saat ini.

**Response 200:**
```json
{
  "success": true,
  "message": "Transaksi berhasil diperbarui",
  "data": { /* objek transaksi yang sudah diupdate */ }
}
```

**Setelah sukses:** catat ke `hauling_transaction_logs` dengan action `UPDATE`, simpan `old_values` dan `new_values` hanya untuk field yang berubah.

---

### B-4: DELETE /api/hauling-transactions/:id

**Deskripsi:** Soft delete transaksi hauling.

**Perilaku:** JANGAN hapus dari database. Set `deleted_at = NOW()` dan `deleted_by = user_id_dari_jwt`.

**Response 200:**
```json
{
  "success": true,
  "message": "Transaksi berhasil dihapus"
}
```

**Response 404:**
```json
{
  "success": false,
  "message": "Transaksi tidak ditemukan"
}
```

**Setelah sukses:** catat ke `hauling_transaction_logs` dengan action `DELETE`.

---

### B-5: GET /api/hauling-transactions/export

**Deskripsi:** Export data transaksi ke file Excel atau PDF, mengikuti filter yang aktif.

**Query parameters:** sama dengan B-1, ditambah:
```
format   string   required   Nilai: xlsx | pdf
```

**Perilaku:**
- Tidak ada pagination — export semua data yang sesuai filter (maksimum 10.000 baris)
- Jika data > 10.000: return 400 dengan pesan "Data terlalu banyak, gunakan filter untuk mempersempit hasil"

**Untuk format xlsx:**
- Library: ExcelJS
- Sheet name: "Hauling Transactions"
- Header baris 1: nama kolom (bold, background abu-abu)
- Kolom: No. | Ticket No | Vehicle Plate | Vendor | Block Code | Weight In | Weight Out | Net Weight | Tanggal | Catatan
- Format angka kolom berat: `#,##0.000`
- Format tanggal: `DD/MM/YYYY`
- Auto-width kolom
- Freeze baris header
- Response header: `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Nama file: `hauling-transactions-[YYYY-MM-DD].xlsx`

**Untuk format pdf:**
- Library: PDFKit atau generate via HTML template + puppeteer
- Orientasi: landscape
- Header halaman: logo PalmTrack Cloud + judul "Laporan Hauling TBS" + tanggal cetak + filter yang aktif
- Tabel data dengan alternating row color
- Footer halaman: nomor halaman `Halaman X dari Y`
- Response header: `Content-Type: application/pdf`

---

### B-6: GET /api/vendors (pastikan sudah ada atau buat jika belum)

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "CV Maju Bersama", "code": "CMB" }
  ]
}
```

Hanya return vendor yang aktif (tidak di-soft-delete). Tidak perlu pagination untuk dropdown.

---

### B-7: GET /api/blocks (pastikan sudah ada atau buat jika belum)

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Blok A1", "code": "A1", "area_ha": 25.5 }
  ]
}
```

Hanya return block yang aktif. Tidak perlu pagination untuk dropdown.

---

## Middleware & Keamanan

1. **Auth middleware:** Pastikan semua endpoint `/api/hauling-transactions/*` memerlukan JWT yang valid. Gunakan middleware yang sudah ada di project.

2. **Role check:** Untuk endpoint DELETE dan export, tambahkan pengecekan role:
   - `DELETE`: hanya role `admin` atau `supervisor` yang diizinkan
   - `GET /export`: hanya role `admin`, `supervisor`, atau `manager`
   - `POST` dan `PUT`: role `admin`, `supervisor`, `operator`

3. **Rate limiting:** Terapkan rate limit pada endpoint export:
   - Max 10 request per user per menit untuk endpoint export

4. **Input sanitization:** Sanitasi semua string input sebelum query database untuk mencegah SQL injection (gunakan parameterized query / ORM — jangan string concatenation).

---

## Error Handling Standard

Semua endpoint harus menggunakan format error yang konsisten:

```json
// 400 Bad Request
{ "success": false, "message": "Deskripsi error", "code": "BAD_REQUEST" }

// 401 Unauthorized
{ "success": false, "message": "Token tidak valid atau sudah kadaluarsa", "code": "UNAUTHORIZED" }

// 403 Forbidden
{ "success": false, "message": "Anda tidak memiliki akses untuk tindakan ini", "code": "FORBIDDEN" }

// 404 Not Found
{ "success": false, "message": "Transaksi tidak ditemukan", "code": "NOT_FOUND" }

// 422 Unprocessable Entity (validation)
{ "success": false, "message": "Validasi gagal", "errors": { "field": ["pesan"] } }

// 500 Internal Server Error
{ "success": false, "message": "Terjadi kesalahan pada server", "code": "INTERNAL_ERROR" }
```

Jangan expose stack trace atau detail internal error ke response production.

---

## Checklist Sebelum Selesai (Backend)

- [ ] Migration berhasil dijalankan tanpa error
- [ ] Semua endpoint (B-1 s/d B-7) terimplementasi dan merespons sesuai contract
- [ ] Soft delete berfungsi (data tidak benar-benar terhapus dari DB)
- [ ] Audit log tersimpan untuk setiap operasi CREATE, UPDATE, DELETE
- [ ] Validasi server-side berjalan untuk semua field
- [ ] Duplikat ticket_no ditolak dengan error yang informatif
- [ ] Export xlsx menghasilkan file yang bisa dibuka di Excel
- [ ] Auth middleware aktif di semua endpoint
- [ ] Rate limiting aktif di endpoint export
- [ ] Semua query menggunakan parameterized query (tidak ada raw string concat)
- [ ] Response format konsisten di semua endpoint (success, data, meta, errors)
- [ ] Unit test untuk validasi bisnis kritis (weight_out ≤ weight_in, duplikat tiket, dsb)

---

*Prompt ini dibuat untuk PalmTrack Cloud — PalmChain Industry System*
*Versi: 1.0 | Tanggal: Juni 2025*
