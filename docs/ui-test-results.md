# Dokumentasi Hasil UI Testing — Fitur CRUD
## Tugas 3 — Lead QA & Docs | Modul 3: Frontend React — UI & API Integration
**Mata Kuliah:** Komputasi Awan  
**Program Studi:** Sistem Informasi — Institut Teknologi Kalimantan  
**Tools Testing:** Browser (Chrome) — `http://localhost:5173`  
**Backend URL:** `http://localhost:8000`  
**Tanggal Testing:** 13 Maret 2026  
**Tester:** Varrel Kaleb Ropard Pasaribu (Lead QA & Docs)

---

## Pendahuluan

Dokumen ini merupakan hasil pengujian menyeluruh terhadap antarmuka pengguna (UI) aplikasi Cloud App yang dibangun pada Workshop 3 Modul 3. Pengujian dilakukan secara manual melalui browser mengikuti 10 langkah alur testing yang ditetapkan modul (Workshop 3.6 — Testing Alur Lengkap). Setiap skenario diuji untuk memverifikasi bahwa seluruh operasi CRUD (Create, Read, Update, Delete) berjalan dengan benar melalui antarmuka React yang terhubung ke backend FastAPI.

---

## Ringkasan Test Case

| No | Skenario | Komponen Diuji | Hasil |
|----|----------|---------------|-------|
| TC-01 | Cek status koneksi API | Header — indikator API status | ✅ Pass |
| TC-02 | Tampil item dari Modul 2 | ItemList + ItemCard | ✅ Pass |
| TC-03 | Tambah item baru via form | ItemForm (mode Create) | ✅ Pass |
| TC-04 | Verifikasi item muncul di daftar setelah ditambah | ItemList + ItemCard | ✅ Pass |
| TC-05 | Klik Edit — form terisi data item | ItemForm (mode Edit) | ✅ Pass |
| TC-06 | Ubah harga item dan klik Update | ItemForm → PUT /items/:id | ✅ Pass |
| TC-07 | Cari item menggunakan SearchBar | SearchBar → GET /items?search= | ✅ Pass |
| TC-08 | Hapus item — confirm dialog muncul | ItemCard → window.confirm() | ✅ Pass |
| TC-09 | Verifikasi item hilang dari daftar setelah dihapus | ItemList — re-render | ✅ Pass |
| TC-10 | Empty state tampil saat semua item dihapus | ItemList — empty state | ✅ Pass |

**Seluruh 10 test case berhasil dijalankan dan menghasilkan status PASS.**

---

## Detail Hasil Pengujian Per Test Case

---

### TC-01 — Cek Status Koneksi API

**Deskripsi:**  
Verifikasi bahwa komponen `Header` menampilkan indikator status koneksi API secara akurat saat halaman pertama kali dimuat. Indikator ini bergantung pada response dari endpoint `GET /health` yang dipanggil oleh fungsi `checkHealth()` di `App.jsx`.

**Langkah Pengujian:**
1. Pastikan backend berjalan (`uvicorn main:app --reload --port 8000`)
2. Buka browser, navigasi ke `http://localhost:5173`
3. Amati badge status di pojok kanan header

**Expected Result:**  
Badge menampilkan "🟢 API Connected" dengan latar hijau jika backend aktif.

**Actual Result:**  
Header menampilkan badge "🟢 API Connected" dengan latar hijau dan jumlah item (2 items) di samping kiri badge, sesuai ekspektasi.

**Screenshot:**

![TC-01 — Status API Connected](../image_w3/Status%20API.png)

**Hasil:** ✅ **PASS**

---

### TC-02 — Tampil Item dari Modul 2

**Deskripsi:**  
Verifikasi bahwa data item yang telah dimasukkan ke database pada Modul 2 sebelumnya otomatis muncul di daftar item saat halaman dimuat. Ini menguji fungsi `loadItems()` → `GET /items` yang dipanggil di `useEffect` pada `App.jsx`.

**Langkah Pengujian:**
1. Buka `http://localhost:5173`
2. Tunggu hingga loading selesai
3. Amati daftar item yang tampil di halaman

**Expected Result:**  
Item-item dari database (hasil Modul 2) tampil sebagai kartu (ItemCard) lengkap dengan nama, harga, deskripsi, jumlah stok, dan tanggal dibuat.

