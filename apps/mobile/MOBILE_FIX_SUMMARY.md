# Mobile App Fix Summary

## Current Status

### Issues Identified

1. **TypeScript Errors: 367 instances of "Cannot find name 'theme'"**
   - Pattern: Styles defined outside components but reference `theme` variable
   - Files affected: Multiple screens (StoriesScreen, ManageSubscriptionScreen, MigrationExampleScreen, all admin screens)
   - **Fixed**: PremiumScreen.tsx, PremiumSuccessScreen.tsx, PremiumCancelScreen.tsx
   - **Remaining**: ~100+ screen files need the same fix

2. **Component Type Errors**
   - GlassContainer borderRadius type mismatches
   - BouncePressable Animated.View children type
   - BeforeAfterSlider gesture handler types
   - And more in UI components

3. **Import/Export Errors**
   - Missing exports in some components
   - Incorrect import names (useReducedMotion vs useReduceMotion)

4. **GDPR Compliance**
   - Articles 17 & 20 need implementation (confirmed in existing reports)

5. **Security Vulnerabilities**
   - 4 issues (3 high, 1 moderate) - already have package overrides

6. **Test Failures**
   - 39% test pass rate (721 passing, 1127 failing)

## Automated Fix Strategy

### For "Cannot find name 'theme'" Errors

Create a script to automatically fix the pattern where styles reference `theme` outside component scope.

**Pattern to fix:**
```typescript
// BEFORE (broken)
export default function MyScreen() {
  const theme = useTheme();
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bg, // ERROR: theme not in scope
  },
});

// AFTER (fixed)
export default function MyScreen() {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.bg, // WORKS: theme in scope
    },
  });
  
  return <View style={styles.container} />;
}
```

### Script Location
`apps/mobile/scripts/fix-theme-errors.sh`

## Files Requiring Manual Review

1. **StoriesScreen.tsx** - Complex styles, needs careful refactoring
2. **Admin screens** (8 files) - All have theme errors
3. **UI Components** - Type mismatches in v2 components
4. **MigrationExampleScreen.tsx** - Theme errors

## Implementation Steps

### Phase 1: Fix Theme Errors (High Priority)
1. Create automated script to fix theme scope issues
2. Run script on all affected files
3. Manually review complex files
4. Verify fix: `pnpm mobile:typecheck`

### Phase 2: Fix Component Type Errors (High Priority)
1. Fix GlassContainer borderRadius types
2. Fix BouncePressable type issues
3. Fix other UI component type mismatches
4. Run type check again

### Phase 3: GDPR Implementation (Critical)
1. Implement Article 17 (Delete account with grace period)
2. Implement Article 20 (Data export/download)
3. Add E2E tests
4. Update documentation

### Phase 4: Security & Tests
1. Verify security vulnerabilities are resolved
2. Update dependencies if needed
3. Fix failing tests
4. Improve test pass rate to 95%+

## Next Actions

1. Create automated fix script for theme errors
2. Review and fix component type errors  
3. Implement GDPR features
4. Verify and fix security issues
5. Improve test coverage and pass rate

## Estimated Time

- Phase 1 (Theme fixes): 2-3 hours
- Phase 2 (Component types): 1-2 hours  
- Phase 3 (GDPR): 4 hours
- Phase 4 (Security & tests): 2-3 hours
- **Total**: ~10-12 hours of focused work

