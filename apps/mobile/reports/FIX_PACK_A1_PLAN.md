# FIX PACK A1 — CRASHERS & REDBOXES

**Date:** 2025-10-27  
**Status:** IN PROGRESS  
**Scope:** Top P0 user-visible crashes and broken functionality

## 📊 Current State

**Audit Results:**
- ✅ TypeScript compilation: 0 syntax errors
- ⚠️ ESLint: 1,398 errors
- ⚠️ Failed checks: 5/12 (3 P0, 2 P1)

**ESLint Error Breakdown:**
| Rule | Count | Severity | Impact |
|------|-------|----------|--------|
| local/no-theme-namespace | 655 | P1 | Theme migration needed |
| @typescript-eslint/no-require-imports | 135 | P2 | Test compatibility |
| react-hooks/exhaustive-deps | 117 | P1 | Stale closures |
| **no-undef** | **90** | **P0** | **CRASHES** |
| @typescript-eslint/no-unused-vars | 43 | P2 | Code cleanliness |
| **react-hooks/rules-of-hooks** | **36** | **P0** | **CRASHES** |
| react/no-unescaped-entities | 28 | P2 | Display issues |
| react/display-name | 11 | P2 | Debug experience |

## 🎯 Fix Pack A1 Scope

### Priority 1: Undefined Variables (P0 - CRASHES)
**Impact:** Runtime crashes, "X is not defined" errors  
**Count:** 90 errors  
**Files affected:**
- `/components/AnimatedButton.tsx` - Missing React import
- `/components/chat/VoiceRecorderUltra.tsx` - Missing React import
- `/components/swipe/SwipeGestureHints.tsx` - Missing React import
- `/hooks/chat/useChatInput.ts` - Missing NodeJS types
- `/hooks/domains/social/useStories.ts` - Missing types
- `/hooks/navigation/useTabReselectRefresh.ts` - Missing types
- `/hooks/screens/useAdoptionApplicationScreen.ts` - Missing types
- `/hooks/screens/useMemoryWeaveScreen.ts` - Missing types
- `/hooks/useMatchesData.ts` - Missing types
- `/hooks/useRetry.ts` - Missing types

**Fix:**
1. Add missing `import React from 'react'` statements
2. Add missing `/// <reference types="node" />` or proper NodeJS type imports

### Priority 2: Hook Rule Violations (P0 - CRASHES)
**Impact:** Hook call errors, render crashes  
**Count:** 36 errors  
**Fix:** Correct hook usage patterns (conditional hooks, hooks in loops, etc.)

### Priority 3: require() Imports (P2 - Test Failures)
**Impact:** Test failures, bundling issues  
**Count:** 135 errors  
**Fix:** Convert `require()` to `import` statements in test files

## 🚀 Execution Plan

**Phase 1 (15 min):** Fix undefined React/NodeJS references  
→ Target: 90 → 0 no-undef errors  

**Phase 2 (20 min):** Fix hook rule violations  
→ Target: 36 → 0 rules-of-hooks errors  

**Phase 3 (30 min):** Convert require() to import  
→ Target: 135 → 0 no-require-imports errors  

**Phase 4 (10 min):** Test & verify  
→ Run: `pnpm lint` and confirm error reduction

## 📈 Success Criteria

- ✅ no-undef errors: 90 → 0
- ✅ rules-of-hooks errors: 36 → 0
- ✅ no-require-imports errors: 135 → 0 (or documented suppressions)
- ✅ No new TypeScript errors introduced
- ✅ App launches without crashes in dev mode

## 📝 Findings & Rationale

**Finding AUD-A1-001:** Missing React imports in 10+ files  
**Root Cause:** Files assume React is globally available (old JSX transform)  
**Fix:** Add explicit `import React from 'react'` statements  

**Finding AUD-A1-002:** Hook violations in screen hooks  
**Root Cause:** Conditional hook calls, hooks in callbacks  
**Fix:** Refactor to follow Rules of Hooks  

**Finding AUD-A1-003:** CommonJS require() in test files  
**Root Cause:** Jest mocking patterns using require()  
**Fix:** Convert to ES6 import with jest.mock()  

## 🔗 Related

- [Audit Summary](/reports/audit-summary.md)
- [Theme Migration Plan](../THEME_MIGRATION_PLAN.md)
- [Testing Strategy](../../docs/GDPR_TESTING_PATTERNS.md)

---

**Assignee:** AI Agent  
**Reviewers:** Team Lead  
**Labels:** P0, crasher, quick-win
