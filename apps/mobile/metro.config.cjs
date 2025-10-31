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
  // Enable platform-specific extensions resolution including web
  platforms: ['ios', 'android', 'web'],
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
    '@mobile': path.resolve(projectRoot, 'src'),
    '@': path.resolve(projectRoot, 'src'),
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
    compress: {
      // Remove console.log statements
      drop_console: process.env.NODE_ENV === 'production',
      // Dead code elimination
      dead_code: true,
      // Remove unused code
      unused: true,
      // Advanced optimizations
      passes: 3, // Multiple passes for better optimization
      pure_funcs: ['console.log', 'console.info', 'console.debug'],
      unsafe: true, // Enable unsafe optimizations
      unsafe_comps: true,
      unsafe_math: true,
      unsafe_proto: true,
    },
  },
  // Optimize asset loading
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  // Enable inline requires for faster startup
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  // Hermes bytecode precompilation (if available)
  ...(process.env.EXPO_PUBLIC_ENABLE_HERMES_BYTECODE === 'true' && {
    hermesCommand: 'hermesc',
  }),
};

// Serializer configuration for bundle optimization
config.serializer = {
  ...config.serializer,
  // Optimize bundle output
  customSerializer: config.serializer?.customSerializer,
  // Enable module concatenation (scope hoisting)
  createModuleIdFactory: () => {
    let nextId = 0;
    return (path) => {
      // Use shorter IDs for production
      if (process.env.NODE_ENV === 'production') {
        return nextId++;
      }
      return path;
    };
  },
  // Custom serializer options for better tree shaking
  processModuleFilter: (module) => {
    // Filter out test files in production
    if (process.env.NODE_ENV === 'production') {
      return !module.path.includes('__tests__') && !module.path.includes('.test.');
    }
    return true;
  },
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
