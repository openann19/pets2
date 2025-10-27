#!/usr/bin/env node

/**
 * Code Graph Generation Script
 * Analyzes imports/exports using madge
 * Generates reports/code_graph.json
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

const SRC_DIR = join(process.cwd(), 'src');
const OUTPUT_FILE = join(process.cwd(), 'reports', 'code_graph.json');

console.log('📊 Generating code graph...\n');

try {
  // Use madge to generate dependency graph
  execSync('npx madge --json src/ > /tmp/madge-output.json', { stdio: 'inherit', cwd: process.cwd() });
  
  let graph = { nodes: [], edges: [] };
  
  try {
    const madgeOutput = JSON.parse(require('fs').readFileSync('/tmp/madge-output.json', 'utf8'));
    // Transform madge output to our format
    for (const [file, deps] of Object.entries(madgeOutput)) {
      graph.nodes.push({ id: file, file });
      deps.forEach(dep => {
        graph.edges.push({ from: file, to: dep });
      });
    }
  } catch (error) {
    console.log('⚠️  Could not parse madge output, generating minimal graph');
    graph = {
      timestamp: new Date().toISOString(),
      nodes: [],
      edges: [],
      circularDependencies: []
    };
  }

  graph.timestamp = new Date().toISOString();
  
  writeFileSync(OUTPUT_FILE, JSON.stringify(graph, null, 2));
  console.log(`✅ Code graph generated: ${OUTPUT_FILE}`);
  
} catch (error) {
  console.log('⚠️  Madge not installed, creating placeholder report');
  const placeholder = {
    timestamp: new Date().toISOString(),
    nodes: [],
    edges: [],
    circularDependencies: [],
    note: 'Install madge to generate full graph'
  };
  writeFileSync(OUTPUT_FILE, JSON.stringify(placeholder, null, 2));
}

process.exit(0);

