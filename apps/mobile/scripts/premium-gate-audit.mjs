#!/usr/bin/env node

/**
 * Premium Gate Audit Script
 * Checks that premium features are gated
 */

import { readFileSync } from 'fs';
import { globSync } from 'glob';
import { join } from 'path';

const SRC_DIR = join(process.cwd(), 'src');

console.log('💎 Auditing premium gates...\n');

const premiumFeatures = [
  'booster',
  'boost',
  'superlike',
  'seeLikes',
  'unlimitedSwipes',
  'premium'
];

const files = globSync('**/*.{ts,tsx}', { cwd: SRC_DIR, absolute: false });
const unprotectedFeatures = [];

files.forEach(file => {
  const content = readFileSync(join(SRC_DIR, file), 'utf8');
  
  premiumFeatures.forEach(feature => {
    if (content.includes(feature)) {
      // Check if wrapped with PremiumGate or usePremium hook
      if (!content.includes('PremiumGate') && !content.includes('usePremium') && !content.includes('useSubscription')) {
        unprotectedFeatures.push({
          file,
          feature,
          severity: 'high'
        });
      }
    }
  });
});

if (unprotectedFeatures.length === 0) {
  console.log('✅ All premium features properly gated');
  process.exit(0);
} else {
  console.log(`⚠️  Found ${unprotectedFeatures.length} unprotected premium features:`);
  unprotectedFeatures.forEach(({ file, feature }) => {
    console.log(`  - ${file}: ${feature}`);
  });
  process.exit(1);
}

