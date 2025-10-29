import path from 'path';
import { createRequire } from 'module';
import type { StorybookConfig } from '@storybook/react-vite';

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: [
    '../apps/mobile/src/**/*.stories.@(tsx|mdx)',
    '../packages/ui/src/**/*.stories.@(tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],
  core: { disableTelemetry: true },
  typescript: {
    reactDocgen: false,
  },
  async viteFinal(baseConfig) {
    baseConfig.resolve ??= {};

    const existingAliases = baseConfig.resolve.alias ?? [];
    const aliasArray = Array.isArray(existingAliases)
      ? existingAliases
      : Object.entries(existingAliases).map(([find, replacement]) => ({ find, replacement }));

    aliasArray.unshift({ find: 'minimatch', replacement: require.resolve('minimatch') });

    aliasArray.push(
      {
        find: 'react-native$',
        replacement: path.resolve(__dirname, './mocks/react-native.ts'),
      },
      {
        find: 'react-native',
        replacement: path.resolve(__dirname, './mocks/react-native.ts'),
      },
      {
        find: 'react-native-reanimated',
        replacement: path.resolve(__dirname, './mocks/react-native-reanimated.ts'),
      },
      {
        find: 'expo-linear-gradient',
        replacement: path.resolve(__dirname, './mocks/expo-linear-gradient.tsx'),
      },
      {
        find: 'expo-constants',
        replacement: path.resolve(__dirname, './mocks/expo-constants.ts'),
      },
      {
        find: '@sentry/react-native',
        replacement: path.resolve(__dirname, './mocks/sentry-react-native.ts'),
      },
      {
        find: 'react-native/Libraries/Animated/NativeAnimatedHelper',
        replacement: path.resolve(__dirname, './mocks/NativeAnimatedHelper.ts'),
      },
      {
        find: 'react-native/Libraries/Utilities/Platform',
        replacement: 'react-native-web/dist/exports/Platform',
      },
      {
        find: 'react-native/Libraries/Utilities/BackHandler',
        replacement: path.resolve(__dirname, './mocks/BackHandler.ts'),
      },
      {
        find: 'react-native/Libraries/Alert/Alert',
        replacement: path.resolve(__dirname, './mocks/Alert.ts'),
      },
      {
        find: 'react-native/Libraries/Utilities/GlobalPerformanceLogger',
        replacement: path.resolve(__dirname, './mocks/empty.ts'),
      },
      {
        find: 'react-native/Libraries/BugReporting/BugReporting',
        replacement: path.resolve(__dirname, './mocks/empty.ts'),
      },
      {
        find: 'react-native/Libraries/ReactNative/AppContainer',
        replacement: path.resolve(__dirname, './mocks/empty.ts'),
      },
      {
        find: 'react-native/Libraries/StyleSheet/PlatformColorValueTypes',
        replacement: path.resolve(__dirname, './mocks/empty.ts'),
      },
      {
        find: 'react-native/Libraries/NativeComponent/BaseViewConfig',
        replacement: path.resolve(__dirname, './mocks/empty.ts'),
      },
      {
        find: 'react-native/Libraries/Network/RCTNetworking',
        replacement: path.resolve(__dirname, './mocks/empty.ts'),
      },
      {
        find: 'react-native/Libraries/Blob/Blob',
        replacement: path.resolve(__dirname, './mocks/empty.ts'),
      },
      {
        find: 'react-native/Libraries/Blob/BlobManager',
        replacement: path.resolve(__dirname, './mocks/empty.ts'),
      },
      {
        find: 'react-native/Libraries/WebSocket/WebSocket',
        replacement: path.resolve(__dirname, './mocks/empty.ts'),
      },
      {
        find: 'react-native/Libraries/WebSocket/WebSocketEvent',
        replacement: path.resolve(__dirname, './mocks/empty.ts'),
      },
      {
        find: 'react-native/Libraries/Utilities/DevSettings',
        replacement: path.resolve(__dirname, './mocks/empty.ts'),
      },
      {
        find: 'react-native/Libraries/Utilities/HMRClient',
        replacement: path.resolve(__dirname, './mocks/empty.ts'),
      },
      {
        find: /react-native\/Libraries\/.*/,
        replacement: path.resolve(__dirname, './mocks/empty.ts'),
      },
      {
        find: 'apps/mobile/src/theme/unified-theme',
        replacement: path.resolve(__dirname, './mocks/unified-theme.ts'),
      },
    );

    baseConfig.resolve.alias = aliasArray;

    const extensionSet = new Set<string>([
      '.web.tsx',
      '.web.ts',
      '.web.js',
      '.web.jsx',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.ios.tsx',
      '.ios.ts',
      '.ios.js',
      '.android.tsx',
      '.android.ts',
      '.android.js',
      '.native.tsx',
      '.native.ts',
      '.native.js',
      '.cjs',
      ...((baseConfig.resolve.extensions as string[] | undefined) ?? []),
    ]);

    baseConfig.resolve.extensions = Array.from(extensionSet);

    baseConfig.optimizeDeps ??= {};
    baseConfig.optimizeDeps.esbuildOptions ??= {};
    baseConfig.optimizeDeps.esbuildOptions.resolveExtensions = baseConfig.resolve.extensions;
    baseConfig.optimizeDeps.exclude = Array.from(
      new Set([...(baseConfig.optimizeDeps.exclude ?? []), 'react-native-reanimated']),
    );

    baseConfig.define ??= {};
    baseConfig.define.__DEV__ = JSON.stringify(true);

    return baseConfig;
  },
};

export default config;

