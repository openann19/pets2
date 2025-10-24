import React from 'react';
import { render, screen } from '@testing-library/react';
import { BioGenerator } from '../BioGenerator';

// Mock the useAuthStore hook
jest.mock('@pawfectmatch/core', () => ({
  useAuthStore: () => ({ user: { id: '123', premium: true } }),
}));

// Mock the api service
jest.mock('@/services/api', () => ({
  api: {
    ai: {
      generateBio: jest.fn(),
    },
  },
}));

describe('BioGenerator', () => {
  it('renders the main title and premium features', () => {
    render(<BioGenerator />);

    // Check for the main title
    expect(screen.getByText('AI Bio Generator')).toBeInTheDocument();

    // Check for the subtitle
    expect(screen.getByText('Create the perfect bio for your furry friend')).toBeInTheDocument();

    // Check for a form label
    expect(screen.getByText('Pet Name')).toBeInTheDocument();
  });
});
