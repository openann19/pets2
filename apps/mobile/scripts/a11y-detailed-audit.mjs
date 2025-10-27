#!/usr/bin/env node

/**
 * Detailed Accessibility Audit
 * Scans React Native components and generates specific fix suggestions
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { globSync } from 'glob';
import { join } from 'node:path';

const SRC_DIR = join(process.cwd(), 'src');
const REPORTS_DIR = join(process.cwd(), 'reports');
const OUTPUT_FILE = join(REPORTS_DIR, 'DETAILED_A11Y.md');

if (!existsSync(REPORTS_DIR)) {
  mkdirSync(REPORTS_DIR, { recursive: true });
}

console.log('🔍 Running detailed accessibility audit...\n');

const issues = [];
const screens = globSync('**/screens/**/*.tsx', { cwd: SRC_DIR, absolute: false });

screens.forEach(file => {
  const filePath = join(SRC_DIR, file);
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Track component-specific issues
  const fileIssues = {
    testID: [],
    accessibilityLabel: [],
    accessibilityRole: [],
    reduceMotion: false,
  };
  
  // Look for interactive elements
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for TouchableOpacity without accessibility
    if (line.includes('<TouchableOpacity') || line.includes('TouchableOpacity')) {
      if (!line.includes('testID') && !line.includes('//')) {
        fileIssues.testID.push({ line: lineNum, code: line.trim() });
      }
      if (!line.includes('accessibilityLabel') && !line.includes('//')) {
        fileIssues.accessibilityLabel.push({ line: lineNum, code: line.trim() });
      }
      if (!line.includes('accessibilityRole') && !line.includes('//')) {
        fileIssues.accessibilityRole.push({ line: lineNum, code: line.trim() });
      }
    }
    
    // Check for Pressable without accessibility
    if (line.includes('<Pressable') || line.includes('Pressable')) {
      if (!line.includes('testID') && !line.includes('//')) {
        fileIssues.testID.push({ line: lineNum, code: line.trim() });
      }
      if (!line.includes('accessibilityLabel') && !line.includes('//')) {
        fileIssues.accessibilityLabel.push({ line: lineNum, code: line.trim() });
      }
      if (!line.includes('accessibilityRole') && !line.includes('//')) {
        fileIssues.accessibilityRole.push({ line: lineNum, code: line.trim() });
      }
    }
    
    // Check for animations without reduce motion
    if ((line.includes('Animated') || line.includes('useAnimatedStyle') || line.includes('withSpring') || line.includes('withTiming')) 
        && !content.includes('useReducedMotion') && !content.includes('AccessibilityInfo') && !fileIssues.reduceMotion) {
      fileIssues.reduceMotion = true;
    }
  });
  
  if (fileIssues.testID.length > 0 || fileIssues.accessibilityLabel.length > 0 || fileIssues.accessibilityRole.length > 0 || fileIssues.reduceMotion) {
    issues.push({ file, ...fileIssues });
  }
});

// Generate detailed report
let report = `# Detailed Accessibility Audit

Generated: ${new Date().toISOString()}

## Summary
- **Total Files Scanned**: ${screens.length}
- **Files with Issues**: ${issues.length}
- **Total Issues**: ${issues.reduce((sum, i) => sum + i.testID.length + i.accessibilityLabel.length + i.accessibilityRole.length + (i.reduceMotion ? 1 : 0), 0)}

## Issues by File

`;

issues.forEach(issue => {
  const totalIssues = issue.testID.length + issue.accessibilityLabel.length + issue.accessibilityRole.length + (issue.reduceMotion ? 1 : 0);
  
  report += `### ${issue.file}\n`;
  report += `**Total Issues**: ${totalIssues}\n\n`;
  
  if (issue.testID.length > 0) {
    report += `#### Missing testID (${issue.testID.length} issues)\n`;
    issue.testID.slice(0, 5).forEach(i => {
      report += `- Line ${i.line}: \`${i.code.substring(0, 60)}...\`\n`;
    });
    report += '\n';
  }
  
  if (issue.accessibilityLabel.length > 0) {
    report += `#### Missing accessibilityLabel (${issue.accessibilityLabel.length} issues)\n`;
    issue.accessibilityLabel.slice(0, 5).forEach(i => {
      report += `- Line ${i.line}: \`${i.code.substring(0, 60)}...\`\n`;
    });
    report += '\n';
  }
  
  if (issue.accessibilityRole.length > 0) {
    report += `#### Missing accessibilityRole (${issue.accessibilityRole.length} issues)\n`;
    issue.accessibilityRole.slice(0, 5).forEach(i => {
      report += `- Line ${i.line}: \`${i.code.substring(0, 60)}...\`\n`;
    });
    report += '\n';
  }
  
  if (issue.reduceMotion) {
    report += `#### Missing Reduce Motion Support\n`;
    report += `- File uses animations without respecting reduce motion preferences\n\n`;
  }
  
  report += '---\n\n';
});

// Add recommendations
report += `## Fix Recommendations

### Priority 1: Create Accessibility HOC
Create a reusable wrapper for common accessibility props:

\`\`\`typescript
import { useA11yProps } from '@/utils/A11yHelpers';

function MyComponent() {
  const a11yProps = useA11yProps({
    label: 'Button label',
    hint: 'Button hint',
    role: 'button',
    testID: 'my-button'
  });
  
  return <TouchableOpacity {...a11yProps} onPress={handlePress} />;
}
\`\`\`

### Priority 2: Add Reduce Motion Support
For all animated components:

\`\`\`typescript
import { useReducedMotion } from '@/utils/A11yHelpers';

function AnimatedComponent() {
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : 300;
  // ... use duration in animations
}
\`\`\`

### Priority 3: Minimum Touch Targets
Ensure all touchable elements are at least 44x44 points:

\`\`\`typescript
import { getSafeTouchTarget } from '@/utils/A11yHelpers';

<TouchableOpacity 
  style={{ minWidth: getSafeTouchTarget(40), minHeight: getSafeTouchTarget(40) }}
  {...otherProps}
/>
\`\`\`
`;

writeFileSync(OUTPUT_FILE, report);
console.log(`✅ Detailed report generated: ${OUTPUT_FILE}`);

