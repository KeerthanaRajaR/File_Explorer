import { useEffect, useState, useRef } from "react";
import "./App.css";

function App() {


    const handleAIRemoveBG = async (item) => {
      try {
        const response = await fetch('http://localhost:5000/api/ai/remove-bg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: item.path })
        });
        const data = await response.json();
        if (data.success) {
          alert('Background removed image created: ' + data.outPath);
          fetchItems(currentPath);
        } else {
          alert(data.error || 'Remove background failed');
        }
      } catch (err) {
        alert('Remove background failed!');
        console.error(err);
      }
    };
  const [items, setItems] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list


    // Check if image
    const isImage = (item) => {
      const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
      return imageExts.includes(item.extension);
    };


  const [selectedItem, setSelectedItem] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameDialog, setRenameDialog] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name, size, date
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [filterType, setFilterType] = useState("all"); // all, folder, file, images, documents
  const [darkMode, setDarkMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [clipboard, setClipboard] = useState(null); // {items: [], operation: 'copy' or 'cut'}
  const [storageInfo, setStorageInfo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [gridSize, setGridSize] = useState("medium"); // small, medium, large
  const [imageViewer, setImageViewer] = useState(null); // {item, url}
  const [showProperties, setShowProperties] = useState(null); // item to show properties
  const fileInputRef = useRef(null);

  // Fetch files and folders
  const fetchItems = async (path = "") => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/browse?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      setItems(data.items || []);
      setCurrentPath(data.currentPath || "");
    } catch (error) {
      console.error("Error fetching items:", error);
    }
    setLoading(false);
  };

  // Load initial files
  useEffect(() => {
    fetchItems();
    fetchStorageInfo();
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      // Ctrl+A - Select all
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        const allIds = new Set(items.map((_, idx) => idx));
        setSelectedItems(allIds);
      }
      // Ctrl+C - Copy
      if (e.ctrlKey && e.key === 'c' && selectedItems.size > 0) {
        e.preventDefault();
        const selectedItemsList = Array.from(selectedItems).map(idx => items[idx]);
        setClipboard({ items: selectedItemsList, operation: 'copy' });
      }
      // Ctrl+X - Cut
      if (e.ctrlKey && e.key === 'x' && selectedItems.size > 0) {
        e.preventDefault();
        const selectedItemsList = Array.from(selectedItems).map(idx => items[idx]);
        setClipboard({ items: selectedItemsList, operation: 'cut' });
      }
      // Ctrl+V - Paste
      if (e.ctrlKey && e.key === 'v' && clipboard) {
        e.preventDefault();
        handlePaste();
      }
      // Delete key
      if (e.key === 'Delete' && selectedItems.size > 0) {
        e.preventDefault();
        handleBulkDelete();
      }
      // Escape - Clear selection
      if (e.key === 'Escape') {
        setSelectedItems(new Set());
        setSelectedItem(null);
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [selectedItems, clipboard, items]);

  // Fetch storage info
  const fetchStorageInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/storage');
      const data = await response.json();
      setStorageInfo(data);
    } catch (error) {
      console.error("Error fetching storage:", error);
    }
  };

  // Handle folder navigation
  const handleItemClick = async (item) => {
    if (item.type === "folder") {
      setFileContent(null);
      setSelectedItem(null);
      fetchItems(item.path);
    } else {
      setSelectedItem(item);
      // Fetch file content for text files
      if (!isImage(item)) {
        try {
          const response = await fetch(`http://localhost:5000/api/file?path=${encodeURIComponent(item.path)}`);
          const data = await response.json();
          setFileContent(data.content);
        } catch (error) {
          console.error("Error fetching file:", error);
          setFileContent(null);
        }
      } else {
        setFileContent(null);
      }
    }
  };

  // Open file (double-click or context menu)
  const handleOpenFile = (item) => {
    if (item.type === "folder") {
      fetchItems(item.path);
    } else if (isImage(item)) {
      setImageViewer({
        item: item,
        url: `http://localhost:5000/api/thumbnail?path=${encodeURIComponent(item.path)}`
      });
    } else {
      // Download file to open
      handleDownload(item);
    }
  };

  // Navigate up
  const navigateUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    const newPath = parts.join("/");
    setFileContent(null);
    setSelectedItem(null);
    fetchItems(newPath);
  };

  // Navigate to specific breadcrumb
  const navigateTo = (index) => {
    const parts = currentPath.split("/").filter(Boolean);
    const newPath = parts.slice(0, index + 1).join("/");
    setFileContent(null);
    setSelectedItem(null);
    fetchItems(newPath);
  };

  // Upload files
  const handleFileUpload = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    setUploadProgress({ current: 0, total: files.length });

    try {
      const response = await fetch(`http://localhost:5000/api/upload?path=${encodeURIComponent(currentPath)}`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        fetchItems(currentPath);
        fetchStorageInfo();
        setUploadProgress(null);
        alert(`${data.files.length} file(s) uploaded successfully!`);
      }
    } catch (error) {
      setUploadProgress(null);
      alert("Upload failed!");
      console.error("Error uploading files:", error);
    }
  };

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert("Please enter a folder name");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/create-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: currentPath,
          folderName: newFolderName
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchItems(currentPath);
        setShowNewFolderDialog(false);
        setNewFolderName("");
      } else {
        alert(data.error || "Failed to create folder");
      }
    } catch (error) {
      alert("Failed to create folder!");
      console.error("Error creating folder:", error);
    }
  };

  // Delete item
  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/delete?path=${encodeURIComponent(item.path)}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        fetchItems(currentPath);
        fetchStorageInfo();
        setSelectedItem(null);
        setFileContent(null);
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (error) {
      alert("Failed to delete!");
      console.error("Error deleting:", error);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    if (!window.confirm(`Delete ${selectedItems.size} item(s)?`)) {
      return;
    }

    const selectedItemsList = Array.from(selectedItems).map(idx => items[idx]);
    
    for (const item of selectedItemsList) {
      try {
        await fetch(`http://localhost:5000/api/delete?path=${encodeURIComponent(item.path)}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
    
    fetchItems(currentPath);
    fetchStorageInfo();
    setSelectedItems(new Set());
  };

  // Copy/Cut/Paste operations
  const handlePaste = async () => {
    if (!clipboard || clipboard.items.length === 0) return;

    try {
      const response = await fetch('http://localhost:5000/api/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: clipboard.items.map(item => item.path),
          targetPath: currentPath,
          operation: clipboard.operation
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchItems(currentPath);
        fetchStorageInfo();
        if (clipboard.operation === 'cut') {
          setClipboard(null);
        }
      } else {
        alert(data.error || "Paste failed");
      }
    } catch (error) {
      alert("Paste failed!");
      console.error("Error pasting:", error);
    }
  };

  // Rename item
  const handleRename = async () => {
    if (!renameDialog.newName.trim()) {
      alert("Please enter a new name");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPath: renameDialog.item.path,
          newName: renameDialog.newName
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchItems(currentPath);
        setRenameDialog(null);
        setSelectedItem(null);
      } else {
        alert(data.error || "Failed to rename");
      }
    } catch (error) {
      alert("Failed to rename!");
      console.error("Error renaming:", error);
    }
  };

  // Download file
  const handleDownload = (item) => {
    window.open(`http://localhost:5000/api/download?path=${encodeURIComponent(item.path)}`, '_blank');
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Context menu
  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item: item
    });
  };

  // Close context menu
  useEffect(() => {
    const closeContextMenu = () => setContextMenu(null);
    document.addEventListener('click', closeContextMenu);
    return () => document.removeEventListener('click', closeContextMenu);
  }, []);

  // Format file size
  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString();
  };

  // Get file icon based on extension
  const getFileIcon = (item) => {
    if (item.type === "folder") return "📁";
    
    const ext = item.extension || "";
    const iconMap = {
      txt: "📄",
      pdf: "📕",
      doc: "📘",
      docx: "📘",
      xls: "📗",
      xlsx: "📗",
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
  };

  // Get breadcrumb parts
  const breadcrumbs = currentPath ? currentPath.split("/").filter(Boolean) : [];

  // Filter and sort items
  const filteredAndSortedItems = items
    .filter(item => {
      // Search filter
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filterType === "folder" && item.type !== "folder") return false;
      if (filterType === "file" && item.type !== "file") return false;
      if (filterType === "images") {
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
        return imageExts.includes(item.extension);
      }
      if (filterType === "documents") {
        const docExts = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'];
        return docExts.includes(item.extension);
      }
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "size") {
        comparison = (a.size || 0) - (b.size || 0);
      } else if (sortBy === "date") {
        comparison = new Date(a.modified || 0) - new Date(b.modified || 0);
      }
      
      // Folders first, then apply sort
      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;
      
      return sortOrder === "asc" ? comparison : -comparison;
    });



  // Toggle item selection
  const toggleItemSelection = (index, e) => {
    e.stopPropagation();
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h1>📂 File Explorer</h1>
        </div>
        <div className="header-right">
          {/* Storage Info */}
          {storageInfo && (
            <div className="storage-indicator" title={`${formatSize(storageInfo.used)} / ${formatSize(storageInfo.total)}`}>
              <div className="storage-bar">
                <div 
                  className="storage-fill" 
                  style={{width: `${(storageInfo.used / storageInfo.total) * 100}%`}}
                ></div>
              </div>
              <span className="storage-text">{formatSize(storageInfo.used)}</span>
            </div>
          )}
          
          <button 
            className="action-btn"
            onClick={() => fileInputRef.current.click()}
            title="Upload files"
          >
            📤 Upload
          </button>
          <button 
            className="action-btn"
            onClick={() => setShowNewFolderDialog(true)}
            title="Create new folder"
          >
            📁+ Folder
          </button>
          
          {/* Dark Mode Toggle */}
          <button 
            className="view-btn"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
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

      {/* Hidden file input */}
      <input 
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files.length > 0) {
            handleFileUpload(e.target.files);
          }
        }}
      />

      {/* Navigation Bar */}
      <div className="nav-bar">
        <button 
          className="nav-btn" 
          onClick={navigateUp}
          disabled={!currentPath}
          title="Go up"
        >
          ⬆️
        </button>
        
        <div className="breadcrumbs">
          <span 
            className="breadcrumb-item clickable"
            onClick={() => fetchItems("")}
          >
            Home
          </span>
          {breadcrumbs.map((part, index) => (
            <span key={index}>
              <span className="breadcrumb-separator">/</span>
              <span 
                className="breadcrumb-item clickable"
                onClick={() => navigateTo(index)}
              >
                {part}
              </span>
            </span>
          ))}
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <input 
            type="text"
            placeholder="🔍 Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery("")}>✕</button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        {/* Selection Info */}
        {selectedItems.size > 0 && (
          <div className="selection-info">
            <span>{selectedItems.size} item(s) selected</span>
            <button className="toolbar-btn" onClick={() => setSelectedItems(new Set())}>
              Clear
            </button>
            <button className="toolbar-btn" onClick={handleBulkDelete}>
              🗑️ Delete
            </button>
            <button className="toolbar-btn" onClick={() => {
              const selectedItemsList = Array.from(selectedItems).map(idx => filteredAndSortedItems[idx]);
              setClipboard({ items: selectedItemsList, operation: 'copy' });
            }}>
              📋 Copy
            </button>
            <button className="toolbar-btn" onClick={() => {
              const selectedItemsList = Array.from(selectedItems).map(idx => filteredAndSortedItems[idx]);
              setClipboard({ items: selectedItemsList, operation: 'cut' });
            }}>
              ✂️ Cut
            </button>
          </div>
        )}
        
        {clipboard && (
          <div className="clipboard-info">
            <span>📋 {clipboard.items.length} item(s) {clipboard.operation === 'cut' ? 'cut' : 'copied'}</span>
            <button className="toolbar-btn" onClick={handlePaste}>
              📌 Paste Here
            </button>
            <button className="toolbar-btn" onClick={() => setClipboard(null)}>
              ✕
            </button>
          </div>
        )}

        {/* Filters and Sort */}
        <div className="filter-sort">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
            <option value="all">All Files</option>
            <option value="folder">Folders</option>
            <option value="file">Files</option>
            <option value="images">Images</option>
            <option value="documents">Documents</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
            <option value="date">Sort by Date</option>
          </select>

          <button 
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          <select value={gridSize} onChange={(e) => setGridSize(e.target.value)} className="grid-size-select">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="main-content"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className={`file-area ${dragActive ? "drag-active" : ""}`}>
          {dragActive && (
            <div className="drag-overlay">
              <div className="drag-message">📤 Drop files here to upload</div>
            </div>
          )}
          {loading ? (
            <div className="loading">Loading...</div>
          ) : filteredAndSortedItems.length === 0 ? (
            <div className="empty">
              <p>{searchQuery ? `No results for "${searchQuery}"` : "No files or folders"}</p>
              {!searchQuery && (
                <button className="upload-prompt-btn" onClick={() => fileInputRef.current.click()}>
                  📤 Upload Files
                </button>
              )}
            </div>
          ) : (
            <>
              {uploadProgress && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '50%'}}></div>
                  </div>
                  <span>Uploading {uploadProgress.current}/{uploadProgress.total} files...</span>
                </div>
              )}
              <div className={`items-container ${viewMode} grid-${gridSize}`}>
                {filteredAndSortedItems.map((item, index) => (
                  <div
                    key={index}
                    className={`item ${selectedItem?.name === item.name ? "selected" : ""} ${selectedItems.has(index) ? "multi-selected" : ""}`}
                    onClick={(e) => {
                      if (e.shiftKey || e.ctrlKey) {
                        toggleItemSelection(index, e);
                      } else {
                        handleItemClick(item);
                      }
                    }}
                    onDoubleClick={() => handleOpenFile(item)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                  >
                    {/* Checkbox for multi-select */}
                    <div className="item-checkbox" onClick={(e) => toggleItemSelection(index, e)}>
                      <input 
                        type="checkbox" 
                        checked={selectedItems.has(index)}
                        onChange={() => {}}
                      />
                    </div>
                    <div className="item-icon">
                      {isImage(item) ? (
                        <img 
                          src={`http://localhost:5000/api/thumbnail?path=${encodeURIComponent(item.path)}`}
                          alt={item.name}
                          className="thumbnail"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ) : (
                        getFileIcon(item)
                      )}
                    </div>
                    <div className="item-details">
                      <div className="item-name" title={item.name}>
                        {item.name}
                      </div>
                      {viewMode === "list" && (
                      <>
                        <div className="item-size">{item.type === "folder" ? "-" : formatSize(item.size)}</div>
                        <div className="item-date">{formatDate(item.modified)}</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </div>

        {/* File Preview Panel */}
        {selectedItem && (
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
            
            {/* Image Preview */}
            {isImage(selectedItem) && (
              <div className="preview-image-container">
                <img 
                  src={`http://localhost:5000/api/thumbnail?path=${encodeURIComponent(selectedItem.path)}`}
                  alt={selectedItem.name}
                  className="preview-image"
                  onClick={() => handleOpenFile(selectedItem)}
                  style={{cursor: 'pointer'}}
                />
                <p className="preview-hint">Click to view full size</p>
              </div>
            )}
            
            {/* Text File Preview */}
            {fileContent && (
              <div className="preview-content">
                <h4>Preview:</h4>
                <pre>{fileContent}</pre>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="preview-actions">
              <button className="preview-action-btn" onClick={() => handleOpenFile(selectedItem)}>
                📂 Open
              </button>
              <button className="preview-action-btn" onClick={() => handleDownload(selectedItem)}>
                📥 Download
              </button>
              <button className="preview-action-btn" onClick={() => setShowProperties(selectedItem)}>
                ℹ️ Properties
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="context-menu-item" onClick={() => {
            handleOpenFile(contextMenu.item);
            setContextMenu(null);
          }}>
            📂 Open
          </div>
          

          {contextMenu.item.type === "file" && (
            <>
              {/* Open With... submenu for files */}
              <div className="context-menu-submenu">
                <div className="context-menu-item submenu-title">🖼️ Open With... ▸</div>
                <div className="context-menu-submenu-list">
                  {isImage(contextMenu.item) && (
                    <div className="context-menu-item" onClick={() => {
                      setImageViewer({
                        item: contextMenu.item,
                        url: `http://localhost:5000/api/thumbnail?path=${encodeURIComponent(contextMenu.item.path)}`
                      });
                      setContextMenu(null);
                    }}>
                      Image Viewer
                    </div>
                  )}
                  {/* Add more viewers for other file types here if needed */}
                </div>
              </div>
              <div className="context-menu-item" onClick={() => {
                handleDownload(contextMenu.item);
                setContextMenu(null);
              }}>
                📥 Download
              </div>
              {isImage(contextMenu.item) && (
                <div className="context-menu-submenu">
                  <div className="context-menu-item submenu-title">🤖 AI Actions ▸</div>
                  <div className="context-menu-submenu-list">
                    {/* Only Remove Background is available */}
                    <div className="context-menu-item" onClick={() => { handleAIRemoveBG(contextMenu.item); setContextMenu(null); }}>Remove Background</div>
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="context-menu-separator"></div>
          
          <div className="context-menu-item" onClick={() => {
            const selectedItemsList = [contextMenu.item];
            setClipboard({ items: selectedItemsList, operation: 'copy' });
            setContextMenu(null);
          }}>
            📋 Copy
          </div>
          <div className="context-menu-item" onClick={() => {
            const selectedItemsList = [contextMenu.item];
            setClipboard({ items: selectedItemsList, operation: 'cut' });
            setContextMenu(null);
          }}>
            ✂️ Cut
          </div>
          
          <div className="context-menu-separator"></div>
          
          <div className="context-menu-item" onClick={() => {
            setRenameDialog({ item: contextMenu.item, newName: contextMenu.item.name });
            setContextMenu(null);
          }}>
            ✏️ Rename
          </div>
          <div className="context-menu-item delete" onClick={() => {
            handleDelete(contextMenu.item);
            setContextMenu(null);
          }}>
            🗑️ Delete
          </div>
          
          <div className="context-menu-separator"></div>
          
          <div className="context-menu-item" onClick={() => {
            setShowProperties(contextMenu.item);
            setContextMenu(null);
          }}>
            ℹ️ Properties
          </div>
        </div>
      )}

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="modal-overlay" onClick={() => setShowNewFolderDialog(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Folder</h3>
            <input 
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <div className="modal-buttons">
              <button onClick={handleCreateFolder}>Create</button>
              <button onClick={() => {
                setShowNewFolderDialog(false);
                setNewFolderName("");
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {renameDialog && (
        <div className="modal-overlay" onClick={() => setRenameDialog(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Rename</h3>
            <input 
              type="text"
              placeholder="New name"
              value={renameDialog.newName}
              onChange={(e) => setRenameDialog({...renameDialog, newName: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && handleRename()}
              autoFocus
            />
            <div className="modal-buttons">
              <button onClick={handleRename}>Rename</button>
              <button onClick={() => setRenameDialog(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {imageViewer && (
        <div className="image-viewer-overlay" onClick={() => setImageViewer(null)}>
          <div className="image-viewer-container">
            <button className="image-viewer-close" onClick={() => setImageViewer(null)}>✕</button>
            <img 
              src={imageViewer.url}
              alt={imageViewer.item.name}
              className="image-viewer-img"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="image-viewer-info">
              <h3>{imageViewer.item.name}</h3>
              <p>{formatSize(imageViewer.item.size)} • {imageViewer.item.extension?.toUpperCase()}</p>
            </div>
            <div className="image-viewer-actions">
              <button onClick={() => handleDownload(imageViewer.item)}>📥 Download</button>
              <button onClick={() => {
                setShowProperties(imageViewer.item);
                setImageViewer(null);
              }}>ℹ️ Properties</button>
            </div>
          </div>
        </div>
      )}

      {/* Properties Dialog */}
      {showProperties && (
        <div className="modal-overlay" onClick={() => setShowProperties(null)}>
          <div className="modal properties-modal" onClick={(e) => e.stopPropagation()}>
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
                      src={`http://localhost:5000/api/thumbnail?path=${encodeURIComponent(showProperties.path)}`}
                      alt={showProperties.name}
                      onClick={() => {
                        setImageViewer({
                          item: showProperties,
                          url: `http://localhost:5000/api/thumbnail?path=${encodeURIComponent(showProperties.path)}`
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
      )}
    </div>
  );
}

export default App;
