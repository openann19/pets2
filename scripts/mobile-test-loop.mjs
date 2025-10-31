#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const REPORT_DIR = join('apps','mobile','.reports');
const JEST_JSON = join(REPORT_DIR, 'jest-results.json');
mkdirSync(REPORT_DIR, { recursive: true });

function run(cmd, args, opts={}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  return r.status === 0;
}

function runCapture(cmd, args, opts={}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) return null;
  return r.stdout;
}

function parseJest() {
  if (!existsSync(JEST_JSON)) return { numPassedTests: 0, numFailedTests: 9999, testResults: [] };
  try {
    const data = JSON.parse(readFileSync(JEST_JSON,'utf8'));
    return {
      numPassedTests: data.numPassedTests ?? 0,
      numFailedTests: data.numFailedTests ?? 0,
      testResults: data.testResults ?? []
    };
  } catch (error) {
    console.error('Failed to parse Jest results:', error.message);
    return { numPassedTests: 0, numFailedTests: 9999, testResults: [] };
  }
}

function summarizeFailures(results) {
  const map = new Map();
  for (const suite of results.testResults || []) {
    for (const a of suite.assertionResults || []) {
      if (a.status === 'failed') {
        const key = `${a.title}::${suite.name}`;
        map.set(key, (map.get(key)||0) + 1);
      }
    }
  }
  return Array.from(map.entries())
    .sort((a,b)=>b[1]-a[1])
    .slice(0,20)
    .map(([k,c])=>`- ${c}× ${k}`)
    .join('\n');
}

function appendReport(passed, failed, failuresTop, iteration) {
  const path = join(REPORT_DIR, 'LOOP_REPORT.md');
  const now = new Date().toISOString();
  const line = `\n## Iteration ${iteration} - ${now}\n- ✅ Passed: ${passed}\n- ❌ Failed: ${failed}\n- 🎯 Target: 4000+ passed, 0 failed\n${failuresTop ? `### Top 20 Failures\n${failuresTop}\n` : ''}---\n`;
  if (!existsSync(path)) {
    writeFileSync(path, '# Mobile Test Loop Report\n\nThis report tracks the continuous test loop execution.\n\n', 'utf8');
  }
  writeFileSync(path, line, { flag: 'a' });
  console.log(`📊 Loop report updated: ${path}`);
}

const TARGET = 4000;
let iteration = 0;

console.log('🚀 Starting Mobile Test Automation Loop...');
console.log(`🎯 Target: ${TARGET}+ passing tests, 0 failures\n`);

while (true) {
  iteration++;
  console.log(`\n🔄 Iteration ${iteration}\n`);
  
  try {
    // Run TypeScript typecheck
    // console.log('🔍 Running TypeScript typecheck...');
    // if (!run('pnpm', ['mobile:typecheck'])) {
    //   console.log('⚠️  TypeScript errors detected. Continuing to test run...');
    //   appendReport(0, 9999, 'TypeScript typecheck failed', iteration);
    //   continue;
    // }

    // Run ESLint
    // console.log('🧹 Running ESLint...');
    // if (!run('pnpm', ['mobile:lint'])) {
    //   console.log('⚠️  ESLint errors detected. Continuing to test run...');
    //   appendReport(0, 9999, 'ESLint failed', iteration);
    //   continue;
    // }

  // Run tests
  console.log('🧪 Running Jest test suite...');
  const testSuccess = run('pnpm', ['mobile:test:ci']);
  
  const { numPassedTests, numFailedTests, testResults } = parseJest();
  const failuresTop = numFailedTests > 0 ? summarizeFailures({ testResults }) : '';

  console.log(`\n📊 Results: ${numPassedTests} passed, ${numFailedTests} failed\n`);
  
  appendReport(numPassedTests, numFailedTests, failuresTop, iteration);

  // Check if criteria met
  if (numFailedTests === 0 && numPassedTests >= TARGET) {
    console.log('✅ Criteria met! Verifying stability with 3 consecutive runs...\n');
    
    let stableRuns = 1; // First run already passed
    
    // Run 2 more times for stability verification (total 3)
    for (let i = 0; i < 2; i++) {
      console.log(`🔄 Stability check run ${stableRuns + 1}/3...`);
      const stableTestSuccess = run('pnpm', ['mobile:test:ci']);
      
      const { numPassedTests: p2, numFailedTests: f2 } = parseJest();
      
      if (f2 !== 0 || p2 < TARGET) {
        console.log(`⚠️  Stability check failed: ${p2} passed, ${f2} failed. Continuing loop...\n`);
        appendReport(p2, f2, '', iteration);
        break; // Continue outer loop
      }
      
      stableRuns++;
      appendReport(p2, f2, '', iteration);
      console.log(`✅ Stability run ${stableRuns}/3 passed\n`);
      
      if (stableRuns === 3) {
        console.log('🎉 SUCCESS: Mobile test automation complete!');
        console.log(`📊 Final Results: ${p2} passed, ${f2} failed (stable across 3 runs)`);
        console.log(`📝 See ${join(REPORT_DIR, 'LOOP_REPORT.md')} for full report`);
        process.exit(0);
      }
    }
  } else {
    console.log('⚠️  Criteria not met. Continuing loop...\n');
    console.log(`📊 Current: ${numPassedTests} passed, ${numFailedTests} failed`);
    console.log(`🎯 Target: ${TARGET}+ passed, 0 failed`);
    console.log('\n💡 Hand off to AI dev for fixes (reads LOOP_REPORT.md and jest-results.json)');
    console.log('   Apply minimal, typed patches and let loop continue.\n');
  }
} catch (error) {
  console.error('💥 Loop execution failed:', error.message);
  appendReport(0, 9999, `Error: ${error.message}`, iteration);
  console.log('🔄 Continuing loop despite error...\n');
}
}
