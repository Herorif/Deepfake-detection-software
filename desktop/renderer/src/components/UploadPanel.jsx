import React, { useState } from 'react';
import { analyzeMedia } from '../api/backendClient.js';

const panelStyle = {
  background: '#1f2937',
  padding: '1.5rem',
  borderRadius: '0.75rem',
  boxShadow: '0 10px 40px rgba(15, 23, 42, 0.4)',
  marginTop: '1.5rem',
};

const buttonStyle = {
  padding: '0.85rem 1.5rem',
  borderRadius: '0.5rem',
  border: 'none',
  background: '#3b82f6',
  cursor: 'pointer',
  color: '#fff',
  fontWeight: 600,
};

const selectStyle = {
  padding: '0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid #475569',
  width: '100%',
  marginTop: '0.5rem',
  background: '#0f172a',
  color: '#e2e8f0',
};

const inputStyle = {
  marginTop: '0.5rem',
  color: '#e2e8f0',
};

const contexts = [
  { value: '', label: 'No additional context' },
  { value: 'kyc', label: 'KYC onboarding' },
  { value: 'vip', label: 'Executive impersonation' },
  { value: 'social', label: 'Social engineering campaign' },
];

export default function UploadPanel({ status, onStatusChange, onComplete, onError }) {
  const [file, setFile] = useState(null);
  const [context, setContext] = useState(contexts[0].value);
  const [localMessage, setLocalMessage] = useState(null);

  const disabled = status === 'analyzing';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      const message = 'Select a media file before running analysis.';
      setLocalMessage(message);
      onError?.(message);
      return;
    }

    try {
      onStatusChange?.('analyzing');
      setLocalMessage('Uploading to FastAPI backend...');
      const result = await analyzeMedia(file, context || undefined);
      onComplete?.(result);
      setLocalMessage('Analysis complete. Scroll to view results.');
    } catch (error) {
      console.error(error);
      const message = 'Failed to reach backend. Ensure FastAPI is running on localhost:8000.';
      setLocalMessage(message);
      onError?.(message);
    } finally {
      onStatusChange?.('idle');
    }
  };

  return (
    <form style={panelStyle} onSubmit={handleSubmit}>
      <label htmlFor='context-selector'>Operational Context</label>
      <select
        id='context-selector'
        style={selectStyle}
        value={context}
        onChange={(event) => setContext(event.target.value)}
        disabled={disabled}
      >
        {contexts.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label style={{ display: 'block', marginTop: '1rem' }} htmlFor='file-input'>Media File</label>
      <input
        id='file-input'
        style={inputStyle}
        type='file'
        accept='.mp4,.mov,.avi,.mkv,.mp3,.wav,.png,.jpg,.jpeg'
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        disabled={disabled}
      />

      <div style={{ marginTop: '1rem' }}>
        <button style={buttonStyle} type='submit' disabled={disabled}>
          {disabled ? 'Analyzing...' : 'Analyze Media'}
        </button>
      </div>

      {localMessage && (
        <p style={{ marginTop: '0.75rem', color: '#a5b4fc' }}>{localMessage}</p>
      )}
    </form>
  );
}

