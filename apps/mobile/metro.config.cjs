/**
 * Metro configuration for optimized bundle size and performance
 * Reduces APK size and improves app startup time
 * 
 * Includes workspace resolution for pnpm monorepo with hoisted node_modules
 */
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

// Calculate paths for workspace resolution
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

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
    // Configure workspace package resolution for pnpm hoisting
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    // Create aliases for workspace packages to resolve them directly
    // Use built artifacts when available (core is built via pre-build hooks)
    extraNodeModules: {
      '@pawfectmatch/core': path.resolve(workspaceRoot, 'packages/core/dist'),
      '@pawfectmatch/design-tokens': path.resolve(workspaceRoot, 'packages/design-tokens/dist'),
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
  enableBabelRuntime: false,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
};

// Serializer configuration
config.serializer = {
  ...config.serializer,
  // Use default module ID factory (removed custom implementation due to Metro API changes)
};

// Watch folders for better development experience and hot reloading
config.watchFolders = [
  projectRoot,
  workspaceRoot,
  path.resolve(workspaceRoot, 'packages'),
];

// Blocklist conflicting directories
config.resolver.blockList = [
  /package-for-refactor/,
  /node_modules\/.*\/.*\/package-for-refactor/,
];

// Enable source maps in development for better debugging
if (process.env.NODE_ENV === 'development') {
  config.transformer.sourceMap = true;
}

module.exports = config;
