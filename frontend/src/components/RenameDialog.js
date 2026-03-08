import React from "react";

export function RenameDialog({ renameDialog, setRenameDialog, onRename }) {
  if (!renameDialog) return null;

  return (
    <div className="modal-overlay" onClick={() => setRenameDialog(null)}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h3>Rename</h3>
        <input
          type="text"
          placeholder="New name"
          value={renameDialog.newName}
          onChange={(event) =>
            setRenameDialog({ ...renameDialog, newName: event.target.value })
          }
          onKeyPress={(event) => event.key === "Enter" && onRename()}
          autoFocus
        />
        <div className="modal-buttons">
          <button onClick={onRename}>Rename</button>
          <button onClick={() => setRenameDialog(null)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
