import { useState, useEffect, useCallback } from 'react';

const API_URL = (import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : "http://localhost").replace(/\/$/, "");

function ServiceCard({ name, icon, healthUrl, metricsUrl }) {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const healthRes = await fetch(healthUrl);
      if (!healthRes.ok) throw new Error("Failed");
      const healthData = await healthRes.json();
      setHealth(healthData);
    } catch {
      setHealth({ status: 'unreachable' });
    }

    if (metricsUrl) {
      try {
        const metricsRes = await fetch(metricsUrl);
        if (!metricsRes.ok) throw new Error("Failed");
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      } catch {
        setMetrics(null);
      }
    }

    setLoading(false);
  }, [healthUrl, metricsUrl]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Refresh setiap 10 detik
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const statusColor = {
    healthy: '#22c55e',
    degraded: '#f59e0b',
    unhealthy: '#ef4444',
    unreachable: '#6b7280',
  };

  const status = health?.status || 'unreachable';

  return (
    <div style={{
      border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: '12px',
      padding: '20px',
      borderLeft: `4px solid ${statusColor[status] || '#6b7280'}`,
      background: 'var(--bg-card, #fff)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{icon} {name}</h3>
        <span style={{
          background: statusColor[status],
          color: '#fff',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '600',
          textTransform: 'uppercase',
        }}>
          {loading ? '...' : status}
        </span>
      </div>

      {metrics && (
        <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary, #64748b)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>Requests: <strong>{metrics.total_requests}</strong></div>
            <div>Errors: <strong style={{ color: metrics.total_errors > 0 ? '#ef4444' : 'inherit' }}>
              {metrics.total_errors}
            </strong></div>
            <div>Error Rate: <strong>{metrics.error_rate_percent}%</strong></div>
            <div>Avg Latency: <strong>{metrics.latency?.avg_ms || 0}ms</strong></div>
            <div>p95 Latency: <strong>{metrics.latency?.p95_ms || 0}ms</strong></div>
            <div>Uptime: <strong>{Math.round((metrics.uptime_seconds || 0) / 60)}min</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastChecked(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ color: 'var(--text-primary)' }}>📊 System Status</h1>
      <p style={{ color: 'var(--text-secondary, #64748b)' }}>
        Real-time health monitoring — auto-refresh setiap 10 detik
      </p>

      <div style={{ display: 'grid', gap: '16px', marginTop: '24px' }}>
        <ServiceCard
          name="Auth Service"
          icon="🔐"
          healthUrl={`${API_URL}/auth/health`}
          metricsUrl={`${API_URL}/auth/metrics`}
        />
        <ServiceCard
          name="Item Service"
          icon="📦"
          healthUrl={`${API_URL}/items/health`}
          metricsUrl={`${API_URL}/items/metrics`}
        />
        <ServiceCard
          name="API Gateway"
          icon="🚪"
          healthUrl={`${API_URL}/health`}
          metricsUrl={null}
        />
      </div>

      <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary, #94a3b8)' }}>
        Last checked: {lastChecked.toLocaleTimeString()}
      </p>
    </div>
  );
}
