# 🧪 Hasil Pengujian UI (User Interface) — PalmTrack Cloud
## Tugas 3 — Lead QA & Docs | Modul 3: Frontend React — UI & API Integration

**Mata Kuliah:** Komputasi Awan  
**Program Studi:** Sistem Informasi — Institut Teknologi Kalimantan  
**Branch:** `development` (PalmChain Project)  
**Tools Testing:** Browser (Chrome) — `http://localhost:5173`  
**Backend URL:** `http://localhost:8000`  
**Tanggal Testing:** 22 April 2026  
**Tester:** Adonia Azarya Tamalonggehe (Lead QA & Docs)

---

## Pendahuluan

Dokumen ini merupakan laporan pengujian (testing) antarmuka pengguna aplikasi **PalmTrack Cloud**. Aplikasi ini telah sepenuhnya bertransformasi dari praktikum awal menjadi sistem monitoring rantai pasok TBS kelapa sawit.

Pengujian ini memastikan bahwa alur Autentikasi (Register/Login/Logout), Navigasi Sidebar, serta fungsi CRUD (Create, Read, Update, Delete) pada Master Data (Kontraktor & Blok) berjalan dengan lancar saat diintegrasikan dengan backend FastAPI.

---

## Ringkasan Test Case

| No | Skenario Pengujian | Hasil |
|----|--------------------|-------|
| TC-01 | Alur Registrasi Akun Baru & Login | ✅ Pass |
| TC-02 | Akses Halaman Master Data Contractors | ✅ Pass |
| TC-03 | Tambah Data Kontraktor (Create) | ✅ Pass |
| TC-04 | Edit Data Kontraktor (Update) | ✅ Pass |
| TC-05 | Hapus Data Kontraktor (Delete) dengan Konfirmasi | ✅ Pass |
| TC-06 | Akses Halaman Master Data Blocks | ✅ Pass |
| TC-07 | Tambah Data Blok/Area (Create) | ✅ Pass |
| TC-08 | Edit Data Blok/Area (Update) | ✅ Pass |
| TC-09 | Hapus Data Blok/Area (Delete) dengan Konfirmasi | ✅ Pass |
| TC-10 | Akses Halaman Actual Hauling (Status Progress) | ⚠️ Terverifikasi (Belum dibuat) |
| TC-11 | Alur Logout Akun | ✅ Pass |

---

## Bukti Pengujian (Screenshots)

---

### TC-01 — Alur Registrasi Akun Baru & Login
**Deskripsi:** Menguji pembuatan akun baru melalui form registrasi. Setelah registrasi sukses, sistem harus otomatis mengarahkan pengguna ke halaman Dashboard.

**Langkah & Hasil:** 
Form registrasi diisi dengan data pengguna baru. Sistem merespons dengan sukses dan langsung masuk ke Dashboard.

![Tampilan Registrasi](../image_w3/tampilan%20registrasi.png)  
*Form registrasi diisi oleh pengguna baru.*

![Dashboard Setelah Regis](../image_w3/dashbord%20setelah%20regis.png)  
*Berhasil dialihkan ke Dashboard dengan stat cards yang sudah berfungsi.*

✅ **Hasil: PASS**

---

### TC-02 — Akses Halaman Master Data Contractors
**Deskripsi:** Memastikan navigasi sidebar berfungsi memindahkan halaman ke menu "Contractor / Vendor" tanpa me-reload penuh halaman (SPA).

![Halaman Contractor](../image_w3/halaman%20Contractor%20atau%20vendor.png)  
*Halaman awal Kontraktor (Tabel belum berisi data).*

✅ **Hasil: PASS**

---

### TC-03 — Tambah Data Kontraktor (Create)
**Deskripsi:** Menguji form tambah kontraktor baru dan memastikan data berhasil tersimpan serta tampil di tabel.

![Add Contractor](../image_w3/Add%20Contractor.png)  
*Form input data kontraktor baru.*

![Berhasil Menambahkan Contractor](../image_w3/berhasil%20menambahkan.png)  
*Data berhasil disimpan dan langsung ter-render di dalam tabel.*

✅ **Hasil: PASS**

---

### TC-04 — Edit Data Kontraktor (Update)
**Deskripsi:** Memastikan tombol Edit menarik data yang benar ke dalam form, dan perubahan berhasil disimpan kembali ke database.

![Edit Contractor](../image_w3/Edit.png)  
*Form edit terbuka dengan data kontraktor terisi otomatis.*

![Berhasil Edit Contractor](../image_w3/berhasil%20edit.png)  
*Perubahan data kontraktor berhasil diperbarui di tabel.*

