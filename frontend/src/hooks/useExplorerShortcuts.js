import { useEffect } from "react";

export function useExplorerShortcuts({ items, selectedItems, clipboard, onSelectAll, onCopy, onCut, onPaste, onDelete, onEscape }) {
  useEffect(() => {
    const handleKeyboard = (event) => {
      if (event.ctrlKey && event.key === "a") {
        event.preventDefault();
        onSelectAll(items);
      }

      if (event.ctrlKey && event.key === "c" && selectedItems.size > 0) {
        event.preventDefault();
        onCopy(items, selectedItems);
      }

      if (event.ctrlKey && event.key === "x" && selectedItems.size > 0) {
        event.preventDefault();
        onCut(items, selectedItems);
      }

      if (event.ctrlKey && event.key === "v" && clipboard) {
        event.preventDefault();
        onPaste();
      }

      if (event.key === "Delete" && selectedItems.size > 0) {
        event.preventDefault();
        onDelete();
      }

      if (event.key === "Escape") {
        onEscape();
      }
    };

    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, [items, selectedItems, clipboard, onSelectAll, onCopy, onCut, onPaste, onDelete, onEscape]);
}
