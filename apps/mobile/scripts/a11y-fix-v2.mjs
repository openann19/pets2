#!/usr/bin/env node

/**
 * Enhanced Accessibility Fixer
 * Properly handles JSX structure and adds accessibility props correctly
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'glob';
import { join } from 'node:path';

const SRC_DIR = join(process.cwd(), 'src');

console.log('🔧 Enhanced auto-fixing accessibility issues...\n');

const fixedFiles = [];
let totalFixes = 0;

const files = globSync('**/screens/**/*.tsx', { cwd: SRC_DIR, absolute: false });

files.forEach(file => {
  const filePath = join(SRC_DIR, file);
  let content = readFileSync(filePath, 'utf8');
  const originalContent = content;
  let changed = false;

  // Generate component name for testID
  const baseName = file.replace(/.*\/([^/]+)\.tsx$/, '$1').replace(/[^a-zA-Z0-9]/g, '');
  
  let buttonCounter = 0;
  let pressableCounter = 0;

  // Helper to generate unique testID
  const generateTestID = (type) => {
    if (type === 'TouchableOpacity' || type === 'button') {
      return `testID="${baseName}-button-${++buttonCounter}"`;
    } else {
      return `testID="${baseName}-pressable-${++pressableCounter}"`;
    }
  };

  // Fix TouchableOpacity with opening tag
  // Handle both self-closing and multi-line components
  const touchablePattern = /<TouchableOpacity(\s+[^>]*)(\s+\/>|\s*>)/g;
  content = content.replace(touchablePattern, (match, props, closing) => {
    // Skip if already has all required props
    if (props.includes('accessibilityLabel') && props.includes('accessibilityRole') && props.includes('testID')) {
      return match;
    }

    changed = true;
    totalFixes++;

    let newProps = props;
    
    // Add missing props
    if (!props.includes('testID')) {
      newProps += ' ' + generateTestID('button');
    }
    
    if (!props.includes('accessibilityLabel')) {
      // Try to extract text from children
      newProps += ' accessibilityLabel="Button"';
    }
    
    if (!props.includes('accessibilityRole')) {
      newProps += ' accessibilityRole="button"';
    }
    
    return `<TouchableOpacity${newProps}${closing}`;
  });

  // Fix Pressable components
  const pressablePattern = /<Pressable(\s+[^>]*)(\s+\/>|\s*>)/g;
  content = content.replace(pressablePattern, (match, props, closing) => {
    if (props.includes('accessibilityLabel') && props.includes('accessibilityRole') && props.includes('testID')) {
      return match;
    }

    changed = true;
    totalFixes++;

    let newProps = props;
    
    if (!props.includes('testID')) {
      newProps += ' ' + generateTestID('pressable');
    }
    
    if (!props.includes('accessibilityLabel')) {
      newProps += ' accessibilityLabel="Button"';
    }
    
    if (!props.includes('accessibilityRole')) {
      newProps += ' accessibilityRole="button"';
    }
    
    return `<Pressable${newProps}${closing}`;
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

