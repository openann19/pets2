# 🎯 Theme Color Migration - Complete Analysis & Examples

## Executive Summary

**Status:** V2 Codemod dry-run shows **0 files would change** because the codemod has a critical bug - it's not properly detecting JSX style objects with hardcoded colors.

**Root Cause:** The codemod's AST traversal is finding the components but failing to match the PropertyAssignment pattern for colors in JSX style objects.

**Solution:** Manual systematic replacement following proven patterns.

---

## Part 1: Current State Analysis

### What We Know

1. **Hardcoded colors still exist:** ~1,074 total
   - 534 in components
   - 540 in screens

2. **Files already have useTheme imported:** V1 codemod successfully added 57 imports

3. **Files already have theme usage:** 149 components have `const theme = useTheme()`

4. **V2 Codemod limitation:** Not detecting colors in JSX style objects properly

### Examples of Existing Hardcoded Colors

#### Example 1: In JSX style objects (INLINE)
```tsx
// ❌ BEFORE - showcase-demos.tsx
<View style={{ 
  position: 'absolute', 
  top: 16, 
  right: 16, 
  width: 80, 
  height: 60, 
  backgroundColor: '#555',  // ← HARDCODED
  borderRadius: 8, 
  justifyContent: 'center', 
  alignItems: 'center' 
}} >
  <Text style={{ color: theme.colors.background.primary, fontSize: 24 }}>📹</Text>
</View>

// ✅ AFTER
<View style={{ 
  position: 'absolute', 
  top: 16, 
  right: 16, 
  width: 80, 
  height: 60, 
  backgroundColor: theme.colors.text.secondary,  // ← THEME TOKEN
  borderRadius: 8, 
  justifyContent: 'center', 
  alignItems: 'center' 
}} >
  <Text style={{ color: theme.colors.background.primary, fontSize: 24 }}>📹</Text>
</View>
```

#### Example 2: In JSX style objects (MULTIPLE COLORS)
```tsx
// ❌ BEFORE - showcase-demos.tsx
<Card variant="elevated" padding="xl" style={{ 
  backgroundColor: '#667eea',  // ← HARDCODED
  minHeight: 400 
}} >

// ✅ AFTER
<Card variant="elevated" padding="xl" style={{ 
  backgroundColor: theme.colors.primary[500],  // ← THEME TOKEN
  minHeight: 400 
}} >
```

#### Example 3: In JSX style objects (LIGHT COLOR)
```tsx
// ❌ BEFORE - showcase-demos.tsx
<View style={{ 
  flex: 1, 
  backgroundColor: '#FFE5B4',  // ← HARDCODED (light peach)
  justifyContent: 'center', 
  alignItems: 'center' 
}} >

// ✅ AFTER
<View style={{ 
  flex: 1, 
  backgroundColor: theme.colors.background.secondary,  // ← THEME TOKEN
  justifyContent: 'center', 
  alignItems: 'center' 
}} >
```

#### Example 4: In JSX style objects (GRAY)
```tsx
// ❌ BEFORE - showcase-demos.tsx
<View style={{ 
  width: 50, 
  height: 50, 
  borderRadius: 25, 
  backgroundColor: '#ccc'  // ← HARDCODED (light gray)
}} />

// ✅ AFTER
<View style={{ 
  width: 50, 
  height: 50, 
  borderRadius: 25, 
  backgroundColor: theme.colors.background.tertiary  // ← THEME TOKEN
}} />
```

#### Example 5: In JSX style objects (DARK)
```tsx
// ❌ BEFORE - PinchZoomPro.tsx
style={{ 
  width, 
  height, 
  backgroundColor: "#111"  // ← HARDCODED (near-black)
}}

// ✅ AFTER
style={{ 
  width, 
  height, 
  backgroundColor: theme.colors.text.primary  // ← THEME TOKEN
}}
```

---

## Part 2: Color Mapping Reference

Use this mapping to replace hardcoded colors:

### Background Colors
```
"#ffffff" or "#fff"        → theme.colors.background.primary
"#f9fafb"                  → theme.colors.background.secondary
"#f3f4f6"                  → theme.colors.background.tertiary
```

