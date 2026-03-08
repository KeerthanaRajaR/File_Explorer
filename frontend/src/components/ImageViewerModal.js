import React from "react";

export function ImageViewerModal({ imageViewer, onClose, onDownload, onShowProperties, formatSize }) {
  if (!imageViewer) return null;

  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <div className="image-viewer-container">
        <button className="image-viewer-close" onClick={onClose}>
          ✕
        </button>

        <img
          src={imageViewer.url}
          alt={imageViewer.item.name}
          className="image-viewer-img"
          onClick={(event) => event.stopPropagation()}
        />

        <div className="image-viewer-info">
          <h3>{imageViewer.item.name}</h3>
          <p>
            {formatSize(imageViewer.item.size)} • {imageViewer.item.extension?.toUpperCase()}
          </p>
        </div>

        <div className="image-viewer-actions">
          <button onClick={() => onDownload(imageViewer.item)}>📥 Download</button>
          <button onClick={() => onShowProperties(imageViewer.item)}>ℹ️ Properties</button>
        </div>
      </div>
    </div>
  );
}
