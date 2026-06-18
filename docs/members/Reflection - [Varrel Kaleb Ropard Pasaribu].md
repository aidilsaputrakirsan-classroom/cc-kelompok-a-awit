# Reflection Paper — Peran Lead DevOps & Container
**Nama:** Varrel Kaleb Ropard Pasaribu  
**NIM:** 10231089  
**Peran:** Lead DevOps / Container  
**Mata Kuliah:** Cloud Computing (Kelompok A - AWIT)

---

## 1. Pendahuluan dan Fokus Peran
Sebagai Lead DevOps dan Container, fokus utama saya dalam proyek PalmTrack Cloud (PalmChain) bukan sekadar menulis skrip deployment, melainkan mengarsiteki jembatan yang andal antara kode aplikasi dan infrastruktur cloud. Tanggung jawab ini menuntut pemahaman mendalam tentang siklus hidup perangkat lunak (SDLC), orkestrasi kontainer menggunakan Docker Compose, serta otomatisasi pengujian dan deployment melalui GitHub Actions CI/CD Pipeline. 

Tujuan arsitektural saya adalah mencapai sistem pengiriman kode yang berkecepatan tinggi, aman, dan minim intervensi manual (zero-touch deployment), sekaligus memastikan aplikasi dapat berjalan dengan efisiensi sumber daya yang ketat di lingkungan produksi.

---

## 2. Keputusan Teknis dan Analisis Arsitektur

Dalam merancang infrastruktur proyek ini, saya mengambil beberapa keputusan teknis penting yang didasari pertimbangan trade-off performa, kompleksitas, dan batasan sumber daya:

