"""
Simple In-Memory Metrics Collector.
Mengumpulkan metrics dasar: request count, error count, latency.
"""
import time
import threading
from collections import defaultdict, deque


class MetricsCollector:
    """Thread-safe metrics collector."""

    def __init__(self):
        self._lock = threading.Lock()
        self.start_time = time.time()

        # Counters
        self.request_count = 0
        self.error_count = 0          # 4xx + 5xx
        self.status_counts = defaultdict(int)  # per status code

        # Latency tracking (last 1000 requests)
        self.latencies = []
        self.max_latency_samples = 1000

        # Per-endpoint stats
        self.endpoint_stats = defaultdict(lambda: {
            "count": 0,
            "errors": 0,
            "total_latency_ms": 0,
        })
        
        # Sliding window for recent error rate (1 minute)
        self.recent_requests = deque()

    def record_request(self, method: str, path: str, status_code: int, duration_ms: float):
        """Catat satu request."""
        with self._lock:
            self.request_count += 1
            self.status_counts[status_code] += 1

            if status_code >= 400:
                self.error_count += 1

            # Record in sliding window
            now = time.time()
            self.recent_requests.append((now, status_code >= 400))
            self._cleanup_recent(now)

            # Latency
            self.latencies.append(duration_ms)
            if len(self.latencies) > self.max_latency_samples:
                self.latencies.pop(0)

            # Per-endpoint
            key = f"{method} {path}"
            self.endpoint_stats[key]["count"] += 1
            self.endpoint_stats[key]["total_latency_ms"] += duration_ms
            if status_code >= 400:
                self.endpoint_stats[key]["errors"] += 1

    def get_metrics(self) -> dict:
        """Return snapshot metrics."""
        with self._lock:
            uptime = round(time.time() - self.start_time, 1)
            error_rate = (
                round(self.error_count / self.request_count * 100, 2)
                if self.request_count > 0 else 0
            )

            # Latency percentiles
            latency_stats = {}
            if self.latencies:
                sorted_lat = sorted(self.latencies)
                n = len(sorted_lat)
                latency_stats = {
                    "p50_ms": round(sorted_lat[int(n * 0.5)], 2),
                    "p95_ms": round(sorted_lat[int(n * 0.95)], 2),
                    "p99_ms": round(sorted_lat[min(int(n * 0.99), n - 1)], 2),
                    "avg_ms": round(sum(sorted_lat) / n, 2),
                }

            # Top endpoints
            endpoints = {}
            for key, stats in self.endpoint_stats.items():
                avg_lat = (
                    round(stats["total_latency_ms"] / stats["count"], 2)
                    if stats["count"] > 0 else 0
                )
                endpoints[key] = {
                    "count": stats["count"],
                    "errors": stats["errors"],
                    "avg_latency_ms": avg_lat,
                }

            return {
                "uptime_seconds": uptime,
                "total_requests": self.request_count,
                "total_errors": self.error_count,
                "error_rate_percent": error_rate,
                "status_codes": dict(self.status_counts),
                "latency": latency_stats,
                "endpoints": endpoints,
            }

    def _cleanup_recent(self, current_time: float):
        """Hapus data request yang lebih dari 60 detik."""
        while self.recent_requests and self.recent_requests[0][0] < current_time - 60:
            self.recent_requests.popleft()

    def get_recent_error_rate(self) -> float:
        """Hitung persentase error dalam 60 detik terakhir."""
        with self._lock:
            now = time.time()
            self._cleanup_recent(now)
            if not self.recent_requests:
                return 0.0
            
            total = len(self.recent_requests)
            errors = sum(1 for _, is_error in self.recent_requests if is_error)
            return round((errors / total) * 100, 2)

    def reset(self):
        """Reset semua metrics."""
        with self._lock:
            self.request_count = 0
            self.error_count = 0
            self.status_counts.clear()
            self.latencies.clear()
            self.endpoint_stats.clear()


# Singleton instance
metrics = MetricsCollector()
