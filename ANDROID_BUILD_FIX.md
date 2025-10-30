# 🔧 Android Build Fix

## Issues Identified

1. ✅ **Fixed**: Metro bundler file collision - moved `package-for-refactor` directory
2. ⏳ **In Progress**: Gradle missing `libs.versions.toml` file
3. ⏳ **Need**: Android project hasn't been prebuilt

## Solution

### Option 1: Prebuild Android Project (Recommended)

```bash
cd apps/mobile

# Generate Android native code
pnpm prebuild:clean

# This will create the android/ directory with all native files
```

### Option 2: Use Expo Development Build

```bash
cd apps/mobile

# Create a development build
pnpm build:dev

# Or use EAS Build
eas build --platform android --profile development
```

### Option 3: Use Expo Go (Quick Testing)

```bash
cd apps/mobile

# Start Expo
pnpm dev

# Then scan QR code with Expo Go app on your phone
# Or press 'w' for web
```

## What Was Fixed

✅ **Metro Config**: Added blocklist to exclude `package-for-refactor`
✅ **Directory Conflict**: Moved conflicting directory out of way

## Next Steps

1. **For Development**: Use `pnpm dev` and Expo Go
2. **For Production**: Create development build with `pnpm prebuild:clean`
3. **For Testing**: Use Android Studio emulator

## Recommended Workflow

```bash
# Quick development with Expo Go
cd apps/mobile
pnpm dev
# Scan QR code with Expo Go app

# Or for native builds
pnpm prebuild:clean
pnpm android
```

## Troubleshooting

**Gradle still failing?**
```bash
cd apps/mobile
rm -rf android
pnpm prebuild:clean
pnpm android
```

**Metro still showing conflicts?**
```bash
cd apps/mobile
rm -rf node_modules/.cache
pnpm dev
```

**Can't find build tools?**
```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
pnpm android
```
