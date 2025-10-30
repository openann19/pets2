# EA Enhanced — Advanced Error Annihilator Guide

## 🎯 Overview

The **EA Enhanced** script is a comprehensive TypeScript codemod that automatically fixes multiple categories of React Native TypeScript errors in the PawfectMatch mobile app.

---

## 🚀 Quick Start

### Preview Changes (Safe - No Modifications)
```bash
pnpm ea:enhanced
```

### Apply Changes
```bash
pnpm ea:enhanced:write
```

### Verify Results
```bash
pnpm --dir apps/mobile tsc --noEmit
```

---

## 📋 What EA Enhanced Fixes

| Error Code | Description | Transformation | Impact |
|------------|-------------|----------------|--------|
| **TS2559** | Style array type issues | `style={[...]}` → `style={StyleSheet.flatten([...])}` | High |
| **TS4114** | Missing override modifiers | `componentDidMount()` → `override componentDidMount()` | Medium |
| **TS1484** | Type-only imports needed | `import { Type }` → `import type { Type }` | Medium |
| **TS2322** | SafeAreaView edges prop | `<SafeAreaView edges>` → `<SafeAreaView>` | Low |
| **TS2339** | Theme semantic references | `Theme.semantic.primary` → `Theme.colors.primary[500]` | Medium |
| **TS2339** | Ionicons glyphMap access | `Ionicons.glyphMap[x]` → `x as string` | Low |
| **TS2322** | fontWeight literal types | `fontWeight: 600` → `fontWeight: '600'` | Low |
| **TS17001** | Duplicate JSX attributes | Removes duplicate attributes | Low |
| **Missing Imports** | StyleSheet, ReactNode | Adds missing imports | Medium |

---

## 🔧 Current Implementation

### Script Location
- **File:** `scripts/ea-enhanced.ts`
- **Config:** `scripts/ea.config.ts`

### Features Implemented

#### ✅ 1. SafeAreaView Edges Removal (TS2322)
**Pattern:** Invalid `edges` prop on SafeAreaView  
**Fix:** Removes `edges` attribute from SafeAreaView components

```typescript
// Before
<SafeAreaView edges={['top']}>

// After
<SafeAreaView>
```

#### ✅ 2. Theme Semantic → Tokens (TS2339)
**Pattern:** Accessing deprecated `Theme.semantic.*` properties  
**Fix:** Replaces with proper `Theme.colors.*` structure

```typescript
// Before
Theme.semantic.primary

// After
Theme.colors.primary[500]
```

#### ✅ 3. Ionicons glyphMap Access (TS2339)
**Pattern:** Unsafe `Ionicons.glyphMap` type access  
**Fix:** Converts to string with type assertion

```typescript
// Before
name={Ionicons.glyphMap[iconName]}

// After
name={iconName as string}
```

#### ✅ 4. fontWeight Normalization (TS2322)
**Pattern:** Numeric fontWeight values  
**Fix:** Converts to string literals

```typescript
// Before
fontWeight: 600

// After
fontWeight: '600'
```

#### ✅ 5. Style Array Flattening (TS2559) ⭐ NEW
**Pattern:** Array passed directly to style prop  
**Fix:** Wraps with `StyleSheet.flatten()`

```typescript
// Before
style={[styles.base, styles.highlight, props.style]}

// After
style={StyleSheet.flatten([styles.base, styles.highlight, props.style])}
```

#### ✅ 6. Override Modifiers (TS4114) ⭐ NEW
**Pattern:** React lifecycle methods without `override` modifier  
**Fix:** Adds `override` keyword to lifecycle methods

```typescript
// Before
componentDidMount() {
  // ...
}

// After
override componentDidMount() {
  // ...
}
```

#### ✅ 7. Type-Only Imports (TS1484) ⭐ NEW
**Pattern:** Types imported without `type` keyword  
**Fix:** Adds `type` keyword to imports

```typescript
// Before
import { PetFormData } from '../types';

// After
import type { PetFormData } from '../types';
```

