import React, { useRef, useState } from 'react';

const FileUpload = ({ onFileUpload }) => {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [selectedType, setSelectedType] = useState(null);

  const validateFile = (file, expectedType) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (expectedType === 'image' && imageExtensions.includes(extension)) {
      return { isValid: true, type: 'image' };
    } else if (expectedType === 'video' && videoExtensions.includes(extension)) {
      return { isValid: true, type: 'video' };
    } else {
      const supportedTypes = expectedType === 'image' 
        ? 'JPG, JPEG, PNG, GIF, BMP, WebP' 
        : 'MP4, AVI, MOV, WMV, WebM, MKV';
      return { 
        isValid: false, 
        message: `Please upload only ${expectedType} files (${supportedTypes})` 
      };
    }
  };

  const handleFileSelect = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const validation = validateFile(file, type);
    if (validation.isValid) {
      setSelectedType(type);
      onFileUpload(file, type);
    } else {
      alert(validation.message);
      event.target.value = '';
    }
  };

  const handleButtonClick = (type) => {
    if (type === 'image') {
      imageInputRef.current?.click();
    } else {
      videoInputRef.current?.click();
    }
  };

  return (
    <div className="vertical-upload-container">
      {/* Image Upload Card */}
      <div 
        className={`vertical-upload-card ${selectedType === 'image' ? 'card-selected' : ''}`}
        onClick={() => handleButtonClick('image')}
      >
        <div className="card-content-wrapper">
          <div className="card-icon">
            <span>🖼️</span>
          </div>
          <div className="card-text">
            <h4>Upload Image</h4>
            <p>Analyze images for deepfake detection with advanced AI algorithms</p>
            <div className="file-info">
              <span className="file-types">JPG, PNG, GIF, WebP</span>
              <span className="file-size">Max 50MB</span>
            </div>
          </div>
        </div>
        <button className="vertical-upload-btn">
          Choose Image
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
          onChange={(e) => handleFileSelect(e, 'image')}
          style={{ display: 'none' }}
        />
      </div>

      {/* Divider */}
      <div className="upload-divider">
        <span>OR</span>
      </div>

      {/* Video Upload Card */}
      <div 
        className={`vertical-upload-card ${selectedType === 'video' ? 'card-selected' : ''}`}
        onClick={() => handleButtonClick('video')}
      >
        <div className="card-content-wrapper">
          <div className="card-icon">
            <span>🎥</span>
          </div>
          <div className="card-text">
            <h4>Upload Video</h4>
            <p>Detect deepfake manipulations in video content with frame-by-frame analysis</p>
            <div className="file-info">
              <span className="file-types">MP4, MOV, AVI, WebM</span>
              <span className="file-size">Max 100MB</span>
            </div>
          </div>
        </div>
        <button className="vertical-upload-btn">
          Choose Video
        </button>
        <input
          ref={videoInputRef}
          type="file"
          accept=".mp4,.avi,.mov,.wmv,.webm,.mkv"
          onChange={(e) => handleFileSelect(e, 'video')}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default FileUpload;