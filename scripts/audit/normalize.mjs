#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const reportsDir = join(root, 'reports/audit/raw');
const outputDir = join(root, 'reports/audit');

// Read all JSONL files
const allFindings = [];
const rawFiles = readdirSync(reportsDir).filter(f => f.endsWith('.jsonl'));

rawFiles.forEach(file => {
  const content = readFileSync(join(reportsDir, file), 'utf8');
  const lines = content.trim().split('\n');
  
  lines.forEach(line => {
    if (line.trim()) {
      try {
        const finding = JSON.parse(line);
        allFindings.push(finding);
      } catch (error) {
        console.error(`Error parsing line in ${file}:`, line);
      }
    }
  });
});

// Sort findings by severity and file
const severityOrder = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
allFindings.sort((a, b) => {
  const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
  if (severityDiff !== 0) return severityDiff;
  return a.file.localeCompare(b.file);
});

// Write combined JSONL
const jsonlOutput = allFindings.map(f => JSON.stringify(f)).join('\n');
writeFileSync(join(outputDir, 'semantic_findings.jsonl'), jsonlOutput);

// Generate summary statistics
const summary = {
  timestamp: new Date().toISOString(),
  total_findings: allFindings.length,
  by_severity: {
    P0: allFindings.filter(f => f.severity === 'P0').length,
    P1: allFindings.filter(f => f.severity === 'P1').length,
    P2: allFindings.filter(f => f.severity === 'P2').length,
    P3: allFindings.filter(f => f.severity === 'P3').length,
  },
  by_category: {},
  by_owner: {
    mobile: allFindings.filter(f => f.owner === 'mobile').length,
    web: allFindings.filter(f => f.owner === 'web').length,
    core: allFindings.filter(f => f.owner === 'core').length,
    server: allFindings.filter(f => f.owner === 'server').length,
  },
  top_files: {},
  top_risks: []
};

// Calculate category stats
allFindings.forEach(finding => {
  summary.by_category[finding.category] = (summary.by_category[finding.category] || 0) + 1;
  
  const file = finding.file;
  summary.top_files[file] = (summary.top_files[file] || 0) + 1;
});

// Get top 10 files with most findings
summary.top_files = Object.entries(summary.top_files)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .reduce((obj, [file, count]) => {
    obj[file] = count;
    return obj;
  }, {});

// Get top 20 risks (P0 and P1 findings)
summary.top_risks = allFindings
  .filter(f => f.severity === 'P0' || f.severity === 'P1')
  .slice(0, 20)
  .map(f => ({
    id: f.id,
    severity: f.severity,
    category: f.category,
    file: f.file,
    line: f.line,
    problem: f.problem
  }));

// Write summary
writeFileSync(join(outputDir, 'summary.json'), JSON.stringify(summary, null, 2));

// Generate HTML report
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PawfectMatch - Semantic Audit Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea; }
        .stat-card h3 { margin: 0 0 10px 0; color: #333; }
        .stat-card .number { font-size: 2em; font-weight: bold; color: #667eea; }
        .severity-P0 { border-left-color: #dc3545; }
        .severity-P1 { border-left-color: #fd7e14; }
        .severity-P2 { border-left-color: #ffc107; }
        .severity-P3 { border-left-color: #28a745; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .findings-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .findings-table th, .findings-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .findings-table th { background: #f8f9fa; font-weight: 600; }
        .severity-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; color: white; }
        .severity-P0 { background: #dc3545; }
        .severity-P1 { background: #fd7e14; }
        .severity-P2 { background: #ffc107; color: #000; }
        .severity-P3 { background: #28a745; }
        .file-path { font-family: monospace; background: #f1f3f4; padding: 2px 6px; border-radius: 3px; }
        .category-badge { background: #e9ecef; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 PawfectMatch Semantic Audit</h1>
            <p>Comprehensive codebase analysis - ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="content">
            <div class="stats">
                <div class="stat-card">
                    <h3>Total Findings</h3>
                    <div class="number">${summary.total_findings}</div>
                </div>
                <div class="stat-card severity-P0">
                    <h3>Critical (P0)</h3>
                    <div class="number">${summary.by_severity.P0}</div>
                </div>
                <div class="stat-card severity-P1">
                    <h3>High (P1)</h3>
                    <div class="number">${summary.by_severity.P1}</div>
                </div>
                <div class="stat-card severity-P2">
                    <h3>Medium (P2)</h3>
                    <div class="number">${summary.by_severity.P2}</div>
                </div>
            </div>
            
            <div class="section">
                <h2>📊 By Category</h2>
                <table class="findings-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Count</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(summary.by_category).map(([cat, count]) => `
                            <tr>
                                <td><span class="category-badge">${cat}</span></td>
                                <td>${count}</td>
                                <td>${((count / summary.total_findings) * 100).toFixed(1)}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2>📂 By Owner</h2>
                <table class="findings-table">
                    <thead>
                        <tr>
                            <th>Package</th>
                            <th>Findings</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(summary.by_owner).map(([owner, count]) => `
                            <tr>
                                <td>${owner}</td>
                                <td>${count}</td>
                                <td>${count > 0 ? ((count / summary.total_findings) * 100).toFixed(1) : 0}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2>🔥 Top 20 Critical Risks</h2>
                <table class="findings-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Severity</th>
                            <th>Category</th>
                            <th>File</th>
                            <th>Line</th>
                            <th>Problem</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${summary.top_risks.map(risk => `
                            <tr>
                                <td><code>${risk.id}</code></td>
                                <td><span class="severity-badge severity-${risk.severity}">${risk.severity}</span></td>
                                <td><span class="category-badge">${risk.category}</span></td>
                                <td><span class="file-path">${risk.file}</span></td>
                                <td>${risk.line}</td>
                                <td>${risk.problem}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2>📁 Files with Most Findings</h2>
                <table class="findings-table">
                    <thead>
                        <tr>
                            <th>File</th>
                            <th>Findings</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(summary.top_files).map(([file, count]) => `
                            <tr>
                                <td><span class="file-path">${file}</span></td>
                                <td>${count}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
`;

writeFileSync(join(outputDir, 'index.html'), htmlContent);

console.log('✅ Audit report generated successfully!');
console.log(`📊 Total findings: ${summary.total_findings}`);
console.log(`🚨 Critical (P0): ${summary.by_severity.P0}`);
console.log(`⚠️  High (P1): ${summary.by_severity.P1}`);
console.log(`📄 Reports available:`);
console.log(`   - HTML: reports/audit/index.html`);
console.log(`   - JSONL: reports/audit/semantic_findings.jsonl`);
console.log(`   - Summary: reports/audit/summary.json`);
