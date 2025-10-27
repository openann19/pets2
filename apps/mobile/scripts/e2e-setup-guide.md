# 🎯 E2E Testing Setup Guide for PawfectMatch Mobile

## Current Status
- ✅ Detox configured and working
- ✅ E2E test files created (25+ test files)
- ✅ Jest configuration restored
- ❌ Build environment needs setup (Xcode/Android Studio)

## 📱 E2E Test Files Available

### Core User Flows
- `auth.e2e.ts` - Authentication flow
- `swipe.e2e.ts` - Card swiping functionality
- `mainFlow.e2e.test.ts` - Complete user journey
- `gdpr-flow.e2e.ts` - Privacy compliance flows

### Feature Tests
- `accessibility.reduceMotion.e2e.ts` - Accessibility testing
- `photo.analyze.e2e.ts` - Photo upload/analysis
- `voice.notes.playback.e2e.ts` - Voice features
- `premium.guard.e2e.ts` - Premium features

### Map & Location
- `01-map.smoke.e2e.js` - Map basic functionality
- `02-map.ar.e2e.js` - AR features
- `03-map.filters-and-marker.e2e.js` - Map filters

## 🚀 Running E2E Tests

### Option 1: Local Development (Requires Setup)

#### iOS Setup
```bash
# Install Xcode (macOS only)
xcode-select --install

# Install iOS Simulator
# Open Xcode → Preferences → Components → iOS Simulator

# Build and run iOS E2E
pnpm e2e:build:ios
pnpm e2e:ios
```

#### Android Setup
```bash
# Install Android Studio
# Set up Android SDK
# Create Android Virtual Device (AVD)

# Fix Gradle issues (if needed)
cd android
./gradlew clean

# Build and run Android E2E
pnpm e2e:build:android
pnpm e2e:android
```

### Option 2: Cloud Builds (Recommended for CI)

```bash
# Build using EAS Cloud (no local setup needed)
pnpm e2e:build:ios:cloud
pnpm e2e:build:android:cloud

# Run tests on cloud-built binaries
pnpm e2e:ios
pnpm e2e:android
```

### Option 3: Development Mode (Skip Build)

```bash
# Run tests in development mode (requires app running)
pnpm start

# In another terminal, run E2E tests
pnpm e2e:ios --reuse
```

## 🔧 Configuration Files

### Detox Configuration
- `detox.config.ts` - TypeScript configuration
- `detox.config.cjs` - CommonJS configuration (active)
- `e2e/jest.config.js` - Jest test runner configuration

### Build Scripts
- `package.json` - E2E build and test scripts
- `e2e/setup.ts` - Global test setup and utilities

## 📊 Test Categories

### Smoke Tests (Quick Health Checks)
- Map loading
- Authentication
- Basic navigation

### Integration Tests (Feature Workflows)
- Complete swipe flow
- Chat functionality
- Photo upload process

### Accessibility Tests (A11y Compliance)
- Reduce motion
- Screen reader compatibility
- Voice control

### Performance Tests (Speed & Memory)
- Map rendering performance
- Animation smoothness
- Memory usage

## 🛠️ Troubleshooting

### Common Issues

#### "xcodebuild: not found"
```bash
# Install Xcode Command Line Tools
xcode-select --install
# Or install full Xcode from App Store
```

#### "gradlew: command not found"
```bash
# Ensure Android SDK is installed
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

#### "Device not found"
```bash
# List available iOS simulators
xcrun simctl list devices

# List available Android emulators
emulator -list-avds

# Create new Android emulator if needed
avdmanager create avd -n Pixel_6_API_34 -k "system-images;android-34;google_apis;x86_64"
```

#### "App not installed"
```bash
# Clean build
pnpm e2e:build:ios --force
# or
pnpm e2e:build:android --force
```

## 📈 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Build iOS E2E
  run: pnpm e2e:build:ios:cloud

- name: Run iOS E2E Tests
  run: pnpm e2e:ios --headless

- name: Build Android E2E  
  run: pnpm e2e:build:android:cloud

- name: Run Android E2E Tests
  run: pnpm e2e:android --headless
```

## 🎯 Next Steps

1. **Choose Your Setup**: Local development vs cloud builds
2. **Install Dependencies**: Xcode/Android Studio if building locally
3. **Run First Test**: Start with a smoke test
4. **Expand Coverage**: Add more E2E tests for critical flows
5. **CI Integration**: Set up automated E2E testing

## 📞 Support

For E2E testing issues:
1. Check Detox documentation: https://wix.github.io/Detox/
2. Review Expo EAS Build docs: https://docs.expo.dev/build/introduction/
3. Check test logs in `e2e/artifacts/` directory

---

**Ready to run comprehensive E2E tests! 🚀**
