import { useCallback, useEffect } from "react";
import {
  fetchFileContent,
  fetchItems as fetchItemsService,
  fetchStorageInfo,
  handleCreateFolder as createFolderService,
  handleDelete as deleteService,
  handleFileUpload as fileUploadService,
  pasteItems,
  removeImageBackground,
  renameItem,
} from "../services/fileService";
import { isImage } from "../utils/helpers";
import { buildImageViewerPayload, shouldFetchTextPreview } from "../utils/fileUtils";

export function useExplorerActions({
  currentPath,
  setCurrentPath,
  setFolderInput,
  setItems,
  setLoading,
  setStorageInfo,
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
  darkMode,
  setContextMenu,
}) {
  const refreshStorage = useCallback(async () => {
    const data = await fetchStorageInfo();
    if (data) {
      setStorageInfo(data);
    }
  }, [setStorageInfo]);

  const refreshItems = useCallback(
    async (path = "") => {
      setLoading(true);
      const refreshed = await fetchItemsService(path);
      setItems(refreshed.items);
      setCurrentPath(refreshed.currentPath || "");
      setFolderInput(refreshed.currentPath || "");
      setLoading(false);
    },
    [setLoading, setItems, setCurrentPath, setFolderInput]
  );

  useEffect(() => {
    refreshItems("");
    refreshStorage();
  }, [refreshItems, refreshStorage]);

  useEffect(() => {
    const closeContextMenu = () => setContextMenu(null);
    document.addEventListener("click", closeContextMenu);
    return () => document.removeEventListener("click", closeContextMenu);
  }, [setContextMenu]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setSelectedItem(null);
    setFileContent(null);
  }, [setSelectedItems, setSelectedItem, setFileContent]);

  const setClipboardFromItems = useCallback(
    (selectedItemsList, operation) => {
      if (!selectedItemsList?.length) return;
      setClipboard({ items: selectedItemsList, operation });
    },
    [setClipboard]
  );

  const handlePaste = useCallback(async () => {
    if (!clipboard || clipboard.items.length === 0) return;

    const data = await pasteItems(
      clipboard.items.map((item) => item.path),
      currentPath,
      clipboard.operation
    );

    if (data.success) {
      await refreshItems(currentPath);
      await refreshStorage();
      if (clipboard.operation === "cut") {
        setClipboard(null);
      }
      clearSelection();
      return;
    }

    alert(data.error || "Paste failed");
  }, [clipboard, currentPath, refreshItems, refreshStorage, setClipboard, clearSelection]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.size === 0) return;

    if (!window.confirm(`Delete ${selectedItems.size} item(s)?`)) {
      return;
    }

    const selectedList = Array.from(selectedItems)
      .map((index) => filteredAndSortedItems[index])
      .filter(Boolean);

    for (const item of selectedList) {
      await deleteService(item);
    }

    await refreshItems(currentPath);
    await refreshStorage();
    clearSelection();
  }, [selectedItems, filteredAndSortedItems, currentPath, refreshItems, refreshStorage, clearSelection]);

  const handleAIRemoveBG = useCallback(
    async (item) => {
      const data = await removeImageBackground(item.path);
      if (data.success) {
        alert(`Background removed image created: ${data.outPath}`);
        await refreshItems(currentPath);
        await refreshStorage();
        return;
      }
      alert(data.error || "Remove background failed");
    },
    [currentPath, refreshItems, refreshStorage]
  );

  const handleItemClick = useCallback(
    async (item, index, event) => {
      if (event.ctrlKey || event.metaKey) {
        event.stopPropagation();
        setSelectedItems((prev) => {
          const next = new Set(prev);
          if (next.has(index)) {
            next.delete(index);
          } else {
            next.add(index);
          }
          return next;
        });
        return;
      }

      setSelectedItems(new Set([index]));

      if (item.type === "folder") {
        setSelectedItem(null);
        setFileContent(null);
        await refreshItems(item.path);
        return;
      }

      setSelectedItem(item);
      if (shouldFetchTextPreview(item)) {
        const content = await fetchFileContent(item.path);
        setFileContent(content);
      } else {
        setFileContent(null);
      }
    },
    [setSelectedItems, setSelectedItem, setFileContent, refreshItems]
  );

  const handleDownload = useCallback((item) => {
    window.open(`http://localhost:5000/api/download?path=${encodeURIComponent(item.path)}`, "_blank");
  }, []);

  const handleOpenFile = useCallback(
    async (item) => {
      if (item.type === "folder") {
        await refreshItems(item.path);
        return;
      }

      if (isImage(item)) {
        setImageViewer(buildImageViewerPayload(item));
        return;
      }

      handleDownload(item);
    },
    [refreshItems, setImageViewer, handleDownload]
  );

  const handleDelete = useCallback(
    async (item) => {
      if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
        return;
      }

      const data = await deleteService(item);
      if (!data.success) {
        alert(data.error || "Failed to delete");
        return;
      }

      await refreshItems(currentPath);
      await refreshStorage();
      clearSelection();
    },
    [currentPath, refreshItems, refreshStorage, clearSelection]
  );

  const handleCreateFolder = useCallback(async () => {
    const data = await createFolderService(currentPath, newFolderName);
    if (!data.success) {
      alert(data.error || "Failed to create folder");
      return;
    }

    setShowNewFolderDialog(false);
    setNewFolderName("");
    await refreshItems(currentPath);
  }, [currentPath, newFolderName, setShowNewFolderDialog, setNewFolderName, refreshItems]);

  const handleRename = useCallback(async () => {
    if (!renameDialog) return;

    const trimmedName = renameDialog.newName.trim();
    if (!trimmedName) {
      alert("Please enter a valid name");
      return;
    }

    const oldPath = renameDialog.item.path;
    const parentPath = oldPath.includes("/") ? oldPath.substring(0, oldPath.lastIndexOf("/")) : "";
    const newPath = parentPath ? `${parentPath}/${trimmedName}` : trimmedName;
    const data = await renameItem(oldPath, newPath);

    if (!data.success) {
      alert(data.error || "Rename failed");
      return;
    }

    setRenameDialog(null);
    await refreshItems(currentPath);
  }, [renameDialog, setRenameDialog, currentPath, refreshItems]);

  const handleFileUpload = useCallback(
    async (files) => {
      setUploadProgress({ current: 0, total: files.length });
      const data = await fileUploadService(files, currentPath);

      if (!data.success) {
        setUploadProgress(null);
        alert("Upload failed!");
        return;
      }

      await refreshItems(currentPath);
      await refreshStorage();
      setUploadProgress(null);
      alert(`${files.length} file(s) uploaded successfully!`);
    },
    [currentPath, setUploadProgress, refreshItems, refreshStorage]
  );

  const navigateUp = useCallback(async () => {
    if (!currentPath) return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    await refreshItems(parts.join("/"));
    clearSelection();
  }, [currentPath, refreshItems, clearSelection]);

  const navigateTo = useCallback(
    async (index) => {
      const parts = currentPath.split("/").filter(Boolean);
      const nextPath = parts.slice(0, index + 1).join("/");
      await refreshItems(nextPath);
      clearSelection();
    },
    [currentPath, refreshItems, clearSelection]
  );

  const handleDrag = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.type === "dragenter" || event.type === "dragover") {
        setDragActive(true);
      }
      if (event.type === "dragleave") {
        setDragActive(false);
      }
    },
    [setDragActive]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setDragActive(false);

      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        handleFileUpload(event.dataTransfer.files);
      }
    },
    [setDragActive, handleFileUpload]
  );

  return {
    refreshItems,
    clearSelection,
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
    navigateUp,
    navigateTo,
    handleDrag,
    handleDrop,
    handleDownload,
  };
}
