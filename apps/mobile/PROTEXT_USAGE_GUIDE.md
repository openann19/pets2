# ProText Usage Guide

## GPU-Accelerated Typography for PawfectMatch Mobile

**ProText** provides pro-grade, GPU-accelerated text rendering using `@shopify/react-native-skia`. All effects run on the GPU pipeline for zero jank, with per-character animations and layered compositing.

---

## Installation & Setup

### 1. Package Already Installed ✅
```bash
# Already added to mobile app
@shopify/react-native-skia v2.3.7
```

### 2. Fonts Already Configured ✅
Inter fonts are bundled in `src/assets/fonts/`:
- `Inter-Black.ttf` (900 weight)
- `Inter-Bold.ttf` (700 weight)
- `Inter-SemiBold.ttf` (600 weight)
- `Inter-Medium.ttf` (500 weight)

Both `app.json` and `app.config.cjs` include font asset patterns.

### 3. TypeScript Alias Configured ✅
```typescript
// tsconfig.json includes:
"@/*": ["src/*"]
```

---

## Basic Usage

```tsx
import ProText from "@/components/typography/ProText";

<ProText
  fontSrc={require("@/assets/fonts/Inter-Bold.ttf")}
  variant="h2"
  effects={["gradient"]}
  gradientColors={["#ff7a7a", "#ffd36e"]}
>
  Premium Title
</ProText>
```

---

## API Reference

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fontSrc` | `number` | required | Font asset via `require()` |
| `variant` | `Variant` | `"body"` | Typography scale |
| `effects` | `Effect[]` | `["gradient"]` | Visual effects array |
| `color` | `string` | `"#111827"` | Base text color |
| `align` | `"auto" \| "left" \| "right" \| "center" \| "justify"` | `"auto"` | Text alignment |

### Animation Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animated` | `boolean` | `true` | Enable entrance animation |
| `animationType` | `AnimationType` | `"fadeInUp"` | Animation style |
| `animationDelay` | `number` | `0` | Delay in ms |
| `animationDuration` | `number` | `520` | Duration in ms |
| `split` | `boolean` | `false` | Per-character reveal |

### Effect Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gradientColors` | `string[]` | `["#00E1FF","#7C4DFF","#FF00E5"]` | Gradient color stops |
| `glowColor` | `string` | `"#B388FF"` | Neon glow color |
| `glassOpacity` | `number` | `0.16` | Glass sheen opacity |
| `shimmerIntensity` | `number` | `0.28` | Shimmer brightness (0-1) |
| `maxSplit` | `number` | `140` | Perf guard for split mode |
| `letterSpacing` | `number` | `0` | Letter spacing adjustment |

### Variant Scale

```typescript
type Variant =
  | "display"   // 48px, 900 weight
  | "h1"        // 32px, 700 weight
  | "h2"        // 28px, 700 weight
  | "h3"        // 24px, 700 weight
  | "h4"        // 20px, 600 weight
  | "h5"        // 18px, 600 weight
  | "h6"        // 16px, 600 weight
  | "title"     // 22px, 700 weight
  | "subtitle"  // 16px, 500 weight
  | "body"      // 16px, 400 weight
  | "bodyLarge" // 18px, 400 weight
  | "bodySmall" // 14px, 400 weight
  | "caption"   // 12px, 400 weight
  | "overline"  // 10px, 500 weight
  | "button"    // 16px, 600 weight
  | "label"     // 14px, 500 weight
```

### Effect Types

```typescript
type Effect =
  | "gradient"    // Linear gradient fill
  | "neon"        // Bright outer glow
  | "aberration"  // RGB split chromatic fringe
  | "glass"       // Top sheen highlight
  | "shimmer"     // Animated specular sweep
  | "shadow"      // Soft drop shadow
```

### Animation Types

```typescript
type AnimationType =
  | "none"
  | "fadeInUp"      // Fade + translate up
  | "scaleIn"       // Scale from 0.96 → 1
  | "slideInLeft"   // Slide from left
  | "slideInRight"  // Slide from right
  | "reveal"        // Per-char staggered (requires split=true)
```

---

## Curated Presets

### 1. Hero — Jaw-Dropping Entrance
```tsx
import { ProTextHero } from "@/components";

<ProTextHero fontSrc={require("@/assets/fonts/Inter-Black.ttf")}>
  Pawfect Match
</ProTextHero>
```
**Includes:** gradient + neon + aberration + shimmer + glass, split reveal

---

### 2. Premium — Clean Gradient Title
```tsx
import { ProTextPremium } from "@/components";

<ProTextPremium fontSrc={require("@/assets/fonts/Inter-Bold.ttf")}>
  Premium Features
</ProTextPremium>
```
**Includes:** gradient (sunset colors), fadeInUp animation

---

### 3. Neon — Bright Glow Effect
```tsx
import { ProTextNeon } from "@/components";

<ProTextNeon fontSrc={require("@/assets/fonts/Inter-Bold.ttf")}>
  Live Now
</ProTextNeon>
```
**Includes:** neon glow + gradient, scaleIn animation

---

### 4. Holographic — Rainbow Shimmer
```tsx
import { ProTextHolographic } from "@/components";

<ProTextHolographic fontSrc={require("@/assets/fonts/Inter-Bold.ttf")}>
  Exclusive
</ProTextHolographic>
```
**Includes:** gradient + shimmer + glass, slideInLeft animation

---

### 5. Subtle — Soft Shadow for Body
```tsx
import { ProTextSubtle } from "@/components";

<ProTextSubtle fontSrc={require("@/assets/fonts/Inter-Medium.ttf")}>
  Find loving homes for every pet.
</ProTextSubtle>
```
**Includes:** soft shadow, fadeInUp with delay

---

