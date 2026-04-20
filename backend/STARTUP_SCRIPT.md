# Backend Startup Script Documentation

## Overview
File `scripts/wait-for-db.sh` adalah startup script yang memastikan PostgreSQL database siap sebelum aplikasi FastAPI dimulai.

## Fungsi
- ✅ Mengecek koneksi ke PostgreSQL menggunakan `pg_isready`
- ✅ Melakukan retry hingga 30 kali (setiap 1 detik)
- ✅ Menampilkan progress dan status
- ✅ Mencegah error "connection refused" pada startup

## Cara Kerja

### Parameter
```bash
./wait-for-db.sh [host] [port] [user]
```

- `host`: Hostname database (default: `db`)
- `port`: Port database (default: `5432`)
- `user`: PostgreSQL user (default: `postgres`)

### Contoh Penggunaan

**Di Docker:**
```dockerfile
# Dockerfile
ENTRYPOINT ["/app/wait-for-db.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Langsung di Terminal:**
```bash
./scripts/wait-for-db.sh db 5432 postgres && uvicorn main:app
```

## Output Contoh

**Success:**
```
⏳ Waiting for PostgreSQL at db:5432...
✓ PostgreSQL is ready!
Starting application...
```

**Timeout:**
```
⏳ Waiting for PostgreSQL at db:5432...
  Attempt 1/30: PostgreSQL not ready yet, retrying in 1 second...
  Attempt 2/30: PostgreSQL not ready yet, retrying in 1 second...
  ...
✗ PostgreSQL did not become ready after 30 seconds
```

## Integrasi dengan Docker Compose

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      POSTGRES_DB: cloudapp
    ports:
      - "5432:5432"
    networks:
      - cloudnet
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://postgres:postgres123@db:5432/cloudapp
    ports:
      - "8000:8000"
    networks:
      - cloudnet

networks:
  cloudnet:

volumes:
  pgdata:
```

## Best Practices

1. **Selalu gunakan di Docker container** — ensure database readiness sebelum app start
2. **Environment variables** — DATABASE_URL harus sesuai dengan hostname container (gunakan `db`, bukan `localhost`)
3. **Health check** — tambahkan HEALTHCHECK di Dockerfile untuk monitoring
4. **Logging** — script sudah include logging untuk debugging

## Troubleshooting

### "PostgreSQL not ready" terus-terusan
- ✓ Pastikan database container sudah berjalan: `docker ps | grep db`
- ✓ Verifikasi network: `docker network inspect cloudnet`
- ✓ Cek database logs: `docker logs db`

### "Command not found: pg_isready"
- ✓ Pastikan `postgresql-client` terinstall di Dockerfile

### Script tidak executable
- ✓ Set permission: `chmod +x scripts/wait-for-db.sh`
- ✓ Di Windows, gunakan `git config core.fileMode true` sebelum commit
