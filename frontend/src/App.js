import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import MediaPreview from './components/MediaPreview';
import ResultPopup from './components/ResultPopup';
import ApiReasoning from './components/ApiReasoning';
import { analyzeMedia } from './services/api';
import './styles/App.css';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleFileUpload = (file, type) => {
    setUploadedFile(file);
    setFileType(type);
    setAnalysisResult(null);
    setShowResult(false);
  };

  const handleVerify = async () => {
    if (!uploadedFile) {
      alert('Please upload an image or video first!');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('type', fileType);

      const result = await analyzeMedia(formData);
      setAnalysisResult(result);
      setShowResult(true);
    } catch (error) {
      console.error('Verification failed:', error);
      setAnalysisResult({
        is_fake: false,
        confidence: 0,
        reasoning: 'Verification failed. Please try again.'
      });
      setShowResult(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setFileType(null);
    setAnalysisResult(null);
    setShowResult(false);
  };

  return (
    <div className="liquid-glass-app">
      {/* Animated background bubbles */}
      <div className="app-bubble bubble-1"></div>
      <div className="app-bubble bubble-2"></div>
      <div className="app-bubble bubble-3"></div>
      
      {/* Header */}
      <header className="glass-header">
        <div className="header-container">
          <div className="glass-logo">
            <div className="logo-shine"></div>
            <div className="logo-icon">🛡️</div>
            <div className="logo-text">
              <h1>CYBERJAYA DEEPFAKE DETECTION</h1>
              <span>AI-Powered Deepfake Detection Software</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="glass-main">
        <div className="main-container">
          {/* Left Panel - Upload Section */}
          <div className="left-panel">
            <div className="panel-content">
              <div className="section-header">
                <h2>Upload Media</h2>
                <p>Select your image or video for authenticity analysis</p>
              </div>
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
          </div>

          {/* Right Panel - Preview & Results */}
          <div className="right-panel">
            <div className="panel-content">
              <div className="section-header">
                <h2>Media Analysis</h2>
                <p>Preview and verify your uploaded content</p>
              </div>
              
              {/* Media Preview with popup container */}
              <div className="media-preview-container">
                <MediaPreview file={uploadedFile} type={fileType} />
                
                {/* Popup appears over MediaPreview */}
                {showResult && analysisResult && (
                  <ResultPopup result={analysisResult} onClose={() => setShowResult(false)} />
                )}
              </div>
              
              {/* Action Section */}
              <div className="action-section">
                <button 
                  onClick={handleVerify} 
                  disabled={isLoading || !uploadedFile}
                  className="verify-btn primary-btn"
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Analyzing Media...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🔍</span>
                      Verify Authenticity
                    </>
                  )}
                </button>
                
                {uploadedFile && (
                  <button onClick={handleReset} className="secondary-btn">
                    <span className="btn-icon">🔄</span>
                    Upload New File
                  </button>
                )}
              </div>

              {/* ApiReasoning shows after popup closes */}
              {!showResult && analysisResult && (
                <div className="results-section">
                  <ApiReasoning reasoning={analysisResult.reasoning} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-footer">
        <div className="footer-bottom">
          <p>&copy; Cyberjaya - Secure NEX Hackathon 2025</p>
        </div>
      </footer>
    </div>
  );
}

export default App;