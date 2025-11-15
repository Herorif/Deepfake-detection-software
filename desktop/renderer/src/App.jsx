import React, { useState } from 'react';
import UploadPanel from './components/UploadPanel.jsx';
import ResultCard from './components/ResultCard.jsx';
import ThreatPanel from './components/ThreatPanel.jsx';
import ThreatGallery from './components/ThreatGallery.jsx';

const shellStyle = {
  padding: '2rem',
  background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
  minHeight: '100vh',
};

const headerStyle = {
  fontSize: '2.25rem',
  fontWeight: 700,
  marginBottom: '1rem',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '1.5rem',
  marginTop: '1.5rem',
};

export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);

  const handleAnalysisComplete = (payload) => {
    setAnalysis(payload);
    setErrorMessage(null);
  };

  const handleAnalysisError = (message) => {
    setErrorMessage(message);
  };

  return (
    <div style={shellStyle}>
      <header style={headerStyle}>Deepfake Detection Desktop</header>
      <p style={{ color: '#cbd5f5', maxWidth: '720px' }}>
        Upload video, audio, or still images to run local EfficientNetV2-based classification (placeholder) and
        receive an Ollama-backed threat reasoning summary (also placeholder) entirely on your workstation.
      </p>
      <UploadPanel
        status={status}
        onStatusChange={setStatus}
        onComplete={handleAnalysisComplete}
        onError={handleAnalysisError}
      />
      {errorMessage && (
        <div style={{ color: '#f87171', marginTop: '1rem' }}>[!] {errorMessage}</div>
      )}
      <section style={gridStyle}>
        <ResultCard data={analysis} status={status} />
        <ThreatPanel llm={analysis?.llm} />
      </section>
      <ThreatGallery />
    </div>
  );
}

