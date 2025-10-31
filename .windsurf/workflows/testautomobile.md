---
description: testautomobile
auto_execution_mode: 3
---

AGENT_PROMPT_MOBILE_TEST_LOOP.md (paste this into your AI dev)

Objective (non-negotiable):
Continuously run and fix the mobile test suite until ≥ 4,000 tests pass and 0 fail. Do not stop early. Maintain strict TypeScript and ESLint gates. Only make changes that improve correctness, stability, and coverage. No test deletions to inflate pass count.

Environment assumptions (adjust if needed):

Monorepo with pnpm. Mobile app in apps/mobile.

Jest for unit/integration; Detox optional for E2E.

Commands:

pnpm mobile:typecheck → TypeScript (no emit)

pnpm mobile:lint → ESLint

pnpm mobile:test:ci → Jest CI run (json output enabled)

pnpm mobile:e2e:ci (optional) → Detox CI

Test JSON written to apps/mobile/.reports/jest-results.json.

Definition of Done:

numPassedTests >= 4000, numFailedTests = 0.

pnpm mobile:typecheck and pnpm mobile:lint pass.

Coverage (changed files) ≥ 90% lines/branches.

No skipped tests added to bypass failures.

Flaky tests stabilized (3 consecutive green runs).

Operating rules:

Prefer fixing root causes (config/bootstrap/mocks) before per-test edits.

Keep changes deterministic; pin versions when needed.

Don’t silence errors with broad mocks. Mocks must be minimal and typed.

If a test is invalid, repair it with clear reasoning and assertions matching product behavior.

Maintain RN/Expo test best-practices: proper JSDOM env, react-native-reanimated/gesture-handler/expo-* mocks, jest.useFakeTimers() policy, and act() compliance.

Prioritized remediation map (use in order):

Bootstrap/config: fix Jest env, tsconfig for tests, moduleNameMapper, test setup files, timers, @testing-library/react-native version compat.