**Actual Result:**  
Dua item dari Modul 2 tampil dengan benar:
- **SRD** — Rp 1 | BUANG BUANG WAKTU | Stok: 1 | 7 Mar 2026, 21.39
- **INSPACE** — Rp 1 | BUANG BUANG WAKTU | Stok: 1 | 7 Mar 2026, 21.39

Setiap kartu menampilkan tombol "✏️ Edit" dan "🗑️ Hapus" sebagaimana mestinya.

**Screenshot:**

![TC-02 — Item dari Modul 2 tampil di daftar](../image_w3/item%20dari%20modul%202.png)

**Hasil:** ✅ **PASS**

---

### TC-03 — Tambah Item Baru via Form

**Deskripsi:**  
Verifikasi bahwa form `ItemForm` dalam mode Create dapat diisi dengan data valid dan berhasil mengirim request `POST /items` ke backend. Pengujian mencakup validasi input yang wajib diisi.

**Langkah Pengujian:**
1. Isi field **Nama Item** dengan: `Radiator Coolant`
2. Isi field **Harga (Rp)** dengan: `30000`
3. Isi field **Deskripsi** dengan: `cairan radiator motor`
4. Isi field **Jumlah Stok** dengan: `1`
5. Klik tombol "➕ Tambah Item"

**Data Input:**

| Field | Nilai |
|-------|-------|
| Nama Item | Radiator Coolant |
| Harga (Rp) | 30000 |
| Deskripsi | cairan radiator motor |
| Jumlah Stok | 1 |

**Expected Result:**  
Form berhasil disubmit, request `POST /items` terkirim ke backend, dan form kembali kosong (reset) setelah berhasil.

**Actual Result:**  
Form terisi dengan data yang benar. Judul form menampilkan "➕ Tambah Item Baru". Tombol "➕ Tambah Item" tersedia di bawah form. Setelah diklik, form berhasil disubmit dan data dikirim ke backend.

**Screenshot:**

![TC-03 — Form tambah item diisi dengan data Radiator Coolant](../image_w3/tambah%20item.png)

**Hasil:** ✅ **PASS**

---

### TC-04 — Verifikasi Item Muncul di Daftar Setelah Ditambah

**Deskripsi:**  
Verifikasi bahwa item yang baru saja dibuat pada TC-03 langsung muncul di daftar item tanpa perlu refresh halaman. Ini menguji siklus `createItem()` → `loadItems()` → re-render state di `App.jsx`.

**Langkah Pengujian:**
1. Setelah TC-03 berhasil, amati daftar item
2. Cari kartu item dengan nama "Radiator Coolant"
3. Verifikasi data yang tampil sesuai dengan yang diinput

**Expected Result:**  
Item baru "Radiator Coolant" muncul di posisi teratas daftar dengan harga, deskripsi, stok, dan timestamp yang benar.

**Actual Result:**  
Item "Radiator Coolant" berhasil muncul di posisi paling atas daftar:
- **Radiator Coolant** — Rp 30.000 | cairan radiator motor | Stok: 1 | 13 Mar 2026, 13.30

Daftar kini menampilkan 3 item total (Radiator Coolant, SRD, INSPACE).

**Screenshot:**

![TC-04 — Item Radiator Coolant berhasil muncul di daftar](../image_w3/item%20baru%20di%20tambahkan.png)

**Hasil:** ✅ **PASS**

---

### TC-05 — Klik Edit — Form Terisi Data Item

**Deskripsi:**  
Verifikasi bahwa saat tombol "✏️ Edit" pada sebuah ItemCard diklik, form `ItemForm` beralih ke mode Edit dan seluruh field terisi otomatis dengan data item yang dipilih. Ini menguji `handleEdit()` → `setEditingItem()` → `useEffect` di `ItemForm`.

**Langkah Pengujian:**
1. Pada kartu "Radiator Coolant", klik tombol "✏️ Edit"
2. Amati perubahan pada form di bagian atas halaman
3. Verifikasi judul form berubah dan semua field terisi

**Expected Result:**  
- Judul form berubah dari "➕ Tambah Item Baru" menjadi "✏️ Edit Item"
- Semua field (Nama, Harga, Deskripsi, Stok) terisi dengan data item yang dipilih
- Tombol submit berubah menjadi "💾 Update Item"
- Tombol "✕ Batal Edit" muncul di sebelah kanan tombol submit

