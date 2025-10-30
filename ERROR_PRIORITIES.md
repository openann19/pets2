# TypeScript Error Priorities for Manual Fix

## Top Priority Errors (67 total)

### 1. TS2322 - Type Not Assignable (67 errors)
**High impact, systematic fixes needed**

**Most Common Patterns:**

#### Pattern A: SafeAreaView edges prop
```typescript
// ❌ Before
<SafeAreaView edges={['top']}>

// ✅ After  
<SafeAreaView>
```

**Files to fix:**
- `src/components/Advanced/AdvancedHeader.tsx(448,7)`

---

#### Pattern B: Complex style objects
```typescript
// ❌ Before
style={{ transform: [...], opacity: value }}

// ✅ After
style={StyleSheet.flatten([{ transform: [...] }, { opacity: value }])}
```

**Files to fix:**
- `src/components/ImmersiveCard.tsx(270,9)`
- `src/components/chat/MessageItem.tsx` (multiple lines)

---

#### Pattern C: String type mismatches
```typescript
// ❌ Before
variant="holographic"

// ✅ After
variant="primary" // or remove if not supported
```

**Files to fix:**
- `src/components/buttons/EliteButton.tsx(167,7)`
- `src/components/containers/FXContainer.tsx(242,7)`

---

### 2. TS2769 - No Overload Matches (31 errors)
**Function signature mismatches**

**Common causes:**
- Wrong number of arguments
- Wrong argument types
- Missing imports

**Files with most errors:**
- `src/components/GlowShadowSystem.tsx`
- `src/components/HolographicEffects.tsx`
- `src/components/ai/PetInfoForm.tsx` (4 errors)
- `src/components/create-pet/PetBasicInfoSection.tsx` (3 errors)

---

### 3. TS2304 - Cannot Find Name (31 errors)
**Missing variables/constants**

#### Pattern A: Missing imports from design-tokens
```typescript
// ❌ Before
const color = tokens.primary;

// ✅ After
import { tokens } from '@pawfectmatch/design-tokens';
const color = tokens.primary;
```

**Files to fix:**
- `src/components/chat/TypingIndicator.tsx(109,15)`
- `src/components/glass/configs/index.ts` (BLUR_CONFIGS, etc.)

#### Pattern B: Missing variable definitions
```typescript
// ❌ Before
if (transactionStatusFilter) { ... }

// ✅ After
const [transactionStatusFilter, setTransactionStatusFilter] = useState<string>();
// or remove if unused
```

**Files to fix:**
- `src/hooks/screens/useAdminBillingScreen.ts` (multiple)
- `src/hooks/screens/useAdminSecurityScreen.ts` (multiple)
- `src/hooks/screens/useAdminUploadsScreen.ts` (multiple)

---

## Quick Wins (Easy Manual Fixes)

### 1. Import Missing Dependencies
**Estimated fix time:** 5-10 minutes
- Add missing imports at file tops
- Fix TS2304 errors

### 2. Remove Invalid Props
**Estimated fix time:** 5 minutes
- Remove `edges` prop from SafeAreaView
- Fix TS2322 for SafeAreaView

### 3. Fix Variant Types
**Estimated fix time:** 10 minutes
- Remove unsupported variants like "holographic"
- Use supported variants: "primary", "secondary", "glass", "glow"

### 4. Wrap Complex Styles
**Estimated fix time:** 15-20 minutes
- Use `StyleSheet.flatten()` for complex style arrays
- Fix TS2322 for complex style objects

---

## Prioritized File List

Start with highest-impact files:

1. **src/components/Advanced/AdvancedHeader.tsx** (TS2322)
   - Remove `edges` prop (1 line fix)

2. **src/components/buttons/EliteButton.tsx** (TS2322, TS2769)
   - Fix "holographic" variant
   - Fix overload matches

3. **src/components/ImmersiveCard.tsx** (TS2322, TS2769)
   - Fix style object issues
   - Use StyleSheet.flatten

4. **src/components/ai/PetInfoForm.tsx** (TS2322, TS2769)
   - Fix ColorValue assignments (4 errors)
   - Fix overload matches (4 errors)

5. **src/hooks/screens/useAdminBillingScreen.ts** (TS2304)
   - Add missing state variables (5 errors)

6. **src/components/glass/configs/index.ts** (TS2304)
   - Add missing constant definitions (4 errors)

---

## Expected Impact

- **TS2322 fixes:** -30 to -40 errors (SafeAreaView + variant fixes)
- **TS2304 fixes:** -25 to -30 errors (imports + variables)
- **TS2769 fixes:** -20 to -30 errors (function signatures)

**Total expected reduction: 75-100 errors → Down to ~220-240 errors**

---

## Commands to Check Progress

```bash
# See current error count
cd apps/mobile && pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l

# See error distribution
pnpm tsc --noEmit 2>&1 | grep "error TS" | sed 's/.*error TS/TS/' | sed 's/:.*//' | sort | uniq -c | sort -rn

# Focus on specific file
pnpm tsc --noEmit 2>&1 | grep "src/components/AdvancedHeader.tsx"
```

