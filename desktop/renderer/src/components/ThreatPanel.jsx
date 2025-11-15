import React from 'react';

const panelStyle = {
  background: '#111827',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  border: '1px solid #312e81',
};

const listStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
};

const badgeStyle = {
  borderRadius: '999px',
  padding: '0.25rem 0.75rem',
  background: '#3730a3',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

export default function ThreatPanel({ llm }) {
  if (!llm) {
    return (
      <div style={panelStyle}>
        <p style={{ color: '#94a3b8' }}>Threat intelligence will appear after a successful analysis.</p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <div style={badgeStyle}>Threat Analysis</div>
      <p style={{ marginTop: '0.75rem', fontSize: '1.1rem' }}>{llm.summary}</p>

      <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Attack Vectors</h4>
      <ul style={listStyle}>
        {llm.attack_vectors?.map((vector) => (
          <li key={vector.name} style={{ marginBottom: '0.75rem' }}>
            <strong>{vector.name}</strong>
            <div style={{ color: '#cbd5f5' }}>{vector.description}</div>
            <small style={{ color: '#f59e0b' }}>Impact: {vector.impact}</small>
          </li>
        ))}
      </ul>

      <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Recommendations</h4>
      <ul style={listStyle}>
        {(llm.recommendations || []).map((tip, index) => (
          <li key={index} style={{ marginBottom: '0.5rem' }}>- {tip}</li>
        ))}
      </ul>
    </div>
  );
}

