import React, { useMemo, useState } from 'react';
import FileUpload from './components/FileUpload';
import MediaPreview from './components/MediaPreview';
import ResultPopup from './components/ResultPopup';
import ApiReasoning from './components/ApiReasoning';
import { analyzeMedia } from './services/api';
import './styles/App.css';

const GUIDELINES = [
  {
    title: 'Local-Only Pipeline',
    text: 'Media stays on-device: EfficientNetV2 handles detection while Ollama llama3:8b crafts SOC-ready reasoning.',
  },
  {
    title: 'File Hygiene',
    text: 'Use original exports instead of screenshots of screenshots and keep uploads under 200MB for best fidelity.',
  },
  {
    title: 'Image & Video Capture',
    text: 'Center the subject, keep faces unobstructed, and trim video clips to ~30 seconds for rapid verdicts.',
  },
  {
    title: 'Audit Trail',
    text: 'Each run logs a SHA-256 hash, verdict, and attack vectors in backend/logs/audit.log for forensics.',
  },
  {
    title: 'Security Tips',
    text: 'Escalate impersonation attempts, verify out-of-band, and quarantine suspect media before sharing.',
  },
];

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedMediaType, setUploadedMediaType] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const logoSrc = `${process.env.PUBLIC_URL}/images/cj-logo.png`;

  const handleFileUpload = (file, type = 'image') => {
    setUploadedFile(file);
    setUploadedMediaType(type);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleVerify = async () => {
    if (!uploadedFile) {
      alert('Please upload media before running analysis.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('media_type', uploadedMediaType || 'image');
      const result = await analyzeMedia(formData);
      const llm = result?.llm || {};
      setAnalysisResult({
        label: result.label,
        confidence: result.confidence,
        probabilities: result.probabilities,
        fileHash: result.file_hash,
        model: result.model,
        mediaType: result.media_type || uploadedMediaType || 'image',
        artifacts: result.artifacts,
        summary: llm.overall_explanation || llm.summary,
        attackVectors: llm.attack_vectors ?? [],
        recommendations: llm.recommendations ?? [],
        riskLevel: llm.risk_level,
        finalVerdict: llm.final_verdict,
        scoreSummary: llm.score_summary,
        llm,
      });
    } catch (error) {
      console.error('Verification failed:', error);
      const message =
        error.response?.data?.error || 'Verification failed. Ensure the backend is running and try again.';
      setErrorMessage(message);
      setAnalysisResult({
        label: 'unknown',
        confidence: 0,
        probabilities: undefined,
        summary: message,
        attackVectors: [],
        recommendations: [],
        fileHash: null,
        mediaType: uploadedMediaType || 'image',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setUploadedMediaType(null);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const mediaPreviewType = useMemo(() => {
    if (!uploadedFile) return null;
    return uploadedMediaType || 'image';
  }, [uploadedFile, uploadedMediaType]);

  return (
    <div className="liquid-glass-app">
      <div className="app-bubble bubble-1"></div>
      <div className="app-bubble bubble-2"></div>
      <div className="app-bubble bubble-3"></div>

      <header className="glass-header">
        <div className="header-container">
          <div className="glass-logo">
            <div className="logo-shine"></div>
            <div className="logo-image">
              <img src={logoSrc} alt="Cyberjaya Deepfake Detection Logo" />
            </div>
            <div className="logo-text">
              <h1>CYBERJAYA DEEPFAKE DETECTION</h1>
              <span>AI-Powered Deepfake Detection Software</span>
            </div>
          </div>
          <button className="guidelines-btn" onClick={() => setShowGuidelines(true)} aria-label="Open help overlay">
            Help & Info
          </button>
        </div>
      </header>

      <main className="glass-main">
        <div className="main-container">
          <div className="left-panel">
            <div className="panel-content">
              <div className="section-header">
                <h2>Upload Media</h2>
                <p>Images leverage EfficientNetV2. Videos sample frames for the same detector.</p>
              </div>
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
          </div>

          <div className="right-panel">
            <div className="panel-content">
              <div className="section-header">
                <h2>Media Analysis</h2>
                <p>Preview your upload, view verdicts, and read the LLM reasoning in one console.</p>
              </div>

              <div className="media-preview-container">
                <MediaPreview file={uploadedFile} type={mediaPreviewType} />
                {analysisResult && (
                  <ResultPopup
                    result={analysisResult}
                    mediaType={mediaPreviewType}
                    onClose={() => setAnalysisResult(null)}
                  />
                )}
              </div>

              <div className="action-section">
                <button onClick={handleVerify} disabled={isLoading || !uploadedFile} className="verify-btn primary-btn">
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Analyzing Media...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon" aria-hidden="true">
                        ⚡
                      </span>
                      Verify Authenticity
                    </>
                  )}
                </button>

                {uploadedFile && (
                  <button onClick={handleReset} className="secondary-btn">
                    <span className="btn-icon" aria-hidden="true">
                      ↺
                    </span>
                    Upload New File
                  </button>
                )}
              </div>

              {errorMessage && <p className="error-text">{errorMessage}</p>}

              {analysisResult && (
                <div className="results-section">
                  <ApiReasoning
                    summary={analysisResult.summary}
                    attackVectors={analysisResult.attackVectors}
                    recommendations={analysisResult.recommendations}
                    riskLevel={analysisResult.riskLevel}
                    finalVerdict={analysisResult.finalVerdict}
                    scoreSummary={analysisResult.scoreSummary}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showGuidelines && (
        <div className="guidelines-popup-overlay" role="dialog" aria-modal="true">
          <div className="guidelines-popup">
            <div className="popup-header">
              <div className="header-content">
                <h3>Field Guidance</h3>
                <p>Follow these steps to keep investigations defensible.</p>
              </div>
              <button
                className="transparent-close-btn"
                onClick={() => setShowGuidelines(false)}
                aria-label="Close help overlay"
              >
                ×
              </button>
            </div>
            <div className="guidelines-content">
              {GUIDELINES.map((item) => (
                <div className="guideline-item" key={item.title}>
                  <span className="check-icon">•</span>
                  <span>
                    <strong>{item.title}:</strong> {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="glass-footer">
        <div className="footer-bottom">
          <p>&copy; Cyberjaya - Secure NEX Hackathon 2025</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
