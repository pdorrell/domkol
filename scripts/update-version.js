#!/usr/bin/env node

/**
 * Script to update version.txt with current timestamp
 * Used before deployment to create a version identifier
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current date/time in YYYY/MM/DD HH:mm format
const getFormattedDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

const rootDir = path.join(__dirname, '..');
const versionFile = path.join(rootDir, 'version.txt');
const newVersion = getFormattedDateTime();

try {
  fs.writeFileSync(versionFile, newVersion);
  console.log(`Updated version.txt to: ${newVersion}`);
} catch (error) {
  console.error(`❌ Error updating version.txt: ${error.message}`);
  process.exit(1);
}