# Panduan Deployment & Penanganan Darurat Proyek

## 🔄 Skenario Mitigasi: Panduan Rollback Manual (DeployCC)

Apabila proses Continuous Deployment (CD) berhasil diselesaikan oleh GitHub Actions namun sistem mendeteksi adanya kegagalan fungsionalitas kritikal pada lingkungan production, Lead DevOps wajib melakukan pemulihan darurat (*rollback*) menggunakan Git Revert Commit.

### Prosedur Pembatalan Perubahan (Git Revert)
Karena infrastruktur DeployCC dirancang untuk membaca commit history secara linear dan otomatis terpicu oleh kesuksesan CI pipeline, metode terbaik untuk melakukan rollback adalah membalikkan commit buruk langsung dari history Git:

1. **Identifikasi SHA Commit** Cari SHA commit stabil terakhir sebelum sistem mengalami *crash* melalui riwayat log Git atau GitHub Commit History.

2. **Eksekusi Revert Lokal** Buka terminal di laptop Anda, pindah ke branch utama, dan lakukan perintah pembatalan commit:
   ```bash
   git checkout main
   git pull origin main
   
   # Membatalkan commit buruk (ini akan membuat commit baru berisi kode versi sebelumnya)
   git revert <SHA-COMMIT-YANG-MERUSAK-INFRASTRUKTUR> --no-edit