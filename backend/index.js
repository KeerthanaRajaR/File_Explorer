const express = require("express");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const { remove } = require('rembg-node');

const app = express();
app.use(cors());
app.use(express.json());

// Folder we will browse (can be overridden by environment variable or config)
const BASE_DIR = process.env.FILE_EXPLORER_ROOT || path.join(__dirname, "files");

// Storage info route (register before modular router and app.listen)
app.get('/storage', (req, res) => {
  try {
    const getDirSize = (dir) => {
      let total = 0;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          total += getDirSize(filePath);
        } else {
          total += stats.size;
        }
      }
      return total;
    };
    const used = getDirSize(BASE_DIR);
    const total = 10 * 1024 * 1024 * 1024; // Example: 10GB quota
    res.json({ used, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get storage info', details: err.message });
  }
});
app.get('/storage', (req, res) => {
  try {
    const getDirSize = (dir) => {
      let total = 0;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          total += getDirSize(filePath);
        } else {
          total += stats.size;
        }
      }
      return total;
    };
    const used = getDirSize(BASE_DIR);
    const total = 10 * 1024 * 1024 * 1024; // Example: 10GB quota
    res.json({ used, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get storage info', details: err.message });
  }
});

// Create folder route
app.post('/api/create-folder', (req, res) => {
  const { path: relPath, folderName } = req.body;
  const targetPath = path.join(BASE_DIR, relPath || "", folderName);
  try {
    if (!folderName || folderName.trim() === "") {
      return res.status(400).json({ success: false, error: "Folder name required" });
    }
    if (fs.existsSync(targetPath)) {
      return res.status(400).json({ success: false, error: "Folder already exists" });
    }
    fs.mkdirSync(targetPath, { recursive: true });
    res.json({ success: true, path: path.relative(BASE_DIR, targetPath) });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to create folder", details: err.message });
  }
});

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

// File upload route (must be registered before modular router)
app.post('/api/upload', upload.array('files'), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }
    res.json({ success: true, files: req.files.map(f => f.originalname) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Upload failed', details: err.message });
  }
});


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
// Folder we will browse (can be overridden by environment variable or config)
// ...existing code...

// ...existing code...


// ...existing code...

// Modular routes
const fileRoutes = require("./routes/fileRoutes");
app.use("/api", fileRoutes(BASE_DIR));

// Helper functions
const { getFileStats } = require('./utils/helpers');

// Helper to get file extension
const getFileExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return ext.substring(1); // Remove the dot
};

// ...existing code...
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
