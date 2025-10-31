#!/usr/bin/env node
/**
 * Bundle Budget Analysis for Web Parity
 * Measures and enforces performance budgets for production builds
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default budgets (configurable)
const DEFAULT_BUDGETS = {
  'main.js': '500KB',
  'vendor.js': '1MB',
  'styles.css': '100KB',
  'total': '2MB',
  'chunks': '200KB' // per chunk
};

// Parse size string to bytes
function parseSize(sizeStr) {
  const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);
  if (!match) throw new Error(`Invalid size format: ${sizeStr}`);
  return parseFloat(match[1]) * units[match[2].toUpperCase()];
}

// Format bytes to human readable
function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Analyze bundle stats
function analyzeBundle(buildDir = './dist') {
  const stats = [];
  let totalSize = 0;

  // Look for common bundle analysis files
  const analysisFiles = [
    'build/static/js', // Create React App
    'dist/_next/static/chunks', // Next.js
    'dist/assets', // Vite
    '.next/static/chunks' // Next.js dev
  ];

  for (const dir of analysisFiles) {
    const fullPath = join(process.cwd(), dir);
    if (existsSync(fullPath)) {
      // Analyze files in directory
      const files = require('fs').readdirSync(fullPath, { recursive: true })
        .filter(f => typeof f === 'string' && (f.endsWith('.js') || f.endsWith('.css')))
        .map(f => join(fullPath, f))
        .filter(f => existsSync(f));

      files.forEach(file => {
        const stat = require('fs').statSync(file);
        stats.push({
          file: file.replace(process.cwd() + '/', ''),
          size: stat.size,
          type: file.endsWith('.css') ? 'css' : 'js'
        });
        totalSize += stat.size;
      });
    }
  }

  // Fallback: look for webpack bundle analyzer output
  const webpackStatsPath = join(process.cwd(), 'dist', 'stats.json');
  if (existsSync(webpackStatsPath)) {
    const webpackStats = JSON.parse(readFileSync(webpackStatsPath, 'utf8'));
    webpackStats.assets.forEach(asset => {
      stats.push({
        file: asset.name,
        size: asset.size,
        type: asset.name.endsWith('.css') ? 'css' : 'js'
      });
    });
  }

  return { stats, totalSize };
}

// Check budgets
function checkBudgets(stats, budgets = DEFAULT_BUDGETS) {
  const results = {
    passed: true,
    violations: [],
    summary: {}
  };

  // Group by type
  const byType = stats.reduce((acc, stat) => {
    acc[stat.type] = acc[stat.type] || [];
    acc[stat.type].push(stat);
    return acc;
  }, {});

  // Check main bundles
  Object.entries(budgets).forEach(([key, limit]) => {
    const limitBytes = parseSize(limit);

    if (key === 'total') {
      const totalSize = stats.reduce((sum, stat) => sum + stat.size, 0);
      results.summary[key] = {
        actual: totalSize,
        limit: limitBytes,
        passed: totalSize <= limitBytes
      };
      if (totalSize > limitBytes) {
        results.passed = false;
        results.violations.push({
          type: 'total',
          actual: formatBytes(totalSize),
          limit: formatBytes(limitBytes),
          overBy: formatBytes(totalSize - limitBytes)
        });
      }
    } else if (key === 'chunks') {
      const largeChunks = stats.filter(stat => stat.size > limitBytes);
      results.summary[key] = {
        count: largeChunks.length,
        limit: limitBytes,
        passed: largeChunks.length === 0
      };
      if (largeChunks.length > 0) {
        results.passed = false;
        largeChunks.forEach(chunk => {
          results.violations.push({
            type: 'chunk',
            file: chunk.file,
            actual: formatBytes(chunk.size),
            limit: formatBytes(limitBytes),
            overBy: formatBytes(chunk.size - limitBytes)
          });
        });
      }
    } else {
      // Specific file type budget
      const typeStats = byType[key.replace('.js', '').replace('.css', '')] || [];
      const totalForType = typeStats.reduce((sum, stat) => sum + stat.size, 0);

      results.summary[key] = {
        actual: totalForType,
        limit: limitBytes,
        passed: totalForType <= limitBytes
      };

      if (totalForType > limitBytes) {
        results.passed = false;
        results.violations.push({
          type: key,
          actual: formatBytes(totalForType),
          limit: formatBytes(limitBytes),
          overBy: formatBytes(totalForType - limitBytes)
        });
      }
    }
  });

  return results;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const buildDir = args.find(arg => arg.startsWith('--build-dir='))?.split('=')[1] || './dist';
  const failOnIncrease = args.includes('--fail-on-increase');

  console.log('🔍 Analyzing bundle sizes...\n');

  try {
    const { stats, totalSize } = analyzeBundle(buildDir);

    if (stats.length === 0) {
      console.log('⚠️  No bundle files found. Make sure to build the application first.');
      process.exit(1);
    }

    console.log(`📊 Found ${stats.length} bundle files (${formatBytes(totalSize)} total)\n`);

    // Display file breakdown
    stats
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach(stat => {
        console.log(`  ${stat.file}: ${formatBytes(stat.size)}`);
      });

    if (stats.length > 10) {
      console.log(`  ... and ${stats.length - 10} more files\n`);
    }

    // Check budgets
    const results = checkBudgets(stats);

    console.log('📏 Budget Analysis:\n');

    Object.entries(results.summary).forEach(([key, data]) => {
      const status = data.passed ? '✅' : '❌';
      const actual = formatBytes(data.actual);
      const limit = formatBytes(data.limit);
      console.log(`  ${key}: ${actual} / ${limit} ${status}`);
    });

    if (results.violations.length > 0) {
      console.log('\n🚨 Budget Violations:\n');
      results.violations.forEach(violation => {
        if (violation.file) {
          console.log(`  ${violation.file}: ${violation.actual} (limit: ${violation.limit}) - over by ${violation.overBy}`);
        } else {
          console.log(`  ${violation.type}: ${violation.actual} (limit: ${violation.limit}) - over by ${violation.overBy}`);
        }
      });

      if (failOnIncrease) {
        console.log('\n💥 Build failed due to budget violations!');
        process.exit(1);
      } else {
        console.log('\n⚠️  Budget violations detected but not failing build (--fail-on-increase not set)');
      }
    } else {
      console.log('\n🎉 All budgets passed!');
    }

  } catch (error) {
    console.error('❌ Error analyzing bundles:', error.message);
    process.exit(1);
  }
}

main();