**Actual Result:**  
Form beralih ke mode Edit dengan benar:
- Judul: "✏️ Edit Item"
- Nama Item: `Radiator Coolant`
- Harga (Rp): `50000` *(data harga saat itu)*
- Deskripsi: `cairan radiator motor`
- Jumlah Stok: `1`
- Tombol "💾 Update Item" dan "✕ Batal Edit" tampil berdampingan

**Screenshot:**

![TC-05 — Form beralih ke mode Edit dengan data Radiator Coolant terisi](../image_w3/item%20baru%20update%20harga.png)

**Hasil:** ✅ **PASS**

---

### TC-06 — Ubah Harga Item dan Klik Update

**Deskripsi:**  
Verifikasi bahwa perubahan data item melalui form Edit berhasil dikirim ke backend via `PUT /items/:id` dan perubahan langsung tercermin di daftar item tanpa refresh halaman.

**Langkah Pengujian:**
1. Dalam mode Edit item "Radiator Coolant", ubah field **Harga (Rp)** dari `30000` menjadi `50000`
2. Klik tombol "💾 Update Item"
3. Amati daftar item setelah update

**Expected Result:**  
- Request `PUT /items/:id` terkirim dengan data terbaru
- Form kembali ke mode Create (reset) setelah update berhasil
- Kartu "Radiator Coolant" di daftar menampilkan harga yang sudah diperbarui (Rp 50.000)

**Actual Result:**  
Harga "Radiator Coolant" berhasil diperbarui dari Rp 30.000 menjadi **Rp 50.000**. Perubahan langsung tercermin di kartu item tanpa perlu refresh. Form kembali ke mode Create setelah update berhasil.

**Screenshot:**

![TC-06 — Harga Radiator Coolant berhasil diperbarui menjadi Rp 50.000](../image_w3/berhasil%20update%20harga.png)

**Hasil:** ✅ **PASS**

---

### TC-07 — Cari Item Menggunakan SearchBar

**Deskripsi:**  
Verifikasi bahwa fitur pencarian melalui komponen `SearchBar` berfungsi dengan benar — mengirim request `GET /items?search=<query>` ke backend dan menampilkan hanya item yang sesuai dengan kata kunci.

**Langkah Pengujian:**
1. Ketik `Radiator Coolant` pada input SearchBar
2. Klik tombol "🔍 Cari" (atau tekan Enter)
3. Amati hasil pencarian yang ditampilkan

**Expected Result:**  
Hanya item yang namanya atau deskripsinya mengandung kata kunci "Radiator Coolant" yang tampil. Item lain (SRD, INSPACE) tersembunyi dari daftar.

**Actual Result:**  
Pencarian berhasil menyaring daftar. Hanya satu item yang tampil:
- **Radiator Coolant** — Rp 50.000 | cairan radiator motor | Stok: 1 | 13 Mar 2026, 13.30

Tombol "✕ Clear" muncul di sebelah kanan tombol "🔍 Cari" untuk mereset pencarian.

**Screenshot:**

![TC-07 — Hasil pencarian 'Radiator Coolant' menampilkan 1 item yang sesuai](../image_w3/cari%20item%20di%20searchbar.png)

**Hasil:** ✅ **PASS**

---

### TC-08 — Hapus Item — Confirm Dialog Muncul

**Deskripsi:**  
Verifikasi bahwa saat tombol "🗑️ Hapus" pada sebuah ItemCard diklik, dialog konfirmasi `window.confirm()` muncul sebelum proses penghapusan dijalankan. Ini adalah mekanisme pengaman agar pengguna tidak menghapus item secara tidak sengaja.

**Langkah Pengujian:**
1. Reset pencarian terlebih dahulu (klik "✕ Clear")
2. Pada kartu "Radiator Coolant", klik tombol "🗑️ Hapus"
3. Amati apakah dialog konfirmasi muncul

**Expected Result:**  
Browser menampilkan dialog konfirmasi dengan pesan: `Yakin ingin menghapus "<nama item>"?` beserta tombol OK dan Cancel.

