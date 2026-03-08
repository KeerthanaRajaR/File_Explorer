import React from "react";

export function ExplorerToolbar({
  selectedItems,
  setSelectedItems,
  filteredAndSortedItems,
  setClipboardFromItems,
  handleBulkDelete,
  clipboard,
  handlePaste,
  setClipboard,
  filterType,
  setFilterType,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  gridSize,
  setGridSize,
}) {
  return (
    <div className="toolbar">
      {selectedItems.size > 0 && (
        <div className="selection-info">
          <span>{selectedItems.size} item(s) selected</span>
          <button className="toolbar-btn" onClick={() => setSelectedItems(new Set())}>
            Clear
          </button>
          <button className="toolbar-btn" onClick={handleBulkDelete}>
            🗑️ Delete
          </button>
          <button
            className="toolbar-btn"
            onClick={() => {
              const selectedList = Array.from(selectedItems)
                .map((index) => filteredAndSortedItems[index])
                .filter(Boolean);
              setClipboardFromItems(selectedList, "copy");
            }}
          >
            📋 Copy
          </button>
          <button
            className="toolbar-btn"
            onClick={() => {
              const selectedList = Array.from(selectedItems)
                .map((index) => filteredAndSortedItems[index])
                .filter(Boolean);
              setClipboardFromItems(selectedList, "cut");
            }}
          >
            ✂️ Cut
          </button>
        </div>
      )}

      {clipboard && (
        <div className="clipboard-info">
          <span>
            📋 {clipboard.items.length} item(s) {clipboard.operation === "cut" ? "cut" : "copied"}
          </span>
          <button className="toolbar-btn" onClick={handlePaste}>
            📌 Paste Here
          </button>
          <button className="toolbar-btn" onClick={() => setClipboard(null)}>
            ✕
          </button>
        </div>
      )}

      <div className="filter-sort">
        <select value={filterType} onChange={(event) => setFilterType(event.target.value)} className="filter-select">
          <option value="all">All Files</option>
          <option value="folder">Folders</option>
          <option value="file">Files</option>
          <option value="images">Images</option>
          <option value="documents">Documents</option>
        </select>

        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="sort-select">
          <option value="name">Sort by Name</option>
          <option value="size">Sort by Size</option>
          <option value="date">Sort by Date</option>
        </select>

        <button
          className="sort-order-btn"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          title={sortOrder === "asc" ? "Ascending" : "Descending"}
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </button>

        <select value={gridSize} onChange={(event) => setGridSize(event.target.value)} className="grid-size-select">
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
    </div>
  );
}