### 6. Glitch — RGB Aberration
```tsx
import { ProTextGlitch } from "@/components";

<ProTextGlitch fontSrc={require("@/assets/fonts/Inter-Bold.ttf")}>
  System Error
</ProTextGlitch>
```
**Includes:** aberration + gradient, split reveal

---

### 7. Gold — Luxury Metallic
```tsx
import { ProTextGold } from "@/components";

<ProTextGold fontSrc={require("@/assets/fonts/Inter-Bold.ttf")}>
  VIP Access
</ProTextGold>
```
**Includes:** gold gradient + shimmer, scaleIn animation

---

## Example Use Cases

### 1. Onboarding Hero
```tsx
<ProTextHero fontSrc={require("@/assets/fonts/Inter-Black.ttf")}>
  Welcome to
  Pawfect Match
</ProTextHero>
```

### 2. Premium Upsell
```tsx
<ProTextPremium fontSrc={require("@/assets/fonts/Inter-Bold.ttf")}>
  Unlock Premium Features
</ProTextPremium>

<ProTextSubtle fontSrc={require("@/assets/fonts/Inter-Medium.ttf")}>
  Get unlimited matches and advanced filters
</ProTextSubtle>
```

### 3. Real-time Notification
```tsx
<ProTextNeon fontSrc={require("@/assets/fonts/Inter-SemiBold.ttf")}>
  New Match!
</ProTextNeon>
```

### 4. Holographic Badge
```tsx
<ProTextHolographic fontSrc={require("@/assets/fonts/Inter-Bold.ttf")}>
  TOP MEMBER
</ProTextHolographic>
```

---

## Performance Considerations

### GPU Pipeline
- All effects render on GPU via Skia shaders
- Zero layout jank on main thread
- Per-character animations run on UI thread (60fps+)

### Perf Guards
- `maxSplit={140}` prevents excessive split-char rendering
- Reduce-motion aware (respects OS accessibility settings)
- Font loading is async and cached

### Best Practices
1. **Use split mode sparingly** — Reserve for hero headings (< 30 chars)
2. **Reuse font assets** — Load fonts once, reuse across components
3. **Limit shimmer** — CPU-light but consider battery on older devices
4. **Profile on device** — Test on mid-tier Android for real-world perf

---

## Accessibility

### Reduce Motion Support
- Animations respect `AccessibilityInfo.isReduceMotionEnabled()`
- Per-char reveals skip when motion is reduced
- Gradient/effects remain visible for visual appeal

### Color Contrast
- Ensure gradient colors meet WCAG AA contrast ratios
- Test with system-level dark mode
- Provide fallback plain text if fontSrc fails

---

## Fallback Behavior

If `fontSrc` is missing or Skia fails to load:
1. **Gradient effects** → Fallback to `MaskedView` gradient
2. **Other effects** → Render plain `<Text>` with base color
3. **Animations** → Skip gracefully

This ensures the app never crashes due to font loading issues.

---

## Migration from Existing Text

### Before
```tsx
import { Text } from "react-native";

<Text style={{ fontSize: 28, fontWeight: "bold", color: "#ec4899" }}>
  Title
</Text>
```

### After
```tsx
import ProText from "@/components/typography/ProText";

<ProText
  fontSrc={require("@/assets/fonts/Inter-Bold.ttf")}
  variant="h2"
  effects={["gradient"]}
  gradientColors={["#ec4899", "#f472b6"]}
>
  Title
</ProText>
```

---

## Token Bridge (Future Enhancement)

To pull directly from theme tokens:

```typescript
// Future: Auto-map theme.typography + theme.colors
<ProText
  variant="h2"
  tone="primary"  // → pulls from Theme.colors.primary
  // Auto-applies typography.h2 metrics
>
  Title
</ProText>
```

This requires extending `ProText` to accept `tone` and wire into `useTheme()`.

---

## Storybook Showcase (Future)

Create a dedicated screen to preview all presets:

```tsx
// apps/mobile/src/screens/ProTextShowcaseScreen.tsx
import { ProTextHero, ProTextPremium, /* ... */ } from "@/components";

export default function ProTextShowcaseScreen() {
  return (
    <ScrollView>
      <ProTextHero fontSrc={require("@/assets/fonts/Inter-Black.ttf")}>
        Hero Preset
      </ProTextHero>
      
      <ProTextPremium fontSrc={require("@/assets/fonts/Inter-Bold.ttf")}>
        Premium Preset
      </ProTextPremium>
      
      {/* ... all other presets */}
    </ScrollView>
  );
}
```

---

## Troubleshooting

### Fonts Not Loading
- Ensure `app.json` includes `"src/assets/fonts/*"` in `assetBundlePatterns`
- Rebuild app after adding new fonts: `expo prebuild --clean`
- Check Metro bundler logs for font resolution errors

### TypeScript Errors
- Verify `@/*` alias in `tsconfig.json` → `"@/*": ["src/*"]`
- Restart TS server if imports not resolving

### Performance Issues
- Reduce `maxSplit` if laggy on low-end devices
- Use fewer effects simultaneously (max 3 recommended)
- Profile with React DevTools Performance tab

### Peer Dependency Warnings
- `@shopify/react-native-skia` requires RN ≥0.78 (currently 0.72)
- `react-native-reanimated` ≥3.19.1 (currently 3.3.0)
- Document upgrade path in backlog

---

## Summary

ProText provides:
✅ GPU-accelerated Skia shaders  
✅ Per-character staggered reveals  
✅ 7 curated effect presets  
✅ Reduce-motion aware  
✅ Graceful fallback  
✅ Zero main-thread jank  

Use for hero headings, premium badges, and art-directed titles where visual impact matters.

For body text and lists, stick with the standard `Text` component for optimal bundle size.
