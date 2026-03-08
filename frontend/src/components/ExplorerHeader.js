import React from "react";
import { formatSize } from "../utils/fileUtils";

export function ExplorerHeader({
  folderInput,
  setFolderInput,
  refreshItems,
  storageInfo,
  onUploadClick,
  onNewFolderClick,
  darkMode,
  setDarkMode,
  viewMode,
  setViewMode,
}) {
  return (
    <div className="header">
      <div className="header-left">
        <h1>📂 File Explorer</h1>
      </div>

      <div className="header-right">
        <input
          type="text"
          value={folderInput}
          onChange={(event) => setFolderInput(event.target.value)}
          placeholder="Enter folder path"
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            marginRight: "8px",
            minWidth: "220px",
          }}
        />

        <button className="action-btn" onClick={() => refreshItems(folderInput)} title="Go to folder">
          Go
        </button>

        {storageInfo && (
          <div
            className="storage-indicator"
            title={`${formatSize(storageInfo.used)} / ${formatSize(storageInfo.total)}`}
          >
            <div className="storage-bar">
              <div
                className="storage-fill"
                style={{ width: `${(storageInfo.used / storageInfo.total) * 100}%` }}
              ></div>
            </div>
            <span className="storage-text">{formatSize(storageInfo.used)}</span>
          </div>
        )}

        <button className="action-btn" onClick={onUploadClick} title="Upload files">
          📤 Upload
        </button>

        <button className="action-btn" onClick={onNewFolderClick} title="Create new folder">
          📁+ Folder
        </button>

        <button className="view-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode">
          {darkMode ? "☀️" : "🌙"}
        </button>

        <button
          className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
          onClick={() => setViewMode("grid")}
          title="Grid view"
        >
          ⊞
        </button>

        <button
          className={`view-btn ${viewMode === "list" ? "active" : ""}`}
          onClick={() => setViewMode("list")}
          title="List view"
        >
          ☰
        </button>
      </div>
    </div>
  );
}
