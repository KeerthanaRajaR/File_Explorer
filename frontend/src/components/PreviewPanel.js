import React from "react";
import { isImage } from "../utils/helpers";

export function PreviewPanel({ selectedItem, fileContent, setSelectedItem, setFileContent, setImageViewer, setShowProperties, handleDownload, formatSize, formatDate }) {
  if (!selectedItem) return null;
  return (
    <div className="preview-panel">
      <div className="preview-header">
        <h3>{selectedItem.name}</h3>
        <button onClick={() => { setSelectedItem(null); setFileContent(null); }}>✕</button>
      </div>
      <div className="preview-info">
        <p><strong>Type:</strong> {selectedItem.extension?.toUpperCase() || "File"}</p>
        <p><strong>Size:</strong> {formatSize(selectedItem.size)}</p>
        <p><strong>Modified:</strong> {formatDate(selectedItem.modified)}</p>
      </div>
      {isImage(selectedItem) && (
        <div className="preview-image-container">
          <img 
            src={`http://localhost:5000/api/file?path=${encodeURIComponent(selectedItem.path.replace('backend/files/', ''))}`}
            alt={selectedItem.name}
            className="preview-image"
            onClick={() => {
              let imgPath = selectedItem.path;
              if (imgPath.startsWith('backend/files/')) {
                imgPath = imgPath.replace('backend/files/', '');
              }
              setImageViewer({
                item: selectedItem,
                url: `http://localhost:5000/api/file?path=${encodeURIComponent(imgPath)}`
              });
            }}
            style={{cursor: 'pointer'}}
          />
          <p className="preview-hint">Click to view full size</p>
        </div>
      )}
      {fileContent && (
        <div className="preview-content">
          <h4>Preview:</h4>
          <pre>{fileContent}</pre>
        </div>
      )}
      <div className="preview-actions">
        {isImage(selectedItem) && (
          <button className="preview-action-btn" onClick={() => {
            let imgPath = selectedItem.path;
            if (imgPath.startsWith('backend/files/')) {
              imgPath = imgPath.replace('backend/files/', '');
            }
            setImageViewer({
              item: selectedItem,
              url: `http://localhost:5000/api/file?path=${encodeURIComponent(imgPath)}`
            });
          }}>
            📂 Open
          </button>
        )}
        <button className="preview-action-btn" onClick={() => handleDownload(selectedItem)}>
          📥 Download
        </button>
        <button className="preview-action-btn" onClick={() => setShowProperties(selectedItem)}>
          ℹ️ Properties
        </button>
      </div>
    </div>
  );
}
