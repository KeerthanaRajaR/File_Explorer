// Helper functions for file operations
const fs = require('fs');

function getFileStats(filePath) {
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
}

module.exports = {
  getFileStats
};
