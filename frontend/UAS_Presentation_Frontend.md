---
title: "UAS Komputasi Awan - PalmTrack Cloud (Frontend)"
author: "Lead Frontend"
date: "Minggu 16"
---

# PalmTrack Cloud: Frontend Architecture & Observability

## 1. Perjalanan Arsitektur (Monolith ke Microservices)
- **Monolith:** Sebelumnya, *frontend* memanggil `/api/items` yang langsung mengarah ke satu *backend* terpusat.
- **Microservices Gateway:** Kini, *frontend* bertindak sebagai klien mandiri yang mengonsumsi layanan via **Nginx API Gateway**.
- **Perubahan Rute:** Endpoint diadaptasi menjadi `/auth/*` dan `/items/*` untuk menyelaraskan dengan *reverse proxy* di infrastruktur Cloud.

## 2. Tech Stack & Tools (Frontend)
- **Framework Core:** React (Vite)
- **Routing:** React Router v6
- **Styling:** CSS Variables (Dukungan *Dark Mode/Light Mode*)
- **Peta & GIS:** React Leaflet & Geoman (Untuk Pemetaan Blok Perkebunan)
- **Grafik & Data:** Recharts (Untuk *Dashboard Dashboard*)

## 3. Reliability & Graceful Degradation
- **Resiliensi:** Menerapkan *Error Boundary* tingkat *root* untuk memastikan *crash* komponen tidak merusak seluruh aplikasi dan menampilkan pesan "🚨 Kesalahan Kritis" yang informatif.
- **Graceful Degradation:** Menangani kasus layanan yang gagal (Contoh: Item Service mati namun Auth Service hidup).
  - Pada *ItemsPage*: Menampilkan *fallback banner* kuning (Layanan Sedang Mengalami Gangguan) alih-alih melempar *error blank*.
  - Pada *Dashboard*: Mengamankan *render* dasbor. Meskipun ada layanan yang mati (Status 503), widget grafik lainnya yang berhasil ditarik tetap akan dirender.

## 4. Monitoring & System Status (Observability)
- **Health Dashboard:** Membangun `/status` page yang secara real-time me-*refresh* setiap 10 detik.
- **Metrik Sistem:** Menampilkan indikator HTTP dari `GET /metrics`, menghitung waktu rata-rata (Latensi), *Uptime*, dan *Error Rate* secara visual di dalam UI.
- Membantu DevOps untuk memantau performa tanpa harus selalu masuk ke *console server*.

## 5. Security & Cleanup
- Melakukan pembersihan *log* tersisa (*console.log*).
- Memastikan struktur HTML lebih aksesibel (penambahan `aria-label` dan peran semantik seperti `role="alert"` pada status *error*).
- Bebas dari penyimpanan *hardcoded credential* (Manajemen *token* murni mengandalkan enkripsi JWT yang tersimpan lokal secara dinamis).

---
*Terima kasih! Kami siap mendemonstrasikan sistem berjalan.*
