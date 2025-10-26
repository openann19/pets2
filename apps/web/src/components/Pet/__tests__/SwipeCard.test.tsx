/**
 * SwipeCard Component Tests
 * Tests the core swiping functionality - one of the most critical components
 * 
 * CRITICAL: This component is completely untested
 * Business Impact: Core user interaction for pet matching
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SwipeCard from '../SwipeCard';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
  useMotionValue: () => ({ get: () => 0, set: jest.fn() }),
  useTransform: () => 0,
  useSpring: () => ({ x: 0, y: 0 }),
  PanInfo: {},
}));

const mockPet = {
  _id: 'pet-123',
  name: 'Buddy',
  species: 'dog',
  breed: 'Golden Retriever',
  age: 3,
  gender: 'male',
  size: 'large',
  photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
  description: 'Friendly and energetic dog who loves to play fetch and go on long walks.',
  location: {
    coordinates: [-74.006, 40.7128],
    address: { city: 'New York', state: 'NY', country: 'USA' }
  },
  owner: {
    _id: 'owner-123',
    name: 'John Doe',
    isOnline: true
  },
  personality_tags: ['friendly', 'energetic', 'playful'],
  intent: 'playdate',
  compatibilityScore: 85
};

const mockOnSwipe = jest.fn();
const mockOnLike = jest.fn();
const mockOnPass = jest.fn();
const mockOnSuperLike = jest.fn();

describe('SwipeCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render pet information', () => {
    render(
      <SwipeCard
        pet={mockPet}
        onSwipe={mockOnSwipe}
        onLike={mockOnLike}
        onPass={mockOnPass}
      />
    );

    expect(screen.getByText('Buddy')).toBeInTheDocument();
    expect(screen.getByText(/Golden Retriever/i)).toBeInTheDocument();
    expect(screen.getByText(/3 years old/i)).toBeInTheDocument();
    expect(screen.getByText(/Friendly and energetic dog/i)).toBeInTheDocument();
  });

  it('should display pet photo', () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    const image = screen.getByRole('img', { name: /Buddy/i });
    expect(image).toHaveAttribute('src', mockPet.photos[0]);
    expect(image).toHaveAttribute('alt', expect.stringContaining('Buddy'));
  });

  it('should display multiple photos with navigation', async () => {
    const user = userEvent.setup();
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    // Should show photo indicators
    expect(screen.getByTestId('photo-indicators')).toBeInTheDocument();
    
    // Should show next photo button
    const nextButton = screen.getByRole('button', { name: /next photo/i });
    await user.click(nextButton);

    const image = screen.getByRole('img', { name: /Buddy/i });
    expect(image).toHaveAttribute('src', mockPet.photos[1]);
  });

  it('should handle like button click', async () => {
    const user = userEvent.setup();
    render(<SwipeCard pet={mockPet} onLike={mockOnLike} />);

    const likeButton = screen.getByRole('button', { name: /like/i });
    await user.click(likeButton);

    expect(mockOnLike).toHaveBeenCalledWith(mockPet);
  });

  it('should handle pass button click', async () => {
    const user = userEvent.setup();
    render(<SwipeCard pet={mockPet} onPass={mockOnPass} />);

    const passButton = screen.getByRole('button', { name: /pass/i });
    await user.click(passButton);

    expect(mockOnPass).toHaveBeenCalledWith(mockPet);
  });

  it('should handle super like button click', async () => {
    const user = userEvent.setup();
    render(<SwipeCard pet={mockPet} onSuperLike={mockOnSuperLike} />);

    const superLikeButton = screen.getByRole('button', { name: /super like/i });
    await user.click(superLikeButton);

    expect(mockOnSuperLike).toHaveBeenCalledWith(mockPet);
  });

  it('should handle swipe right gesture (like)', async () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    const card = screen.getByTestId('swipe-card');
    
    // Simulate swipe right
    fireEvent.touchStart(card, { 
      touches: [{ clientX: 100, clientY: 100 }] 
    });
    fireEvent.touchMove(card, { 
      touches: [{ clientX: 300, clientY: 100 }] 
    });
    fireEvent.touchEnd(card);

    await waitFor(() => {
      expect(mockOnSwipe).toHaveBeenCalledWith('like', mockPet);
    });
  });

  it('should handle swipe left gesture (pass)', async () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    const card = screen.getByTestId('swipe-card');
    
    // Simulate swipe left
    fireEvent.touchStart(card, { 
      touches: [{ clientX: 300, clientY: 100 }] 
    });
    fireEvent.touchMove(card, { 
      touches: [{ clientX: 100, clientY: 100 }] 
    });
    fireEvent.touchEnd(card);

    await waitFor(() => {
      expect(mockOnSwipe).toHaveBeenCalledWith('pass', mockPet);
    });
  });

  it('should handle swipe up gesture (super like)', async () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    const card = screen.getByTestId('swipe-card');
    
    // Simulate swipe up
    fireEvent.touchStart(card, { 
      touches: [{ clientX: 200, clientY: 300 }] 
    });
    fireEvent.touchMove(card, { 
      touches: [{ clientX: 200, clientY: 100 }] 
    });
    fireEvent.touchEnd(card);

    await waitFor(() => {
      expect(mockOnSwipe).toHaveBeenCalledWith('superLike', mockPet);
    });
  });

  it('should show swipe animations', () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    const card = screen.getByTestId('swipe-card');
    
    // Start swipe right
    fireEvent.touchStart(card, { 
      touches: [{ clientX: 100, clientY: 100 }] 
    });
    fireEvent.touchMove(card, { 
      touches: [{ clientX: 200, clientY: 100 }] 
    });

    // Should show like overlay
    expect(screen.getByTestId('like-overlay')).toBeInTheDocument();
  });

  it('should show distance information', () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    expect(screen.getByText(/New York, NY/i)).toBeInTheDocument();
  });

  it('should display compatibility score if provided', () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    expect(screen.getByText(/85% match/i)).toBeInTheDocument();
  });

  it('should display personality tags', () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    expect(screen.getByText('friendly')).toBeInTheDocument();
    expect(screen.getByText('energetic')).toBeInTheDocument();
    expect(screen.getByText('playful')).toBeInTheDocument();
  });

  it('should display owner information', () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/online/i)).toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<SwipeCard pet={mockPet} onLike={mockOnLike} onPass={mockOnPass} onSuperLike={mockOnSuperLike} />);

    const card = screen.getByTestId('swipe-card');
    card.focus();

    // Press right arrow for like
    await user.keyboard('{ArrowRight}');
    expect(mockOnLike).toHaveBeenCalled();

    // Press left arrow for pass
    await user.keyboard('{ArrowLeft}');
    expect(mockOnPass).toHaveBeenCalled();

    // Press up arrow for super like
    await user.keyboard('{ArrowUp}');
    expect(mockOnSuperLike).toHaveBeenCalled();
  });

  it('should handle mouse drag gestures', async () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    const card = screen.getByTestId('swipe-card');
    
    // Simulate mouse drag right
    fireEvent.mouseDown(card, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(card, { clientX: 300, clientY: 100 });
    fireEvent.mouseUp(card);

    await waitFor(() => {
      expect(mockOnSwipe).toHaveBeenCalledWith('like', mockPet);
    });
  });

  it('should handle pet without photos gracefully', () => {
    const petWithoutPhotos = { ...mockPet, photos: [] };
    
    render(<SwipeCard pet={petWithoutPhotos} onSwipe={mockOnSwipe} />);

    // Should show placeholder image
    expect(screen.getByTestId('placeholder-image')).toBeInTheDocument();
  });

  it('should handle pet without description', () => {
    const petWithoutDescription = { ...mockPet, description: '' };
    
    render(<SwipeCard pet={petWithoutDescription} onSwipe={mockOnSwipe} />);

    // Should still render other information
    expect(screen.getByText('Buddy')).toBeInTheDocument();
    expect(screen.getByText(/Golden Retriever/i)).toBeInTheDocument();
  });

  it('should handle pet without compatibility score', () => {
    const petWithoutScore = { ...mockPet, compatibilityScore: undefined };
    
    render(<SwipeCard pet={petWithoutScore} onSwipe={mockOnSwipe} />);

    // Should not show compatibility score
    expect(screen.queryByText(/% match/i)).not.toBeInTheDocument();
  });

  it('should handle pet without personality tags', () => {
    const petWithoutTags = { ...mockPet, personality_tags: [] };
    
    render(<SwipeCard pet={petWithoutTags} onSwipe={mockOnSwipe} />);

    // Should not show personality tags section
    expect(screen.queryByTestId('personality-tags')).not.toBeInTheDocument();
  });

  it('should handle pet without owner information', () => {
    const petWithoutOwner = { ...mockPet, owner: undefined };
    
    render(<SwipeCard pet={petWithoutOwner} onSwipe={mockOnSwipe} />);

    // Should not show owner information
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('should be accessible with proper ARIA labels', () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    const card = screen.getByTestId('swipe-card');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Buddy'));

    const likeButton = screen.getByRole('button', { name: /like/i });
    expect(likeButton).toHaveAttribute('aria-label', expect.stringContaining('like'));

    const passButton = screen.getByRole('button', { name: /pass/i });
    expect(passButton).toHaveAttribute('aria-label', expect.stringContaining('pass'));
  });

  it('should support screen readers', () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    // Should have descriptive text for screen readers
    expect(screen.getByText(/Buddy, a 3 year old Golden Retriever/i)).toBeInTheDocument();
    expect(screen.getByText(/Located in New York, NY/i)).toBeInTheDocument();
  });

  it('should handle rapid swipes gracefully', async () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    const card = screen.getByTestId('swipe-card');
    
    // Simulate rapid swipes
    for (let i = 0; i < 5; i++) {
      fireEvent.touchStart(card, { 
        touches: [{ clientX: 100, clientY: 100 }] 
      });
      fireEvent.touchMove(card, { 
        touches: [{ clientX: 300, clientY: 100 }] 
      });
      fireEvent.touchEnd(card);
    }

    // Should only call onSwipe once (debounced)
    await waitFor(() => {
      expect(mockOnSwipe).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle edge case swipe distances', async () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    const card = screen.getByTestId('swipe-card');
    
    // Very small swipe (should not trigger)
    fireEvent.touchStart(card, { 
      touches: [{ clientX: 100, clientY: 100 }] 
    });
    fireEvent.touchMove(card, { 
      touches: [{ clientX: 110, clientY: 100 }] 
    });
    fireEvent.touchEnd(card);

    // Should not trigger swipe
    expect(mockOnSwipe).not.toHaveBeenCalled();
  });

  it('should handle swipe with rotation', async () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    const card = screen.getByTestId('swipe-card');
    
    // Swipe with diagonal movement
    fireEvent.touchStart(card, { 
      touches: [{ clientX: 100, clientY: 100 }] 
    });
    fireEvent.touchMove(card, { 
      touches: [{ clientX: 300, clientY: 50 }] 
    });
    fireEvent.touchEnd(card);

    await waitFor(() => {
      expect(mockOnSwipe).toHaveBeenCalledWith('like', mockPet);
    });
  });
});