#### ✅ 8. Missing Module Imports ⭐ NEW
**Pattern:** Usage without proper import  
**Fix:** Adds missing imports (StyleSheet, ReactNode, etc.)

```typescript
// Automatically adds:
import { StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
```

#### ✅ 9. Duplicate Attributes Removal (TS17001) ⭐ NEW
**Pattern:** Multiple attributes with same name  
**Fix:** Removes duplicate attributes

```typescript
// Before
<View style={[]} style={[]}>

// After
<View style={[]}>
```

---

## 📊 Expected Impact

### Error Reduction Potential
- **Style array fixes (TS2559):** -40 to -60 errors
- **Override modifiers (TS4114):** -10 to -15 errors
- **Type imports (TS1484):** -5 to -10 errors
- **Theme semantic fixes:** -40 to -60 errors
- **SafeAreaView fixes:** -5 to -10 errors
- **Ionicons cleanup:** -10 to -20 errors
- **fontWeight normalization:** -5 to -10 errors
- **Missing imports:** -10 to -15 errors

**Total potential:** -125 to -190 errors (18-27% reduction)

---

## 🎓 How to Enhance EA Enhanced Further

### Step 1: Identify Error Patterns

Run TypeScript compiler to see current errors:
```bash
pnpm --dir apps/mobile tsc --noEmit 2>&1 | grep "error TS" | head -100
```

Analyze the error codes and patterns:
- **TS2769:** No overload matches this call
- **TS2554:** Expected X arguments, but got Y
- **TS2349:** This expression is not callable
- **TS2305:** Module has no exported member
- **TS2307:** Cannot find module
- **TS2532:** Object is possibly 'undefined'
- **TS18046:** 'variable' is of type 'unknown'

### Step 2: Add New Transformation Function

In `scripts/ea-enhanced.ts`, add a new transformation function:

```typescript
// Example: Fix TS2769 - No overload matches
function fixOverloadMismatches(file: SourceFile): boolean {
  let touched = false;
  
  // Find all function calls
  const callExpressions = file.getDescendantsOfKind(SyntaxKind.CallExpression);
  
  for (const call of callExpressions) {
    const expr = call.getExpression();
    
    // Detect specific patterns
    if (Node.isPropertyAccessExpression(expr)) {
      const name = expr.getName();
      const left = expr.getExpression();
      
      // Example: Fix Alert.alert() argument count issues
      if (expr.getText() === "Alert.alert") {
        const args = call.getArguments();
        
        // If 3+ args and Alert signature expects 1-2, fix it
        if (args.length >= 3) {
          // Custom transformation logic
          stats.alert_fixes++;
          touched = true;
        }
      }
    }
  }
  
  return touched;
}
```

### Step 3: Integrate into Main Transform

Add the new function to `transformFile()`:

```typescript
function transformFile(file: SourceFile): boolean {
  let touched = false;
  
  // ... existing transformations ...
  
  // Add new transformation
  touched = fixOverloadMismatches(file) || touched;
  
  return touched;
}
```

### Step 4: Add Statistics Tracking

Add to `stats` object at the top:

```typescript
const stats: FixStats = {
  // ... existing stats ...
  alert_fixes: 0,
};
```

### Step 5: Update Report

Add to report section:

```typescript
console.log(pad("Alert fixes") + stats.alert_fixes);
```

---

## 🎯 Advanced Patterns to Implement

### 1. TS2769 - No Overload Matches
**Pattern:** Function call signature mismatch  
**Strategy:** 
- Analyze argument types
- Add type assertions or spread arguments
- Add missing imports for better type resolution

### 2. TS2554 - Argument Count Mismatch
**Pattern:** Wrong number of arguments  
**Strategy:**
- Detect function signature from imports
- Remove extra arguments or add missing ones
- Use optional chaining for safe calls

### 3. TS2349 - Expression Not Callable
**Pattern:** Calling non-function values  
**Strategy:**
- Convert to arrow function wrapper
- Add null checks
- Fix type definitions

