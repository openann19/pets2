/**
 * 📊 PERF SMOKE TEST SCRIPT
 * 
 * Per polish mandate: <1% dropped frames on iPhone 12 / Pixel 6 for hero flows
 * Run in CI to fail builds if performance regresses
 */

import { animationTelemetry, type QualityTier } from '../foundation/telemetry';

interface PerfTestResult {
  flow: string;
  frameDrops: number;
  droppedFrameRate: number;
  passed: boolean;
  qualityTier: QualityTier;
}

const PERFORMANCE_THRESHOLDS = {
  iPhone12: {
    maxDroppedFrameRate: 0.01, // 1%
    maxP99FrameTime: 16.67, // 60fps = 16.67ms per frame
  },
  Pixel6: {
    maxDroppedFrameRate: 0.01, // 1%
    maxP99FrameTime: 16.67, // 60fps = 16.67ms per frame
  },
};

/**
 * Run performance smoke test
 */
export async function runPerfSmokeTest(
  deviceModel: 'iPhone12' | 'Pixel6' = 'iPhone12',
): Promise<{
  passed: boolean;
  results: PerfTestResult[];
  summary: string;
}> {
  const thresholds = PERFORMANCE_THRESHOLDS[deviceModel];
  const metrics = animationTelemetry.getMetrics();
  
  // Test hero flows
  const heroFlows = ['Card→Details', 'Swipe→Match', 'Chat→Open'];
  const results: PerfTestResult[] = [];
  
  for (const flow of heroFlows) {
    const tti = animationTelemetry.getTimeToInteractive(flow);
    const flowEvents = animationTelemetry.exportEvents().filter(
      e => e.metadata?.flowName === flow
    );
    
    const frameDropEvents = flowEvents.filter(e => e.type === 'frame_drop');
    const totalFrames = flowEvents.length;
    const droppedFrameRate = totalFrames > 0 
      ? frameDropEvents.length / totalFrames 
      : 0;
    
    const qualityTier: QualityTier = droppedFrameRate < 0.01 
      ? 'high' 
      : droppedFrameRate < 0.05 
      ? 'medium' 
      : 'low';
    
    const passed = droppedFrameRate <= thresholds.maxDroppedFrameRate;
    
    results.push({
      flow,
      frameDrops: frameDropEvents.length,
      droppedFrameRate,
      passed,
      qualityTier,
    });
  }
  
  const allPassed = results.every(r => r.passed);
  const summary = `
Performance Smoke Test Results (${deviceModel})
===========================================
${results.map(r => 
  `${r.passed ? '✅' : '❌'} ${r.flow}: ${(r.droppedFrameRate * 100).toFixed(2)}% dropped frames (${r.qualityTier})`
).join('\n')}

Overall: ${allPassed ? '✅ PASSED' : '❌ FAILED'}
Threshold: ${thresholds.maxDroppedFrameRate * 100}% max dropped frames
  `.trim();
  
  return {
    passed: allPassed,
    results,
    summary,
  };
}

/**
 * CI script entry point
 */
export async function main() {
  const args = process.argv.slice(2);
  const deviceModel = (args[0] as 'iPhone12' | 'Pixel6') || 'iPhone12';
  
  console.log(`Running performance smoke test for ${deviceModel}...`);
  
  const result = await runPerfSmokeTest(deviceModel);
  
  console.log(result.summary);
  
  if (!result.passed) {
    console.error('\n❌ Performance smoke test failed! Build blocked.');
    process.exit(1);
  }
  
  console.log('\n✅ Performance smoke test passed!');
  process.exit(0);
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Error running perf smoke test:', error);
    process.exit(1);
  });
}

export default runPerfSmokeTest;