✅ **Hasil: PASS**

---

### TC-05 — Hapus Data Kontraktor (Delete)
**Deskripsi:** Memastikan dialog konfirmasi keamanan muncul saat menghapus data, dan data benar-benar hilang dari tabel setelah dikonfirmasi.

![Notif Delete Contractor](../image_w3/notif%20delete.png)  
*Sistem memberikan peringatan (confirm dialog) sebelum penghapusan.*

![Berhasil Delete Contractor](../image_w3/Berhasil%20delete.png)  
*Data kontraktor berhasil terhapus dari tabel.*

✅ **Hasil: PASS**

---

### TC-06 — Akses Halaman Master Data Blocks
**Deskripsi:** Berpindah navigasi ke halaman manajemen Blok (Area Panen) dan memastikan tampilannya sesuai.

![Halaman Block](../image_w3/halaman%20block%20atau%20area.png)  
*Tampilan awal halaman tabel Master Data Blocks.*

![Test Fitur Block](../image_w3/test%20fitur%20Block%20atau%20area.png)  
*Tabel kosong siap menerima data Blok/Afdeling baru.*

✅ **Hasil: PASS**

---

### TC-07 — Tambah Data Blok/Area (Create)
**Deskripsi:** Mengisi form Master Block (Kode Blok, Afdeling, Luas/Hektar) dan memastikan data tersebut berhasil disimpan.

![Add Block](../image_w3/Add%20Block.png)  
*Mengisi data untuk blok/area panen baru.*

![Berhasil Menambahkan Block](../image_w3/berhasil%20menambahkan%20block.png)  
*Blok panen sukses ditambahkan ke dalam tabel.*

✅ **Hasil: PASS**

---

### TC-08 — Edit Data Blok/Area (Update)
**Deskripsi:** Memastikan fitur ubah/edit data Blok beroperasi dengan normal.

![Edit Block](../image_w3/edit%20block.png)  
*Membuka form edit untuk salah satu blok.*

![Berhasil Edit Block](../image_w3/berhasil%20edit%20block.png)  
*Perubahan nama/luas blok berhasil diperbarui dan tertampil.*

✅ **Hasil: PASS**

---

### TC-09 — Hapus Data Blok/Area (Delete)
**Deskripsi:** Menguji proses penghapusan data Blok dengan memastikan adanya validasi konfirmasi hapus.

![Notif Delete Block](../image_w3/notif%20delete%20block.png)  
*Dialog peringatan penghapusan area blok muncul.*

![Berhasil Delete Block](../image_w3/berhasil%20delete%20block.png)  
*Blok berhasil dihapus dan menghilang dari layar.*

✅ **Hasil: PASS**

---

### TC-10 — Halaman Actual Hauling (Dalam Proses)
**Deskripsi:** Mengecek fungsionalitas halaman transaksi *Actual Hauling*.

![Fitur Belum Dibuat](../image_w3/fitur%20Actual%20Hauling%20belum%20di%20buat.png)  
*Saat ini halaman Actual Hauling belum diimplementasi dan masih menampilkan pesan placeholder sesuai progres pengembangan.*

⚠️ **Hasil: Fitur sesuai dengan progres roadmap tim (In Progress)**

---

### TC-11 — Alur Logout
**Deskripsi:** Menguji fitur keluar sistem dan memastikan aplikasi dikembalikan secara aman ke halaman Login.

![Logout](../image_w3/logout.png)  
*User mengklik logout dan sistem membersihkan sesi lalu dialihkan kembali ke tampilan awal (halaman Register/Login).*

✅ **Hasil: PASS**

---

## Kesimpulan

Berdasarkan pengujian nyata (*manual testing*) di lingkungan lokal, **seluruh fitur utama antarmuka pengguna (UI) PalmTrack Cloud berjalan dengan sangat baik dan stabil.**
- Komunikasi dengan backend REST API (FastAPI) tidak mengalami kendala.
- Fungsi CRUD di halaman Master Data Contractors & Master Data Blocks berfungsi sempurna.
- Tampilan responsif dan navigasi antar menu *smooth* tanpa reload.
- Satu-satunya modul yang belum fungsional adalah *Transactions Hauling*, yang memang dijadwalkan pada siklus sprint pengembangan berikutnya.

Dokumen ini menyatakan bahwa standar Quality Assurance (QA) untuk Modul Frontend telah **terpenuhi**.

---
*Dokumentasi disusun oleh Adonia Azarya Tamalonggehe (Institut Teknologi Kalimantan, 2026).*