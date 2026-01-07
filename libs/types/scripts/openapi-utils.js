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

/**
 * Fixes references from the auto-generated imagebuilder types so they point to the correct types of the "core" API module.
 * The generated types are in the form of:
 * import type { core_v1beta1_openapi_yaml_components_schemas_ObjectMeta } from './core_v1beta1_openapi_yaml_components_schemas_ObjectMeta';
 * type SomeType = {
 *  ...
 *  someField: core_v1beta1_openapi_yaml_components_schemas_ObjectMeta;
 * }
 *
 * The fixed types will be like this:
 * import type { ObjectMeta } from '../../models/ObjectMeta';
 * type SomeType = {
 *  ...
 *  someField: ObjectMeta;
 * }
 *
 * @param {string} modelsDir - Directory containing TypeScript files to fix
 */
async function fixImagebuilderCoreReferences(modelsDir) {
  const files = findTsFiles(modelsDir);

  await Promise.all(
    files.map(async (filePath) => {
      let content = await fsPromises.readFile(filePath, 'utf8');
      const originalContent = content;

      // Modify the path to properly point to the type from the "core" module
      content = content.replace(
        /from\s+['"]\.\/core_v1beta1_openapi_yaml_components_schemas_([A-Za-z][A-Za-z0-9]*)['"]/g,
        "from '../../models/$1'",
      );

      // Correct the import name and the references to this type by removing the prefix
      content = content.replace(/\bcore_v1beta1_openapi_yaml_components_schemas_([A-Za-z][A-Za-z0-9]*)\b/g, '$1');

      // Only write if content changed
      if (content !== originalContent) {
        await fsPromises.writeFile(filePath, content, 'utf8');
      }
    }),
  );
}

module.exports = {
  rimraf,
  copyDir,
  fixImagebuilderCoreReferences,
};
