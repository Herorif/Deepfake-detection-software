import React, { useState, useRef } from 'react';

const MediaPreview = ({ file, type }) => {
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const videoRef = useRef(null);

  // Generate thumbnail from video
  const generateThumbnail = (videoFile) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      video.src = URL.createObjectURL(videoFile);
      video.addEventListener('loadeddata', () => {
        video.currentTime = 1; // Capture at 1 second
      });
      
      video.addEventListener('seeked', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          resolve(URL.createObjectURL(blob));
          URL.revokeObjectURL(video.src);
        }, 'image/jpeg');
      });
    });
  };

  // Handle video file to generate thumbnail
  React.useEffect(() => {
    if (file && type === 'video') {
      generateThumbnail(file).then(thumbnail => {
        setVideoThumbnail(thumbnail);
      });
    } else {
      setVideoThumbnail(null);
    }
  }, [file, type]);

  if (!file) {
    return (
      <div className="media-preview">
        <div className="preview-placeholder">
          <div className="placeholder-icon">📁</div>
          <h3>No Media Selected</h3>
          <p>Upload an image or video to begin analysis</p>
          <div className="placeholder-features">
            <div className="feature-item">
              <span className="feature-icon">🔍</span>
              <span>AI-Powered Analysis</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Fast Verification</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <span>Secure Processing</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fileUrl = URL.createObjectURL(file);

  return (
    <div className="media-preview">
      <div className="preview-header">
        <h3>Media Preview</h3>
        <div className="file-badge">{type.toUpperCase()}</div>
      </div>
      
      <div className="preview-container">
        {type === 'image' ? (
          <div className="image-preview">
            <img 
              src={fileUrl} 
              alt="Uploaded for analysis" 
              className="preview-image"
              onLoad={() => URL.revokeObjectURL(fileUrl)}
            />
          </div>
        ) : (
          <div className="video-preview">
            <div className="video-thumbnail-container">
              <img 
                src={videoThumbnail || fileUrl} 
                alt="Video thumbnail" 
                className="video-thumbnail"
                onLoad={() => {
                  if (!videoThumbnail) URL.revokeObjectURL(fileUrl);
                }}
              />

            </div>
          </div>
        )}
      </div>
      
      <div className="file-details">
        <div className="detail-item">
          <label>File Name:</label>
          <span>{file.name}</span>
        </div>
        <div className="detail-item">
          <label>File Type:</label>
          <span>{type}</span>
        </div>
        <div className="detail-item">
          <label>File Size:</label>
          <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
        </div>
      </div>
    </div>
  );
};

export default MediaPreview;