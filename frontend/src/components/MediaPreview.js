import React, { useEffect, useMemo, useState } from 'react';

const PLACEHOLDER_FEATURES = [
  { icon: '🛡️', label: 'AI-Powered Analysis' },
  { icon: '⚡', label: 'Rapid Verification' },
  { icon: '🔒', label: 'Local-Only Processing' },
];

const MediaPreview = ({ file, type }) => {
  const [videoThumbnail, setVideoThumbnail] = useState(null);

  const fileUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  useEffect(() => {
    if (!file || type !== 'video' || !fileUrl) {
      setVideoThumbnail(null);
      return undefined;
    }

    let thumbnailUrl = null;
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = fileUrl;
    video.onloadeddata = () => {
      video.currentTime = Math.min(1, video.duration || 0.1);
    };
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (thumbnailUrl) {
          URL.revokeObjectURL(thumbnailUrl);
        }
        if (blob) {
          thumbnailUrl = URL.createObjectURL(blob);
          setVideoThumbnail(thumbnailUrl);
        }
      }, 'image/jpeg');
    };

    return () => {
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [file, type, fileUrl]);

  if (!file) {
    return (
      <div className="media-preview">
        <div className="preview-placeholder">
          <div className="placeholder-icon" aria-hidden="true">
            📁
          </div>
          <h3>No Media Selected</h3>
          <p>Upload an image or video to begin analysis</p>
          <div className="placeholder-features">
            {PLACEHOLDER_FEATURES.map((feature) => (
              <div className="feature-item" key={feature.label}>
                <span className="feature-icon" aria-hidden="true">
                  {feature.icon}
                </span>
                <span>{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="media-preview">
      <div className="preview-header">
        <h3>Media Preview</h3>
        {type && <div className="file-badge">{type.toUpperCase()}</div>}
      </div>

      <div className="preview-container">
        {type === 'video' ? (
          <div className="video-preview">
            {videoThumbnail ? (
              <img src={videoThumbnail} alt="Video thumbnail" className="video-thumbnail" />
            ) : (
              <video src={fileUrl} controls className="video-player" />
            )}
          </div>
        ) : (
          <div className="image-preview">
            <img src={fileUrl} alt="Uploaded for analysis" className="preview-image" />
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
          <span>{(type || file.type || 'unknown').toUpperCase()}</span>
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
