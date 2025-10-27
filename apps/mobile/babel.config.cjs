const baseConfig = require('../../babel.config.cjs');

module.exports = function (api) {
  api.cache(true);

  const moduleResolverPlugin = [
    'module-resolver',
    {
      root: ['./src'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      alias: {
        '@mobile': './src',
      },
    },
  ];

  const basePlugins = baseConfig.plugins || [];
  const filteredBasePlugins = basePlugins.filter(
    (plugin) => !(Array.isArray(plugin) && (plugin[0] === 'module-resolver' || plugin[0] === '@babel/plugin-transform-runtime')),
  );

  return {
    presets: [['babel-preset-expo', { jsxRuntime: 'automatic' }], ...baseConfig.presets],
    plugins: [moduleResolverPlugin, ...filteredBasePlugins, 'react-native-reanimated/plugin'],
    env: baseConfig.env,
  };
};
