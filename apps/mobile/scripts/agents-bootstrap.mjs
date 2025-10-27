#!/usr/bin/env node

/**
 * Agents Bootstrap Script
 * Initializes the AGENTS.md quality enforcement system
 * Creates directories, seeds report templates, sets up baseline configs
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const REPORTS_DIR = join(process.cwd(), 'reports');
const DECISIONS_DIR = join(process.cwd(), 'decisions');
const ANALYTICS_DIR = join(process.cwd(), 'analytics');
const CONTRACTS_DIR = join(process.cwd(), 'contracts');

console.log('🚀 Starting Agents Bootstrap...\n');

// Ensure directories exist
const dirs = [REPORTS_DIR, DECISIONS_DIR, ANALYTICS_DIR, CONTRACTS_DIR];
dirs.forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`⚠️  Directory already exists: ${dir}`);
  }
});

// Create baseline perf budget if not exists
const perfBudgetPath = join(REPORTS_DIR, 'perf_budget.json');
if (!existsSync(perfBudgetPath)) {
  const perfBudget = {
    cold_start_ms: { low: 3500, mid: 2800 },
    tti_ms: { low: 3800, mid: 3000 },
    js_heap_mb: 120,
    fps_drop_pct: 1.0,
    bundle_js_kb: 1500,
    bundle_assets_kb: 2500,
    network_requests_count: 25
  };
  writeFileSync(perfBudgetPath, JSON.stringify(perfBudget, null, 2));
  console.log('✅ Created baseline perf_budget.json');
}

// Create analytics events schema
const analyticsPath = join(ANALYTICS_DIR, 'events.yaml');
if (!existsSync(analyticsPath)) {
  const events = `# PawfectMatch Analytics Events Schema

# Lifecycle Events
- key: app.open
  props:
    version: string
    platform: 'ios' | 'android'
  category: lifecycle

- key: app.close
  props:
    session_duration_ms: number
  category: lifecycle

# Core Feature Events
- key: swipe.card
  props:
    direction: 'left' | 'right' | 'super'
    petId: string
  category: core

- key: match.success
  props:
    matchId: string
  category: core

- key: chat.message.sent
  props:
    length: number
    hasMedia: boolean
  category: core

# Photo & Media Events
- key: upload.started
  props:
    mime: string
    size: number
  category: photo

- key: upload.completed
  props:
    mime: string
    duration_ms: number
  category: photo

# Monetization Events
- key: premium.paywall.viewed
  props:
    source: string
  category: monetization

- key: purchase.initiated
  props:
    productId: string
    price: number
  category: monetization

- key: purchase.completed
  props:
    productId: string
    transactionId: string
  category: monetization

# Error & Stability Events
- key: error.occurred
  props:
    error: string
    screen: string
  category: stability
`;
  writeFileSync(analyticsPath, events);
  console.log('✅ Created analytics/events.yaml');
}

// Create error timeline CSV if not exists
const errorTimelinePath = join(REPORTS_DIR, 'ERROR_TIMELINE.csv');
if (!existsSync(errorTimelinePath)) {
  const csv = `timestamp,category,severity,count,description,trend
${new Date().toISOString().split('T')[0]},bootstrap,info,0,Agents system initialized,stable
`;
  writeFileSync(errorTimelinePath, csv);
  console.log('✅ Created ERROR_TIMELINE.csv');
}

console.log('\n✅ Bootstrap complete! Run \'pnpm mobile:agents:full\' to execute full audit.');
process.exit(0);

