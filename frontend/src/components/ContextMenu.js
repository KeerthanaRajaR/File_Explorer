import React from "react";
import { isImage } from "../utils/helpers";

export function ContextMenu({
  contextMenu,
  onOpen,
  onCopyPath,
  onOpenImageViewer,
  onDownload,
  onRemoveBackground,
  onCopy,
  onCut,
  onRename,
  onDelete,
  onProperties,
  onClose,
}) {
  if (!contextMenu) return null;

  return (
    <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
      <div
        className="context-menu-item"
        onClick={() => {
          onOpen(contextMenu.item);
          onClose();
        }}
      >
        📂 Open
      </div>

      <div
        className="context-menu-item"
        onClick={() => {
          onCopyPath(contextMenu.item.path);
          onClose();
        }}
      >
        📋 Copy Path
      </div>

      {contextMenu.item.type === "file" && (
        <>
          <div className="context-menu-submenu">
            <div className="context-menu-item submenu-title">🖼️ Open With... ▸</div>
            <div className="context-menu-submenu-list">
              {isImage(contextMenu.item) && (
                <div
                  className="context-menu-item"
                  onClick={() => {
                    onOpenImageViewer(contextMenu.item);
                    onClose();
                  }}
                >
                  Image Viewer
                </div>
              )}
            </div>
          </div>

          <div
            className="context-menu-item"
            onClick={() => {
              onDownload(contextMenu.item);
              onClose();
            }}
          >
            📥 Download
          </div>

          {isImage(contextMenu.item) && (
            <div className="context-menu-submenu">
              <div className="context-menu-item submenu-title">🤖 AI Actions ▸</div>
              <div className="context-menu-submenu-list">
                <div
                  className="context-menu-item"
                  onClick={() => {
                    onRemoveBackground(contextMenu.item);
                    onClose();
                  }}
                >
                  Remove Background
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="context-menu-separator"></div>

      <div
        className="context-menu-item"
        onClick={() => {
          onCopy([contextMenu.item]);
          onClose();
        }}
      >
        📋 Copy
      </div>

      <div
        className="context-menu-item"
        onClick={() => {
          onCut([contextMenu.item]);
          onClose();
        }}
      >
        ✂️ Cut
      </div>

      <div className="context-menu-separator"></div>

      <div
        className="context-menu-item"
        onClick={() => {
          onRename(contextMenu.item);
          onClose();
        }}
      >
        ✏️ Rename
      </div>

      <div
        className="context-menu-item delete"
        onClick={() => {
          onDelete(contextMenu.item);
          onClose();
        }}
      >
        🗑️ Delete
      </div>

      <div className="context-menu-separator"></div>

      <div
        className="context-menu-item"
        onClick={() => {
          onProperties(contextMenu.item);
          onClose();
        }}
      >
        ℹ️ Properties
      </div>
    </div>
  );
}
