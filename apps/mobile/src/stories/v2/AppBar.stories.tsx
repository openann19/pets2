import type { Meta, StoryObj } from '@storybook/react';
import { AppBar, type AppBarProps } from '../../components/ui/v2/AppBar';

const meta: Meta<typeof AppBar> = {
  title: 'UI v2/AppBar',
  component: AppBar,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    title: 'Aurora',
    subtitle: 'Premium journeys for pets',
    blur: true,
    gradient: true,
  },
};

export default meta;

type Story = StoryObj<typeof AppBar>;

export const Default: Story = {};

export const WithBackAction: Story = {
  args: {
    onBack: () => {},
  },
};

export const WithActions: Story = {
  args: {
    rightActions: [
      { icon: 'settings-outline', onPress: () => {}, accessibilityLabel: 'Open settings' },
      { icon: 'heart-outline', onPress: () => {}, accessibilityLabel: 'Toggle favorite' },
    ],
  },
};

export const SolidSurface: Story = {
  args: {
    blur: false,
    gradient: false,
  },
};
