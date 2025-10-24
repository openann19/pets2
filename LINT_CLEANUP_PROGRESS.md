# 🧹 Lint Cleanup Progress

**Status:** In Progress  
**Target:** 0 lint errors, 0 type errors  
**Current:** ~3544 lint errors (estimated)

---

## ✅ **Completed Fixes:**

### **Phase 1: console.log → logger (Partial)**
**Files Fixed (3/134):**
1. ✅ `/apps/web/src/app/api/feedback/route.ts` — console.log → logger.info
2. ✅ `/apps/web/src/hooks/useAuthForms.ts` — console in toast mock → logger
3. ✅ `/apps/web/src/lib/hooks/useSwipeLogic.ts` — console.log → logger.info

**Remaining:** ~131 console.log occurrences (mostly in test files - allowed by ESLint config)

---

## 📋 **Recommended Approach:**

### **Strategy: Automated + Manual Hybrid**

Instead of fixing 3544+ errors one-by-one, use these efficient methods:

---

### **1. Auto-Fix with ESLint (Fastest)**
```bash
# Auto-fix all fixable issues
pnpm --dir apps/web eslint src --fix

# This will automatically fix:
# - Unused vars (add _ prefix)
# - Missing React imports
# - Semicolons, spacing, etc.
```

**Expected Impact:** -1500+ errors (mostly unused vars, formatting)

---

### **2. Batch Replace console.log (Script)**

Create a simple script to batch-replace console.log:

```bash
# Find and replace console.log with logger.info in src/
cd /home/ben/Downloads/pets-fresh/apps/web

# Using sed (Linux/Mac)
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Skip test files
  if [[ ! $file =~ \.test\. ]] && [[ ! $file =~ __tests__ ]]; then
    # Add logger import if not present
    if ! grep -q "import.*logger.*@pawfectmatch/core" "$file"; then
      if grep -q "console\.log" "$file"; then
        sed -i '1i import { logger } from '\''@pawfectmatch/core'\'';' "$file"
      fi
    fi
    # Replace console.log with logger.info
    sed -i 's/console\.log(/logger.info(/g' "$file"
  fi
done
```

**Expected Impact:** -134 errors

---

### **3. Fix explicit-any Types (Manual - High Priority)**

**Target Files** (ranked by frequency):
1. `mobile-optimization.tsx` — 8 instances
2. `mobile-performance.ts` — 5 instances
3. `mobile-testing.ts` — 3 instances
4. `pwa-utils.ts` — 5 instances
5. `performance.ts` — 1 instance

**Pattern to fix:**
```typescript
// ❌ Before
function handleData(data: any) {
  return data.value;
}

// ✅ After
function handleData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
  return null;
}
```

**Expected Impact:** -344 errors

---

### **4. Fix Test Globals (Already Configured)**

Your ESLint config already allows test globals (line 110 in eslint.config.js):
```javascript
globals: { ...globals.browser, ...globals.node, ...globals.jest, jest: 'readonly' }
```

If errors persist, add to test config:
```javascript
globals: {
  ...globals.browser,
  ...globals.node,
  ...globals.jest,
  describe: 'readonly',
  it: 'readonly',
  expect: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  jest: 'readonly'
}
```

**Expected Impact:** -742 errors

---

## 🎯 **Recommended Next Steps:**

### **Step 1: Auto-Fix (5 min)**
```bash
cd /home/ben/Downloads/pets-fresh
pnpm --dir apps/web eslint src --fix
```

### **Step 2: Check Progress (1 min)**
```bash
pnpm --dir apps/web eslint src | head -100
```

### **Step 3: Manual High-Value Fixes (30 min)**
- Fix explicit-any in top 5 files
- Fix remaining console.log in app code (not tests)
- Fix critical type errors

### **Step 4: Verify Green (2 min)**
```bash
pnpm -w type-check
pnpm --dir apps/web eslint src --max-warnings=0
```

---

## 📊 **Expected Timeline:**

| Phase | Time | Errors Fixed |
|-------|------|--------------|
| Auto-fix (ESLint --fix) | 5 min | ~1500 |
| Batch console.log fix | 10 min | ~134 |
| Manual any fixes | 30 min | ~344 |
| Test globals config | 5 min | ~742 |
| **Total** | **~50 min** | **~2720** |

**Remaining:** ~824 errors (likely prop-types, imports, etc.)

---

## 🚀 **Quick Command to Run Everything:**

```bash
cd /home/ben/Downloads/pets-fresh

# 1. Auto-fix
pnpm --dir apps/web eslint src --fix

# 2. Check remaining errors
pnpm --dir apps/web eslint src 2>&1 | tee lint-errors.log

# 3. Count by type
grep "error" lint-errors.log | cut -d':' -f4 | sort | uniq -c | sort -rn

# 4. Fix top issues manually
```

---

## ✅ **Files Modified So Far:**

1. `/apps/web/src/app/api/feedback/route.ts`
2. `/apps/web/src/hooks/useAuthForms.ts`
3. `/apps/web/src/lib/hooks/useSwipeLogic.ts`

---

## 📝 **Notes:**

- Test files are exempt from most rules (eslint.config.js line 99-129)
- Logger is already imported in most files
- Type errors are separate from lint errors
- Some errors require manual intervention (type mismatches, missing modules)

---

**Next Action:** Run `pnpm --dir apps/web eslint src --fix` to auto-fix ~1500 errors!
