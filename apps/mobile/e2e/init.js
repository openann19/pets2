const detox = require('detox');
const config = require('../detox.config').default || require('../detox.config');

beforeAll(async () => {
  await detox.init(config, { initGlobals: true });
  // Start clean with permissions granted
  await device.launchApp({
    delete: true,
    newInstance: true,
    permissions: { microphone: 'YES', location: 'inuse' },
    launchArgs: { E2E: '1' },
  });
});

afterAll(async () => {
  await detox.cleanup();
});

