/**
 * Detox Configuration for PawfectMatch Mobile App
 * Comprehensive E2E Testing Setup
 */

module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'detox/jest.config.cjs',
    },
    jest: { setupTimeout: 120000 },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/PawfectMatch.app',
      build: 'xcodebuild -workspace ios/PawfectMatch.xcworkspace -scheme PawfectMatch -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/PawfectMatch.app',
      build: 'xcodebuild -workspace ios/PawfectMatch.xcworkspace -scheme PawfectMatch -configuration Release -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: {
        '8081': 8081
      }
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15 Pro'
      }
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_7_API_34'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release'
    },
    'android.att.debug': {
      device: 'attached',
      app: 'android.debug'
    },
    'android.att.release': {
      device: 'attached',
      app: 'android.release'
    }
  },
  artifacts: {
    rootDir: './e2e/artifacts',
    pathBuilder: './e2e/path-builder.js',
    plugins: {
      log: 'all',
      screenshot: 'failing',
      video: 'failing',
      instruments: 'failing'
    }
  },
  logger: {
    level: 'info'
  },
  behavior: {
    init: {
      reinstallApp: true,
      exposeGlobals: false
    },
    cleanup: {
      shutdownDevice: false
    }
  }
};
