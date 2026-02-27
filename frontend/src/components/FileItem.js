import React from "react";
import { isImage } from "../utils/helpers";

export function FileItem({ item, index, selected, multiSelected, onClick, onDoubleClick, onContextMenu, viewMode, gridSize }) {
  function getFileIcon(item) {
    const ext = item.extension;
    const iconMap = {
      folder: "📁",
      pdf: "📄",
      doc: "📄",
      docx: "📄",
      txt: "📄",
      xls: "📊",
      xlsx: "📊",
      ppt: "📙",
      pptx: "📙",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      svg: "🖼️",
      mp3: "🎵",
      mp4: "🎬",
      avi: "🎬",
      zip: "🗜️",
      rar: "🗜️",
      js: "📜",
      jsx: "📜",
      ts: "📜",
      tsx: "📜",
      json: "📋",
      html: "🌐",
      css: "🎨",
      py: "🐍",
      java: "☕",
      cpp: "⚙️",
      c: "⚙️"
    };
    return iconMap[ext] || "📄";
  }

  return (
    <div
      className={`item ${selected ? "selected" : ""} ${multiSelected ? "multi-selected" : ""}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      <div className="item-icon">
        {isImage(item) ? (
          <img 
            src={`http://localhost:5000/api/thumbnail?path=${encodeURIComponent(item.path)}`}
            alt={item.name}
            className="thumbnail"
            onError={e => e.target.style.display = 'none'}
          />
        ) : (
          getFileIcon(item)
        )}
      </div>
      <div className="item-details">
        <div className="item-name" title={item.name}>{item.name}</div>
        {viewMode === "list" && (
          <>
            <div className="item-size">{item.type === "folder" ? "-" : item.size}</div>
            <div className="item-date">{item.modified}</div>
          </>
        )}
      </div>
    </div>
  );
}
