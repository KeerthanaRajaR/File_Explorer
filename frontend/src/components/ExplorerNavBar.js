import React from "react";

export function ExplorerNavBar({ currentPath, breadcrumbs, refreshItems, navigateUp, navigateTo, searchQuery, setSearchQuery }) {
  return (
    <div className="nav-bar">
      <button className="nav-btn" onClick={navigateUp} disabled={!currentPath} title="Go up">
        ⬆️
      </button>

      <div className="breadcrumbs">
        <span className="breadcrumb-item clickable" onClick={() => refreshItems("")}>
          Home
        </span>
        {breadcrumbs.map((part, index) => (
          <span key={part + index}>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item clickable" onClick={() => navigateTo(index)}>
              {part}
            </span>
          </span>
        ))}
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Search files..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button className="clear-search" onClick={() => setSearchQuery("")}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
