
export async function fetchItems(path = "") {
  try {
    const response = await fetch(`http://localhost:5000/api/browse?path=${encodeURIComponent(path)}`);
    const data = await response.json();
    return { items: data.items || [], currentPath: data.currentPath || "" };
  } catch (error) {
    console.error("Error fetching items:", error);
    return { items: [], currentPath: "" };
  }
}

export async function handleCreateFolder(currentPath, newFolderName) {
  if (!newFolderName.trim()) {
    alert("Please enter a folder name");
    return { success: false };
  }
  try {
    const response = await fetch('http://localhost:5000/api/create-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: currentPath, folderName: newFolderName })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    alert("Failed to create folder!");
    console.error("Error creating folder:", error);
    return { success: false };
  }
}

export async function handleDelete(item) {
  try {
    const response = await fetch(`http://localhost:5000/api/delete?path=${encodeURIComponent(item.path)}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    alert("Failed to delete!");
    console.error("Error deleting:", error);
    return { success: false };
  }
}

export async function handleBulkDelete(items, selectedItems) {
  const selectedItemsList = Array.from(selectedItems).map(idx => items[idx]);
  let results = [];
  for (const item of selectedItemsList) {
    const result = await handleDelete(item);
    results.push(result);
  }
  return results;
}

export async function handleFileUpload(files, currentPath) {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });
  try {
    const response = await fetch(`http://localhost:5000/api/upload?path=${encodeURIComponent(currentPath)}`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    return data;
  } catch (error) {
    alert("Upload failed!");
    console.error("Error uploading files:", error);
    return { success: false };
  }
}
