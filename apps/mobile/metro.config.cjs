/**
 * Metro configuration for optimized bundle size and performance
 * Reduces APK size and improves app startup time
 */
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

  // Enable tree shaking for better bundle size
  config.resolver = {
    ...config.resolver,
    // Enable platform-specific extensions resolution
    platforms: ['ios', 'android'],
    // Optimize asset loading - ensure font and asset extensions are included
    assetExts: [
      ...config.resolver.assetExts.filter(ext => !['svg', 'ttf'].includes(ext)),
      'ttf', 'otf', 'woff', 'woff2' // Re-add font extensions
    ],
    // Ensure proper module resolution for Babel runtime
    extraNodeModules: {
      ...config.resolver.extraNodeModules,
      '@babel/runtime': require.resolve('@babel/runtime/package.json'),
      '@mobile': path.resolve(__dirname, 'src'),
    },
  };

// Transformer configuration for optimization
config.transformer = {
  ...config.transformer,
  // Enable minification in production
  minifierConfig: {
    keep_classnames: false,
    keep_fnames: false,
    mangle: {
      keep_classnames: false,
      keep_fnames: false,
    },
  },
  // Optimize asset loading
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  // Enable experimental features for smaller bundles
  enableBabelRCLookup: false,
  enableBabelRuntime: true,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
};

// Serializer configuration
config.serializer = {
  ...config.serializer,
  // Use default module ID factory (removed custom implementation due to Metro API changes)
};

// Watch folders for better development experience
config.watchFolders = [
  ...config.watchFolders,
  // Add shared packages for better hot reloading
];

// Enable source maps in development for better debugging
if (process.env.NODE_ENV === 'development') {
  config.transformer.sourceMap = true;
}

module.exports = config;
