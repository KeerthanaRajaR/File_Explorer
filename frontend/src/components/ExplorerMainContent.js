import React from "react";
import { FileItem } from "./FileItem";
import { PreviewPanel } from "./PreviewPanel";

export function ExplorerMainContent({
  dragActive,
  handleDrag,
  handleDrop,
  loading,
  filteredAndSortedItems,
  uploadProgress,
  viewMode,
  gridSize,
  selectedItem,
  selectedItems,
  handleItemClick,
  handleOpenFile,
  setContextMenu,
  fileContent,
  setSelectedItem,
  setFileContent,
  setImageViewer,
  setShowProperties,
  handleDownload,
  formatSize,
  formatDate,
}) {
  return (
    <div
      className="main-content"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className={`file-area ${dragActive ? "drag-active" : ""}`}>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="empty">
            <p>No files or folders</p>
          </div>
        ) : (
          <>
            {uploadProgress && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "50%" }}></div>
                </div>
                <span>
                  Uploading {uploadProgress.current}/{uploadProgress.total} files...
                </span>
              </div>
            )}

            <div className={`items-container ${viewMode} grid-${gridSize}`}>
              {filteredAndSortedItems.map((item, index) => (
                <FileItem
                  key={`${item.path}-${index}`}
                  item={item}
                  index={index}
                  selected={selectedItem?.path === item.path}
                  multiSelected={selectedItems.has(index)}
                  onClick={(event) => handleItemClick(item, index, event)}
                  onDoubleClick={() => handleOpenFile(item)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    setContextMenu({ x: event.clientX, y: event.clientY, item });
                  }}
                  viewMode={viewMode}
                  gridSize={gridSize}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <PreviewPanel
        selectedItem={selectedItem}
        fileContent={fileContent}
        setSelectedItem={setSelectedItem}
        setFileContent={setFileContent}
        setImageViewer={setImageViewer}
        setShowProperties={setShowProperties}
        handleDownload={handleDownload}
        formatSize={formatSize}
        formatDate={formatDate}
      />
    </div>
  );
}
