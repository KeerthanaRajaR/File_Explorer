import { isImage } from "./helpers";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"];
const DOCUMENT_EXTENSIONS = ["pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx"];

export function formatSize(bytes) {
  const value = Number(bytes || 0);
  if (value === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(value) / Math.log(k));
  return `${parseFloat((value / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleString();
}

export function getFileIcon(item) {
  const ext = item?.extension;
  const iconMap = {
    folder: "📁",
    pdf: "📄",
    doc: "📄",
    docx: "📄",
    txt: "📄",
    xls: "📊",
    xlsx: "📊",
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
    c: "⚙️",
  };

  return iconMap[ext] || "📄";
}

export function normalizeImagePath(itemPath) {
  if (!itemPath) return "";
  return itemPath.startsWith("backend/files/")
    ? itemPath.replace("backend/files/", "")
    : itemPath;
}

export function buildImageViewerPayload(item) {
  const normalizedPath = normalizeImagePath(item.path);
  return {
    item,
    url: `http://localhost:5000/api/file?path=${encodeURIComponent(normalizedPath)}`,
  };
}

export function getFilteredAndSortedItems(items, searchQuery, filterType, sortBy, sortOrder) {
  return items
    .filter((item) => {
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (filterType === "folder" && item.type !== "folder") return false;
      if (filterType === "file" && item.type !== "file") return false;
      if (filterType === "images") return IMAGE_EXTENSIONS.includes(item.extension);
      if (filterType === "documents") return DOCUMENT_EXTENSIONS.includes(item.extension);

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

      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;

      return sortOrder === "asc" ? comparison : -comparison;
    });
}

export function shouldFetchTextPreview(item) {
  return item?.type === "file" && !isImage(item);
}
