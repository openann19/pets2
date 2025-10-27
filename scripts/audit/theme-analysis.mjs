#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const findings = [];

function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for direct Theme imports
    if (line.includes('import { Theme }') || line.includes('import Theme from')) {
      findings.push({
        id: `AUD-THM-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P2',
        category: 'Theme',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'Direct Theme import instead of useTheme hook',
        evidence: 'Components should use useTheme() hook for dynamic theme access',
        fix: 'Replace import with useTheme() hook and move styles inside component',
        autofix: {
          type: 'codemod',
          snippet: `import { useTheme } from '../theme/Provider';\n// Move StyleSheet.create inside component\nconst theme = useTheme();`
        },
        blast_radius: 'Local',
        confidence: 0.9,
        tags: ['unified-theme', 'react-native'],
        owner: filePath.includes('mobile') ? 'mobile' : filePath.includes('web') ? 'web' : 'core'
      });
    }
    
    // Check for StyleSheet.create outside component
    if (line.includes('StyleSheet.create') && !line.includes('const styles =') && !line.includes('useTheme')) {
      // Check if StyleSheet.create is at module level (outside component)
      const contextLines = lines.slice(Math.max(0, index - 5), Math.min(lines.length, index + 5));
      const hasComponentAbove = contextLines.some(l => l.includes('const') && l.includes('= ()') || l.includes('function') && l.includes('return'));
      
      if (!hasComponentAbove) {
        findings.push({
          id: `AUD-THM-${String(findings.length + 1).padStart(5, '0')}`,
          severity: 'P2',
          category: 'Theme',
          file: filePath.replace(root + '/', ''),
          line: lineNum,
          code: line.trim(),
          problem: 'StyleSheet.create defined outside component',
          evidence: 'Styles defined outside cannot access theme dynamically',
          fix: 'Move StyleSheet.create inside component to access theme',
          autofix: {
            type: 'codemod',
            snippet: `// Move inside component:\nconst styles = StyleSheet.create({\n  // use theme.colors, theme.spacing, etc.\n});`
          },
          blast_radius: 'Local',
          confidence: 0.8,
          tags: ['unified-theme', 'react-native'],
          owner: filePath.includes('mobile') ? 'mobile' : 'web'
        });
      }
    }
    
    // Check for raw hex colors
    const hexColorRegex = /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/;
    const hexMatch = line.match(hexColorRegex);
    if (hexMatch && !line.includes('//') && !line.includes('theme')) {
      findings.push({
        id: `AUD-THM-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P2',
        category: 'Theme',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'Raw hex color instead of theme token',
        evidence: 'Hardcoded colors break theme consistency',
        fix: 'Replace with theme.colors semantic token',
        autofix: {
          type: 'manual',
          snippet: `Replace ${hexMatch[0]} with theme.colors.primary or appropriate semantic color`
        },
        blast_radius: 'Local',
        confidence: 0.7,
        tags: ['unified-theme', 'design-tokens'],
        owner: filePath.includes('mobile') ? 'mobile' : 'web'
      });
    }
    
    // Check for incorrect token paths
    if (line.includes('theme.colors.') && line.includes('[')) {
      findings.push({
        id: `AUD-THM-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P2',
        category: 'Theme',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'Incorrect theme token path with bracket notation',
        evidence: 'Theme colors are strings, not objects with bracket access',
        fix: 'Use direct property access: theme.colors.primary instead of theme.colors.primary[500]',
        autofix: {
          type: 'codemod',
          snippet: 'Replace theme.colors.primary[500] with theme.colors.primary'
        },
        blast_radius: 'Local',
        confidence: 0.8,
        tags: ['unified-theme', 'design-tokens'],
        owner: filePath.includes('mobile') ? 'mobile' : 'web'
      });
    }
  });
}

function traverse(dir) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git') && !item.includes('dist') && !item.includes('build')) {
      traverse(fullPath);
    } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js'))) {
      analyzeFile(fullPath);
    }
  }
}

// Analyze key directories
['apps/mobile/src', 'apps/web/src', 'packages/core/src'].forEach(dir => {
  try {
    traverse(join(root, dir));
  } catch (error) {
    // Skip if directory doesn't exist
  }
});

// Output findings as JSONL
findings.forEach(finding => {
  console.log(JSON.stringify(finding));
});
