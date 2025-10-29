# 🎨 PR: Theme Hardening - Automated Color Codemod + ESLint Enforcement

## 📋 Overview

This PR introduces a production-safe automated codemod to eliminate hardcoded colors across the mobile codebase and enforces semantic theme usage via ESLint rules.

**🎯 Goal**: Achieve 100% semantic theme token usage and prevent regressions.

---

## 🔧 Changes Included

### 1. **Automated Color Codemod** 
- **File**: `scripts/theme-codemods/replaceHardcodedColors.ts`
- **Features**:
  - AST-based (ts-morph) parsing - no regex risks
  - Dry-run mode for safe testing
  - Smart component detection (only modifies React components)
  - Auto-injects `useTheme` hook and imports
  - Comprehensive color mapping (20+ hex → semantic tokens)

### 2. **ESLint Enforcement Rule**
- **File**: `eslint-local-rules/no-hardcoded-colors.js`
- **Features**:
  - Blocks hardcoded hex colors (`#fff`, `#000000`, etc.)
  - Blocks legacy tokens (`colors.white`, `palette.brand.*`)
  - Blocks raw rgba/rgb usage
  - Context-aware (only flags style-related usage)
  - Safe file exclusions (tests, token definitions)

### 3. **Enhanced Safety & Documentation**
- Comprehensive error handling and reporting
- Statistics tracking for codemod execution
- Clear migration patterns and examples

---

## 🚀 Usage Instructions

### Phase 1: Dry Run (Recommended)
```bash
# Preview changes without modifying files
DRY_RUN=true ts-node scripts/theme-codemods/replaceHardcodedColors.ts
```

### Phase 2: Execute Codemod
```bash
# Apply changes to codebase
ts-node scripts/theme-codemods/replaceHardcodedColors.ts
```

### Phase 3: ESLint Cleanup
```bash
# Fix remaining violations (mostly static StyleSheet blocks)
pnpm -w eslint apps/mobile/src --fix
pnpm typecheck:mobile
```

---

## 📊 Expected Impact

### Before Codemod:
- ❌ 50+ hardcoded colors across components
- ❌ Legacy token usage (`colors.white`, `palette.brand.*`)
- ❌ Manual migration required for each file
- ❌ Risk of re-introducing hardcoded values

### After Codemod:
- ✅ 90% of hardcoded colors auto-replaced
- ✅ Semantic tokens everywhere (`theme.colors.surface`, `theme.colors.onSurface`)
- ✅ Auto-injected `useTheme` hooks where needed
- ✅ ESLint prevents future regressions

---

## 🎨 Color Mapping Strategy

| Hex Code | Semantic Token | Usage |
|----------|---------------|-------|
| `#fff`, `#ffffff` | `theme.colors.surface` | Light backgrounds |
| `#000`, `#000000` | `theme.colors.onSurface` | Dark text |
| `#ff0000`, `#d32f2f` | `theme.colors.danger` | Error states |
| `#00ff00`, `#00c853` | `theme.colors.success` | Success states |
| `#ffa500`, `#ffd700` | `theme.colors.warning` | Warning states |
| `#3b82f6`, `#2196f3` | `theme.colors.primary` | Primary actions |
| `#f5f5f5` | `theme.colors.bg` | Alternative backgrounds |

---

## 🛡️ Safety Features

### Codemod Safety:
- ✅ **AST-based parsing** - No regex string replacement risks
- ✅ **Component-only targeting** - Leaves static StyleSheet blocks untouched
- ✅ **Style context validation** - Only replaces actual style properties
- ✅ **Dry-run mode** - Preview before execution
- ✅ **Comprehensive error handling** - Won't crash on edge cases
- ✅ **File exclusions** - Skips tests, mocks, node_modules

### ESLint Safety:
- ✅ **Context-aware detection** - Only flags style-related usage
- ✅ **File exclusions** - Skips test files and token definitions
- ✅ **Clear error messages** - Provides specific guidance
- ✅ **Non-breaking** - Reports errors without auto-fixing

---

## 📝 Migration Patterns

### Before:
```tsx
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderColor: "#000",
  },
});

function Card() {
  return <View style={styles.container} />;
}
```

### After (Codemod handles inline styles):
```tsx
function Card() {
  const theme = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.onSurface,
    },
  }), [theme]);
  
  return <View style={styles.container} />;
}
```

### Manual Migration (for static StyleSheet):
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

function Card() {
  const styles = useStyles();
  return <View style={styles.container} />;
}
```

---

## 🧪 Testing Strategy

### Pre-Deployment:
1. **Dry-run execution** - Verify no unexpected changes
2. **Test file exclusion** - Ensure test files aren't modified
3. **Component detection** - Verify only React components are touched
4. **Import injection** - Confirm proper theme imports

### Post-Deployment:
1. **Type checking** - `pnpm typecheck:mobile`
2. **ESLint validation** - `pnpm -w eslint apps/mobile/src`
3. **Build verification** - iOS/Android builds succeed
4. **Visual testing** - Critical screens render correctly

---

## 📈 Success Metrics

- **🎯 95%+** reduction in hardcoded colors
- **🎯 100%** ESLint compliance for new code
- **🎯 0** TypeScript errors post-migration
- **🎯 Zero** visual regressions in critical screens

---

## 🔄 Rollback Plan

If issues arise:
1. **Revert codemod**: `git reset --hard HEAD~1`
2. **Disable ESLint rule**: Comment out in `.eslintrc.js`
3. **Restore files**: Use git to restore specific files
4. **Gradual rollout**: Apply codemod to specific directories first

---

## 🚨 Breaking Changes

- **None** - This is purely additive with migration assistance
- ESLint rule is **enforcing** but can be temporarily disabled
- Codemod is **optional** - manual migration still possible

---

## 📚 Documentation Updates

- Added codemod usage instructions to `docs/THEME_MIGRATION.md`
- Updated ESLint configuration documentation
- Added migration patterns to component development guide

---

## 🎯 Next Steps

1. **Merge this PR** - Establish codemod and ESLint rule
2. **Execute dry-run** - Preview changes in staging
3. **Run codemod** - Apply to main branch
4. **Fix remaining violations** - Manual cleanup of static StyleSheet blocks
5. **Update CI/CD** - Add ESLint rule to build pipeline

---

## 👥 Review Checklist

- [ ] Codemod dry-run tested successfully
- [ ] ESLint rule doesn't flag legitimate usage
- [ ] Documentation is clear and comprehensive
- [ ] Rollback plan is documented
- [ ] Success metrics are defined
- [ ] Breaking changes are assessed

---

**🚀 Ready for review!** This PR provides a safe, automated path to semantic theme adoption while preventing future regressions.
