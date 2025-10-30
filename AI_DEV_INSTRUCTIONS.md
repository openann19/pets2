# 🎯 AI Developer Instructions - Theme Color Migration

## Quick Summary

**Task:** Replace ~1,074 hardcoded hex colors with semantic theme tokens across the mobile codebase.

**Status:** V2 Codemod dry-run showed 0 files would change (codemod has AST matching bug). Manual replacement required.

**Approach:** Systematic file-by-file replacement using proven patterns.

**Estimated Time:** 2-3 hours

**Risk Level:** LOW (isolated changes, easy to verify)

---

## What Needs to Be Changed

### Current State
- **534 hardcoded colors** in `/apps/mobile/src/components/`
- **540 hardcoded colors** in `/apps/mobile/src/screens/`
- **Total: 1,074 colors** to replace
- **Good news:** 57 files already have `useTheme` imported (from V1 codemod)
- **Good news:** 149 components already have `const theme = useTheme();` called

### What You're Replacing

All hardcoded hex colors in JSX `style={...}` props:

```tsx
// ❌ BEFORE
<View style={{ backgroundColor: "#fff", color: "#000" }} />

// ✅ AFTER  
<View style={{ 
  backgroundColor: theme.colors.background.primary,
  color: theme.colors.text.primary
}} />
```

---

## Color Mapping (Copy This)

Replace every hardcoded color using this exact mapping:

```
BACKGROUND COLORS:
"#ffffff" or "#fff"        → theme.colors.background.primary
"#f9fafb"                  → theme.colors.background.secondary
"#f3f4f6"                  → theme.colors.background.tertiary

TEXT COLORS:
"#111827"                  → theme.colors.text.primary
"#6b7280"                  → theme.colors.text.secondary
"#9ca3af"                  → theme.colors.text.tertiary

BORDER COLORS:
"#e5e7eb"                  → theme.colors.border.light
"#d1d5db"                  → theme.colors.border.medium

STATUS COLORS:
"#10b981"                  → theme.colors.status.success
"#f59e0b"                  → theme.colors.status.warning
"#ef4444"                  → theme.colors.status.error
"#3b82f6"                  → theme.colors.status.info

PRIMARY/BRAND COLORS:
"#ec4899"                  → theme.colors.primary[500]
"#db2777"                  → theme.colors.primary[600]
"#f472b6"                  → theme.colors.primary[400]
"#be185d"                  → theme.colors.primary[700]

NEUTRAL/GRAY SCALE:
"#1f2937"                  → theme.colors.neutral[800]
"#374151"                  → theme.colors.neutral[700]
"#4b5563"                  → theme.colors.neutral[600]

DARK/SHADOW COLORS:
"#000000" or "#000"        → theme.colors.text.primary

OVERLAY/TRANSPARENT:
"#00000080"                → theme.colors.text.primary + '80'
"#00000066"                → theme.colors.text.primary + '66'
"#00000040"                → theme.colors.text.primary + '40'
"#00000033"                → theme.colors.text.primary + '33'
```

---

## Real Examples from Codebase

### Example 1: Simple Color Replacement
**File:** `apps/mobile/src/components/ui/v2/showcase-demos.tsx`

```tsx
// ❌ BEFORE
<View style={{ 
  position: 'absolute', 
  backgroundColor: '#555',
  borderRadius: 8
}} />

// ✅ AFTER
<View style={{ 
  position: 'absolute', 
  backgroundColor: theme.colors.text.secondary,
  borderRadius: 8
}} />
```

### Example 2: Multiple Colors
**File:** `apps/mobile/src/components/ui/v2/showcase-demos.tsx`

```tsx
// ❌ BEFORE
<Card style={{ 
  backgroundColor: '#667eea',
  minHeight: 400 
}} />

// ✅ AFTER
<Card style={{ 
  backgroundColor: theme.colors.primary[500],
  minHeight: 400 
}} />
```

### Example 3: Light Background
**File:** `apps/mobile/src/components/ui/v2/showcase-demos.tsx`

```tsx
// ❌ BEFORE
<View style={{ 
  flex: 1, 
  backgroundColor: '#FFE5B4'
}} />

// ✅ AFTER
<View style={{ 
  flex: 1, 
  backgroundColor: theme.colors.background.secondary
}} />
```

### Example 4: Gray Color
**File:** `apps/mobile/src/components/ui/v2/showcase-demos.tsx`