**Actual Result:**  
Dialog konfirmasi browser (`localhost:5173 says`) muncul dengan pesan:  
**"Yakin ingin menghapus 'Radiator Coolant'?"**  
Tombol **OK** dan **Cancel** tersedia. Nama item yang akan dihapus ditampilkan secara dinamis sesuai item yang dipilih.

**Screenshot:**

![TC-08 — Dialog konfirmasi hapus item muncul dengan nama item 'Radiator Coolant'](../image_w3/confirm%20dialog%20delete.png)

**Hasil:** ✅ **PASS**

---

### TC-09 — Item Hilang dari Daftar Setelah Dihapus

**Deskripsi:**  
Verifikasi bahwa setelah konfirmasi penghapusan diterima (klik OK), request `DELETE /items/:id` berhasil dikirim ke backend dan item yang dihapus langsung hilang dari daftar tanpa perlu refresh halaman.

**Langkah Pengujian:**
1. Pada dialog konfirmasi dari TC-08, klik tombol **OK**
2. Amati daftar item setelah penghapusan

**Expected Result:**  
- Item "Radiator Coolant" tidak lagi tampil di daftar
- Daftar diperbarui secara otomatis (re-render) dengan item yang tersisa
- Jumlah item di Header berkurang

**Actual Result:**  
Item "Radiator Coolant" berhasil dihapus dari daftar. Daftar kini hanya menampilkan 2 item yang tersisa:
- **SRD** — Rp 1 | BUANG BUANG WAKTU | Stok: 1 | 7 Mar 2026, 21.39
- **INSPACE** — Rp 1 | BUANG BUANG WAKTU | Stok: 1 | 7 Mar 2026, 21.39

**Screenshot:**

![TC-09 — Daftar item setelah Radiator Coolant dihapus, tersisa SRD dan INSPACE](../image_w3/item%20berhasil%20di%20hapus.png)

**Hasil:** ✅ **PASS**

---

### TC-10 — Empty State Tampil Saat Semua Item Dihapus

**Deskripsi:**  
Verifikasi bahwa komponen `ItemList` menampilkan tampilan *empty state* yang informatif (bukan tampilan kosong atau error blank) ketika tidak ada item sama sekali yang tersedia di database.

**Langkah Pengujian:**
1. Hapus item **SRD** (klik Hapus → konfirmasi OK)
2. Hapus item **INSPACE** (klik Hapus → konfirmasi OK)
3. Amati tampilan setelah semua item terhapus

**Expected Result:**  
Komponen `ItemList` menampilkan *empty state* dengan:
- Ikon 📭 (kotak surat kosong)
- Teks "Belum ada item."
- Hint "Gunakan form di atas untuk menambahkan item pertama."

**Actual Result:**  
Setelah semua item dihapus, halaman menampilkan *empty state* dengan benar:
- Ikon 📭 tampil di tengah area list
- Teks **"Belum ada item."** tampil di bawah ikon
- Teks hint **"Gunakan form di atas untuk menambahkan item pertama."** tampil sebagai panduan bagi pengguna

SearchBar dan dropdown "Urutkan berdasarkan:" tetap tampil di atas area list.

**Screenshot:**

![TC-10 — Empty state tampil setelah semua item dihapus](../image_w3/Empty%20state.png)

**Hasil:** ✅ **PASS**

---

## Rekap Hasil Pengujian

| No | Test Case | Komponen / Endpoint | Expected | Actual | Hasil |
|----|-----------|--------------------|---------|----|-------|
| TC-01 | Cek status koneksi API | Header + `GET /health` | 🟢 API Connected | 🟢 API Connected | ✅ Pass |
| TC-02 | Tampil item dari Modul 2 | ItemList + `GET /items` | Item lama tampil | SRD & INSPACE tampil | ✅ Pass |
| TC-03 | Tambah item baru via form | ItemForm + `POST /items` | Item tersimpan | Radiator Coolant tersimpan | ✅ Pass |
| TC-04 | Item muncul di daftar setelah ditambah | ItemList — re-render | Item baru tampil | Radiator Coolant tampil | ✅ Pass |
| TC-05 | Edit — form terisi data item | ItemForm (mode Edit) | Field terisi otomatis | Semua field terisi dengan benar | ✅ Pass |
| TC-06 | Ubah harga dan klik Update | ItemForm + `PUT /items/:id` | Harga terupdate | Rp 30.000 → Rp 50.000 | ✅ Pass |
| TC-07 | Cari item via SearchBar | SearchBar + `GET /items?search=` | Item tersaring | Hanya Radiator Coolant tampil | ✅ Pass |
| TC-08 | Hapus — confirm dialog muncul | ItemCard + `window.confirm()` | Dialog konfirmasi muncul | Dialog muncul dengan nama item | ✅ Pass |
| TC-09 | Item hilang dari daftar setelah dihapus | ItemList + `DELETE /items/:id` | Item terhapus dari list | Radiator Coolant hilang | ✅ Pass |
| TC-10 | Empty state tampil saat semua item dihapus | ItemList — empty state | Pesan empty state tampil | 📭 Belum ada item. tampil | ✅ Pass |

