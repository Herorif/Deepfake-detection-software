import React, { useEffect, useState } from 'react';
import { fetchStats } from '../api/backendClient.js';

const cardStyle = {
  background: '#0b1120',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  border: '1px solid #1d4ed8',
  minHeight: '200px',
};

const statGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '0.75rem',
  marginTop: '1rem',
};

export default function StatsCard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      try {
        const payload = await fetchStats();
        if (mounted) {
          setStats(payload);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError('Unable to load stats');
        }
      }
    };
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: 0 }}>Analysis Stats</h3>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {!stats && !error && <p style={{ color: '#94a3b8' }}>Loading stats...</p>}
      {stats && (
        <>
          <div style={statGrid}>
            <StatItem label="Total Analyzed" value={stats.total_analyzed} />
            <StatItem label="Fake Verdicts" value={stats.total_fake} />
            <StatItem label="Real Verdicts" value={stats.total_real} />
            <StatItem
              label="Last Analysis"
              value={stats.last_analysis ? new Date(stats.last_analysis).toLocaleTimeString() : 'N/A'}
            />
          </div>
          <p style={{ color: '#64748b', marginTop: '0.75rem' }}>
            Updated every 15 seconds from the FastAPI backend.
          </p>
        </>
      )}
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div>
      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{value ?? 0}</p>
    </div>
  );
}