### 4. TS2305 - Module No Export
**Pattern:** Importing non-existent exports  
**Strategy:**
- Check if it's a default vs named export
- Fix import statement
- Create missing exports

### 5. TS2532 - Object Possibly Undefined
**Pattern:** Accessing properties on potentially undefined objects  
**Strategy:**
- Add optional chaining
- Add null checks
- Use default values

### 6. TS18046 - Type 'Unknown'
**Pattern:** Unknown type inference  
**Strategy:**
- Add type assertions
- Fix type definitions
- Add explicit type annotations

---

## 🧪 Testing Your Enhancements

### 1. Dry Run First
```bash
pnpm ea:enhanced
```

### 2. Check the Output
Look for:
- Number of files touched
- Fixes applied per category
- Total transformations

### 3. Apply and Verify
```bash
pnpm ea:enhanced:write
pnpm --dir apps/mobile tsc --noEmit
```

### 4. Check Error Reduction
```bash
# Before
pnpm --dir apps/mobile tsc --noEmit 2>&1 | grep -c "error TS"

# After
pnpm --dir apps/mobile tsc --noEmit 2>&1 | grep -c "error TS"
```

---

## 📝 Configuration

### Customize Theme Mappings

Edit `scripts/ea.config.ts`:

```typescript
export const EAConfig = {
  globs: ["apps/mobile/src/**/*.{ts,tsx}"],
  
  themeMap: {
    // Add custom mappings
    primary: "colors.primary[500]",
    secondary: "colors.secondary[500]",
    // ... more mappings
  },
  
  // Enable/disable features
  skipAnimatedImport: true,
  
  // NEW: Add custom options
  skipStyleFlattening: false,
  skipOverrideModifiers: false,
} as const;
```

---

## ⚠️ Safety Guidelines

### ✅ Safe Transformations
- Adding imports
- Removing invalid props
- Adding type modifiers
- Flattening style arrays

### ⚠️ Semi-Safe Transformations
- Adding override modifiers (verify inheritance)
- Changing type imports (check usage)
- Wrapping with StyleSheet.flatten (verify array format)

### ❌ Risky Transformations
- Automatically adding imports for runtime usage
- Changing function signatures
- Removing parameters
- Complex type assertions

---

## 🚀 Usage Workflow

```
1. pnpm ea:enhanced          # Preview changes
   ↓
2. Review output              # Check what will change
   ↓
3. pnpm ea:enhanced:write    # Apply changes
   ↓
4. pnpm --dir apps/mobile tsc --noEmit  # Verify
   ↓
5. git diff                  # Review changes
   ↓
6. git add . && git commit -m "refactor: apply EA Enhanced"
```

---

## 📈 Success Metrics

Track progress with:
```bash
# Error count tracking
echo $(date) $(pnpm --dir apps/mobile tsc --noEmit 2>&1 | grep -c "error TS") >> error_timeline.txt

# Error distribution
pnpm --dir apps/mobile tsc --noEmit 2>&1 | grep "error TS" | sed 's/.*error TS/TS/' | sed 's/:.*//' | sort | uniq -c | sort -rn
```

---

## 🆘 Troubleshooting

### "No files matched globs"
Check `scripts/ea.config.ts` - the globs path might be wrong

### "Changes look wrong"
```bash
# Revert
git checkout apps/mobile/src

# Run dry-run to inspect
pnpm ea:enhanced
```

### "TypeScript errors increased"
Some transformations may introduce new errors. Test incrementally and revert if needed.

---

## 🎉 Next Steps

1. **Run EA Enhanced** to fix current errors
2. **Monitor error reduction** using metrics
3. **Identify new patterns** in remaining errors
4. **Add new transformations** as needed
5. **Share improvements** with team

---

**TL;DR:** Run `pnpm ea:enhanced` to preview, then `pnpm ea:enhanced:write` to apply comprehensive error fixes!

