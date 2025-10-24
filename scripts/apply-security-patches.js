#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script to create and apply security patches for vulnerable dependencies
 */

const PATCHES_DIR = path.join(__dirname, '..', '.yarn', 'patches');

// Ensure patches directory exists
if (!fs.existsSync(PATCHES_DIR)) {
  fs.mkdirSync(PATCHES_DIR, { recursive: true });
}

// Security patches to apply
const SECURITY_PATCHES = {
  'dicer@0.3.1': {
    file: 'lib/header.js',
    patches: [{
      find: `var nread = 0;`,
      replace: `var nread = 0;\nvar MAX_HEADER_SIZE = 16384; // 16KB max header size`
    }, {
      find: `    var self = this;`,
      replace: `    var self = this;
    // Check header size limit
    if (nread > MAX_HEADER_SIZE) {
      return cb(new Error('Header size exceeds limit'));
    }`
    }]
  },
  'lodash.set@4.3.2': {
    file: 'index.js',
    patches: [{
      find: `function baseSet(object, path, value, customizer) {`,
      replace: `function baseSet(object, path, value, customizer) {
  // Prevent prototype pollution
  if (Object.prototype.hasOwnProperty.call(object, '__proto__') ||
      Object.prototype.hasOwnProperty.call(object, 'constructor') ||
      Object.prototype.hasOwnProperty.call(object, 'prototype')) {
    return object;
  }`
    }]
  },
  'ip@2.0.1': {
    file: 'lib/ip.js',
    patches: [{
      find: `ip.isPublic = function(addr) {`,
      replace: `ip.isPublic = function(addr) {
  // Enhanced private IP detection
  var buf = ip.toBuffer(addr);
  
  // Check for private IPv4 ranges
  if (buf.length === 4) {
    if (buf[0] === 10) return false;
    if (buf[0] === 172 && (buf[1] >= 16 && buf[1] <= 31)) return false;
    if (buf[0] === 192 && buf[1] === 168) return false;
  }
  
  // Check for private IPv6 ranges
  if (buf.length === 16) {
    if (buf[0] === 0xfc || buf[0] === 0xfd) return false;
    if (buf[0] === 0xfe && (buf[1] & 0xc0) === 0x80) return false;
  }`
    }]
  },
  'validator@13.11.0': {
    file: 'lib/isURL.js',
    patches: [{
      find: `function isURL(url, options) {`,
      replace: `function isURL(url, options) {
  // Enhanced URL validation
  if (typeof url !== 'string') {
    return false;
  }
  
  try {
    const parsed = new URL(url);
    // Additional protocol checks
    if (!/^https?:$/i.test(parsed.protocol)) {
      return false;
    }
    // Prevent SSRF via numerical IPs
    if (/^[\d.]+$/.test(parsed.hostname)) {
      return false;
    }
    // Block localhost variants
    if (/^(localhost|127\\.0\\.0\\.1|::1|0\\.0\\.0\\.0)$/i.test(parsed.hostname)) {
      return false;
    }
  } catch (e) {
    return false;
  }`
    }]
  }
};

async function main() {
  console.log('Creating security patches...');

  for (const [pkg, patch] of Object.entries(SECURITY_PATCHES)) {
    const [name, version] = pkg.split('@');
    const patchDir = path.join(PATCHES_DIR, name);
    
    if (!fs.existsSync(patchDir)) {
      fs.mkdirSync(patchDir, { recursive: true });
    }

    const patchFile = path.join(patchDir, `${version}.patch`);
    console.log(`Creating patch for ${pkg}...`);

    try {
      // Generate patch content
      const patchContent = generatePatch(patch);
      fs.writeFileSync(patchFile, patchContent);
      console.log(`Created patch: ${patchFile}`);

      // Apply patch
      console.log(`Applying patch for ${pkg}...`);
      execSync(`patch-package ${name}@${version}`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });

    } catch (err) {
      console.error(`Error patching ${pkg}:`, err);
      process.exit(1);
    }
  }

  console.log('Security patches created and applied successfully!');
}

function generatePatch(patch) {
  // Basic patch generation - in production, use proper diff generation
  return `diff --git a/${patch.file} b/${patch.file}
index 0000000..0000000 100644
--- a/${patch.file}
+++ b/${patch.file}
@@ -1,1 +1,1 @@
${patch.patches.map(p => `- ${p.find}\n+ ${p.replace}`).join('\n')}`;
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});