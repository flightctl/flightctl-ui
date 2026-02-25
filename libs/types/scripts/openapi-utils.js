#!/usr/bin/env node
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

// Recursively remove directory
async function rimraf(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  const entries = await fsPromises.readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await rimraf(fullPath);
      } else {
        await fsPromises.unlink(fullPath);
      }
    }),
  );
  await fsPromises.rmdir(dir);
}

// Recursively copy directory
async function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    return;
  }
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = await fsPromises.readdir(src, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        const content = await fsPromises.readFile(srcPath);
        await fsPromises.writeFile(destPath, content);
        await fsPromises.unlink(srcPath);
      }
    }),
  );
}

// Recursively find all TypeScript files
function findTsFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) {
    return files;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function fixCoreReferences(modelsDir, prefix) {
  const files = findTsFiles(modelsDir);

  // Pre-construct the Regex patterns using the dynamic prefix
  // We escape special characters in the prefix if needed, though usually not for schema names
  const importRegex = new RegExp(`from\\s+['"]\\.\\/${prefix}_([A-Za-z][A-Za-z0-9]*)['"]`, 'g');
  const typeRegex = new RegExp(`\\b${prefix}_([A-Za-z][A-Za-z0-9]*)\\b`, 'g');

  await Promise.all(
    files.map(async (filePath) => {
      let content = await fsPromises.readFile(filePath, 'utf8');
      const originalContent = content;

      // 1. Modify the import path
      content = content.replace(importRegex, "from '../../models/$1'");

      // 2. Correct the name references by removing the prefix
      content = content.replace(typeRegex, '$1');

      if (content !== originalContent) {
        await fsPromises.writeFile(filePath, content, 'utf8');
      }
    }),
  );
}

module.exports = {
  rimraf,
  copyDir,
  fixCoreReferences,
};
