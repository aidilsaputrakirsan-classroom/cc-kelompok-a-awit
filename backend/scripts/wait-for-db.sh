#!/bin/bash
# wait-for-db.sh
# Script untuk menunggu PostgreSQL siap sebelum menjalankan aplikasi
# Mencegah error "connection refused" karena database belum sepenuhnya siap

set -e

# Ambil hostname dari argument atau default ke 'db'
host="${1:-db}"
port="${2:-5432}"
user="${3:-postgres}"

echo "⏳ Waiting for PostgreSQL at $host:$port..."

# Retry logic: cek database setiap 1 detik sampai siap (max 30 detik)
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if pg_isready -h "$host" -p "$port" -U "$user" -q; then
        echo "✓ PostgreSQL is ready!"
        break
    fi
    
    echo "  Attempt $attempt/$max_attempts: PostgreSQL not ready yet, retrying in 1 second..."
    sleep 1
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "✗ PostgreSQL did not become ready after $max_attempts seconds"
    exit 1
fi

echo "Starting application..."
# Jalankan command yang dikirim (akan berisi: uvicorn main:app ...)
exec "$@"
