# ============================================================
# Backend Monolith — PalmChain API
# Sama persis dengan cara DeployCC menjalankan backend
# ============================================================
FROM python:3.12-slim

WORKDIR /app

# Install dependencies dulu (cache optimization)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

EXPOSE 8000

# Jalankan uvicorn (sama seperti DeployCC)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]