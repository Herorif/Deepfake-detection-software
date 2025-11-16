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

const DEFAULT_SUMMARY = 'Model verdict complete. Awaiting additional reasoning from Ollama.';

const LLM_VERDICT_MAP = {
  likely_fake: 'fake',
  likely_real: 'real',
  uncertain: 'unknown',
};

const deriveLabel = (rawLabel, llmVerdict) => {
  const normalized = (rawLabel || '').toLowerCase();
  if (normalized === 'fake' || normalized === 'real') {
    return normalized;
  }
  const verdict = (llmVerdict || '').toLowerCase();
  return LLM_VERDICT_MAP[verdict] || 'unknown';
};

const deriveConfidence = (label, apiResult) => {
  if (typeof apiResult?.confidence === 'number' && !Number.isNaN(apiResult.confidence)) {
    return apiResult.confidence;
  }
  const probs = apiResult?.probabilities || {};
  if (label === 'fake' && typeof probs.fake === 'number') {
    return probs.fake;
  }
  if (label === 'real' && typeof probs.real === 'number') {
    return probs.real;
  }
  return 0;
};

const deriveRiskLevel = (label, llmRisk) => {
  if (llmRisk) {
    return llmRisk.toLowerCase();
  }
  if (label === 'fake') return 'high';
  if (label === 'real') return 'low';
  return 'medium';
};

const deriveScoreSummary = (llm, probabilities) => {
  if (llm?.score_summary) {
    return llm.score_summary;
  }
  if (probabilities?.fake != null && probabilities?.real != null) {
    return `Detector probabilities — Fake: ${(probabilities.fake * 100).toFixed(1)}% vs Real: ${(
      probabilities.real * 100
    ).toFixed(1)}%`;
  }
  return null;
};

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

  const buildAnalysisResult = (apiResult) => {
    const llm = apiResult?.llm || {};
    const probabilities = apiResult?.probabilities || {};
    const label = deriveLabel(apiResult?.label, llm.final_verdict);
    const confidence = deriveConfidence(label, apiResult);
    const riskLevel = deriveRiskLevel(label, llm.risk_level);
    const llmAvailable = llm.ollama_available !== false;
    const summary = llmAvailable
      ? llm.overall_explanation || llm.summary || DEFAULT_SUMMARY
      : 'Ollama reasoning unavailable.';

    return {
      label,
      confidence,
      probabilities,
      fileHash: apiResult.file_hash,
      model: apiResult.model,
      mediaType: apiResult.media_type || uploadedMediaType || 'image',
      artifacts: apiResult.artifacts || [],
      summary,
      attackVectors: llm.attack_vectors ?? [],
      recommendations: llm.recommendations ?? [],
      riskLevel,
      finalVerdict: llm.final_verdict || label,
      scoreSummary: deriveScoreSummary(llm, probabilities),
      llm,
    };
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
      const apiResult = await analyzeMedia(formData);
      setAnalysisResult(buildAnalysisResult(apiResult));
    } catch (error) {
      console.error('Verification failed:', error);
      const message = error.response?.data?.error || 'Verification failed. Ensure the backend is running and try again.';
      setErrorMessage(message);
      setAnalysisResult({
        label: 'unknown',
        confidence: 0,
        probabilities: {},
        summary: message,
        attackVectors: [],
        recommendations: [],
        fileHash: null,
        mediaType: uploadedMediaType || 'image',
        riskLevel: 'medium',
        finalVerdict: 'uncertain',
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
                  <span className="check-icon">✓</span>
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
