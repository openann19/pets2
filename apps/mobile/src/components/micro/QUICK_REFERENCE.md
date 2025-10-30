# Micro-UX Quick Reference

Copy-paste ready snippets for common patterns.

## Basic Replacements

### Button

```tsx
// ❌ Before
<TouchableOpacity onPress={handlePress} style={styles.btn}>
  <Text>Press Me</Text>
</TouchableOpacity>

// ✅ After
<MicroPressable onPress={handlePress} style={styles.btn}>
  <Text>Press Me</Text>
</MicroPressable>
```

### Switch

```tsx
// ❌ Before
<Switch value={enabled} onValueChange={setEnabled} />

// ✅ After
<HapticSwitch value={enabled} onValueChange={setEnabled} />
```

### Image Loading

```tsx
// ❌ Before
<Image source={{ uri }} />

// ✅ After with shimmer
<SmartImage source={{ uri }} useShimmer rounded={12} />
```

## Advanced Patterns

### Custom Ripple Color

```tsx
<MicroPressable
  onPress={handlePress}
  rippleColor="rgba(59,130,246,0.35)" // blue tint
  haptics={true}
>
  <YourContent />
</MicroPressable>
```

### Disable Haptics (Silent Mode)

```tsx
<MicroPressable
  onPress={handlePress}
  haptics={false} // Respects silent mode
>
  <YourContent />
</MicroPressable>
```

### Custom Scale

```tsx
<MicroPressable
  onPress={handlePress}
  scaleFrom={0.95} // More dramatic press
>
  <YourContent />
</MicroPressable>
```

### Switch with Disabled State

```tsx
<HapticSwitch
  value={enabled}
  onValueChange={setEnabled}
  disabled={isProcessing}
/>
```

### Shimmer Skeleton

```tsx
// For loading states
<View>
  <Shimmer
    width={200}
    height={20}
    radius={8}
  />
  <Shimmer
    width={150}
    height={20}
    radius={8}
  />
  <Shimmer
    width={180}
    height={120}
    radius={12}
  />
</View>
```

### Parallax Card

```tsx
// Wrap any card for 3D tilt effect
<ParallaxCard
  intensity={0.5}
  glow={false}
>
  <YourCard />
</ParallaxCard>
```

## Theme Integration

### Using Theme Colors

```tsx
<MicroPressable
  onPress={handlePress}
  rippleColor={`${Theme.colors.primary[500]}60`} // 60 = 38% opacity in hex
>
  <YourContent />
</MicroPressable>
```

### Status Colors

```tsx
// Success button
<MicroPressable
  onPress={handleDelete}
  rippleColor={`${Theme.colors.status.success}40`}
>
  <Text style={{ color: Theme.colors.status.success }}>Delete</Text>
</MicroPressable>
```

## Migration Checklist

Use this when migrating screens:

- [ ] Find all `<Switch` → Replace with `<HapticSwitch`
- [ ] Find all `<TouchableOpacity` → Replace with `<MicroPressable`
- [ ] Find all `<Pressable` → Replace with `<MicroPressable` (if custom ripples
      desired)
- [ ] Add `useShimmer` prop to `<Image` → Convert to `<SmartImage`
- [ ] Update string literals: `"Theme.colors.X"` → `{Theme.colors.X}`

## Common Pitfalls

### ❌ Don't

```tsx
// Type mismatch
<Shimmer width="100%" /> // String not allowed
```

### ✅ Do

```tsx
// Don't pass width for full width
<Shimmer /> // Defaults to full width
// Or specify numeric width
<Shimmer width={200} />
```

### ❌ Don't

```tsx
// String literal Theme reference
style={{ color: "Theme.colors.primary[500]" }}
```

### ✅ Do

```tsx
// Actual Theme value
style={{ color: Theme.colors.primary[500] }}
```

## Performance Tips

1. **Use Memo for Lists**

```tsx
const PressableItem = React.memo(({ item, onPress }) => (
  <MicroPressable onPress={() => onPress(item)}>
    <ItemContent item={item} />
  </MicroPressable>
));
```

2. **Disable Haptics in Long Lists**

```tsx
<MicroPressable haptics={false}>
  {' '}
  // Reduce CPU
  <ListItem />
</MicroPressable>
```

3. **Shimmer for Lists**

```tsx
{
  isLoading && (
    <>
      <Shimmer />
      <Shimmer />
      <Shimmer />
    </>
  );
}
```

## Accessibility

All components include proper accessibility:

- **MicroPressable**: Inherits accessibility from Pressable
- **HapticSwitch**: Standard Switch accessibility
- **SmartImage**: Image accessibility labels
- **ParallaxCard**: Card accessibility role

## Testing

Quick visual test checklist:

- [ ] Press any button → See ripple
- [ ] Press any button → Feel haptic
- [ ] Toggle switch → See pulse animation
- [ ] Load image → See shimmer
- [ ] Press card → See tilt effect

All good? Ship it! 🚀