```tsx
// ❌ BEFORE
<View style={{ 
  width: 50, 
  backgroundColor: '#ccc'
}} />

// ✅ AFTER
<View style={{ 
  width: 50, 
  backgroundColor: theme.colors.background.tertiary
}} />
```

### Example 5: Dark Color
**File:** `apps/mobile/src/components/Gestures/PinchZoomPro.tsx`

```tsx
// ❌ BEFORE
style={{ 
  backgroundColor: "#111"
}}

// ✅ AFTER
style={{ 
  backgroundColor: theme.colors.text.primary
}}
```

### Example 6: Style Arrays
**File:** Any file with style arrays

```tsx
// ❌ BEFORE
<View style={[
  styles.container, 
  { backgroundColor: "#f9fafb", borderColor: "#d1d5db" }
]} />

// ✅ AFTER
<View style={[
  styles.container, 
  { 
    backgroundColor: theme.colors.background.secondary, 
    borderColor: theme.colors.border.medium 
  }
]} />
```

### Example 7: Conditional Colors
**File:** Any file with ternary operators

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

### Example 8: StyleSheet.create (SPECIAL CASE)
**File:** Any file with top-level StyleSheet.create

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

## Step-by-Step Process

### For Each File:

1. **Verify useTheme is imported:**
   ```tsx
   import { useTheme } from "@/theme";
   ```
   If missing, add it.

2. **Verify useTheme is called in component:**
   ```tsx
   const MyComponent = () => {
     const theme = useTheme();
     // ... rest of component
   };
   ```
   If missing, add it as first line in component body.

3. **Find all hardcoded colors in JSX style props:**
   - Search for: `style={{ ... "#` (inline objects)
   - Search for: `style={[ ... "#` (arrays)

4. **Replace using COLOR_MAP above**

5. **For StyleSheet.create blocks:**
   - Move inside component
   - Wrap in `useMemo` with `[theme]` dependency
   - Replace colors with theme tokens

6. **Verify no TypeScript errors:**
   ```bash
   pnpm typecheck:mobile
   ```

---

## Common Mistakes to Avoid

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

## Files to Start With (Priority Order)

### High Priority (Most Colors)
1. `apps/mobile/src/components/ui/v2/showcase-demos.tsx`
2. `apps/mobile/src/components/Gestures/PinchZoomPro.tsx`
3. `apps/mobile/src/components/photo/AdvancedPhotoEditor.tsx`

### Medium Priority
4. `apps/mobile/src/screens/DeactivateAccountScreen.tsx`
5. `apps/mobile/src/screens/SettingsScreen.tsx`
6. `apps/mobile/src/screens/ProfileScreen.tsx`

### Then Continue With Remaining Files
- Use grep to find files with hardcoded colors:
  ```bash
  grep -r "style={{.*#[0-9a-fA-F]" apps/mobile/src/components/ --include="*.tsx"
  grep -r "style={{.*#[0-9a-fA-F]" apps/mobile/src/screens/ --include="*.tsx"
  ```

---

## Verification Checklist

After each file:

- [ ] All hardcoded hex colors replaced with theme tokens
- [ ] `useTheme` imported at top of file
- [ ] `const theme = useTheme();` called in component
- [ ] StyleSheet.create moved inside component (if applicable)
- [ ] StyleSheet.create wrapped in `useMemo` with `[theme]` dependency
- [ ] No TypeScript errors: `pnpm typecheck:mobile`
- [ ] No ESLint errors: `pnpm -w eslint apps/mobile/src --fix`
- [ ] Component still renders correctly

---

## Testing After Changes

```bash
# Check TypeScript compilation
pnpm typecheck:mobile

# Check ESLint
pnpm -w eslint apps/mobile/src --fix

# Run tests (if available)
pnpm test:mobile
```

---

## Success Criteria

✅ All hardcoded colors replaced with theme tokens
✅ TypeScript compilation passes
✅ ESLint passes
✅ No visual regressions
✅ Components render correctly

---

## Additional Resources

- **Full Analysis:** See `THEME_MIGRATION_ANALYSIS.md` for comprehensive examples
- **Recovery Plan:** See `CODEMOD_V2_RECOVERY_PLAN.md` for context on why manual approach
- **Color Map:** See COLOR_MAP section above for all replacements

---

## Questions?

If you encounter a color not in the mapping, check:
1. Is it a light gray? → `theme.colors.background.tertiary`
2. Is it a dark gray? → `theme.colors.text.secondary`
3. Is it a brand color? → Check `theme.colors.primary[*]`
4. Is it a status color? → Check `theme.colors.status.*`

When in doubt, use the closest semantic match and verify visually.
