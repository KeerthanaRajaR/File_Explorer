// AI image processing dependencies
const { remove } = require('rembg-node');
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(BASE_DIR, req.query.path || "");
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });


// --- AI Actions: Remove Background Only ---
app.post('/api/ai/remove-bg', async (req, res) => {
  const { path: relativePath } = req.body;
  const filePath = path.join(BASE_DIR, relativePath || "");
  if (!filePath.startsWith(BASE_DIR) || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  try {
    const input = fs.readFileSync(filePath);
    const output = await remove(input);
    const outPath = filePath.replace(/(\.[^.]+)$/, '_nobg$1');
    fs.writeFileSync(outPath, output);
    res.json({ success: true, outPath: outPath.replace(BASE_DIR + '/', '') });
  } catch (err) {
    res.status(500).json({ error: 'Remove background failed', details: err.message });
  }
});
// Folder we will browse
// Folder we will browse (can be overridden by environment variable or config)
const BASE_DIR = process.env.FILE_EXPLORER_ROOT || path.join(__dirname, "files");

// Helper to get file stats
const getFileStats = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      modified: stats.mtime,
      created: stats.birthtime,
      isDirectory: stats.isDirectory()
    };
  } catch (err) {
    return null;
  }
};

// Helper to get file extension
const getFileExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return ext.substring(1); // Remove the dot
};

// API to browse files and folders
app.get("/api/browse", (req, res) => {
  const relativePath = req.query.path || "";
  const folderPath = path.join(BASE_DIR, relativePath);

  // Security: prevent directory traversal
  if (!folderPath.startsWith(BASE_DIR)) {
    return res.status(403).json({ error: "Access denied" });
  }

  // Check if path exists
  if (!fs.existsSync(folderPath)) {
    return res.status(404).json({ error: "Path not found" });
  }

  fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Cannot read directory" });
    }

    const result = files.map(file => {
      const fullPath = path.join(folderPath, file.name);
      const stats = getFileStats(fullPath);
      
      return {
        name: file.name,
        type: file.isDirectory() ? "folder" : "file",
        extension: file.isDirectory() ? null : getFileExtension(file.name),
        size: stats ? stats.size : 0,
        modified: stats ? stats.modified : null,
        path: path.join(relativePath, file.name)
      };
    });

    // Sort: folders first, then files
    result.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === "folder" ? -1 : 1;
    });

    res.json({
      currentPath: relativePath,
      items: result
    });
  });
});

// API to get file content
app.get("/api/file", (req, res) => {
  const relativePath = req.query.path || "";
  const filePath = path.join(BASE_DIR, relativePath);

  // Security check
  if (!filePath.startsWith(BASE_DIR)) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  const stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    return res.status(400).json({ error: "Path is a directory" });
  }

  // Serve image files directly
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp'];
  const ext = path.extname(filePath).toLowerCase();
  if (imageExts.includes(ext)) {
    return res.sendFile(filePath);
  }

  // Otherwise, read as text and return JSON
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Cannot read file" });
    }
    res.json({ content: data, name: path.basename(filePath) });
  });
});

// Upload files
app.post("/api/upload", upload.array('files'), (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: `${req.files.length} file(s) uploaded successfully`,
      files: req.files.map(f => f.originalname)
    });
  } catch (error) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// Create new folder
app.post("/api/create-folder", (req, res) => {
  const { path: relativePath, folderName } = req.body;
  const folderPath = path.join(BASE_DIR, relativePath || "", folderName);

  // Security check
  if (!folderPath.startsWith(BASE_DIR)) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (fs.existsSync(folderPath)) {
    return res.status(400).json({ error: "Folder already exists" });
  }

  try {
    fs.mkdirSync(folderPath, { recursive: true });
    res.json({ success: true, message: "Folder created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create folder" });
  }
});

// Delete file or folder
app.delete("/api/delete", (req, res) => {
  const relativePath = req.query.path || "";
  const itemPath = path.join(BASE_DIR, relativePath);

  // Security check
  if (!itemPath.startsWith(BASE_DIR) || itemPath === BASE_DIR) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (!fs.existsSync(itemPath)) {
    return res.status(404).json({ error: "Item not found" });
  }

  try {
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      fs.rmSync(itemPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(itemPath);
    }
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

// Rename file or folder
app.post("/api/rename", (req, res) => {
  const { oldPath, newName } = req.body;
  const oldItemPath = path.join(BASE_DIR, oldPath || "");
  const newItemPath = path.join(path.dirname(oldItemPath), newName);

  // Security check
  if (!oldItemPath.startsWith(BASE_DIR) || !newItemPath.startsWith(BASE_DIR)) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (!fs.existsSync(oldItemPath)) {
    return res.status(404).json({ error: "Item not found" });
  }

  if (fs.existsSync(newItemPath)) {
    return res.status(400).json({ error: "An item with this name already exists" });
  }

  try {
    fs.renameSync(oldItemPath, newItemPath);
    res.json({ success: true, message: "Renamed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to rename" });
  }
});

// Download file
app.get("/api/download", (req, res) => {
  const relativePath = req.query.path || "";
  const filePath = path.join(BASE_DIR, relativePath);

  // Security check
  if (!filePath.startsWith(BASE_DIR)) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath);
});

// Get storage info
app.get("/api/storage", (req, res) => {
  const getDirectorySize = (dirPath) => {
    let size = 0;
    try {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          size += getDirectorySize(filePath);
        } else {
          size += stats.size;
        }
      });
    } catch (err) {
      // ignore errors
    }
    return size;
  };

  const used = getDirectorySize(BASE_DIR);
  const total = 10 * 1024 * 1024 * 1024; // 10GB limit (simulated)

  res.json({ used, total });
});

// Get image thumbnail
app.get("/api/thumbnail", (req, res) => {
  const relativePath = req.query.path || "";
  const filePath = path.join(BASE_DIR, relativePath);

  if (!filePath.startsWith(BASE_DIR)) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.sendFile(filePath);
});

// Copy/Paste operation
app.post("/api/paste", (req, res) => {
  const { items, targetPath, operation } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No items to paste" });
  }

  try {
    items.forEach(itemPath => {
      const sourcePath = path.join(BASE_DIR, itemPath);
      const fileName = path.basename(sourcePath);
      const destPath = path.join(BASE_DIR, targetPath || "", fileName);

      // Security check
      if (!sourcePath.startsWith(BASE_DIR) || !destPath.startsWith(BASE_DIR)) {
        return;
      }

      if (operation === 'copy') {
        // Copy file or directory
        if (fs.statSync(sourcePath).isDirectory()) {
          fs.cpSync(sourcePath, destPath, { recursive: true });
        } else {
          fs.copyFileSync(sourcePath, destPath);
        }
      } else if (operation === 'cut') {
        // Move file or directory
        fs.renameSync(sourcePath, destPath);
      }
    });

    res.json({ success: true, message: "Paste successful" });
  } catch (error) {
    res.status(500).json({ error: "Paste failed: " + error.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
