import type { Pet } from '@/types';
import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { SwipeCardCore } from './SwipeCardCore';

const mockPet: Pet = {
    _id: 'pet1',
    owner: 'user1',
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'male',
    size: 'large',
    photos: [],
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

describe('SwipeCardCore', () => {
    test('renders basic pet info', () => {
        const onSwipe = jest.fn();
        const { getByText } = render(<SwipeCardCore pet={mockPet} onSwipe={onSwipe} />);
        expect(getByText('Buddy')).toBeInTheDocument();
        expect(getByText('Golden Retriever')).toBeInTheDocument();
        expect(getByText('3 years old')).toBeInTheDocument();
    });

    test('action buttons call onSwipe with correct actions', () => {
        const onSwipe = jest.fn();
        const { getByText } = render(<SwipeCardCore pet={mockPet} onSwipe={onSwipe} />);

        // Pass (✕)
        fireEvent.click(getByText('✕'));
        expect(onSwipe).toHaveBeenCalledWith('pass');

        // Superlike (⭐)
        const onSwipe2 = jest.fn();
        const { getByText: getByText2 } = render(<SwipeCardCore pet={mockPet} onSwipe={onSwipe2} />);
        fireEvent.click(getByText2('⭐'));
        expect(onSwipe2).toHaveBeenCalledWith('superlike');

        // Like (♥)
        const onSwipe3 = jest.fn();
        const { getByText: getByText3 } = render(<SwipeCardCore pet={mockPet} onSwipe={onSwipe3} />);
        fireEvent.click(getByText3('♥'));
        expect(onSwipe3).toHaveBeenCalledWith('like');
    });

    test('accepts dragConstraints types without crashing', () => {
        const onSwipe = jest.fn();
        const ref = { current: document.createElement('div') } as React.RefObject<Element>;

        render(
            <SwipeCardCore
                pet={mockPet}
                onSwipe={onSwipe}
                dragConstraints={ref}
                style={{}} // ensure style prop works with motion values
            />,
        );

        render(
            <SwipeCardCore
                pet={mockPet}
                onSwipe={onSwipe}
                dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
            />,
        );

        render(<SwipeCardCore pet={mockPet} onSwipe={onSwipe} dragConstraints={false} />);
        // If no errors, the typing/prop handling is valid
        expect(true).toBe(true);
    });
});
