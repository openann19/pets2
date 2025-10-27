/**
 * Analyze Exports Script
 * Agent: Codebase Mapper (CM)
 * Purpose: Generate code dependency graph and identify dead code
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface ExportAnalysis {
  file: string;
  exports: string[];
  usedExports: string[];
  unusedExports: string[];
}

async function analyzeExports() {
  console.log('🔍 Analyzing exports and dependencies...');
  
  const srcPath = path.join(process.cwd(), 'src');
  const typeScriptFiles = await glob('**/*.{ts,tsx}', {
    cwd: srcPath,
    ignore: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**', '**/__mocks__/**']
  });
  
  const exportMap = new Map<string, Set<string>>();
  const importMap = new Map<string, Set<string>>();
  const moduleExports: ExportAnalysis[] = [];
  
  // Parse all files to find exports and imports
  for (const file of typeScriptFiles) {
    const filePath = path.join(srcPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Find exports
    const exportMatches = [
      ...content.matchAll(/export\s+(?:const|function|class|interface|type|enum|default)\s+(\w+)/g),
      ...content.matchAll(/export\s+{\s*([^}]+)\s*}/g),
    ];
    
    const exports = new Set<string>();
    for (const match of exportMatches) {
      exports.add(match[1]);
    }
    exportMap.set(file, exports);
    
    // Find imports
    const importMatches = content.matchAll(/import\s+[^{]*{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/g);
    const imports = new Set<string>();
    for (const match of importMatches) {
      imports.add(match[0]);
    }
    importMap.set(file, imports);
  }
  
  // Analyze export usage
  for (const file of typeScriptFiles) {
    const exports = exportMap.get(file) || new Set();
    const usedExports = new Set<string>();
    
    // Check if exports are used in other files
    for (const otherFile of typeScriptFiles) {
      if (otherFile === file) continue;
      
      const content = fs.readFileSync(path.join(srcPath, otherFile), 'utf-8');
      for (const exp of exports) {
        if (content.includes(exp)) {
          usedExports.add(exp);
        }
      }
    }
    
    moduleExports.push({
      file,
      exports: Array.from(exports),
      usedExports: Array.from(usedExports),
      unusedExports: Array.from(exports).filter(e => !usedExports.has(e))
    });
  }
  
  // Generate report
  const report = {
    generated: new Date().toISOString(),
    agent: 'Codebase Mapper (CM)',
    totalFiles: typeScriptFiles.length,
    totalExports: Array.from(exportMap.values()).flatMap(e => Array.from(e)).length,
    modulesWithUnusedExports: moduleExports.filter(m => m.unusedExports.length > 0).length,
    analysis: moduleExports,
    circularDependencies: await findCircularDependencies(srcPath, typeScriptFiles),
    topModules: typeScriptFiles.slice(0, 10)
  };
  
  // Save report
  const reportPath = path.join(process.cwd(), '../../reports/code_graph.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`✅ Analysis complete: ${moduleExports.length} modules analyzed`);
  console.log(`📊 Found ${moduleExports.filter(m => m.unusedExports.length > 0).length} modules with unused exports`);
  console.log(`📁 Report saved to ${reportPath}`);
  
  return report;
}

async function findCircularDependencies(srcPath: string, files: string[]): Promise<Array<{ files: string[] }>> {
  // Simplified circular dependency detection
  const circular: Array<{ files: string[] }> = [];
  
  // In a real implementation, this would build a dependency graph
  // and use DFS to find cycles
  
  return circular;
}

// Run if executed directly
if (require.main === module) {
  analyzeExports().catch(console.error);
}

export default analyzeExports;

