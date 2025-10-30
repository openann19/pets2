# 🚀 Android SDK - Quick Start Guide

## ✅ Status: Fully Configured!

Your Android SDK is installed and ready to use.

## Quick Commands

### 1. Set Environment (run once per terminal)
```bash
cd /home/ben/Downloads/pets-fresh
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
```

### 2. Verify Setup
```bash
adb version
```

You should see: `Android Debug Bridge version 1.0.41`

### 3. Check Connected Devices
```bash
adb devices
```

### 4. Run Your React Native App
```bash
cd apps/mobile
pnpm android
```

## Make it Permanent

The environment variables are already added to `~/.bashrc`. To apply:

**Reload your terminal:**
```bash
source ~/.bashrc
```

**Or restart your terminal window** - the variables will be loaded automatically.

## Test the Setup

From the project root (`/home/ben/Downloads/pets-fresh`):

```bash
# Set environment
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"

# Verify
adb version
adb devices

# Run mobile app
cd apps/mobile
pnpm android
```

## Common Commands

### List Connected Devices
```bash
adb devices
```

### Kill ADB Server (if stuck)
```bash
adb kill-server
adb start-server
```

### Install App
```bash
adb install /path/to/app.apk
```

### View Logs
```bash
adb logcat
```

### Clear App Data
```bash
adb shell pm clear com.your.app.package
```

## React Native Commands

```bash
cd apps/mobile

# Start Metro
pnpm dev

# Run on Android
pnpm android

# Build for production
pnpm android:build

# Create release APK
pnpm build:android-apk
```

## Need Help?

- **ADB not found**: Run the environment setup commands above
- **No devices found**: Connect device or start emulator
- **License errors**: Run `yes | sdkmanager --licenses`

## Current Setup

- ✅ **SDK Location**: `/home/ben/Android/Sdk`
- ✅ **Platform**: Android 15 (API 36)
- ✅ **ADB Version**: 1.0.41 (36.0.0)
- ✅ **Build Tools**: 35.0.0, 36.1.0
- ✅ **Environment**: Configured in `~/.bashrc`
