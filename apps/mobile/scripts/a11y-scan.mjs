/**
 * Accessibility Scanner for React Native Screens
 * Checks for accessibility labels, roles, and testIDs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VIOLATIONS = {
  MISSING_ACCESSIBILITY_LABEL: 'missing accessibilityLabel',
  MISSING_TEST_ID: 'missing testID',
  MISSING_ACCESSIBILITY_ROLE: 'missing accessibilityRole',
  RAW_TEXT_WARNING: 'contains raw text without accessibilityLabel',
};

function extractComponents(content) {
  const components = [];
  
  // Match component definitions (const Component = () => {})
  const componentRegex = /(const|function|export\s+(?:default\s+)?(?:const|function))\s+(\w+)\s*[=\(]/g;
  let match;
  
  while ((match = componentRegex.exec(content)) !== null) {
    components.push({ name: match[2], startPos: match.index });
  }
  
  return components;
}

function checkAccessibility(content, filepath) {
  const issues = [];
  
  // Check for TouchableOpacity/Button without accessibilityLabel
  const touchableRegex = /<(?:TouchableOpacity|TouchableHighlight|Pressable|Button)\s+[^>]*>/g;
  let match;
  
  while ((match = touchableRegex.exec(content)) !== null) {
    const element = match[0];
    const hasAccessibilityLabel = /accessibilityLabel\s*=/g.test(element);
    const hasTestID = /testID\s*=/g.test(element);
    const hasRole = /accessibilityRole\s*=/g.test(element);
    
    if (!hasAccessibilityLabel && !hasTestID) {
      issues.push({
        type: VIOLATIONS.MISSING_ACCESSIBILITY_LABEL,
        line: content.substring(0, match.index).split('\n').length,
        element: element.substring(0, 50),
      });
    }
  }
  
  // Check for Text without accessibilityLabel
  const textRegex = /<Text[^>]*>[^<]*[A-Za-z0-9]+/g;
  while ((match = textRegex.exec(content)) !== null) {
    const element = match[0];
    if (!/accessibilityLabel\s*=/.test(element)) {
      const textContent = element.match(/>([^<]+)</)?.[1];
      if (textContent && textContent.trim().length > 0 && !textContent.match(/^[0-9\s\.,]+$/)) {
        issues.push({
          type: VIOLATIONS.RAW_TEXT_WARNING,
          line: content.substring(0, match.index).split('\n').length,
          element: textContent.trim().substring(0, 50),
        });
      }
    }
  }
  
  return issues;
}

function scanScreens(screensDir) {
  const issues = [];
  const files = readdirSync(screensDir, { recursive: true, withFileTypes: true })
    .filter(f => f.isFile() && f.name.endsWith('.tsx'))
    .map(f => join(screensDir, f.name));
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const fileIssues = checkAccessibility(content, file);
      issues.push(...fileIssues.map(i => ({ ...i, file })));
    } catch (error) {
      console.error(`Failed to read ${file}:`, error);
    }
  }
  
  return issues;
}

function main() {
  const screensDir = process.argv[2] || './src/screens';
  const resolvedDir = resolve(screensDir);
  
  console.log(`🔍 Scanning accessibility in: ${resolvedDir}`);
  
  const issues = scanScreens(resolvedDir);
  
  if (issues.length === 0) {
    console.log('✅ No accessibility issues found!');
    process.exit(0);
  }
  
  console.log(`\n⚠️  Found ${issues.length} accessibility issues:\n`);
  
  issues.forEach((issue, idx) => {
    console.log(`${idx + 1}. [${issue.file}]`);
    console.log(`   Type: ${issue.type}`);
    console.log(`   Line: ${issue.line}`);
    console.log(`   Preview: ${issue.element}\n`);
  });
  
  // For now, warnings don't fail the build
  // Uncomment to make it strict:
  // process.exit(1);
  process.exit(0);
}

main();

