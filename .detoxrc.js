module.exports = {
  testRunner: {
    args: { $0: 'jest', config: 'detox/jest.config.cjs' },
    jest: { setupTimeout: 120000 },
  },
  apps: {
    'ios.sim.debug': {
      type: 'ios.app',
      binaryPath: 'artifacts/ios/app/PawfectMatch Premium.app', // will set below
    },
    'android.emu.debug': {
      type: 'android.apk',
      binaryPath: 'artifacts/android/app/app-debug.apk', // will set below
    },
  },
  devices: {
    simulator: { type: 'ios.simulator', device: { type: 'iPhone 15' } },
    emulator:  { type: 'android.emulator', avdName: 'Pixel_6_Pro_API_34' },
  },
  configurations: {
    'ios.sim.debug':     { device: 'simulator', app: 'ios.sim.debug' },
    'android.emu.debug': { device: 'emulator',  app: 'android.emu.debug' },
  },
};
