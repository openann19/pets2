/**
 * Expo E2E Configuration
 * Uses EAS Build for creating test builds
 */

const config = {
  testRunner: 'jest',
  runnerConfig: 'e2e/jest.config.js',
  artifacts: { rootDir: 'e2e/artifacts' },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/PawfectMatch Premium.app',
      build: 'eas build --platform ios --profile development --local',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'eas build --platform android --profile development --local',
    },
  },
  devices: {
    'sim.ios': { type: 'ios.simulator', device: { type: 'iPhone 15' } },
    'emu.android': { type: 'android.emulator', device: { avdName: 'Pixel_6_API_34' } },
  },
  configurations: {
    'ios.sim.debug': { device: 'sim.ios', app: 'ios.debug' },
    'android.emu.debug': { device: 'emu.android', app: 'android.debug' },
  },
};

module.exports = config;
