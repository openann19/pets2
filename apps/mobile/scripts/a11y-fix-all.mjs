#!/usr/bin/env node

/**
 * Auto-fix Accessibility Issues
 * Intelligently adds accessibility props to TouchableOpacity, Pressable, and animated components
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'glob';
import { join } from 'node:path';

const SRC_DIR = join(process.cwd(), 'src');

console.log('🔧 Auto-fixing accessibility issues...\n');

const fixedFiles = [];
let totalFixes = 0;

// Get all screen files
const files = globSync('**/screens/**/*.tsx', { cwd: SRC_DIR, absolute: false });

files.forEach(file => {
  const filePath = join(SRC_DIR, file);
  let content = readFileSync(filePath, 'utf8');
  const originalContent = content;
  let changed = false;

  // Helper to extract text content from JSX
  const extractTextContent = (line, currentIdx) => {
    const nextLines = content.split('\n').slice(currentIdx, currentIdx + 3);
    const fullText = nextLines.join(' ');
    const textMatch = fullText.match(/>([^<]+)</);
    if (textMatch) {
      return textMatch[1].trim();
    }
    return '';
  };

  // Helper to determine role from context
  const determineRole = (text, line) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('button') || lowerText.includes('press') || lowerText.includes('tap')) return 'button';
    if (lowerText.includes('link')) return 'link';
    if (lowerText.includes('header') || lowerText.includes('title')) return 'header';
    return 'button'; // default
  };

  // Helper to generate label
  const generateLabel = (text) => {
    if (!text) return 'Interactive element';
    
    // Clean up common patterns
    text = text.replace(/[<>{}]/g, '').trim();
    if (text.length > 50) text = text.substring(0, 47) + '...';
    return text;
  };

  // Fix TouchableOpacity components
  content = content.replace(/<TouchableOpacity([^>]*?)onPress/g, (match, props) => {
    if (props.includes('testID') && props.includes('accessibilityLabel') && props.includes('accessibilityRole')) {
      return match;
    }
    changed = true;
    totalFixes++;

    const lines = content.split('\n');
    const lineNum = content.substring(0, content.indexOf(match)).split('\n').length;
    const textContent = extractTextContent(lines[lineNum - 1], lineNum - 1);
    const label = generateLabel(textContent);
    const role = determineRole(textContent, lines[lineNum - 1]);

    let newProps = props;
    
    // Add testID if missing
    if (!props.includes('testID')) {
      const baseName = file.replace(/.*\/([^/]+)\.tsx$/, '$1');
      const counter = match.split('<TouchableOpacity').length;
      newProps += ` testID="${baseName}-button-${counter}"`;
    }
    
    // Add accessibilityLabel if missing
    if (!props.includes('accessibilityLabel')) {
      newProps += ` accessibilityLabel="${label}"`;
    }
    
    // Add accessibilityRole if missing
    if (!props.includes('accessibilityRole')) {
      newProps += ` accessibilityRole="${role}"`;
    }
    
    return `<TouchableOpacity${newProps} onPress`;
  });

  // Fix Pressable components (similar logic)
  content = content.replace(/<Pressable([^>]*?)onPress/g, (match, props) => {
    if (props.includes('testID') && props.includes('accessibilityLabel') && props.includes('accessibilityRole')) {
      return match;
    }
    changed = true;
    totalFixes++;

    const lines = content.split('\n');
    const lineNum = content.substring(0, content.indexOf(match)).split('\n').length;
    const textContent = extractTextContent(lines[lineNum - 1], lineNum - 1);
    const label = generateLabel(textContent);
    const role = determineRole(textContent, lines[lineNum - 1]);

    let newProps = props;
    
    if (!props.includes('testID')) {
      const baseName = file.replace(/.*\/([^/]+)\.tsx$/, '$1');
      const counter = match.split('<Pressable').length;
      newProps += ` testID="${baseName}-pressable-${counter}"`;
    }
    
    if (!props.includes('accessibilityLabel')) {
      newProps += ` accessibilityLabel="${label}"`;
    }
    
    if (!props.includes('accessibilityRole')) {
      newProps += ` accessibilityRole="${role}"`;
    }
    
    return `<Pressable${newProps} onPress`;
  });

  if (changed) {
    writeFileSync(filePath, content);
    fixedFiles.push(file);
    console.log(`✅ Fixed: ${file}`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`- Files fixed: ${fixedFiles.length}`);
console.log(`- Total fixes applied: ${totalFixes}`);