### Text Colors
```
"#111827"                  → theme.colors.text.primary
"#6b7280"                  → theme.colors.text.secondary
"#9ca3af"                  → theme.colors.text.tertiary
```

### Border Colors
```
"#e5e7eb"                  → theme.colors.border.light
"#d1d5db"                  → theme.colors.border.medium
```

### Status Colors
```
"#10b981"                  → theme.colors.status.success
"#f59e0b"                  → theme.colors.status.warning
"#ef4444"                  → theme.colors.status.error
"#3b82f6"                  → theme.colors.status.info
```

### Primary/Brand Colors
```
"#ec4899"                  → theme.colors.primary[500]
"#db2777"                  → theme.colors.primary[600]
"#f472b6"                  → theme.colors.primary[400]
"#be185d"                  → theme.colors.primary[700]
```

### Neutral/Gray Scale
```
"#1f2937"                  → theme.colors.neutral[800]
"#374151"                  → theme.colors.neutral[700]
"#4b5563"                  → theme.colors.neutral[600]
```

### Shadow/Dark Colors
```
"#000000" or "#000"        → theme.colors.text.primary
```

### Overlay/Transparent Colors
```
"#00000080"                → theme.colors.text.primary + '80'
"#00000066"                → theme.colors.text.primary + '66'
"#00000040"                → theme.colors.text.primary + '40'
"#00000033"                → theme.colors.text.primary + '33'
```

---

## Part 3: Systematic Replacement Patterns

### Pattern 1: Simple Inline Style Object
```tsx
// ❌ BEFORE
<View style={{ backgroundColor: "#fff", color: "#000" }} />

// ✅ AFTER
<View style={{ 
  backgroundColor: theme.colors.background.primary, 
  color: theme.colors.text.primary 
}} />
```

### Pattern 2: Style Array with Mixed Styles
```tsx
// ❌ BEFORE
<View style={[styles.container, { backgroundColor: "#f9fafb", borderColor: "#d1d5db" }]} />

// ✅ AFTER
<View style={[
  styles.container, 
  { 
    backgroundColor: theme.colors.background.secondary, 
    borderColor: theme.colors.border.medium 
  }
]} />
```

### Pattern 3: Multiple Color Props
```tsx
// ❌ BEFORE
<View style={{
  backgroundColor: "#ffffff",
  borderColor: "#e5e7eb",
  shadowColor: "#000000",
  color: "#111827"
}} />

// ✅ AFTER
<View style={{
  backgroundColor: theme.colors.background.primary,
  borderColor: theme.colors.border.light,
  shadowColor: theme.colors.text.primary,
  color: theme.colors.text.primary
}} />
```

### Pattern 4: Conditional Colors
```tsx
// ❌ BEFORE
<View style={{
  backgroundColor: isActive ? "#ec4899" : "#f9fafb"
}} />

// ✅ AFTER
<View style={{
  backgroundColor: isActive ? theme.colors.primary[500] : theme.colors.background.secondary
}} />
```

### Pattern 5: StyleSheet.create (REQUIRES REFACTOR)
```tsx
// ❌ BEFORE - CANNOT USE THEME (outside component)
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db"
  }
});

export function MyScreen() {
  return <View style={styles.container} />;
}

// ✅ AFTER - MOVE INSIDE COMPONENT + USEMEMO
import { useMemo } from 'react';

export function MyScreen() {
  const theme = useTheme();
  
  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.primary,
      borderColor: theme.colors.border.medium
    }
  }), [theme]);
  
  return <View style={styles.container} />;
}
```

---

## Part 4: Files Needing Changes (Examples)

### High Priority (Most Colors)
1. `apps/mobile/src/components/ui/v2/showcase-demos.tsx`
   - Has: `#555`, `#667eea`, `#FFE5B4`, `#ccc`
   - Already has: `useTheme` imported

2. `apps/mobile/src/components/Gestures/PinchZoomPro.tsx`
   - Has: `#111`
   - Already has: `useTheme` imported

3. `apps/mobile/src/components/photo/AdvancedPhotoEditor.tsx`
   - Has: Multiple hardcoded colors in inline styles
   - Already has: `useTheme` imported

