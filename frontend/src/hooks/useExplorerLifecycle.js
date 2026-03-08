import { useCallback, useEffect } from "react";
import { fetchItems as fetchItemsService, fetchStorageInfo } from "../services/fileService";

export function useExplorerLifecycle({
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

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setSelectedItem(null);
    setFileContent(null);
  }, [setSelectedItems, setSelectedItem, setFileContent]);

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

  // Initial load
  useEffect(() => {
    refreshItems("");
    refreshStorage();
  }, [refreshItems, refreshStorage]);

  // Context menu cleanup
  useEffect(() => {
    const closeContextMenu = () => setContextMenu(null);
    document.addEventListener("click", closeContextMenu);
    return () => document.removeEventListener("click", closeContextMenu);
  }, [setContextMenu]);

  // Dark mode class management
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  return {
    refreshItems,
    refreshStorage,
    clearSelection,
    navigateUp,
    navigateTo,
  };
}
