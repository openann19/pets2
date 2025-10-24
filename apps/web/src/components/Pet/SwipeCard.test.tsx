import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SwipeCard from './SwipeCard';
import { Pet } from '../../types';

const mockPet: Pet = {
  _id: 'pet1',
  owner: 'user1',
  name: 'Buddy',
  species: 'dog',
  breed: 'Golden Retriever',
  age: 3,
  gender: 'male',
  size: 'large',
  photos: [{ url: 'https://via.placeholder.com/400x500', isPrimary: true }],
  description: 'A friendly and energetic dog.',
  personalityTags: ['friendly', 'energetic'],
  intent: 'playdate',
  healthInfo: { vaccinated: true, spayedNeutered: true, microchipped: false },
  location: { type: 'Point', coordinates: [0, 0] },
  featured: { isFeatured: false, boostCount: 0 },
  analytics: { views: 0, likes: 0, matches: 0, messages: 0 },
  isActive: true,
  status: 'active',
  availability: { isAvailable: true },
  isVerified: true,
  listedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('SwipeCard Component', () => {
  it('renders pet information correctly', () => {
    const onSwipe = jest.fn();
    const { getByText } = render(<SwipeCard pet={mockPet} onSwipe={onSwipe} />);

    expect(getByText('Buddy')).toBeInTheDocument();
    expect(getByText('3 years')).toBeInTheDocument();
    expect(getByText('Golden Retriever')).toBeInTheDocument();
    expect(getByText('A friendly and energetic dog.')).toBeInTheDocument();
    expect(getByText('friendly')).toBeInTheDocument();
    expect(getByText('energetic')).toBeInTheDocument();
  });

  it('calls onSwipe with "like" when like button is clicked', async () => {
    const onSwipe = jest.fn();
    const { getByLabelText } = render(<SwipeCard pet={mockPet} onSwipe={onSwipe} style={{}} />);
    const likeButton = getByLabelText('Like button');
    fireEvent.click(likeButton);
    
    // Wait for the timeout in handleButtonClick (200ms)
    await new Promise(resolve => setTimeout(resolve, 250));
    expect(onSwipe).toHaveBeenCalledWith('like');
  });

  it('calls onSwipe with "pass" when pass button is clicked', async () => {
    const onSwipe = jest.fn();
    const { getByLabelText } = render(<SwipeCard pet={mockPet} onSwipe={onSwipe} style={{}} />);
    const passButton = getByLabelText('Pass button');
    fireEvent.click(passButton);
    
    // Wait for the timeout in handleButtonClick (200ms)
    await new Promise(resolve => setTimeout(resolve, 250));
    expect(onSwipe).toHaveBeenCalledWith('pass');
  });

  // Add more tests for drag gestures, superlike, etc.
});
