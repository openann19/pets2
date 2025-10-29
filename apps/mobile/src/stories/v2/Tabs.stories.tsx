import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from '../../components/ui/v2/Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'UI v2/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  args: {
    items: [
      { key: 'one', label: 'Adopt' },
      { key: 'two', label: 'Matches' },
      { key: 'three', label: 'Messages' },
    ],
    value: 'one',
  },
  argTypes: {
    onChange: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value ?? 'one');

    return (
      <Tabs
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange?.(next);
        }}
      />
    );
  },
};

export const WithBadges: Story = {
  args: {
    items: [
      { key: 'matches', label: 'Matches', badge: 4 },
      { key: 'liked', label: 'Liked You', badge: 12 },
      { key: 'archived', label: 'Archived' },
    ],
    value: 'matches',
  },
};
