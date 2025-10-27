# 📱 Android SDK Setup - Complete

## ✅ Status: Installed and Configured

Your Android SDK is fully installed and ready to use.

### Installation Details

**SDK Location**: `~/Android/Sdk`

**Installed Components**:
- ✅ Android Platform 36 (Android 15)
- ✅ Platform Tools (ADB 36.0.0)
- ✅ Build Tools: 35.0.0, 36.1.0
- ✅ Emulator
- ✅ System Images

### Environment Configuration

Environment variables have been added to `~/.bashrc`:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/emulator"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
export PATH="$PATH:$ANDROID_HOME/tools"
export PATH="$PATH:$ANDROID_HOME/tools/bin"
```

### Apply Configuration

**Option 1**: Reload your shell
```bash
source ~/.bashrc
```

**Option 2**: Open a new terminal window

**Option 3**: Temporarily set in current session
```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
```

### Verify Installation

```bash
# Check ADB
adb version

# List connected devices
adb devices

# Check Android SDK Manager
sdkmanager --version

# List installed packages
sdkmanager --list_installed
```

### Using with React Native

Your Expo/React Native app can now build for Android:

```bash
cd apps/mobile

# Start Expo
pnpm dev

# Or run on Android
pnpm android

# Or build
pnpm android:build
```

### Android Studio Access

You have Android Studio installed via Snap. Access it with:

```bash
# Launch Android Studio
snap run android-studio

# Or GUI
# Search for "Android Studio" in applications
```

### Troubleshooting

**If ADB not found**:
```bash
# Reload environment
source ~/.bashrc

# Or manually set
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
```

**Check device connection**:
```bash
adb devices
adb kill-server
adb start-server
adb devices
```

**Accept ADB license**:
```bash
# If you see license errors
yes | sdkmanager --licenses
```

### Next Steps

1. **Test with your mobile app**:
   ```bash
   cd apps/mobile
   pnpm android
   ```

2. **Connect a physical device**:
   - Enable USB debugging on your Android device
   - Connect via USB
   - Run `adb devices` to verify

3. **Create an emulator** (if needed):
   ```bash
   # Open Android Studio and use AVD Manager
   # Or use command line
   avdmanager create avd -n test_device -k "system-images;android-36;google_apis;x86_64"
   ```

### Additional SDK Packages (Optional)

Install additional packages if needed:

```bash
# Accept licenses first
yes | sdkmanager --licenses

# Install additional packages
sdkmanager "platform-tools"
sdkmanager "build-tools;36.0.0"
sdkmanager "platforms;android-36"
sdkmanager "system-images;android-36;google_apis;x86_64"
```

### Summary

✅ **Android SDK**: Installed at `~/Android/Sdk`
✅ **Platform Tools**: Version 36.0.0
✅ **Build Tools**: 35.0.0, 36.1.0
✅ **Platform**: Android 15 (API 36)
✅ **Environment**: Configured in `~/.bashrc`
✅ **ADB**: Working (version 1.0.41)

**You're ready to build Android apps!** 🚀