Platform mocks: add typed mocks for react-native-reanimated, react-native-gesture-handler, expo-*, react-native-safe-area-context, @react-navigation/*, react-native-mmkv, etc.

A11y/render errors: add act() wrappers, async utilities (findBy*, waitFor), proper providers (navigation/theme/store).

State/data contracts: align test fixtures with schema; replace brittle time-based assertions with deterministic clocks.

Flake killers: real timers vs fake timers by case, stabilize network mocks, remove sleeps, use await screen.findBy....

Coverage & quality: add missing tests for changed code paths; refactor large components (cyclomatic ≤ 10).

Loop algorithm (repeat until DoD):

Run gates in this exact order:

pnpm mobile:typecheck

pnpm mobile:lint

pnpm mobile:test:ci

(optional) pnpm mobile:e2e:ci

Parse jest-results.json. If numFailedTests > 0 or numPassedTests < 4000, select top N root causes by failure frequency/signature.

For each cause:

Identify category per remediation map.

Propose minimal, typed fix (config/mock/test/code).

Implement patch + focused test(s).

Re-run gates. If flake suspected, run mobile:test:ci 3x; require all green.

Update LOOP_REPORT.md with pass/fail counts, main fixes, and next 3 targets.

Continue until DoD satisfied. Then run full suite 3x; if all green, stop and summarize.

Required outputs each iteration (append to files):

apps/mobile/.reports/LOOP_REPORT.md: counts, failing signatures, actions taken, next targets.

apps/mobile/.reports/jest-results.json: raw Jest JSON (overwritten).

Diff of changed files with rationale in commit messages.

Hard constraints:

No disabling rules globally in ESLint/TS to pass builds.

No deleting tests without replacing them with correct ones.

No network calls in unit tests; must be mocked.

Keep test runtime reasonable: parallelize/shard if needed.

Typical RN/Expo fixes you may apply:

Add apps/mobile/jest.setup.ts with sane RN mocks (reanimated, gesture-handler, expo-modules-core, expo-constants, expo-linking, react-native-safe-area-context, @shopify/flash-list, etc.).

Ensure testEnvironment: "jsdom", correct transformIgnorePatterns for RN.

Solve renderWithAct issues by aligning @testing-library/react-native with RN/React versions or updating the tests to use proper async utilities.

Stop criterion: Achieve DoD, produce final summary (top fixes, remaining risks, follow-ups), and exit.

Repo scaffolding to enforce the loop
1) Package scripts (root package.json)
{
  "scripts": {
    "mobile:typecheck": "tsc -p apps/mobile/tsconfig.json --noEmit",
    "mobile:lint": "eslint apps/mobile --ext .ts,.tsx",
    "mobile:test:ci": "cross-env CI=true jest --config apps/mobile/jest.config.cjs --runInBand --reporters=default --reporters=json --outputFile=apps/mobile/.reports/jest-results.json",
    "mobile:e2e:ci": "detox test -c ios.ci --record-logs all",
    "mobile:loop": "node scripts/mobile-test-loop.mjs"
  }
}

2) Jest setup (RN essentials)

apps/mobile/jest.setup.ts

import '@testing-library/jest-native/extend-expect';

// Timers: prefer modern fake timers only when needed
// jest.useFakeTimers({ legacyFakeTimers: false });

// react-native-reanimated mock
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// gesture-handler mock
jest.mock('react-native-gesture-handler', () => {
  const RN = require('react-native');
  return {
    ...RN,
    GestureHandlerRootView: ({ children }: any) => children,
  };
});

// safe area
jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    initialWindowMetrics: { frame: { x:0, y:0, width: 0, height: 0 }, insets: { top:0, bottom:0, left:0, right:0 } }
  };
});

// expo basics
jest.mock('expo-constants', () => ({ default: { manifest: {}, expoConfig: {}, deviceName: 'jest' } }));
jest.mock('expo-linking', () => ({ createURL: (p: string) => `app:///${p}` }));

// navigation
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useFocusEffect: (cb: any) => cb(),
  };
});


apps/mobile/jest.config.cjs

module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native' +
      '|@react-native' +
      '|@react-navigation' +
      '|react-native-reanimated' +
      '|react-native-gesture-handler' +
      '|@shopify/flash-list' +
      '|expo(-.*)?' +
      ')/)'
  ],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleFileExtensions: ['ts','tsx','js','jsx','json','node']
};

3) The autonomous loop runner

scripts/mobile-test-loop.mjs

#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const REPORT_DIR = join('apps','mobile','.reports');
const JEST_JSON = join(REPORT_DIR, 'jest-results.json');
mkdirSync(REPORT_DIR, { recursive: true });

function run(cmd, args, opts={}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function runCapture(cmd, args, opts={}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
  return r.stdout;
}

function parseJest() {
  if (!existsSync(JEST_JSON)) return { numPassedTests: 0, numFailedTests: 9999, testResults: [] };
  const data = JSON.parse(readFileSync(JEST_JSON,'utf8'));
  return {
    numPassedTests: data.numPassedTests ?? 0,
    numFailedTests: data.numFailedTests ?? 0,
    testResults: data.testResults ?? []
  };
}

function summarizeFailures(results) {
  const map = new Map();
  for (const suite of results.testResults) {
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

function appendReport(passed, failed, failuresTop) {
  const path = join(REPORT_DIR, 'LOOP_REPORT.md');
  const now = new Date().toISOString();
  const line = `\n## ${now}\n- Passed: ${passed}\n- Failed: ${failed}\n${failuresTop ? `### Top failures\n${failuresTop}\n` : ''}`;
  if (!existsSync(path)) writeFileSync(path, '# Mobile Test Loop Report\n');
  writeFileSync(path, line, { flag: 'a' });
}

const TARGET = 4000;

while (true) {
  run('pnpm', ['mobile:typecheck']);
  run('pnpm', ['mobile:lint']);
  run('pnpm', ['mobile:test:ci']);

  const { numPassedTests, numFailedTests, testResults } = parseJest();
  const failuresTop = numFailedTests ? summarizeFailures({ testResults }) : '';
  appendReport(numPassedTests, numFailedTests, failuresTop);

  if (numFailedTests === 0 && numPassedTests >= TARGET) {
    // verify stability: run 2 more times
    for (let i=0;i<2;i++){
      run('pnpm', ['mobile:test:ci']);
      const { numPassedTests: p2, numFailedTests: f2 } = parseJest();
      if (f2 !== 0 || p2 < TARGET) {
        break; // continue outer loop to fix flake
      }
      appendReport(p2, f2, '');
      if (i === 1) {
        console.log(`🎉 Achieved ${p2} passed, 0 failed (stable). Exiting.`);
        process.exit(0);
      }
    }
  }

  // Hand off to AI dev for fixes (the agent reads LOOP_REPORT.md and jest-results.json)
  // The agent should apply minimal, typed patches and then let this loop continue.
  // This process runs under CI or locally until the stop criterion is met.
}


This runner never stops until the target is met (and stabilized). It logs top failures to guide your AI dev’s next iteration.