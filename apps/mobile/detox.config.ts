// Detox configuration - using plain object as Detox doesn't export DetoxConfig type
const IOS_SCHEME = process.env['DETOX_IOS_SCHEME'] || "PawfectMatch";
const IOS_WORKSPACE = process.env['DETOX_IOS_WORKSPACE'] || `ios/${IOS_SCHEME}.xcworkspace`;
const IOS_BINARY = process.env['DETOX_IOS_BINARY'] || `ios/build/Build/Products/Debug-iphonesimulator/${IOS_SCHEME}.app`;

const ANDROID_BINARY = process.env['DETOX_ANDROID_BINARY'] || "android/app/build/outputs/apk/debug/app-debug.apk";

const config = {
  testRunner: "jest",
  runnerConfig: "e2e/jest.config.js",
  artifacts: { rootDir: "e2e/artifacts" },
  apps: {
    "ios.debug": {
      type: "ios.app",
      binaryPath: IOS_BINARY,
      build: `xcodebuild -workspace ${IOS_WORKSPACE} -scheme ${IOS_SCHEME} -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build`,
    },
    "android.debug": {
      type: "android.apk",
      binaryPath: ANDROID_BINARY,
      build: "cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..",
    },
  },
  devices: {
    "sim.ios": { type: "ios.simulator", device: { type: "iPhone 15" } },
    "emu.android": { type: "android.emulator", device: { avdName: "Pixel_6_API_34" } },
  },
  configurations: {
    "ios.debug": { device: "sim.ios", app: "ios.debug" },
    "android.debug": { device: "emu.android", app: "android.debug" },
  },
};

export default config;