### A. Strategi Kontainerisasi dan Batasan Resource (Resource Limits)
Pada berkas [docker-compose.yml](file:///c:/Users/varrel/OneDrive/%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/Sem6/CC/cc-kelompok-a-awit/docker-compose.yml), saya mendefinisikan batasan sumber daya secara ketat untuk setiap layanan:
*   **Database (PostgreSQL) & Backend Monolith:** Dibatasi masing-masing maksimal `cpus: '0.50'` dan `memory: 512M`.
*   **Frontend & API Gateway (Nginx):** Dibatasi masing-masing maksimal `cpus: '0.25'` dan `memory: 128M`.

*Analisis Keputusan:* Pembatasan ini sangat krusial di lingkungan DeployCC (lingkungan server STB/berdaya rendah) untuk mencegah terjadinya kondisi *Out Of Memory (OOM) Killer* yang dapat mematikan seluruh sistem. Nginx dipilih sebagai API Gateway karena jejak memorinya (memory footprint) yang sangat kecil (~15-30MB) dibandingkan menggunakan gateway berbasis Node.js atau Java.

### B. Optimasi Pipeline CI/CD dengan Granular Paths Filter
Pada berkas [.github/workflows/cd.yml](file:///c:/Users/varrel/OneDrive/%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/Sem6/CC/cc-kelompok-a-awit/.github/workflows/cd.yml), saya menerapkan pustaka `dorny/paths-filter@v3` untuk memisahkan perubahan signifikan (kode sumber) dari perubahan kosmetik (seperti dokumen Markdown, konfigurasi IDE, atau `.gitignore`):
*   *Significant Frontend Changes* memicu build ulang bundel statis.
*   *Cosmetic Changes Only* dilewati (`skip_fe_build=1`), menghemat waktu eksekusi runner GitHub Actions sekitar 3 hingga 5 menit per run.
*   *Requirements Changes* menentukan apakah perintah penginstalan dependensi Python (`pip install`) perlu dijalankan ulang di server produksi untuk mempercepat proses deployment.

### C. Desain Automated Health Check & Diagnostic Fallback
Salah satu kontribusi teknis paling krusial yang saya buat adalah pada tahap akhir pipeline CD (Tugas 11). Setelah memicu deployment ke DeployCC, sistem tidak langsung diasumsikan berjalan dengan baik. Saya menulis skrip *Automated Production Health Check* yang melakukan hal berikut:
1.  Menunggu jeda aman (20 detik) untuk memastikan service Uvicorn telah selesai melakukan restart.
2.  Melakukan pengujian kesehatan pada endpoint `/api/health`.
3.  **Mekanisme Fallback Diagnostik:** Jika health check mengembalikan status selain `200` (gagal), skrip secara otomatis menginstal `sshpass`, membuka koneksi SSH aman ke server produksi menggunakan kredensial yang dihasilkan secara dinamis, lalu mengeksekusi perintah diagnostik (`svc-status`, `svc-applog`, dan `svc-logs`). Hasil log startup ini kemudian diunggah sebagai artefak GitHub Actions agar developer dapat mendiagnosis kegagalan tanpa harus mengakses server secara manual.

---

## 3. Tantangan Teknis dan Penyelesaian Masalah (Troubleshooting)

Selama perjalanan matkul ini, saya menghadapi beberapa kendala teknis yang membutuhkan analisis mendalam untuk menyelesaikannya:

### A. Konflik Port 80 pada Lingkungan Runner GitHub Actions (Tugas 13)
*   **Masalah:** Saat pertama kali menjalankan Integration Test via Docker Compose pada runner GitHub Actions ([ci-integration.yml](file:///c:/Users/varrel/OneDrive/%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/Sem6/CC/cc-kelompok-a-awit/.github/workflows/ci-integration.yml)), build selalu gagal karena port 80 pada host runner sudah digunakan oleh layanan web default runner (seperti Apache atau Nginx bawaan Ubuntu runner).
*   **Analisis & Solusi:** Saya memodifikasi tahap persiapan sebelum menjalankan `docker compose up -d` dengan menghentikan secara paksa semua layanan web yang berjalan pada host runner menggunakan perintah:
    ```bash
    sudo systemctl stop nginx || true
    sudo systemctl stop apache2 || true
    sudo killall nginx || true
    sudo killall apache2 || true
    ```
    Langkah taktis ini membebaskan port 80 dan menjamin kontainer Nginx Gateway di Docker Compose dapat mengikat (bind) port tersebut dengan sukses.

### B. Masalah Sinkronisasi Statefulness Database pada CI Pipeline
*   **Masalah:** Pada siklus pengujian integrasi berulang, terkadang data sisa pengujian sebelumnya mengotori basis data, menyebabkan pengujian baru gagal akibat pelanggaran constraint unik (unique constraints).
*   **Analisis & Solusi:** Saya memastikan bahwa di akhir workflow pengujian integrasi, kontainer dimatikan dengan flag volume cleaning (`docker compose down -v --remove-orphans`). Penggunaan opsi `-v` ini menjamin semua volume Docker yang dibuat selama masa pengujian dihapus sepenuhnya, sehingga setiap integrasi test baru selalu dimulai dengan keadaan basis data bersih (*clean slate*).

### C. Transient Failures saat Health Checking Backend
*   **Masalah:** Uvicorn membutuhkan waktu bootstrapping yang bervariasi tergantung pada beban server DeployCC. Terkadang, pengujian kesehatan langsung dieksekusi sebelum aplikasi siap menerima koneksi, menghasilkan error `502 Bad Gateway` dari Nginx gateway atau koneksi ditolak.
*   **Analisis & Solusi:** Saya merancang skrip polling dengan perulangan (loop) dan jeda waktu aman pada fase pemeriksaan kesehatan integrasi:
    ```bash
    for i in $(seq 1 15); do
      HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health || echo "000")
      ...
    done
    ```
    Strategi ini mencegah kegagalan pipeline palsu (*false positive*) akibat masalah waktu inisialisasi aplikasi.

---

## 4. Pembelajaran dan Refleksi Diri

Melalui matkul ini, saya memperoleh pemahaman mendalam tentang prinsip-prinsip operasional modern:
1.  **Pentingnya Observabilitas:** Membuat skrip pengumpul log otomatis saat kegagalan deployment menyadarkan saya bahwa *deployment yang sukses tidak hanya diukur saat kode terkirim, melainkan saat sistem dapat mendiagnosis dirinya sendiri ketika terjadi kegagalan.*
2.  **Paradoks Keamanan vs Otomatisasi:** Penggunaan `sshpass` dalam workflow CI/CD merupakan keputusan praktis demi otomatisasi diagnostik cepat, namun dari sudut pandang keamanan, hal ini memiliki risiko kebocoran kredensial jika log GitHub Actions tidak disaring dengan ketat. Di masa depan, penggunaan SSH Key berbasis pasangan kunci publik-privat (SSH Key-pairs) yang disimpan dalam GitHub Secrets adalah pendekatan yang lebih aman dan terstandarisasi.
3.  **Manajemen Sumber Daya Kontainer:** Menentukan limits di Docker Compose mengajarkan saya untuk menulis konfigurasi yang ramah terhadap keterbatasan komputasi awan. Hal ini mematangkan kemampuan saya dalam memperhitungkan kapasitas infrastruktur sejak fase pengembangan awal.

Secara keseluruhan, peran Lead DevOps dalam proyek ini menantang saya untuk berpikir secara sistematis dan defensif—merancang alur kerja yang tidak hanya berfungsi dalam kondisi ideal, melainkan juga tangguh saat menghadapi kegagalan jaringan, batasan memori, dan konflik lingkungan komputasi.
