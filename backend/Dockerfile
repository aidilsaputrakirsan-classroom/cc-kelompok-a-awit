# ============================================================
# Stage 1: Builder — Install dependencies in virtual environment
# ============================================================
FROM python:3.12-slim AS builder

WORKDIR /app

# Copy requirements first for cache optimization
COPY requirements.txt .

# Create virtual environment
RUN python -m venv /opt/venv

# Activate venv and install dependencies
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# Install curl for healthcheck (will be copied to final stage)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# ============================================================
# Stage 2: Production — Copy venv + app code only
# ============================================================
FROM python:3.12-slim

WORKDIR /app

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv

# Copy curl binary for healthcheck
COPY --from=builder /usr/bin/curl /usr/bin/curl
COPY --from=builder /usr/lib/x86_64-linux-gnu/libcurl.so.4 /usr/lib/x86_64-linux-gnu/
COPY --from=builder /usr/lib/x86_64-linux-gnu/libnghttp2.so.14 /usr/lib/x86_64-linux-gnu/
COPY --from=builder /usr/lib/x86_64-linux-gnu/libidn2.so.0 /usr/lib/x86_64-linux-gnu/
COPY --from=builder /usr/lib/x86_64-linux-gnu/librtmp.so.1 /usr/lib/x86_64-linux-gnu/
COPY --from=builder /usr/lib/x86_64-linux-gnu/libssh2.so.1 /usr/lib/x86_64-linux-gnu/
COPY --from=builder /usr/lib/x86_64-linux-gnu/libpsl.so.5 /usr/lib/x86_64-linux-gnu/
COPY --from=builder /usr/lib/x86_64-linux-gnu/libgssapi_krb5.so.2 /usr/lib/x86_64-linux-gnu/

# Install postgresql-client untuk pg_isready command (untuk database ready check)
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Activate venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY . .

# Copy startup script
COPY scripts/wait-for-db.sh /app/wait-for-db.sh
RUN chmod +x /app/wait-for-db.sh

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
    CMD curl -f http://localhost:8000/health || exit 1

# Start command dengan wait-for-db script
ENTRYPOINT ["/app/wait-for-db.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]