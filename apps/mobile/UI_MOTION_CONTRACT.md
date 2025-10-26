# 🎬 UI & MOTION CONTRACT

## Overview
This document enforces a strict UI & Motion system for the PawfectMatch mobile app to ensure consistency, accessibility, and performance.

## Core Principles

### 1. Non-Negotiables

✅ **No raw colors/fonts/spacings/blur/opacity in code** - Only use Theme.* tokens  
✅ **No ad-hoc animations** - Only use motion presets from `useMotion()`  
✅ **All screens wrap in `<ScreenShell>`** - Provides header, safe areas, gradients, spacing  
✅ **Haptics + A11y obey system settings** - Reduce motion, VoiceOver labels  
✅ **One interaction model for gestures** - react-native-gesture-handler + Reanimated  

### 2. Design Tokens (Single Source of Truth)

**Location**: `src/theme/unified-theme.ts`

Use ONLY these:
- **Colors**: `Theme.colors.primary|neutral|status...`
- **Typography**: `Theme.typography.fontSize`, `fontWeight`, `lineHeight`
- **Spacing**: `Theme.spacing.xs...4xl`
- **Radius**: `Theme.borderRadius.sm...full`
- **Shadows**: `Theme.shadows.depth.sm...xl`

**NEVER write**:
```tsx
// ❌ BAD
style={{ color: '#333', borderRadius: 8 }}

// ✅ GOOD
style={{ color: Theme.colors.text.primary, borderRadius: Theme.borderRadius.md }}
```

### 3. Motion System

**Location**: `src/ui/motion/useMotion.ts`

All animations use these presets:
- `enterUp` - Screen enter (24px up, fade in)
- `enterFade` - Simple fade
- `exitDown` - Screen exit (16px down, fade out)
- `cardStagger` - List animations (60ms stagger)
- `press` - Button press feedback (0.98 scale)
- `fabPop` - FAB appearance (0.8 scale)

**Usage**:
```tsx
const m = useMotion('cardStagger');
// m.duration, m.easing, m.stagger, etc.
```

### 4. ScreenShell

**Location**: `src/ui/layout/ScreenShell.tsx`

**Every screen MUST use**:
```tsx
<ScreenShell header={<AdvancedHeader {...HeaderConfigs.glass()} />}>
  <YourContent />
</ScreenShell>
```

Provides:
- Safe area handling
- Background gradients
- Consistent spacing
- Header integration

### 5. Components

**Always use**:
- `AdvancedHeader` - All headers
- `AdvancedCard` - All card surfaces
- `BouncePressable` - All pressable interactions
- `StaggerList` - All animated lists

### 6. Haptics

**Location**: `src/ui/haptics.ts`

**Usage Map**:
- `haptic.tap()` - Tab switches, buttons, minor selections
- `haptic.confirm()` - Like, send, confirm actions
- `haptic.super()` - Super-like, purchase, premium
- `haptic.error()` - Error states
- `haptic.success()` - Success states
- `haptic.selection()` - Picker changes, toggles

### 7. Accessibility

**Required on all touchables**:
- `accessibilityRole`
- `accessibilityLabel`
- Respect Reduce Motion

**VoiceOver**:
- Headers announce index/total ("Tab 2 of 4")
- All interactive elements have labels

### 8. Animation Recipes

#### List with Stagger
```tsx
<StaggerList
  data={items}
  renderItem={(item) => <AdvancedCard {...CardConfigs.glass()} />}
/>
```

#### Pressable with Animation
```tsx
<BouncePressable onPress={handlePress} hapticFeedback="confirm">
  <AdvancedCard />
</BouncePressable>
```

#### Screen Enter
```tsx
<Animated.View entering={FadeInDown.duration(220)}>
  <AdvancedCard />
</Animated.View>
```

### 9. Enforcement

#### ESLint Rules
```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      { 
        "selector": "Literal[value=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/]", 
        "message": "Use Theme.colors.* tokens" 
      }
    ]
  }
}
```

#### CI Checks
```bash
# Check for raw colors
grep -R "color: '#" apps/mobile/src | wc -l  # Must be 0

# Check for raw border radius
grep -R "borderRadius: [0-9]" apps/mobile/src | wc -l  # Must be 0
```

### 10. Starter Screen Template

**Location**: `src/screens/TemplateScreen.tsx`

Copy this structure for all new screens.

### 11. QA Checklist (Before Merging)

- [ ] Wrapped with ScreenShell
- [ ] Only Theme tokens used
- [ ] Motion preset applied
- [ ] Haptics via haptic util
- [ ] Reduce Motion checked
- [ ] A11y roles/labels set
- [ ] No layout jank on Android
- [ ] Storybook story added (if component)

## Quick Reference

```tsx
// Screen structure
<ScreenShell header={<AdvancedHeader {...HeaderConfigs.glass({ title })} />}>
  <Animated.View entering={FadeInDown.duration(220)}>
    <AdvancedCard {...CardConfigs.glass()} />
  </Animated.View>
  
  <StaggerList
    data={items}
    renderItem={(item) => (
      <BouncePressable onPress={handlePress} hapticFeedback="tap">
        <AdvancedCard {...CardConfigs.glass()} />
      </BouncePressable>
    )}
  />
</ScreenShell>
```

## Files Created

- `src/ui/motion/useMotion.ts` - Motion presets hook
- `src/ui/haptics.ts` - Haptic feedback utility
- `src/ui/layout/ScreenShell.tsx` - Screen wrapper
- `src/ui/lists/StaggerList.tsx` - Animated list
- `src/ui/pressables/BouncePressable.tsx` - Pressable with feedback
- `src/screens/TemplateScreen.tsx` - Starter template
- `src/ui/index.ts` - Exports

## Migration Guide

1. Replace hardcoded colors with `Theme.colors.*`
2. Wrap screens with `<ScreenShell>`
3. Use `useMotion()` for all animations
4. Use `haptic` utility for feedback
5. Add `BouncePressable` to interactions
6. Use `StaggerList` for lists

