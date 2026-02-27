import React from "react";
import { isImage } from "../utils/helpers";

export function PropertiesDialog({ showProperties, setShowProperties, formatSize, formatDate, getFileIcon, setImageViewer }) {
  if (!showProperties) return null;
  return (
    <div className="modal-overlay" onClick={() => setShowProperties(null)}>
      <div className="modal properties-modal" onClick={e => e.stopPropagation()}>
        <h3>📋 Properties</h3>
        <div className="properties-content">
          <div className="property-row">
            <div className="property-icon">{getFileIcon(showProperties)}</div>
            <div className="property-name">{showProperties.name}</div>
          </div>
          <div className="property-section">
            <h4>General</h4>
            <table className="properties-table">
              <tbody>
                <tr>
                  <td className="property-label">Type:</td>
                  <td className="property-value">
                    {showProperties.type === 'folder' ? 'Folder' : `${showProperties.extension?.toUpperCase() || 'File'} File`}
                  </td>
                </tr>
                <tr>
                  <td className="property-label">Location:</td>
                  <td className="property-value">{showProperties.path}</td>
                </tr>
                <tr>
                  <td className="property-label">Size:</td>
                  <td className="property-value">
                    {formatSize(showProperties.size)} ({showProperties.size.toLocaleString()} bytes)
                  </td>
                </tr>
                <tr>
                  <td className="property-label">Modified:</td>
                  <td className="property-value">{formatDate(showProperties.modified)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {isImage(showProperties) && (
            <div className="property-section">
              <h4>Preview</h4>
              <div className="properties-preview">
                <img 
                  src={`http://localhost:5000/api/file?path=${encodeURIComponent(showProperties.path.replace('backend/files/', ''))}`}
                  alt={showProperties.name}
                  onClick={() => {
                    let imgPath = showProperties.path;
                    if (imgPath.startsWith('backend/files/')) {
                      imgPath = imgPath.replace('backend/files/', '');
                    }
                    setImageViewer({
                      item: showProperties,
                      url: `http://localhost:5000/api/file?path=${encodeURIComponent(imgPath)}`
                    });
                    setShowProperties(null);
                  }}
                  style={{cursor: 'pointer', maxWidth: '100%', borderRadius: '8px'}}
                />
              </div>
            </div>
          )}
        </div>
        <div className="modal-buttons">
          <button onClick={() => setShowProperties(null)}>Close</button>
        </div>
      </div>
    </div>
  );
}
