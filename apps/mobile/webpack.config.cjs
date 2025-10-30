const { createExpoWebpackConfigAsync } = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      projectRoot: __dirname,
    },
    argv,
  );

  // Override entry to use our index.js
  config.entry = path.resolve(__dirname, 'index.js');

  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    '@mobile': path.resolve(__dirname, 'src'),
    '@': path.resolve(__dirname, 'src'),
    'react-native$': require.resolve('react-native-web'),
    'react-native/Libraries/Utilities/Platform': require.resolve(
      'react-native-web/dist/exports/Platform',
    ),
    'react-native/Libraries/Utilities/BackHandler': require.resolve(
      'react-native-web/dist/modules/BackHandler',
    ),
    'react-native/Libraries/Alert/Alert': path.resolve(__dirname, 'web/polyfills/Alert.web.ts'),
    'react-native/Libraries/Network/XMLHttpRequest': require.resolve('react-native-web/dist/exports/XMLHttpRequest'),
  };

  // Exclude old refactor directory
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  config.module.rules.push({
    test: /\.js$/,
    exclude: /package-for-refactor/,
  });

  return config;
};

