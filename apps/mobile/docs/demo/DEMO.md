# PawfectMatch Mobile Demo

This demo showcases offline fixtures, adapters, and a curated DemoShowcase screen to explore key app experiences without a backend.

## Prerequisites

- Node, pnpm, Expo tooling installed
- Android emulator or iOS simulator/device configured

## Start the Demo (Dev Client)

```bash
cd apps/mobile
pnpm demo
```

This sets `EXPO_PUBLIC_DEMO_MODE=true` and launches the app. In the app:

- Open Settings → Support → Demo Showcase
- Or deep link directly: `pawfectmatch://demo-showcase`

## Deep Links

See `docs/demo/deeplinks.md` for full mappings. Quick examples:

- Open Demo Showcase: `pawfectmatch://demo-showcase`
- Open Chat thread: `pawfectmatch://chat/match-1/Buddy`
- **Open Home**: `pawfectmatch://home`
- **Open Stories**: `pawfectmatch://stories`

## What's Included

- Offline fixtures for pets, matches, liked-you, chat, adoption, map pins, **stories**, and **home stats/recent activity**
- Demo adapters for native and web (MSW) paths
- `DemoModeProvider` to expose a simple `enabled` flag
- `DemoShowcase` screen: highlights matches, liked-you, chat snapshot, adoption cards, map pins, and CTA buttons
- **HomeScreen** with 6 quick actions, recent activity card, and premium section (fully functional in demo mode)
- **StoriesScreen** with gesture controls, progress bars, and real-time view tracking (offline fixtures)

## Build Demo Artifacts

### Android APK (Local Build)

```bash
cd apps/mobile
pnpm demo:apk
```

The APK will be saved to `apps/mobile/dist/PawfectMatch-Demo-preview.apk`

### Android AAB (Local Build)

```bash
cd apps/mobile
pnpm demo:aab
```

The AAB will be saved to `apps/mobile/dist/PawfectMatch-Demo-production.aab`

### Android APK (Cloud Build)

```bash
cd apps/mobile
pnpm demo:android:apk
```

### Android AAB (Cloud Build)

```bash
cd apps/mobile
pnpm demo:android:aab
```

### iOS (Cloud Build)

```bash
pnpm demo:ios
```

Note: EAS cloud builds store artifacts remotely; see your Expo account dashboard for download links. Local builds require EAS CLI and are saved to `apps/mobile/dist/`.

## Testing Deep Links

See `docs/demo/deeplinks.md` for full ADB commands. Quick examples:

```bash
# Install Demo APK
adb install -r apps/mobile/dist/PawfectMatch-Demo-preview.apk

# Open Home
adb shell am start -W -a android.intent.action.VIEW -d "pawfectmatch://home"

# Open Stories
adb shell am start -W -a android.intent.action.VIEW -d "pawfectmatch://stories"
```

## Troubleshooting

- If you see a banner saying demo mode is disabled, ensure `EXPO_PUBLIC_DEMO_MODE=true` is set (or use `pnpm demo`).
- If navigation can't find the screen, verify the route `DemoShowcase` exists in `App.tsx` and `navigation/types.ts` and deep link config in `navigation/linking.ts`.
- Clear caches: `pnpm clean` and restart.
