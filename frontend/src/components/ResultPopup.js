import React from 'react';

const ResultPopup = ({ result, mediaType, onClose }) => {
  const label = (result?.label || 'unknown').toLowerCase();
  const isFake = label === 'fake';
  const isReal = label === 'real';
  const confidencePercent = Math.min(100, Math.max(0, (result?.confidence || 0) * 100));
  const probabilities = result?.probabilities || {};
  const riskLevel = result?.riskLevel ? result.riskLevel.toLowerCase() : null;
  const riskLabel = riskLevel ? riskLevel.toUpperCase() : null;
  const riskClass = riskLevel ? `risk-pill-${riskLevel}` : '';

  return (
    <div className="mediapreview-popup-overlay">
      <div className="transparent-glass-popup">
        <div className="popup-header">
          <div className="header-content">
            <h3>Analysis Result</h3>
            <p>EfficientNetV2 verdict &amp; confidence{mediaType ? ` · ${mediaType.toUpperCase()}` : ''}</p>
          </div>
          <button className="transparent-close-btn" onClick={onClose} aria-label="Close result details">
            ×
          </button>
        </div>

        <div className="popup-verdict">
          <div className={`verdict-badge ${isFake ? 'fake' : isReal ? 'real' : 'unknown'}`}>
            <div className="badge-text">
              <span className="verdict-title">{isFake ? 'FAKE' : isReal ? 'REAL' : 'UNSURE'}</span>
              <span className="verdict-subtitle">
                {isFake ? 'Manipulated Content' : isReal ? 'Authentic Content' : 'Needs Manual Review'}
              </span>
              {riskLabel && <span className={`reasoning-pill ${riskClass}`}>{riskLabel} RISK</span>}
            </div>
          </div>
        </div>

        <div className="popup-confidence">
          <div className="confidence-header">
            <span>Confidence Level</span>
            <span className="confidence-value">{confidencePercent.toFixed(1)}%</span>
          </div>
          <div className="confidence-bar">
            <div
              className={`confidence-fill ${isFake ? 'fake' : isReal ? 'real' : 'unknown'}`}
              style={{ width: `${confidencePercent}%` }}
            ></div>
          </div>
          {probabilities.fake != null && probabilities.real != null && (
            <p className="confidence-details">
              Fake: {(probabilities.fake * 100).toFixed(1)}% · Real: {(probabilities.real * 100).toFixed(1)}%
            </p>
          )}
          {result?.scoreSummary && <p className="confidence-details">{result.scoreSummary}</p>}
          {result?.fileHash && <p className="hash-text">SHA-256: {result.fileHash}</p>}
        </div>

        <div className="popup-actions">
          <button className="transparent-primary-btn" onClick={onClose}>
            Analyze Another
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPopup;
