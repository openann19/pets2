/**
 * ToneSelector Stories
 * Comprehensive stories showcasing tone selection states and interactions
 */

import React from 'react';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react-native';
import { ToneSelector } from './ToneSelector';

/**
 * Meta configuration
 */
const meta: Meta<typeof ToneSelector> = {
  title: 'AI/ToneSelector',
  component: ToneSelector,
  parameters: {
    notes: {
      markdown: `
# ToneSelector Component

Visual tone selector for choosing AI bio generation personality.

## Features
- Visual card selection with icons and colors
- Selected state with checkmark indicator
- Accessibility support
- Responsive grid layout

## Tones Available
- 🎾 Playful: Fun and energetic
- 💼 Professional: Polite and well-mannered
- 😊 Casual: Relaxed and friendly
- 💕 Romantic: Sweet and affectionate
- 🕵️ Mysterious: Intriguing and enigmatic

## Props
- selectedTone: Currently selected tone ID
- onToneSelect: Callback when tone is selected
      `,
    },
  },
  argTypes: {
    selectedTone: {
      control: 'select',
      options: ['playful', 'professional', 'casual', 'romantic', 'mysterious'],
      description: 'Currently selected tone',
    },
  },
};

export default meta;

type Story = StoryObj<typeof ToneSelector>;

/**
 * Playful tone selected
 */
export const Playful: Story = {
  args: {
    selectedTone: 'playful',
    onToneSelect: action('onToneSelect'),
  },
  parameters: {
    notes: 'Playful tone selected - fun and energetic personality',
  },
};

/**
 * Professional tone selected
 */
export const Professional: Story = {
  args: {
    selectedTone: 'professional',
    onToneSelect: action('onToneSelect'),
  },
  parameters: {
    notes: 'Professional tone selected - polite and well-mannered',
  },
};

/**
 * Casual tone selected
 */
export const Casual: Story = {
  args: {
    selectedTone: 'casual',
    onToneSelect: action('onToneSelect'),
  },
  parameters: {
    notes: 'Casual tone selected - relaxed and friendly',
  },
};

/**
 * Romantic tone selected
 */
export const Romantic: Story = {
  args: {
    selectedTone: 'romantic',
    onToneSelect: action('onToneSelect'),
  },
  parameters: {
    notes: 'Romantic tone selected - sweet and affectionate',
  },
};

/**
 * Mysterious tone selected
 */
export const Mysterious: Story = {
  args: {
    selectedTone: 'mysterious',
    onToneSelect: action('onToneSelect'),
  },
  parameters: {
    notes: 'Mysterious tone selected - intriguing and enigmatic',
  },
};

/**
 * No selection (default to first)
 */
export const NoSelection: Story = {
  args: {
    selectedTone: 'playful', // Default selection
    onToneSelect: action('onToneSelect'),
  },
  parameters: {
    notes: 'Default state showing first tone selected',
  },
};

/**
 * Interactive demonstration
 */
export const Interactive: Story = {
  render: (args) => {
    const [selectedTone, setSelectedTone] = React.useState('playful');
    return (
      <ToneSelector
        selectedTone={selectedTone}
        onToneSelect={(tone) => {
          setSelectedTone(tone);
          action('onToneSelect')(tone);
        }}
      />
    );
  },
  parameters: {
    notes: 'Fully interactive selector - click different tones to see selection change',
  },
};
