# Phase-3 Component Audit: Buttons, Chips & Badges

**Date:** 2025-01-27  
**Status:** In Progress  
**Goal:** Normalize buttons to canonical set, consolidate chips/badges to one spec

---

## Button Component Inventory

### Existing Button Components

| Component | Location | Variants | Status |
|-----------|----------|----------|--------|
| `Button` | `components/ui/Button.tsx` | primary, secondary, outline, ghost | ✅ Active |
| `BaseButton` | `components/buttons/BaseButton.tsx` | primary, secondary, ghost, outline | ✅ Active |
| `Button` (v2) | `components/ui/v2/Button.tsx` | primary, secondary, outline, danger, ghost | ✅ Active |
| `EliteButton` | `components/elite/buttons/EliteButton.tsx` | Multiple presets | ⚠️ Advanced |
| `InteractiveButton` | `components/InteractiveButton.tsx` | Multiple variants | ⚠️ Advanced |
| `AnimatedButton` | `components/AnimatedButton.tsx` | Multiple variants | ⚠️ Advanced |
| `GlassButton` | `components/glass/GlassButton.tsx` | Glass style | ⚠️ Specialized |

### Recommended Canonical Set

**Primary Button Component:** `components/ui/v2/Button.tsx` (recommended)

**Variants:**
- `primary` - Main CTA (uses `theme.colors.primary`)
- `secondary` - Secondary action (uses `theme.colors.secondary` or `surface`)
- `ghost` - Tertiary action (transparent, text only)
- `outline` - Outlined button (transparent bg, border)

**Sizes:**
- `sm` - 36px height
- `md` - 44px height (default)
- `lg` - 52px height

**States:**
- Normal, Pressed (scale 0.98), Disabled (opacity 0.5), Loading

**Motion:**
- Uses `Interactive` v2 wrapper for press feedback
- Haptic: `medium` for primary, `light` for others
- Respects reduced motion

---

## Badge Component Inventory

### Existing Badge Components

| Component | Location | Variants | Status |
|-----------|----------|----------|--------|
| `Badge` | `components/ui/v2/Badge.tsx` | primary, secondary, success, warning, danger, muted | ✅ Recommended |
| `TranscriptionBadge` | `components/chat/TranscriptionBadge.tsx` | Custom | ⚠️ Specialized |

### Recommended Badge Spec

**Primary Badge Component:** `components/ui/v2/Badge.tsx`

**Variants (using semantic tokens):**
- `success` → `theme.colors.success` + `theme.colors.onPrimary`
- `danger` → `theme.colors.danger` + `theme.colors.onPrimary`
- `info` → `theme.colors.info` + `theme.colors.onPrimary`
- `warning` → `theme.colors.warning` + `theme.colors.onPrimary`
- `primary` → `theme.colors.primary` + `theme.colors.onPrimary`
- `muted` → `theme.colors.border` + `theme.colors.onSurface`

**Sizes:**
- `sm` - 10px font, 6px horizontal padding
- `md` - 12px font, 8px horizontal padding (default)
- `lg` - 14px font, 12px horizontal padding

**Radii:**
- `theme.radii.full` (pill shape)

---

## Chip Component Status

**Finding:** No dedicated Chip component found.

**Recommendation:** Create `components/ui/v2/Chip.tsx` using Badge as base but with:
- Tappable (Pressable wrapper)
- Optional trailing icon
- Interactive states (hover/press)
- Uses same variant system as Badge

**Usage Pattern:**
```tsx
<Chip variant="success" onPress={handleFilter} trailingIcon="close">
  Filter Name
</Chip>
```

---

## Consolidation Plan

### Phase 1: Audit & Document (Current)
- [x] Inventory all button components
- [x] Inventory all badge components
- [x] Identify canonical set
- [ ] Document usage patterns

### Phase 2: Standardize
- [ ] Ensure all buttons use motion tokens (`motionDurations`, `motionScale`)
- [ ] Ensure all badges use semantic color tokens
- [ ] Create Chip component if needed
- [ ] Update `Interactive` v2 wrapper usage

### Phase 3: Migration
- [ ] Create migration guide
- [ ] Update screens to use canonical components
- [ ] Deprecate redundant components
- [ ] Update documentation

---

## Action Items

1. **Button Normalization**
   - [ ] Update `components/ui/v2/Button.tsx` to use `Interactive` v2 wrapper
   - [ ] Ensure all variants use semantic tokens
   - [ ] Add proper disabled/loading states
   - [ ] Document usage in component README

2. **Badge Consolidation**
   - [ ] Verify `components/ui/v2/Badge.tsx` uses semantic tokens ✅ (already done)
   - [ ] Ensure all badges use this component
   - [ ] Migrate specialized badges where possible

3. **Chip Creation**
   - [ ] Create `components/ui/v2/Chip.tsx` based on Badge
   - [ ] Add press feedback via `Interactive` v2
   - [ ] Add trailing icon support
   - [ ] Export from `components/ui/v2/index.ts`

---

## Success Metrics

- [ ] All buttons use canonical set (primary/secondary/ghost)
- [ ] All buttons use motion tokens (no magic numbers)
- [ ] All badges use semantic tokens (success/danger/info)
- [ ] Chip component created and documented
- [ ] Zero redundant button components in active use

---

**Next Steps:** Begin Phase 2 standardization work

