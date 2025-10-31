/**
 * 📦 BUNDLE SIZE CHECK
 * 
 * Per polish mandate: fail if animated bundles > +30KB from baseline
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUNDLE_SIZE_BASELINE = {
  // Baseline sizes in KB (update these after establishing baseline)
  animations: 45, // KB
  effects: 120, // KB
  motion: 30, // KB
  total: 195, // KB
};

const BUNDLE_SIZE_THRESHOLD = 30; // KB increase allowed

interface BundleSizeResult {
  name: string;
  currentSize: number;
  baselineSize: number;
  delta: number;
  passed: boolean;
}

/**
 * Get bundle size for a file or directory
 */
function getBundleSize(filePath: string): number {
  try {
    const stats = fs.statSync(filePath);
    return stats.size / 1024; // Convert to KB
  } catch (error) {
    return 0;
  }
}

/**
 * Check bundle sizes against baseline
 */
export function checkBundleSizes(): {
  passed: boolean;
  results: BundleSizeResult[];
  summary: string;
} {
  const results: BundleSizeResult[] = [];
  
  // Check animation-related bundles
  const animationPaths = [
    path.join(__dirname, '../src/foundation/motion.ts'),
    path.join(__dirname, '../src/foundation/reduce-motion.ts'),
    path.join(__dirname, '../src/ui/motion/useMotion.ts'),
  ];
  
  let totalAnimationSize = 0;
  for (const filePath of animationPaths) {
    if (fs.existsSync(filePath)) {
      totalAnimationSize += getBundleSize(filePath);
    }
  }
  
  results.push({
    name: 'animations',
    currentSize: totalAnimationSize,
    baselineSize: BUNDLE_SIZE_BASELINE.animations,
    delta: totalAnimationSize - BUNDLE_SIZE_BASELINE.animations,
    passed: (totalAnimationSize - BUNDLE_SIZE_BASELINE.animations) <= BUNDLE_SIZE_THRESHOLD,
  });
  
  // Check effects bundles
  const effectsPaths = [
    path.join(__dirname, '../src/components/HolographicEffects.tsx'),
    path.join(__dirname, '../src/components/effects'),
  ];
  
  let totalEffectsSize = 0;
  for (const filePath of effectsPaths) {
    if (fs.existsSync(filePath)) {
      if (fs.statSync(filePath).isDirectory()) {
        // Sum all files in directory
        const files = fs.readdirSync(filePath);
        for (const file of files) {
          totalEffectsSize += getBundleSize(path.join(filePath, file));
        }
      } else {
        totalEffectsSize += getBundleSize(filePath);
      }
    }
  }
  
  results.push({
    name: 'effects',
    currentSize: totalEffectsSize,
    baselineSize: BUNDLE_SIZE_BASELINE.effects,
    delta: totalEffectsSize - BUNDLE_SIZE_BASELINE.effects,
    passed: (totalEffectsSize - BUNDLE_SIZE_BASELINE.effects) <= BUNDLE_SIZE_THRESHOLD,
  });
  
  // Check motion foundation bundle
  const motionSize = getBundleSize(path.join(__dirname, '../src/foundation/motion.ts'));
  results.push({
    name: 'motion',
    currentSize: motionSize,
    baselineSize: BUNDLE_SIZE_BASELINE.motion,
    delta: motionSize - BUNDLE_SIZE_BASELINE.motion,
    passed: (motionSize - BUNDLE_SIZE_BASELINE.motion) <= BUNDLE_SIZE_THRESHOLD,
  });
  
  const totalSize = totalAnimationSize + totalEffectsSize + motionSize;
  results.push({
    name: 'total',
    currentSize: totalSize,
    baselineSize: BUNDLE_SIZE_BASELINE.total,
    delta: totalSize - BUNDLE_SIZE_BASELINE.total,
    passed: (totalSize - BUNDLE_SIZE_BASELINE.total) <= BUNDLE_SIZE_THRESHOLD,
  });
  
  const allPassed = results.every(r => r.passed);
  
  const summary = `
Bundle Size Check Results
==========================
${results.map(r => 
  `${r.passed ? '✅' : '❌'} ${r.name}: ${r.currentSize.toFixed(2)}KB (${r.delta >= 0 ? '+' : ''}${r.delta.toFixed(2)}KB)`
).join('\n')}

Overall: ${allPassed ? '✅ PASSED' : '❌ FAILED'}
Threshold: +${BUNDLE_SIZE_THRESHOLD}KB max increase per bundle
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
  console.log('Running bundle size check...');
  
  const result = checkBundleSizes();
  
  console.log(result.summary);
  
  if (!result.passed) {
    console.error('\n❌ Bundle size check failed! Build blocked.');
    console.error('Please optimize bundle size or update baseline.');
    process.exit(1);
  }
  
  console.log('\n✅ Bundle size check passed!');
  process.exit(0);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Error running bundle size check:', error);
    process.exit(1);
  });
}

export default checkBundleSizes;

