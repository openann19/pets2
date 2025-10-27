/**
 * Storybook Configuration for Mobile App
 * React Native Storybook with on-device support
 */

import type { StorybookConfig } from '@storybook/react-native';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/**/*.story.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-ondevice-controls',
    '@storybook/addon-ondevice-actions',
    '@storybook/addon-ondevice-notes',
    '@storybook/addon-ondevice-backgrounds',
  ],
  framework: {
    name: '@storybook/react-native',
    options: {
      strictMode: true,
    },
  },
  features: {
    argTypeTargetsV7: true,
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;

