---
description: go
auto_execution_mode: 3
---

✅ Mobile Tests — Execute, Triage, Fix (Autonomous Loop)

Commander’s intent: Make @pawfectmatch/mobile tests pass with zero relaxations: strict TS, strict ESLint, correct mocks, typed adapters. No any, no unsafe members, no console leaks.

0) Runbook: discover → group → nuke env errors → fix code errors
# Always from repo root
pnpm --filter @pawfectmatch/mobile run typecheck
pnpm --filter @pawfectmatch/mobile run lint
pnpm --filter @pawfectmatch/mobile run test -- --json --outputFile=apps/mobile/reports/jest-results.json --runInBand --no-cache


If failures look like missing native modules / undefined methods, fix Jest env & mocks first (section 1).

When env is clean, fix imports/types/lint (sections 2–4).

Re-run the same 3 commands after every change. Commit in small batches.

1) Jest env in sync with Expo 49 / RN 0.72
1.1 apps/mobile/jest.config.cjs

Make sure:

module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFiles: [
    '<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts','tsx','js','jsx','json','node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      'react-native' +
      '|@react-native' +
      '|react-native-reanimated' +
      '|react-native-gesture-handler' +
      '|expo(nent)?' +
      '|expo-.*' +
      '|@expo/.*' +
      ')/)'
  ],
};

1.2 apps/mobile/jest.setup.ts — add/repair mocks
import 'react-native-gesture-handler/jestSetup';
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('expo-haptics', () => ({ impactAsync: jest.fn(), notificationAsync: jest.fn(), selectionAsync: jest.fn() }));
jest.mock('expo-linear-gradient', () => {
  const React = require('react'); const { View } = require('react-native');
  return { LinearGradient: React.forwardRef((p:any,r:any)=><View ref={r} {...p} />) };
});
jest.mock('expo-blur', () => {
  const React = require('react'); const { View } = require('react-native');
  return { BlurView: React.forwardRef((p:any,r:any)=><View ref={r} {...p} />) };
});
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Local Authentication: provide enums + all asyncs
jest.mock('expo-local-authentication', () => {
  const AuthenticationType = { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 };
  const SecurityLevel = { NONE: 0, SECRET: 1, BIOMETRIC: 2 };
  return {
    hasHardwareAsync: jest.fn().mockResolvedValue(true),
    isEnrolledAsync: jest.fn().mockResolvedValue(true),
    supportedAuthenticationTypesAsync: jest.fn().mockResolvedValue([AuthenticationType.FACIAL_RECOGNITION]),
    getEnrolledLevelAsync: jest.fn().mockResolvedValue(SecurityLevel.BIOMETRIC),
    authenticateAsync: jest.fn().mockResolvedValue({ success: true }),
    cancelAuthenticate: jest.fn(),
    AuthenticationType,
    SecurityLevel,
  };
});

// Optional common Expo bits you use:
jest.mock('expo-file-system', () => ({ readAsStringAsync: jest.fn(), writeAsStringAsync: jest.fn() }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));

// Silence RN warnings in tests without violating no-console in src:
const warn = jest.spyOn(global.console, 'warn').mockImplementation(() => {});
const error = jest.spyOn(global.console, 'error').mockImplementation(() => {});
afterAll(() => { warn.mockRestore(); error.mockRestore(); });


Why:

Fixes your AuthenticationType / getEnrolledLevelAsync crashes.

Fixes expo-blur “.create undefined”.

Stabilizes reanimated/gesture-handler in JSDOM-less env.

Re-run tests now. If still env errors, add tiny mocks for any remaining Expo module the failures name.

2) Fix immediate red tests you already saw
2.1 PhoenixCard import

Your test fails to resolve ../phoenix/PhoenixCard. Normalize to alias:

Update test import to:
import { PhoenixCard } from '@/components/phoenix/PhoenixCard';

Or add an index.ts inside src/components/phoenix/ that re-exports PhoenixCard and import @/components/phoenix.

2.2 Components that import expo-blur / expo-linear-gradient

With the mocks above, rerun:

pnpm --filter @pawfectmatch/mobile test -- --testPathPattern="PhoenixCard|BiometricService|AuthService" --runInBand --no-cache


All env errors must be gone now. If any persist, add mock exactly for the named function.

