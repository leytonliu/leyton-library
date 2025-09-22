#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionType = process.argv[2] || 'patch';

// 更新子包版本
const packagesDir = path.join(__dirname, '..', 'packages');
const packages = fs.readdirSync(packagesDir);

packages.forEach(pkg => {
  const pkgPath = path.join(packagesDir, pkg, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const currentVersion = pkgJson.version;
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    let newVersion;
    switch (versionType) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }
    
    pkgJson.version = newVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');
    console.log(`Updated ${pkg} from ${currentVersion} to ${newVersion}`);
  }
});

// 更新主包版本
const rootPkgPath = path.join(__dirname, '..', 'package.json');
const rootPkgJson = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
const currentVersion = rootPkgJson.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);

let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

rootPkgJson.version = newVersion;
fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkgJson, null, 2) + '\n');
console.log(`Updated root package from ${currentVersion} to ${newVersion}`);

console.log('Version update completed!');
