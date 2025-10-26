const baseConfig = require('../../babel.config.cjs');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', ...baseConfig.presets],
    plugins: [...baseConfig.plugins, 'react-native-reanimated/plugin'],
    env: baseConfig.env,
  };
};
