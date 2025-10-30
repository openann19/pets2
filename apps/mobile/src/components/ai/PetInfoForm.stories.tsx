/**
 * PetInfoForm Stories
 * Comprehensive stories showcasing form states, validation, and accessibility
 */

import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react-native';
import { PetInfoForm } from './PetInfoForm';
import {
  mockValidationErrors,
  mockValidationErrorsWithErrors,
  mockFormData,
} from '../../stories/mocks/bioMocks';

/**
 * Meta configuration
 */
const meta: Meta<typeof PetInfoForm> = {
  title: 'AI/PetInfoForm',
  component: PetInfoForm,
  parameters: {
    notes: {
      markdown: `
# PetInfoForm Component

Production-hardened form component for collecting pet information with AI bio generation.

## Features
- Real-time validation with visual feedback
- Character counting for personality field
- Accessible with proper labels
- Responsive design

## Props
- petName, setPetName: Name input control
- petBreed, setPetBreed: Breed input control
- petAge, setPetAge: Age input control
- petPersonality, setPetPersonality: Personality textarea control
- validationErrors: Object containing validation error messages
      `,
    },
  },
  argTypes: {
    petName: {
      control: 'text',
      description: 'Current pet name value',
    },
    petBreed: {
      control: 'text',
      description: 'Current pet breed value',
    },
    petAge: {
      control: 'text',
      description: 'Current pet age value',
    },
    petPersonality: {
      control: 'text',
      description: 'Current pet personality value',
    },
  },
};

export default meta;

type Story = StoryObj<typeof PetInfoForm>;

/**
 * Interactive wrapper for controlled form
 */
const InteractiveWrapper = (args: any) => {
  const [petName, setPetName] = useState(args.petName || '');
  const [petBreed, setPetBreed] = useState(args.petBreed || '');
  const [petAge, setPetAge] = useState(args.petAge || '');
  const [petPersonality, setPetPersonality] = useState(args.petPersonality || '');
  const [errors, setErrors] = useState(args.validationErrors || {});

  return (
    <PetInfoForm
      petName={petName}
      setPetName={(value) => {
        setPetName(value);
        action('setPetName')(value);
      }}
      petBreed={petBreed}
      setPetBreed={(value) => {
        setPetBreed(value);
        action('setPetBreed')(value);
      }}
      petAge={petAge}
      setPetAge={(value) => {
        setPetAge(value);
        action('setPetAge')(value);
      }}
      petPersonality={petPersonality}
      setPetPersonality={(value) => {
        setPetPersonality(value);
        action('setPetPersonality')(value);
      }}
      validationErrors={errors}
    />
  );
};

/**
 * Default empty form
 */
export const Default: Story = {
  render: () => (
    <InteractiveWrapper
      {...mockFormData.empty}
      validationErrors={mockValidationErrors}
    />
  ),
  parameters: {
    notes: 'Empty form ready for user input',
  },
};

/**
 * Form with valid input
 */
export const FilledOut: Story = {
  render: () => (
    <InteractiveWrapper
      {...mockFormData.valid}
      validationErrors={mockValidationErrors}
    />
  ),
  parameters: {
    notes: 'Form with all fields filled out with valid data',
  },
};

/**
 * Form with validation errors
 */
export const WithValidationErrors: Story = {
  render: () => (
    <InteractiveWrapper
      {...mockFormData.empty}
      validationErrors={mockValidationErrorsWithErrors}
    />
  ),
  parameters: {
    notes: 'Form showing validation error states for required fields',
  },
};

/**
 * Form with partial input
 */
export const PartialInput: Story = {
  render: () => (
    <InteractiveWrapper
      {...mockFormData.partial}
      validationErrors={mockValidationErrors}
    />
  ),
  parameters: {
    notes: 'Form with some fields filled and others empty',
  },
};

/**
 * Form with long personality text
 */
export const LongPersonalityText: Story = {
  render: () => (
    <InteractiveWrapper
      {...mockFormData.valid}
      petPersonality={
        'Max is an incredibly playful and energetic Golden Retriever who loves playing fetch, going on hikes, swimming in lakes, chasing squirrels in the park, cuddling on the couch, learning new tricks, meeting new friends at the dog park, exploring new trails, watching birds from the window, and absolutely adores belly rubs! He has the sweetest personality and is always ready for the next adventure.'
      }
      validationErrors={mockValidationErrors}
    />
  ),
  parameters: {
    notes: 'Form with extensive personality description showing character count',
  },
};

/**
 * Interactive demonstration
 */
export const Interactive: Story = {
  render: () => (
    <InteractiveWrapper
      {...mockFormData.empty}
      validationErrors={mockValidationErrors}
    />
  ),
  parameters: {
    notes: 'Fully interactive form where you can type and see real-time updates',
  },
};
