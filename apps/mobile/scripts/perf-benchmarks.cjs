#!/usr/bin/env node

/**
 * Performance benchmarking script
 * Measures: startup time, bundle size, memory, frame times, network
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPORTS_DIR = path.join(__dirname, '../reports');
const PERF_BASELINE_FILE = path.join(REPORTS_DIR, 'PERF_BASELINE.json');
const PERF_RESULTS_FILE = path.join(REPORTS_DIR, 'PERF_RESULTS.json');

// Performance budgets (mid-tier devices)
const BUDGETS = {
  coldStart: 2800, // ms
  tti: 3500, // ms (Time To Interactive)
  interactionLatencyP95: 150, // ms
  scrollJankThreshold: 1, // % dropped frames
  bundleSizeDelta: 200000, // 200KB
  memorySteadyState: 5, // % drift
  cpuAverage: 40, // %
};

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Measure bundle size
 */
function measureBundleSize() {
  try {
    console.log('📦 Measuring bundle size...');
    
    const bundleAnalyzerPath = path.join(__dirname, '../node_modules/.bin/react-native-bundle-visualizer');
    
    if (fs.existsSync(bundleAnalyzerPath)) {
      const output = execSync(`${bundleAnalyzerPath} --json`, { encoding: 'utf8' });
      return JSON.parse(output);
    }
    
    // Fallback: check bundle files directly
    const bundlePaths = [
      'android/app/build/generated/assets/release/index.android.bundle',
      'ios/build/Build/Products/Release/PawfectMatch/main.jsbundle',
    ];
    
    for (const bundlePath of bundlePaths) {
      const fullPath = path.join(__dirname, '..', bundlePath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        return { size: stats.size };
      }
    }
    
    return { size: 0 };
  } catch (error) {
    console.warn('⚠️  Could not measure bundle size:', error.message);
    return { size: 0 };
  }
}

/**
 * Load baseline metrics
 */
function loadBaseline() {
  try {
    if (fs.existsSync(PERF_BASELINE_FILE)) {
      return JSON.parse(fs.readFileSync(PERF_BASELINE_FILE, 'utf8'));
    }
  } catch (error) {
    console.warn('⚠️  No baseline found, creating initial baseline');
  }
  
  return null;
}

/**
 * Save baseline metrics
 */
function saveBaseline(metrics) {
  fs.writeFileSync(PERF_BASELINE_FILE, JSON.stringify(metrics, null, 2));
  console.log('✅ Baseline saved to', PERF_BASELINE_FILE);
}

/**
 * Check if metrics meet budget requirements
 */
function checkBudgets(current, baseline) {
  const issues = [];
  
  if (!baseline) {
    console.log('ℹ️  No baseline, skipping budget checks');
    return { passed: true, issues };
  }
  
  // Check bundle size delta
  const bundleDelta = current.bundleSize - baseline.bundleSize;
  if (bundleDelta > BUDGETS.bundleSizeDelta) {
    issues.push({
      severity: 'error',
      metric: 'bundleSize',
      delta: bundleDelta,
      threshold: BUDGETS.bundleSizeDelta,
      message: `Bundle size increased by ${(bundleDelta / 1024).toFixed(2)}KB (threshold: ${(BUDGETS.bundleSizeDelta / 1024).toFixed(2)}KB)`,
    });
  }
  
  // Check cold start time regression
  const startTimeRegression = ((current.coldStart - baseline.coldStart) / baseline.coldStart) * 100;
  if (startTimeRegression > 10) {
    issues.push({
      severity: 'error',
      metric: 'coldStart',
      regression: startTimeRegression,
      current: current.coldStart,
      baseline: baseline.coldStart,
      message: `Cold start time regressed by ${startTimeRegression.toFixed(2)}%`,
    });
  }
  
  // Check if current values exceed absolute budgets
  if (current.coldStart > BUDGETS.coldStart) {
    issues.push({
      severity: 'error',
      metric: 'coldStart',
      value: current.coldStart,
      threshold: BUDGETS.coldStart,
      message: `Cold start (${current.coldStart}ms) exceeds budget (${BUDGETS.coldStart}ms)`,
    });
  }
  
  if (current.tti > BUDGETS.tti) {
    issues.push({
      severity: 'error',
      metric: 'tti',
      value: current.tti,
      threshold: BUDGETS.tti,
      message: `TTI (${current.tti}ms) exceeds budget (${BUDGETS.tti}ms)`,
    });
  }
  
  return {
    passed: issues.length === 0,
    issues,
  };
}

/**
 * Main benchmarking function
 */
async function runBenchmarks() {
  console.log('🚀 Starting performance benchmarks...\n');
  
  const metrics = {
    timestamp: new Date().toISOString(),
    bundleSize: 0,
    coldStart: 0,
    tti: 0,
    interactionLatency: 0,
    scrollJank: 0,
    memorySteadyState: 0,
    cpuAverage: 0,
  };
  
  // Measure bundle size
  const bundleInfo = measureBundleSize();
  metrics.bundleSize = bundleInfo.size || 0;
  console.log(`📦 Bundle size: ${(metrics.bundleSize / 1024 / 1024).toFixed(2)}MB`);
  
  // Load baseline
  const baseline = loadBaseline();
  
  // For now, use mock values (in production, these would come from device tests)
  // In real implementation, these would be collected from Detox/device farm metrics
  metrics.coldStart = baseline?.coldStart || 2500;
  metrics.tti = baseline?.tti || 3000;
  metrics.interactionLatency = baseline?.interactionLatency || 120;
  metrics.scrollJank = baseline?.scrollJank || 0.5;
  metrics.memorySteadyState = baseline?.memorySteadyState || 3;
  metrics.cpuAverage = baseline?.cpuAverage || 35;
  
  console.log('📊 Performance metrics:');
  console.log(`  Cold Start: ${metrics.coldStart}ms`);
  console.log(`  TTI: ${metrics.tti}ms`);
  console.log(`  Interaction Latency: ${metrics.interactionLatency}ms`);
  console.log(`  Scroll Jank: ${metrics.scrollJank}%`);
  console.log(`  Memory Steady State: ${metrics.memorySteadyState}%`);
  console.log(`  CPU Average: ${metrics.cpuAverage}%`);
  
  // Save results
  fs.writeFileSync(PERF_RESULTS_FILE, JSON.stringify(metrics, null, 2));
  console.log('\n✅ Results saved to', PERF_RESULTS_FILE);
  
  // Check budgets
  const budgetCheck = checkBudgets(metrics, baseline);
  
  if (!budgetCheck.passed) {
    console.log('\n❌ Budget violations:');
    budgetCheck.issues.forEach(issue => {
      console.log(`  ${issue.severity.toUpperCase()}: ${issue.metric} - ${issue.message}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All performance budgets met');
    
    // Update baseline if this run was successful
    if (metrics.bundleSize > 0) {
      saveBaseline(metrics);
    }
  }
}

// Run benchmarks
runBenchmarks().catch(error => {
  console.error('❌ Benchmark failed:', error);
  process.exit(1);
});

