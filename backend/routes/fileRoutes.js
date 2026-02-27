// File routes for modular backend
const express = require('express');
const { getFileStats } = require('../utils/helpers');
const { addFile, deleteFile, renameFile } = require('../services/fileService');
const fs = require('fs');
const path = require('path');

module.exports = (BASE_DIR) => {
  const router = express.Router();

  // Example: Get file/folder stats
  router.get('/stats', (req, res) => {
    const relPath = req.query.path || '';
    const filePath = path.join(BASE_DIR, relPath);
    const stats = getFileStats(filePath);
    if (!stats) return res.status(404).json({ error: 'File not found' });
    res.json(stats);
  });

  // Example: Add file
  router.post('/add', (req, res) => {
    const { folderPath, fileName, fileContent } = req.body;
    try {
      const newPath = addFile(BASE_DIR, folderPath, fileName, fileContent);
      res.json({ success: true, path: newPath });
    } catch (err) {
      res.status(500).json({ error: 'Add file failed', details: err.message });
    }
  });

  // Example: Delete file
  router.post('/delete', (req, res) => {
    const { filePath } = req.body;
    try {
      const result = deleteFile(BASE_DIR, filePath);
      if (result) res.json({ success: true });
      else res.status(404).json({ error: 'File not found' });
    } catch (err) {
      res.status(500).json({ error: 'Delete file failed', details: err.message });
    }
  });

  // Example: Rename file
  router.post('/rename', (req, res) => {
    const { oldPath, newPath } = req.body;
    try {
      const result = renameFile(BASE_DIR, oldPath, newPath);
      if (result) res.json({ success: true });
      else res.status(404).json({ error: 'File not found' });
    } catch (err) {
      res.status(500).json({ error: 'Rename file failed', details: err.message });
    }
  });

  // Browse files and folders
  router.get('/browse', (req, res) => {
    const relPath = req.query.path || '';
    const dirPath = path.join(BASE_DIR, relPath);
    if (!dirPath.startsWith(BASE_DIR) || !fs.existsSync(dirPath)) {
      return res.status(404).json({ error: 'Directory not found', items: [], currentPath: relPath });
    }
    try {
      const files = fs.readdirSync(dirPath);
      const items = files.map(name => {
        const filePath = path.join(dirPath, name);
        const stats = getFileStats(filePath);
        return {
          name,
          path: path.relative(BASE_DIR, filePath),
          type: stats.isDirectory ? 'folder' : 'file',
          size: stats.size,
          modified: stats.modified,
          extension: stats.isDirectory ? 'folder' : (name.split('.').pop() || '')
        };
      });
      res.json({ items, currentPath: relPath });
    } catch (err) {
      res.status(500).json({ error: 'Failed to browse', items: [], currentPath: relPath });
    }
  });

  return router;
};
