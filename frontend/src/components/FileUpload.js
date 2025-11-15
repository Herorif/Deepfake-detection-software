import React, { useRef, useState } from 'react';

const SUPPORTED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
const SUPPORTED_VIDEO_TYPES = ['mp4', 'mov', 'avi', 'mkv', 'webm'];

const ICONS = {
  image: '📷',
  video: '🎬',
};

const FileUpload = ({ onFileUpload }) => {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [selectedType, setSelectedType] = useState(null);

  const handleFileSelect = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    const allowed = type === 'video' ? SUPPORTED_VIDEO_TYPES : SUPPORTED_IMAGE_TYPES;
    if (!allowed.includes(extension)) {
      alert(`Unsupported ${type} format. Supported: ${allowed.join(', ').toUpperCase()}`);
      event.target.value = '';
      return;
    }

    setSelectedType(type);
    onFileUpload(file, type);
  };

  const openFileDialog = (type) => {
    if (type === 'video') {
      videoInputRef.current?.click();
    } else {
      imageInputRef.current?.click();
    }
  };

  const renderCard = (type, title, description, fileInfo, inputProps) => (
    <div className={`vertical-upload-card ${selectedType === type ? 'card-selected' : ''}`}>
      <div className="card-content-wrapper" onClick={() => openFileDialog(type)}>
        <div className="card-icon" aria-hidden="true">
          <span>{ICONS[type]}</span>
        </div>
        <div className="card-text">
          <h4>{title}</h4>
          <p>{description}</p>
          <div className="file-info">
            <span className="file-types">{fileInfo.types}</span>
            <span className="file-size">{fileInfo.size}</span>
          </div>
        </div>
      </div>
      <button className="vertical-upload-btn" onClick={() => openFileDialog(type)}>
        {inputProps.buttonLabel}
      </button>
      <input
        ref={type === 'video' ? videoInputRef : imageInputRef}
        type="file"
        accept={inputProps.accept}
        onChange={(event) => handleFileSelect(event, type)}
        style={{ display: 'none' }}
      />
    </div>
  );

  return (
    <div className="vertical-upload-container">
      {renderCard(
        'image',
        'Upload Image',
        'Detect deepfake manipulation with the on-device EfficientNetV2 model.',
        { types: 'JPG, JPEG, PNG, GIF, BMP, WebP', size: 'Max 200MB' },
        { accept: '.jpg,.jpeg,.png,.gif,.bmp,.webp', buttonLabel: 'Choose Image' }
      )}

      <div className="upload-divider">
        <span>OR</span>
      </div>

      {renderCard(
        'video',
        'Upload Video',
        'Experimental support: frames are sampled and fed through EfficientNetV2.',
        { types: 'MP4, MOV, AVI, MKV, WebM', size: 'Max 200MB' },
        { accept: '.mp4,.mov,.avi,.mkv,.webm', buttonLabel: 'Choose Video' }
      )}
    </div>
  );
};

export default FileUpload;
