import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/V2/Button',
  component: Button,
  args: {
    title: 'Adopt Me',
    variant: 'primary',
    size: 'md',
    onPress: action('onPress'),
  },
  argTypes: {
    onPress: { action: 'pressed', table: { disable: true } },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    title: 'Outline',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    title: 'Delete',
  },
};

