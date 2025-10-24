# Ban Type Suppressions — Implementation Plan

## Problem
Type suppressions (`@ts-ignore`, `@ts-expect-error`, `eslint-disable`) hide real bugs and violate Type Supremacy. Found:
- **4 instances** of `@ts-nocheck/@ts-expect-error` 
- **40 instances** of `eslint-disable` comments

## Strategy

### Phase 1: Add Ban Rules ✅
### Phase 2: Fix Existing Violations (14 files)
### Phase 3: Add Pre-commit Hook

---

## Existing Violations to Fix

### TypeScript Suppressions (4)

1. **apps/web/src/__tests__/auth.test.tsx** - `@ts-nocheck`
   - **Fix**: Add proper types for test helpers
   
2. **apps/web/src/tests/ultra-test-suite.ts** - `@ts-nocheck`
   - **Fix**: Add proper types or delete if unused
   
3. **apps/web/src/components/Layout/__tests__/Header.test.tsx** - `@ts-nocheck`
   - **Fix**: Add proper types for React Testing Library

4. **apps/web/src/utils/codeSplitting.tsx** - `@ts-expect-error`
   - **Fix**: Type lazy component props correctly with generics

### ESLint Suppressions (40 across 14 files)

**High Priority** (breaking type safety):
- `@typescript-eslint/no-unsafe-*` (17 instances) — Fix with proper types
- `@typescript-eslint/no-explicit-any` (1 instance) — Replace with proper type
- `react-hooks/exhaustive-deps` (1 instance) — Fix deps or use useCallback properly

**Medium Priority** (code quality):
- `no-console` (4 instances in logger.ts) — Already using logger, remove suppression
- `@next/next/no-img-element` (2 instances) — Document why or use Next Image

**Low Priority** (acceptable in specific contexts):
- `jsx-a11y/alt-text` (1 instance in test mock) — Can stay in test mocks only

---

## Implementation

### Step 1: ESLint Rules (tsconfig + eslint)

**tsconfig.base.json** - Already done by user ✅
```json
{
  "compilerOptions": {
    "allowJs": false,
    "checkJs": false
  }
}
```

**ESLint - Ban Suppressions**
```javascript
{
  "rules": {
    "@typescript-eslint/ban-ts-comment": ["error", {
      "ts-expect-error": "allow-with-description",
      "ts-ignore": true,
      "ts-nocheck": true,
      "minimumDescriptionLength": 10
    }],
    "no-restricted-syntax": [
      "error",
      {
        "selector": "Program > :has(Comment[value=/eslint-disable|eslint-disable-next-line/])",
        "message": "Do not suppress ESLint errors. Fix the root cause instead."
      }
    ]
  }
}
```

### Step 2: Fix Each File

#### Fix Test Files (Remove @ts-nocheck)

**auth.test.tsx**
```typescript
// Remove: // @ts-nocheck
import { renderHook, act } from '@testing-library/react';
import type { RenderHookResult } from '@testing-library/react';
// ... properly typed test code
```

**Header.test.tsx**
```typescript
// Remove: // @ts-nocheck
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
```

#### Fix Lazy Loading (codeSplitting.tsx)

Replace:
```typescript
{/* @ts-expect-error: Lazy component props... */}
<LazyComponent {...props}/>
```

With typed wrapper:
```typescript
function lazyLoadWithFallback<P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  componentName: string
): React.ComponentType<P> {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props: P) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<ComponentLoadingFallback />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}
```

#### Fix Unsafe Type Assertions (swipe-v2/page.tsx)

Replace:
```typescript
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
Array.from({ length: 10 }, generateMockPetCardData)
```

With proper types:
```typescript
const mockPets: PetCardData[] = Array.from({ length: 10 }, (_, i) => 
  generateMockPetCardData(i)
);
```

#### Fix Logger Console Suppressions (logger.ts)

Remove all `// eslint-disable-next-line no-console` — logger.ts is the ONE place console.* is allowed.

Add ESLint override:
```javascript
// eslint.config.js
{
  files: ['**/logger.ts', '**/logger.js'],
  rules: {
    'no-console': 'off' // Logging service is the exception
  }
}
```

#### Fix Exhaustive Deps (AuthProvider.tsx)

Replace:
```typescript
useEffect(() => {
  authStore.initializeAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

With properly memoized:
```typescript
const initializeAuth = useCallback(() => {
  authStore.initializeAuth();
}, []);

useEffect(() => {
  initializeAuth();
}, [initializeAuth]);

// OR if truly run-once:
const hasInitialized = useRef(false);
useEffect(() => {
  if (!hasInitialized.current) {
    authStore.initializeAuth();
    hasInitialized.current = true;
  }
}, []);
```

### Step 3: Verification Script

```bash
#!/bin/bash
# scripts/verify-no-suppressions.sh

echo "🔍 Scanning for type suppressions..."

# Check for TS suppressions
TS_SUPPRESS=$(grep -r --include="*.ts" --include="*.tsx" \
  -e "@ts-ignore" -e "@ts-nocheck" apps/web/src packages/*/src 2>/dev/null || true)

if [ -n "$TS_SUPPRESS" ]; then
  echo "❌ Found @ts-ignore or @ts-nocheck:"
  echo "$TS_SUPPRESS"
  exit 1
fi

# Check for ESLint disables (except in config files)
ESLINT_DISABLE=$(grep -r --include="*.ts" --include="*.tsx" \
  --exclude="*eslint*" --exclude="*.test.*" \
  -e "eslint-disable" apps/web/src packages/*/src 2>/dev/null || true)

if [ -n "$ESLINT_DISABLE" ]; then
  echo "❌ Found eslint-disable comments:"
  echo "$ESLINT_DISABLE"
  exit 1
fi

echo "✅ No type suppressions found!"
exit 0
```

### Step 4: Pre-commit Hook

```bash
#!/bin/bash
# .husky/pre-commit

# Run suppression check
./scripts/verify-no-suppressions.sh || {
  echo ""
  echo "💡 Fix suppressions before committing:"
  echo "   - Remove @ts-ignore/@ts-nocheck and fix types"
  echo "   - Remove eslint-disable and fix root cause"
  exit 1
}
```

---

## Expected Results

### Before
```bash
grep -r "@ts-ignore\|@ts-nocheck\|@ts-expect-error" apps/web/src --include="*.ts*"
# 4 files with suppressions

grep -r "eslint-disable" apps/web/src --include="*.ts*" | wc -l
# 40 instances
```

### After
```bash
./scripts/verify-no-suppressions.sh
# ✅ No type suppressions found!

pnpm -w type-check
# ✅ 0 errors (all fixed properly)

pnpm -w lint
# ✅ 0 warnings (all fixed properly)
```

---

## Benefits

✅ **Type Supremacy** — No hidden bugs, all types explicit  
✅ **Resilience** — Catch errors at compile time, not runtime  
✅ **Maintainability** — No technical debt from suppressions  
✅ **CI Enforcement** — Pre-commit hook blocks bad code  

---

## Exceptions (If Any)

**Only allow `@ts-expect-error` with description** (10+ chars) for:
- External library bugs (with link to issue)
- Temporary workarounds (with TODO + date)

**Never allow**:
- `@ts-ignore` — Always use `@ts-expect-error` if needed (fails if error is fixed)
- `@ts-nocheck` — Fix types instead
- `eslint-disable` without `eslint-disable-next-line` — Too broad

**Acceptable in tests only**:
- `jsx-a11y/*` in test mocks (not production code)
- `@typescript-eslint/no-explicit-any` in test fixtures (typed as `unknown` preferred)
