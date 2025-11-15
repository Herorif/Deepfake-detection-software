import React from 'react';

const cardStyle = {
  background: '#0f172a',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  border: '1px solid #1e3a8a',
};

const statStyle = {
  fontSize: '2rem',
  margin: 0,
};

const labelStyle = {
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#a5b4fc',
  fontSize: '0.85rem',
};

function formatConfidence(value) {
  if (typeof value !== 'number') {
    return '0.00%';
  }
  return `${(value * 100).toFixed(1)}%`;
}

export default function ResultCard({ data, status }) {
  if (!data) {
    return (
      <div style={cardStyle}>
        <p style={{ color: '#94a3b8' }}>No analysis yet. Upload a file and run inference to populate this card.</p>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <p style={labelStyle}>Model Verdict</p>
      <p style={statStyle}>{data.label}</p>
      <p style={{ color: '#22d3ee', fontSize: '1.25rem' }}>{formatConfidence(data.confidence)} confidence</p>
      <p style={{ color: '#cbd5f5' }}>Context: {data.context || 'None provided'}</p>
      {status === 'analyzing' && <p style={{ color: '#facc15' }}>Processing...</p>}
    </div>
  );
}

