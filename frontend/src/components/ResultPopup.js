import React from 'react';

const ResultPopup = ({ result, onClose }) => {
  const isFake = result?.is_fake || false;
  const confidence = (result?.confidence || 0) * 100;

  const handleViewDetails = () => {
    onClose(); // Close popup and show main screen
  };

  return (
    <div className="mediapreview-popup-overlay">
      <div className="transparent-glass-popup">
        {/* Header */}
        <div className="popup-header">
          <div className="header-content">
            <h3>Analysis Result</h3>
            <p>Deepfake detection completed</p>
          </div>
          <button className="transparent-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        {/* Verdict Section */}
        <div className="popup-verdict">
          <div className={`verdict-badge ${isFake ? 'fake' : 'real'}`}>
            <div className="badge-icon">
              {isFake ? '' : ''}
            </div>
            <div className="badge-text">
              <span className="verdict-title">{isFake ? 'FAKE' : 'REAL'}</span>
              <span className="verdict-subtitle">{isFake ? 'Manipulated Content' : 'Authentic Content'}</span>
            </div>
          </div>
        </div>

        {/* Confidence Section */}
        <div className="popup-confidence">
          <div className="confidence-header">
            <span>Confidence Level</span>
            <span className="confidence-value">{confidence.toFixed(1)}%</span>
          </div>
          <div className="confidence-bar">
            <div 
              className={`confidence-fill ${isFake ? 'fake' : 'real'}`}
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
        </div>

        {/* Actions */}
        <div className="popup-actions">
          <button className="transparent-primary-btn" onClick={onClose}>
            Analyze Another
          </button>
          <button className="transparent-secondary-btn" onClick={handleViewDetails}>
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPopup;