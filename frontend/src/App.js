import React, { useMemo, useRef, useState } from "react";
import "./App.css";
import { ContextMenu } from "./components/ContextMenu";
import { ExplorerHeader } from "./components/ExplorerHeader";
import { ExplorerMainContent } from "./components/ExplorerMainContent";
import { ExplorerNavBar } from "./components/ExplorerNavBar";
import { ExplorerToolbar } from "./components/ExplorerToolbar";
import { ImageViewerModal } from "./components/ImageViewerModal";
import { NewFolderDialog } from "./components/NewFolderDialog";
import { PropertiesDialog } from "./components/PropertiesDialog";
import { RenameDialog } from "./components/RenameDialog";
import { useExplorerItemActions } from "./hooks/useExplorerItemActions";
import { useExplorerLifecycle } from "./hooks/useExplorerLifecycle";
import { useExplorerShortcuts } from "./hooks/useExplorerShortcuts";
import { buildImageViewerPayload, formatDate, formatSize, getFileIcon, getFilteredAndSortedItems } from "./utils/fileUtils";

function App() {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [clipboard, setClipboard] = useState(null);
  const [currentPath, setCurrentPath] = useState("");
  const [folderInput, setFolderInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedItem, setSelectedItem] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameDialog, setRenameDialog] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterType, setFilterType] = useState("all");
  const [darkMode, setDarkMode] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [gridSize, setGridSize] = useState("medium");
  const [imageViewer, setImageViewer] = useState(null);
  const [showProperties, setShowProperties] = useState(null);
  const fileInputRef = useRef(null);

  const filteredAndSortedItems = useMemo(
    () => getFilteredAndSortedItems(items, searchQuery, filterType, sortBy, sortOrder),
    [items, searchQuery, filterType, sortBy, sortOrder]
  );

  const breadcrumbs = useMemo(
    () => (currentPath ? currentPath.split("/").filter(Boolean) : []),
    [currentPath]
  );

  const { refreshItems, refreshStorage, clearSelection, navigateUp, navigateTo } = useExplorerLifecycle({
    currentPath,
    setCurrentPath,
    setFolderInput,
    setItems,
    setLoading,
    setStorageInfo,
    setSelectedItems,
    setSelectedItem,
    setFileContent,
    darkMode,
    setContextMenu,
  });

  const {
    setClipboardFromItems,
    handlePaste,
    handleBulkDelete,
    handleAIRemoveBG,
    handleItemClick,
    handleOpenFile,
    handleDelete,
    handleCreateFolder,
    handleRename,
    handleFileUpload,
    handleDrag,
    handleDrop,
    handleDownload,
  } = useExplorerItemActions({
    currentPath,
    clipboard,
    setClipboard,
    selectedItems,
    setSelectedItems,
    filteredAndSortedItems,
    setSelectedItem,
    setFileContent,
    newFolderName,
    setShowNewFolderDialog,
    setNewFolderName,
    renameDialog,
    setRenameDialog,
    setUploadProgress,
    setImageViewer,
    setDragActive,
    refreshItems,
    refreshStorage,
    clearSelection,
  });

  useExplorerShortcuts({
    items: filteredAndSortedItems,
    selectedItems,
    clipboard,
    onSelectAll: (list) => setSelectedItems(new Set(list.map((_, index) => index))),
    onCopy: (list, selection) => {
      const selectedList = Array.from(selection).map((index) => list[index]).filter(Boolean);
      setClipboardFromItems(selectedList, "copy");
    },
    onCut: (list, selection) => {
      const selectedList = Array.from(selection).map((index) => list[index]).filter(Boolean);
      setClipboardFromItems(selectedList, "cut");
    },
    onPaste: handlePaste,
    onDelete: handleBulkDelete,
    onEscape: clearSelection,
  });

  return (
    <div className={`app ${darkMode ? "dark-mode" : ""}`}>
      <ExplorerHeader
        folderInput={folderInput}
        setFolderInput={setFolderInput}
        refreshItems={refreshItems}
        storageInfo={storageInfo}
        onUploadClick={() => fileInputRef.current?.click()}
        onNewFolderClick={() => setShowNewFolderDialog(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={(event) => {
          if (event.target.files.length > 0) {
            handleFileUpload(event.target.files);
          }
        }}
      />

      <ExplorerNavBar
        currentPath={currentPath}
        breadcrumbs={breadcrumbs}
        refreshItems={refreshItems}
        navigateUp={navigateUp}
        navigateTo={navigateTo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <ExplorerToolbar
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        filteredAndSortedItems={filteredAndSortedItems}
        setClipboardFromItems={setClipboardFromItems}
        handleBulkDelete={handleBulkDelete}
        clipboard={clipboard}
        handlePaste={handlePaste}
        setClipboard={setClipboard}
        filterType={filterType}
        setFilterType={setFilterType}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        gridSize={gridSize}
        setGridSize={setGridSize}
      />

      <ExplorerMainContent
        dragActive={dragActive}
        handleDrag={handleDrag}
        handleDrop={handleDrop}
        loading={loading}
        filteredAndSortedItems={filteredAndSortedItems}
        uploadProgress={uploadProgress}
        viewMode={viewMode}
        gridSize={gridSize}
        selectedItem={selectedItem}
        selectedItems={selectedItems}
        handleItemClick={handleItemClick}
        handleOpenFile={handleOpenFile}
        setContextMenu={setContextMenu}
        fileContent={fileContent}
        setSelectedItem={setSelectedItem}
        setFileContent={setFileContent}
        setImageViewer={setImageViewer}
        setShowProperties={setShowProperties}
        handleDownload={handleDownload}
        formatSize={formatSize}
        formatDate={formatDate}
      />

      <ContextMenu
        contextMenu={contextMenu}
        onOpen={handleOpenFile}
        onCopyPath={(pathValue) => {
          navigator.clipboard.writeText(pathValue);
          alert("Path copied to clipboard!");
        }}
        onOpenImageViewer={(item) => setImageViewer(buildImageViewerPayload(item))}
        onDownload={handleDownload}
        onRemoveBackground={handleAIRemoveBG}
        onCopy={(selectedList) => setClipboardFromItems(selectedList, "copy")}
        onCut={(selectedList) => setClipboardFromItems(selectedList, "cut")}
        onRename={(item) => setRenameDialog({ item, newName: item.name })}
        onDelete={handleDelete}
        onProperties={setShowProperties}
        onClose={() => setContextMenu(null)}
      />

      <NewFolderDialog
        show={showNewFolderDialog}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        handleCreateFolder={handleCreateFolder}
        closeDialog={() => {
          setShowNewFolderDialog(false);
          setNewFolderName("");
        }}
        existingFolders={items.filter((item) => item.type === "folder").map((item) => item.name)}
      />

      <RenameDialog
        renameDialog={renameDialog}
        setRenameDialog={setRenameDialog}
        onRename={handleRename}
      />

      <ImageViewerModal
        imageViewer={imageViewer}
        onClose={() => setImageViewer(null)}
        onDownload={handleDownload}
        onShowProperties={(item) => {
          setShowProperties(item);
          setImageViewer(null);
        }}
        formatSize={formatSize}
      />

      <PropertiesDialog
        showProperties={showProperties}
        setShowProperties={setShowProperties}
        formatSize={formatSize}
        formatDate={formatDate}
        getFileIcon={getFileIcon}
        setImageViewer={setImageViewer}
      />
    </div>
  );
}

export default App;
