module.exports = {
  preset: 'detox',
  testTimeout: 180000,
  testMatch: ['**/*.e2e.js'],
  setupFilesAfterEnv: ['./init.js'],
  reporters: ['detox/runners/jest/reporter'],
};
