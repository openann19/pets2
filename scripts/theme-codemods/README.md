# 🎨 Theme Codemods

Automated tools for migrating PawfectMatch mobile app to semantic theme tokens.

## 📋 Overview

This directory contains production-safe codemods to eliminate hardcoded colors and enforce semantic theme usage across the mobile codebase.

## 🚀 Available Codemods

### 1. `replaceHardcodedColors.ts`

**Purpose**: Automatically replace hardcoded hex colors with semantic theme tokens.

**Features**:
- ✅ AST-based parsing (ts-morph) - no regex risks
- ✅ Dry-run mode for safe testing
- ✅ Smart component detection (only modifies React components)
- ✅ Auto-injects `useTheme` hook and imports
- ✅ Comprehensive color mapping (20+ hex → semantic tokens)
- ✅ Statistics tracking and error reporting

## 🎯 Color Mappings

| Hex Code | Semantic Token | Usage |
|----------|---------------|-------|
| `#fff`, `#ffffff` | `theme.colors.surface` | Light backgrounds |
| `#000`, `#000000` | `theme.colors.onSurface` | Dark text |
| `#333333`, `#666666` | `theme.colors.onMuted` | Muted text |
| `#ff0000`, `#d32f2f` | `theme.colors.danger` | Error states |
| `#00ff00`, `#00c853` | `theme.colors.success` | Success states |
| `#ffa500`, `#ffd700` | `theme.colors.warning` | Warning states |
| `#3b82f6`, `#2196f3` | `theme.colors.primary` | Primary actions |
| `#f5f5f5` | `theme.colors.bg` | Alternative backgrounds |
| `#1a1a1a` | `theme.colors.surface` | Dark mode surface |

## 📝 Usage Instructions

### Phase 1: Dry Run (Recommended)
```bash
# Preview changes without modifying files
pnpm theme:codemod:dry-run
```

### Phase 2: Execute Codemod
```bash
# Apply changes to codebase
pnpm theme:codemod:apply
```

### Phase 3: Full Migration
```bash
# Apply codemod + fix lint issues + type check
pnpm theme:migrate
```

## 🛡️ Safety Features

### File Exclusions
The codemod automatically skips:
- ✅ Test files (`__tests__`, `*.test.*`, `*.spec.*`)
- ✅ Mock files (`__mocks__`)
- ✅ Node modules
- ✅ Design token definition files

### Scope Limitations
- ✅ Only modifies React components (detected by name or JSX content)
- ✅ Only replaces colors in style properties (backgroundColor, color, etc.)
- ✅ Leaves static StyleSheet blocks untouched (hooks can't run there)

### Error Handling
- ✅ Comprehensive error reporting
- ✅ Won't crash on edge cases
- ✅ Statistics tracking for verification

## 📊 Expected Output

### Dry Run Example:
```
============================================================
🔍 HARDCODED COLOR CODEMOD (DRY RUN)
============================================================

Target: /home/ben/Downloads/pets-fresh/apps/mobile/src
Mode: 🔒 DRY RUN - No files will be modified

Found 156 source files to scan

  Would replace: #fff → theme.colors.surface
    in: /components/ModernSwipeCard.tsx
    property: backgroundColor

  Would replace: #000 → theme.colors.onSurface
    in: /components/PremiumScreen.tsx
    property: color

✅ /components/ModernSwipeCard.tsx
✅ /components/PremiumScreen.tsx

============================================================
📊 CODEMOD SUMMARY
============================================================

Files scanned:        156
Files modified:       12
Colors replaced:      47
Imports added:        8
Hooks injected:       12
Errors encountered:   0

✅ DRY RUN COMPLETE - No files were modified

To apply changes, run without DRY_RUN:
  pnpm theme:codemod:apply
```

## 🔧 Manual Cleanup Required

After running the codemod, you'll need to manually fix:

### 1. Static StyleSheet Blocks
The codemod leaves static StyleSheet blocks untouched because hooks can't run there:

**Before:**
```tsx
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderColor: "#000",
  },
});
```

**After (Manual Fix):**
```tsx
function useStyles() {
  const theme = useTheme();
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.onSurface,
    },
  });
}

function Screen() {
  const styles = useStyles();
  return <View style={styles.container} />;
}
```

### 2. ESLint Violations
Run ESLint to catch remaining violations:
```bash
pnpm lint:fix
```

## 🧪 Testing

### Test the ESLint Rule:
```bash
cd eslint-local-rules
node no-hardcoded-colors.test.js
```

### Test Codemod on Single File:
```bash
# Create test file first
echo "const styles = { color: '#fff' };" > test-file.tsx

# Run codemod (it will skip non-component files)
DRY_RUN=true ts-node scripts/theme-codemods/replaceHardcodedColors.ts

# Clean up
rm test-file.tsx
```

## 🚨 Troubleshooting

### Common Issues:

1. **"ts-node command not found"**
   ```bash
   pnpm add -D ts-node
   ```

2. **"Cannot find module 'ts-morph'"**
   ```bash
   pnpm add -D ts-morph
   ```

3. **"Target dir not found"**
   - Ensure you're running from repository root
   - Check that `apps/mobile/src` exists

4. **TypeScript errors after codemod**
   ```bash
   pnpm type-check
   # Fix any remaining type issues manually
   ```

## 📈 Success Metrics

Track migration progress:
- **Before**: 50+ hardcoded colors
- **After**: 90% auto-replaced, 10% manual cleanup
- **Goal**: 100% semantic token usage

## 🔄 Rollback Plan

If issues arise:
```bash
# Revert all changes
git reset --hard HEAD~1

# Or revert specific files
git checkout HEAD~1 -- apps/mobile/src/components/ProblematicComponent.tsx
```

## 📚 Related Documentation

- [Theme Migration Guide](../../docs/THEME_MIGRATION.md)
- [ESLint Rules](../../eslint-local-rules/)
- [Semantic Theme Tokens](../../apps/mobile/src/theme/)

## 🤝 Contributing

To add new color mappings:
1. Update `COLOR_MAP` in `replaceHardcodedColors.ts`
2. Update the mapping table in this README
3. Add test cases to the ESLint rule tests
4. Test with dry-run before applying

---

**⚡ Ready to migrate!** Start with `pnpm theme:codemod:dry-run` to preview changes.
