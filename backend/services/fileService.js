// Business logic for file/folder operations
const fs = require('fs');
const path = require('path');

function addFile(baseDir, folderPath, fileName, fileContent) {
  const targetPath = path.join(baseDir, folderPath, fileName);
  fs.writeFileSync(targetPath, fileContent);
  return targetPath;
}

function deleteFile(baseDir, filePath) {
  const targetPath = path.join(baseDir, filePath);
  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
    return true;
  }
  return false;
}

function renameFile(baseDir, oldPath, newPath) {
  const oldFullPath = path.join(baseDir, oldPath);
  const newFullPath = path.join(baseDir, newPath);
  if (fs.existsSync(oldFullPath)) {
    fs.renameSync(oldFullPath, newFullPath);
    return true;
  }
  return false;
}

module.exports = {
  addFile,
  deleteFile,
  renameFile
};
