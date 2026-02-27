import React from "react";

export function NewFolderDialog({ show, newFolderName, setNewFolderName, handleCreateFolder, closeDialog, existingFolders }) {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={closeDialog}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Create New Folder</h3>
        <input 
          type="text"
          placeholder="Folder name"
          value={newFolderName}
          onChange={e => setNewFolderName(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleCreateFolder()}
          autoFocus
        />
        {existingFolders && existingFolders.length > 0 && (
          <div style={{marginTop: '12px', fontSize: '13px', color: '#888'}}>
            <strong>Existing folders:</strong> {existingFolders.join(', ')}
          </div>
        )}
        <div className="modal-buttons">
          <button onClick={handleCreateFolder}>Create</button>
          <button onClick={closeDialog}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