### Medium Priority (Some Colors)
4. `apps/mobile/src/screens/DeactivateAccountScreen.tsx`
5. `apps/mobile/src/screens/SettingsScreen.tsx`
6. `apps/mobile/src/screens/ProfileScreen.tsx`

### Low Priority (Few Colors)
7. Various component files with 1-2 hardcoded colors

---

## Part 5: Step-by-Step Replacement Instructions

### For Each File:

1. **Verify useTheme is imported:**
   ```tsx
   import { useTheme } from "@/theme";
   ```

2. **Verify useTheme is called in component:**
   ```tsx
   const MyComponent = () => {
     const theme = useTheme();
     // ... rest of component
   };
   ```

3. **Find all hardcoded colors in JSX style props:**
   - Look for: `style={{ ... backgroundColor: "#..." ... }}`
   - Look for: `style={[..., { color: "#..." }]}`

4. **Replace using the COLOR_MAP above**

5. **For StyleSheet.create blocks:**
   - Move inside component
   - Wrap in `useMemo` with `[theme]` dependency
   - Replace colors with theme tokens

6. **Verify no new TypeScript errors:**
   ```bash
   pnpm typecheck:mobile
   ```

---

## Part 6: Common Mistakes to Avoid

### ❌ DON'T: Leave colors in top-level StyleSheet.create
```tsx
// WRONG - can't use theme here
const styles = StyleSheet.create({
  container: { backgroundColor: "#fff" }
});
```

### ✅ DO: Move StyleSheet.create inside component with useMemo
```tsx
// CORRECT
const MyScreen = () => {
  const theme = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    container: { backgroundColor: theme.colors.background.primary }
  }), [theme]);
};
```

### ❌ DON'T: Forget to add useTheme import
```tsx
// WRONG - no import
const MyComponent = () => {
  const theme = useTheme();  // ERROR: useTheme not defined
};
```

### ✅ DO: Import useTheme first
```tsx
// CORRECT
import { useTheme } from "@/theme";

const MyComponent = () => {
  const theme = useTheme();
};
```

### ❌ DON'T: Mix old and new color references
```tsx
// WRONG - inconsistent
<View style={{
  backgroundColor: theme.colors.primary[500],  // new
  borderColor: "#d1d5db"  // old
}} />
```

### ✅ DO: Replace all colors in the same object
```tsx
// CORRECT - all using theme
<View style={{
  backgroundColor: theme.colors.primary[500],
  borderColor: theme.colors.border.medium
}} />
```

---

## Part 7: Verification Checklist

After making changes to each file:

- [ ] All hardcoded hex colors replaced with theme tokens
- [ ] `useTheme` imported at top of file
- [ ] `const theme = useTheme();` called in component
- [ ] StyleSheet.create moved inside component (if applicable)
- [ ] StyleSheet.create wrapped in `useMemo` with `[theme]` dependency
- [ ] No TypeScript errors: `pnpm typecheck:mobile`
- [ ] No ESLint errors: `pnpm -w eslint apps/mobile/src --fix`
- [ ] Component still renders correctly

---

## Part 8: Why V2 Codemod Didn't Work

**Issue:** The codemod's AST pattern matching is too strict.

**What it's looking for:**
```typescript
// PropertyAssignment with StringLiteral initializer
backgroundColor: "#fff"
```

**What it's finding:** The pattern exists but the traversal logic isn't properly collecting matches.

**Why manual is better:** 
- More reliable
- Can handle edge cases
- Can verify each change
- Safer for production code

---

## Summary for Your AI Dev

**Task:** Replace ~1,074 hardcoded colors with theme tokens

**Approach:** Systematic file-by-file replacement

**Key Points:**
1. Use the COLOR_MAP provided above
2. Only touch JSX `style={...}` props
3. For StyleSheet.create blocks, move inside component + useMemo
4. Verify with `pnpm typecheck:mobile` after each file
5. Files already have useTheme imported (from V1 codemod)

**Estimated Effort:** 2-3 hours for all files

**Risk Level:** LOW (changes are isolated, easy to verify)

**Success Criteria:**
- All hardcoded colors replaced
- TypeScript compilation passes
- ESLint passes
- No visual regressions