---

## Temuan & Observasi

### 1. Semua Fitur CRUD Berfungsi Penuh
Seluruh operasi Create, Read, Update, dan Delete berjalan dengan baik melalui antarmuka React tanpa hambatan. Komunikasi frontend-backend via Fetch API berjalan mulus dengan CORS yang sudah dikonfigurasi dengan benar di sisi backend.

### 2. UI Reaktif Tanpa Refresh Manual
Setiap operasi (tambah, edit, hapus) langsung memperbarui tampilan melalui mekanisme state React (`loadItems()` dipanggil ulang setelah setiap mutasi). Pengguna tidak perlu melakukan refresh browser secara manual untuk melihat perubahan data.

### 3. Form Validasi Berjalan
Form `ItemForm` melakukan validasi sederhana di sisi frontend sebelum mengirimkan request ke backend:
- Field **Nama Item** wajib diisi (tidak boleh kosong)
- Field **Harga** harus lebih dari 0

Jika validasi gagal, pesan error ditampilkan dalam kotak merah di atas form tanpa halaman berpindah.

### 4. Confirm Dialog Sebagai Pengaman Delete
Implementasi `window.confirm()` sebelum request DELETE memastikan pengguna tidak tidak sengaja menghapus item. Nama item ditampilkan secara dinamis dalam dialog (misalnya: `"Yakin ingin menghapus 'Radiator Coolant'?"`) sehingga pengguna tahu persis item mana yang akan dihapus.

### 5. Empty State yang Informatif
Komponen `ItemList` menangani kondisi daftar kosong dengan menampilkan *empty state* yang bersih dan informatif (bukan layar kosong). Ini meningkatkan pengalaman pengguna terutama saat pertama kali menggunakan aplikasi.

### 6. Fitur Sorting Tersedia (Bonus Lead CI/CD)
Ditemukan adanya komponen dropdown **"Urutkan berdasarkan:"** yang tersedia di tampilan — ini merupakan hasil implementasi tambahan dari Lead Frontend/CI/CD yang memperkaya fungsionalitas UI di luar 10 test case wajib.

---

## Catatan untuk Pengembangan Selanjutnya (Modul 4)

Berdasarkan observasi selama pengujian, berikut beberapa hal yang dapat ditingkatkan pada iterasi berikutnya:

1. **Notifikasi Toast** — Saat ini tidak ada feedback visual eksplisit (selain perubahan daftar) saat operasi berhasil dilakukan. Menambahkan komponen Toast/Notification akan meningkatkan kejelasan pengalaman pengguna.
2. **Penanganan Error Jaringan di UI** — Jika backend mati saat operasi sedang berjalan, tidak ada pesan error yang ditampilkan ke pengguna (hanya log di console). Perlu ditambahkan penanganan error yang lebih ramah.
3. **Loading State per Operasi** — Indikator loading saat ini hanya ada pada saat awal memuat daftar. Operasi POST/PUT/DELETE belum memiliki indikator loading, sehingga jika koneksi lambat, tombol dapat diklik berulang kali.
4. **Pagination** — Saat ini seluruh item dimuat sekaligus (limit 20). Untuk dataset yang lebih besar, implementasi pagination atau infinite scroll perlu dipertimbangkan.

---

*Dokumen ini disusun oleh Varrel Kaleb Ropard Pasaribu sebagai bagian dari tugas Lead QA & Docs, Modul 3 Komputasi Awan — Institut Teknologi Kalimantan.*