3) Remove unsafe any and unsafe member access in src (no relax)
3.1 Typed adapters (example: secureStorage.ts)

Replace loose any with a driver interface:

export interface SecureStoreDriver {
  getItemAsync(key: string): Promise<string|null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

import * as SecureStore from 'expo-secure-store';
const driver: SecureStoreDriver = {
  getItemAsync: SecureStore.getItemAsync,
  setItemAsync: SecureStore.setItemAsync,
  deleteItemAsync: SecureStore.deleteItemAsync,
};
export async function getJson<T>(key: string): Promise<T | null> {
  const raw = await driver.getItemAsync(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

3.2 Image pipelines (utils/image-ultra/*)

Create explicit types instead of .export on any:

export interface ExportResult { uri: string; width: number; height: number }
export interface Stage<I,O> { run(input: I): Promise<O> }
export interface PipelineOptions { denoise?: number; upscale?: number; sharpen?: number }

export class ExportStage implements Stage<unknown, ExportResult> {
  async run(input: { bitmap: Uint8Array; format: 'jpeg'|'png' }): Promise<ExportResult> {
    // … real impl
    return { uri: 'file://...', width: 0, height: 0 };
  }
}


Add types/vendor/image-ultra.d.ts for any 3P lib that forces any.

Replace require() with ESM imports.

Remove all any and unsafe member access by narrowing types, e.g. if ('upscale' in engine) …

3.3 withPremiumGate.tsx error handling

Narrow unknown error:

function toMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}


Use that everywhere instead of assigning error typed values.

4) ESLint “no-console” in src

Replace console calls with a logger util:

src/utils/logger.ts

export const logger = {
  info: (...a: unknown[]) => {},
  warn: (...a: unknown[]) => {},
  error: (...a: unknown[]) => {},
};


In tests, mock it to surface messages if needed:

jest.mock('@/utils/logger', () => ({ logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));


No rule relaxations.

5) Biometric tests — make them really pass

In src/services/__tests__/AuthService.test.ts & BiometricService.test.ts:

Do not reach into modules directly; use the mocked handles:

import * as LocalAuthentication from 'expo-local-authentication';

const la = LocalAuthentication as jest.Mocked<typeof LocalAuthentication>;
beforeEach(() => {
  la.hasHardwareAsync.mockResolvedValue(true);
  la.isEnrolledAsync.mockResolvedValue(true);
  la.supportedAuthenticationTypesAsync.mockResolvedValue([la.AuthenticationType.FACIAL_RECOGNITION]);
  la.getEnrolledLevelAsync.mockResolvedValue(la.SecurityLevel.BIOMETRIC);
  la.authenticateAsync.mockResolvedValue({ success: true });
});


Avoid mockResolvedValueOnce chains unless needed; start green with defaults, then specialize per test as required.

6) Execution loop (automate the grind)

Run in this order every time:

pnpm --filter @pawfectmatch/mobile typecheck
pnpm --filter @pawfectmatch/mobile lint
pnpm --filter @pawfectmatch/mobile test -- --runInBand --no-cache --reporters=default --reporters=jest-junit


If >10 failures remain, bucket by error signature:

“Cannot read X of undefined” → add/extend mock

“Unexpected any / unsafe member access” → add types/adapters

“Module not found” → fix import or moduleNameMapper

“i18n missing key” → add to messages

Commit after each bucket is fully green.

Acceptance to stop:

✅ All unit/integration tests pass

✅ TypeScript strict 0 errors

✅ ESLint strict 0 errors

✅ No any or unsafe access in touched files

✅ reports/jest-results.json exists and shows 100% pass for changed suites

7) Bonus: stabilize snapshots & perf tests

Update snapshots only when visual diff is intentional: pnpm --filter @pawfectmatch/mobile test -u (per-PR).

If performance tests read UI libs (Blur, Gradient), keep mocks from §1.2.

8) Deliverables back to me

Short note: what you fixed (env vs code), files touched, before→after counts

Paths to:

apps/mobile/reports/jest-results.json

apps/mobile/reports/ACCESSIBILITY.md (already generated)

Commands you ran + last commit SHA

Do it now. Prioritize fixing env/mocks so test runner stabilizes, then delete all any/unsafe at the source. No rule relaxations.