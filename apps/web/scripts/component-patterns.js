import { logger } from '@pawfectmatch/core';

/**
 * Component Pattern Analyzer for React Components
 * Identifies legacy patterns that need to be updated for React 19
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.resolve(ROOT_DIR, 'src');
const REPORT_FILE = path.resolve(ROOT_DIR, 'component-patterns-report.json');
const PATTERNS = {
  REACT_FC: /React\.FC<.*>/g,
  FC_PATTERN: /FC<.*>/g,
  IMPLICIT_CHILDREN: /children(?!.*:)/g,
  MISSING_RETURN_TYPE: /=>\s*\(/g,
  COMPONENT_WITHOUT_MEMO: /^export\s+(const|function)\s+([A-Z][a-zA-Z0-9]*)/gm,
};

// State
const results = {
  analyzedFiles: 0,
  componentCount: 0,
  patternsFound: {
    reactFC: 0,
    fc: 0,
    implicitChildren: 0,
    missingReturnType: 0,
    nonMemoized: 0,
  },
  componentsByDirectory: {},
  componentsToUpdate: [],
};

// Functions
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativeFilePath = path.relative(ROOT_DIR, filePath);
  
  // Count components in file
  let componentCount = 0;
  let matches;
  const componentMatches = [...content.matchAll(PATTERNS.COMPONENT_WITHOUT_MEMO)];
  componentCount += componentMatches.length;
  
  // Check for legacy patterns
  const hasReactFC = content.match(PATTERNS.REACT_FC) !== null;
  const hasFC = content.match(PATTERNS.FC_PATTERN) !== null;
  const hasImplicitChildren = content.match(PATTERNS.IMPLICIT_CHILDREN) !== null;
  const hasMissingReturnType = content.match(PATTERNS.MISSING_RETURN_TYPE) !== null;
  
  if (hasReactFC) results.patternsFound.reactFC++;
  if (hasFC) results.patternsFound.fc++;
  if (hasImplicitChildren) results.patternsFound.implicitChildren++;
  if (hasMissingReturnType) results.patternsFound.missingReturnType++;
  
  // Record non-memoized components
  const nonMemoizedCount = componentMatches.length;
  results.patternsFound.nonMemoized += nonMemoizedCount;
  
  // Track components by directory
  const directory = path.dirname(relativeFilePath);
  if (!results.componentsByDirectory[directory]) {
    results.componentsByDirectory[directory] = 0;
  }
  results.componentsByDirectory[directory] += componentCount;
  
  // Add to components to update if issues found
  if (hasReactFC || hasFC || hasImplicitChildren || hasMissingReturnType) {
    results.componentsToUpdate.push({
      path: relativeFilePath,
      issues: {
        reactFC: hasReactFC,
        fc: hasFC,
        implicitChildren: hasImplicitChildren,
        missingReturnType: hasMissingReturnType,
        nonMemoized: nonMemoizedCount > 0,
      },
      componentCount: componentCount,
    });
  }
  
  results.analyzedFiles++;
  results.componentCount += componentCount;
}

// Main execution
logger.info('Analyzing React component patterns...');

const files = glob.sync(`${SRC_DIR}/**/*.{tsx,jsx}`);
files.forEach(analyzeFile);

// Sort components by number of issues
results.componentsToUpdate.sort((a, b) => {
  const issuesA = Object.values(a.issues).filter(Boolean).length;
  const issuesB = Object.values(b.issues).filter(Boolean).length;
  return issuesB - issuesA;
});

// Write report
fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));

// Summary
logger.info('===== Component Pattern Analysis =====');
logger.info(`Analyzed ${results.analyzedFiles} files`);
logger.info(`Found ${results.componentCount} components`);
logger.info('Legacy patterns:');
logger.info(`- React.FC: ${results.patternsFound.reactFC}`);
logger.info(`- FC: ${results.patternsFound.fc}`);
logger.info(`- Implicit children: ${results.patternsFound.implicitChildren}`);
logger.info(`- Missing return types: ${results.patternsFound.missingReturnType}`);
logger.info(`- Non-memoized components: ${results.patternsFound.nonMemoized}`);
logger.info(`Report written to ${REPORT_FILE}`);
logger.info('=====================================');
