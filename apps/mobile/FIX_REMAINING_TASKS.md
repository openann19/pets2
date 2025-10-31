# Fixing Remaining Test Tasks

This document provides guidance for fixing the remaining test issues.

## 1. "Expected 1 Argument" Errors

### Common Causes

1. **Mock functions called without required arguments**
   ```typescript
   // ❌ Wrong
   mockFn.mockResolvedValue();
   
   // ✅ Correct
   mockFn.mockResolvedValue({ data: {} });
   ```

2. **Type-safe mocks expecting specific argument counts**
   ```typescript
   // If mock expects 1 argument but called with 0
   const mockFn = jest.fn<Promise<void>, [string]>();
   mockFn(); // ❌ Error: Expected 1 argument
   mockFn('value'); // ✅ Correct
   ```

### How to Fix

1. **Use the new type-safe utilities:**
   ```typescript
   import { createTypedMock, safeMockResolvedValue } from '@/test-utils';
   
   // Create type-safe mock
   const mockFn = createTypedMock<[string], Promise<{ data: unknown }>>(
     async (id: string) => ({ data: { id } })
   );
   
   // Use safe helpers
   safeMockResolvedValue(mockFn, { data: {} });
   ```

2. **Check mock signatures:**
   - Look at the actual service/function signature
   - Match the mock's type parameters: `jest.fn<ReturnType, [Arg1, Arg2, ...]>()`
   - Ensure all calls provide the correct number of arguments

3. **Run diagnostics:**
   ```typescript
   import { validateMockCall } from '@/test-utils/fix-common-test-issues';
   
   const error = validateMockCall(mockFn, 1);
   if (error) {
     console.error(error);
   }
   ```

### Example Fixes

**Fix 1: PremiumService mock calls**
```typescript
// Before
premiumService.getPremiumLimits.mockResolvedValue(); // ❌

// After
premiumService.getPremiumLimits.mockResolvedValue({
  swipesPerDay: 5,
  likesPerDay: 5,
  // ... other fields
}); // ✅
```

**Fix 2: API mock calls**
```typescript
// Before
api.get.mockResolvedValue(); // ❌

// After  
api.get.mockResolvedValue({ data: {} }); // ✅
```

**Fix 3: Function calls with missing arguments**
```typescript
// Before
await result.current.checkFeatureAccess(); // ❌ Expected 1 argument

// After
await result.current.checkFeatureAccess('superLikesPerDay'); // ✅
```

## 2. Import Path Fixes

### Current Issues

Many test files use deep relative imports like `../../../../hooks/` which:
- Are fragile when files move
- Don't work well with TypeScript path mapping
- Are harder to read and maintain

### Solution: Use Path Aliases

All imports should use the configured aliases:
- `@/` → `apps/mobile/src/`
- `@mobile/` → `apps/mobile/src/`

### Automated Fix

Run the provided script:
```bash
./scripts/fix-import-paths.sh
```

Or manually fix patterns:

**Before:**
```typescript
import { usePremiumStatus } from '../../hooks/domains/premium/usePremiumStatus';
import { premiumService } from '../../services/PremiumService';
```

**After:**
```typescript
import { usePremiumStatus } from '@/hooks/domains/premium/usePremiumStatus';
import { premiumService } from '@/services/PremiumService';
```

### Common Patterns

| Old Pattern | New Pattern |
|------------|-------------|
| `../../hooks/` | `@/hooks/` |
| `../../../hooks/` | `@/hooks/` |
| `../../services/` | `@/services/` |
| `../../../services/` | `@/services/` |
| `../../components/` | `@/components/` |
| `../../utils/` | `@/utils/` |
| `../../stores/` | `@/stores/` |

## 3. Step-by-Step Fix Process

### For "Expected 1 Argument" Errors

1. **Identify the failing test:**
   ```bash
   pnpm test -- --testNamePattern="test name" --verbose
   ```

2. **Locate the mock causing the issue:**
   - Look for `.mockResolvedValue()`, `.mockReturnValue()`, or function calls
   - Check if they match the expected signature

3. **Check the actual function signature:**
   - Find the source file (service, hook, etc.)
   - Note the parameter types and counts

4. **Fix the mock:**
   - Update mock type: `jest.fn<ReturnType, [Arg1, Arg2]>()`
   - Provide correct arguments in calls
   - Use safe helpers from `@/test-utils`

5. **Verify the fix:**
   ```bash
   pnpm test -- --testNamePattern="test name"
   ```

### For Import Path Issues

1. **Find files with relative imports:**
   ```bash
   grep -r "from '../../" apps/mobile/src --include="*.test.ts" --include="*.test.tsx"
   ```

2. **Fix incrementally:**
   - Start with most commonly used files
   - Fix one file at a time
   - Test after each fix

3. **Use the script for bulk fixes:**
   ```bash
   ./scripts/fix-import-paths.sh
   ```

4. **Review changes:**
   ```bash
   git diff
   ```

## 4. Prevention

### Use Type-Safe Mocks

Always use typed mocks to catch issues at compile time:

```typescript
import { createTypedMock } from '@/test-utils';

// TypeScript will error if arguments don't match
const mockFn = createTypedMock<[string, number], Promise<Data>>(
  async (id: string, count: number) => ({ id, count })
);
```

### Use Path Aliases from Start

Always use `@/` aliases in new test files:
```typescript
import { useHook } from '@/hooks/useHook';
import { service } from '@/services/service';
```

### Add to ESLint

Consider adding a rule to prefer path aliases:
```json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [{
        "group": ["../../*"],
        "message": "Use path aliases (@/) instead of relative imports"
      }]
    }]
  }
}
```

## 5. Tools Available

### New Utilities

All available in `@/test-utils`:

- `createTypedMock` - Type-safe mock creation
- `safeMockResolvedValue` - Ensures argument provided
- `safeMockReturnValue` - Ensures argument provided
- `validateMockCall` - Diagnostic helper
- `getTestFileSuggestions` - Identifies common issues

### Scripts

- `scripts/fix-import-paths.sh` - Bulk import path fixes

## Next Steps

1. Run tests to identify specific "Expected 1 argument" errors
2. Fix mocks one file at a time
3. Run the import path fix script
4. Review and test all changes
5. Update ESLint rules to prevent future issues

