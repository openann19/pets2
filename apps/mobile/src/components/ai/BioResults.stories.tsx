/**
 * BioResults Stories
 * Comprehensive stories showcasing bio display, actions, and analysis
 */

import React from 'react';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react-native';
import { BioResults } from './BioResults';
import {
  mockBioPlayful,
  mockBioProfessional,
  mockBioCasual,
  mockBioRomantic,
  mockBioMysterious,
  mockBios,
} from '../../stories/mocks/bioMocks';

/**
 * Meta configuration
 */
const meta: Meta<typeof BioResults> = {
  title: 'AI/BioResults',
  component: BioResults,
  parameters: {
    notes: {
      markdown: `
# BioResults Component

Displays AI-generated pet bios with interactive actions and analysis.

## Features
- Rich text display with scrollable content
- Copy to clipboard functionality
- Save to history
- Regenerate option
- Sentiment and match score analysis
- Keywords/traits display

## Props
- generatedBio: Bio data object with text, keywords, sentiment, match score
- onSave: Callback when saving bio
- onRegenerate: Callback to generate new bio

## Analysis Features
- Match Score (0-100) with color-coded progress bar
- Sentiment Analysis (score + label)
- Keywords/Traits display
      `,
    },
  },
  argTypes: {
    generatedBio: {
      control: 'object',
      description: 'Generated bio data object',
    },
  },
};

export default meta;

type Story = StoryObj<typeof BioResults>;

/**
 * Playful bio result
 */
export const PlayfulBio: Story = {
  args: {
    generatedBio: mockBioPlayful,
    onSave: action('onSave'),
    onRegenerate: action('onRegenerate'),
  },
  parameters: {
    notes: 'Bio generated with playful tone - high match score and positive sentiment',
  },
};

/**
 * Professional bio result
 */
export const ProfessionalBio: Story = {
  args: {
    generatedBio: mockBioProfessional,
    onSave: action('onSave'),
    onRegenerate: action('onRegenerate'),
  },
  parameters: {
    notes:
      'Bio generated with professional tone - moderate match score and positive sentiment',
  },
};

/**
 * Casual bio result
 */
export const CasualBio: Story = {
  args: {
    generatedBio: mockBioCasual,
    onSave: action('onSave'),
    onRegenerate: action('onRegenerate'),
  },
  parameters: {
    notes: 'Bio generated with casual tone - high match score and positive sentiment',
  },
};

/**
 * Romantic bio result
 */
export const RomanticBio: Story = {
  args: {
    generatedBio: mockBioRomantic,
    onSave: action('onSave'),
    onRegenerate: action('onRegenerate'),
  },
  parameters: {
    notes:
      'Bio generated with romantic tone - very high match score and positive sentiment',
  },
};

/**
 * Mysterious bio result
 */
export const MysteriousBio: Story = {
  args: {
    generatedBio: mockBioMysterious,
    onSave: action('onSave'),
    onRegenerate: action('onRegenerate'),
  },
  parameters: {
    notes:
      'Bio generated with mysterious tone - lower match score and neutral-positive sentiment',
  },
};

/**
 * High match score
 */
export const HighScore: Story = {
  args: {
    generatedBio: {
      ...mockBioPlayful,
      matchScore: 98,
      sentiment: { score: 0.95, label: 'Very Positive' },
    },
    onSave: action('onSave'),
    onRegenerate: action('onRegenerate'),
  },
  parameters: {
    notes: 'Bio with very high match score (green indicator)',
  },
};

/**
 * Medium match score
 */
export const MediumScore: Story = {
  args: {
    generatedBio: {
      ...mockBioProfessional,
      matchScore: 65,
      sentiment: { score: 0.55, label: 'Neutral' },
    },
    onSave: action('onSave'),
    onRegenerate: action('onRegenerate'),
  },
  parameters: {
    notes: 'Bio with medium match score (yellow indicator)',
  },
};

/**
 * Low match score
 */
export const LowScore: Story = {
  args: {
    generatedBio: {
      ...mockBioMysterious,
      matchScore: 45,
      sentiment: { score: 0.35, label: 'Neutral-Negative' },
    },
    onSave: action('onSave'),
    onRegenerate: action('onRegenerate'),
  },
  parameters: {
    notes: 'Bio with low match score (red indicator)',
  },
};

/**
 * All tone variations (showing first as example)
 * Note: Interactive carousel would require additional UI controls in a real implementation
 */
export const AllTones: Story = {
  args: {
    generatedBio: mockBios[0],
    onSave: action('onSave'),
    onRegenerate: action('onRegenerate'),
  },
  parameters: {
    notes:
      'Showing first tone variation. All 5 tones are available as separate stories (Playful, Professional, Casual, Romantic, Mysterious)',
  },
};

