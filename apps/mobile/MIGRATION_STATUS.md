# 🚀 UI & MOTION CONTRACT - Migration Status

## Overview
This document tracks the migration of all screens to use the new UI & Motion Contract system.

## Migration Strategy

### Phase 1: Core Infrastructure ✅ COMPLETE
- [x] Created `useMotion` hook with presets
- [x] Created `haptic` utility
- [x] Created `ScreenShell` component
- [x] Created `StaggerList` component
- [x] Created `BouncePressable` component
- [x] Updated `AdvancedHeader` to use Theme tokens
- [x] Updated `AdvancedCard` to use Theme tokens
- [x] Added ESLint rules
- [x] Added CI checks
- [x] Created documentation
- [x] Created starter template

### Phase 2: Critical Screens (In Progress)

#### High Priority (Must Migrate)
- [ ] `HomeScreen.tsx` - Main landing screen
- [ ] `MatchesScreen.tsx` - Core feature
- [ ] `SettingsScreen.tsx` - User settings
- [ ] `ProfileScreen.tsx` - User profile
- [ ] `SwipeScreen.tsx` - Core feature
- [ ] `ChatScreen.tsx` - Messaging

#### Medium Priority
- [ ] `CreatePetScreen.tsx` - Pet creation
- [ ] `EditProfileScreen.tsx` - Profile editing
- [ ] `MyPetsScreen.tsx` - Pet management
- [ ] `MapScreen.tsx` - Map view
- [ ] `PremiumScreen.tsx` - Premium features

#### Low Priority
- [ ] Admin screens (all)
- [ ] Onboarding screens (all)
- [ ] Utility screens (Forgot Password, etc.)

### Phase 3: Batch Migration (Automated)

#### Before Migration
Check the following:
1. Open the screen file
2. Look for hardcoded colors (`#...`)
3. Look for raw spacing numbers
4. Look for custom animations

#### Migration Pattern

**Replace**:
```tsx
// OLD
<SafeAreaView style={styles.container}>
  <View style={{ padding: 16, backgroundColor: '#fff' }}>
    {/* content */}
  </View>
</SafeAreaView>
```

**With**:
```tsx
// NEW
<ScreenShell header={<AdvancedHeader {...HeaderConfigs.glass({ title: 'Screen' })} />}>
  <View style={{ padding: Theme.spacing.md, backgroundColor: Theme.colors.neutral[0] }}>
    {/* content */}
  </View>
</ScreenShell>
```

### Phase 4: Testing & Validation

- [ ] Run `pnpm check:theme-tokens`
- [ ] Run ESLint
- [ ] Run tests
- [ ] Visual regression testing
- [ ] A11y testing
- [ ] Performance testing

## Migration Checklist Per Screen

For each screen being migrated:

- [ ] Wrap with `ScreenShell`
- [ ] Add `AdvancedHeader` with config
- [ ] Replace hardcoded colors with `Theme.colors.*`
- [ ] Replace raw spacing with `Theme.spacing.*`
- [ ] Replace raw radius with `Theme.borderRadius.*`
- [ ] Use `useMotion()` for animations
- [ ] Use `haptic` utility for feedback
- [ ] Use `BouncePressable` for interactions
- [ ] Use `StaggerList` for lists
- [ ] Add accessibility roles/labels
- [ ] Test Reduce Motion
- [ ] Verify no linter errors
- [ ] Update documentation

## Quick Reference

### Import
```tsx
import { ScreenShell } from '@/ui/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '@/components/Advanced/AdvancedHeader';
import { AdvancedCard, CardConfigs } from '@/components/Advanced/AdvancedCard';
import { useMotion } from '@/ui/motion/useMotion';
import { haptic } from '@/ui/haptics';
import { Theme } from '@/theme/unified-theme';
import { StaggerList } from '@/ui/lists/StaggerList';
import { BouncePressable } from '@/ui/pressables/BouncePressable';
```

### Structure
```tsx
export default function MyScreen() {
  return (
    <ScreenShell header={<AdvancedHeader {...HeaderConfigs.glass({ title: 'My Screen' })} />}>
      <Animated.View entering={FadeInDown.duration(220)}>
        <StaggerList
          data={items}
          renderItem={(item) => (
            <BouncePressable onPress={handlePress} hapticFeedback="tap">
              <AdvancedCard {...CardConfigs.glass()} />
            </BouncePressable>
          )}
        />
      </Animated.View>
    </ScreenShell>
  );
}
```

## Status

**Phase 1**: ✅ Complete
**Phase 2**: 🔄 In Progress
**Phase 3**: ⏳ Pending
**Phase 4**: ⏳ Pending

## Files Modified

### Core System
- `src/ui/motion/useMotion.ts`
- `src/ui/haptics.ts`
- `src/ui/layout/ScreenShell.tsx`
- `src/ui/lists/StaggerList.tsx`
- `src/ui/pressables/BouncePressable.tsx`
- `src/ui/index.ts`
- `src/components/Advanced/AdvancedHeader.tsx`
- `src/components/Advanced/AdvancedCard.tsx`
- `eslint.config.cjs`
- `scripts/check-theme-tokens.sh`
- `package.json`
- `src/screens/TemplateScreen.tsx`

### Documentation
- `UI_MOTION_CONTRACT.md`
- `UI_MOTION_IMPLEMENTATION.md`
- `UI_MOTION_CONTRACT_README.md`
- `MIGRATION_STATUS.md` (this file)

## Next Actions

1. Start migrating critical screens
2. Test each migration thoroughly
3. Document any issues
4. Update this status as screens are migrated

