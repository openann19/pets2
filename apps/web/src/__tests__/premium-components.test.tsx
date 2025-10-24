/**
 * 🧪 Premium Components Test Suite
 * Comprehensive testing for all premium UI components
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Component imports
import PremiumButton from '../components/UI/PremiumButton';
import PremiumCard from '../components/UI/PremiumCard';
import PremiumInput from '../components/UI/PremiumInput';
import MobileSwipeCard from '../components/UI/MobileSwipeCard';

// Mock data
const mockPet = {
  id: '1',
  name: 'Max',
  breed: 'Golden Retriever',
  age: 3,
  description: 'Friendly and energetic dog',
  photos: [
    { url: 'https://example.com/photo1.jpg', isPrimary: true },
    { url: 'https://example.com/photo2.jpg', isPrimary: false }
  ],
  personalityTags: ['Playful', 'Friendly', 'Energetic'],
  species: 'dog',
  size: 'large',
  intent: 'playdate',
  healthInfo: {
    vaccinated: true,
    spayedNeutered: true
  },
  featured: { isFeatured: false },
  owner: {
    name: 'John Doe',
    location: { city: 'San Francisco' }
  }
};

expect.extend(toHaveNoViolations);

// Mock haptic feedback
const mockTriggerHaptic = jest.fn();
const mockTriggerSound = jest.fn();
const mockAnnounce = jest.fn();

jest.mock('../hooks/useAccessibility', () => ({
  useHaptics: () => ({ triggerHaptic: mockTriggerHaptic }),
  useSoundFeedback: () => ({ triggerSound: mockTriggerSound }),
  useAccessibility: () => ({
    announce: mockAnnounce,
    isReducedMotion: false,
    isHighContrast: false,
    isScreenReader: false,
    isKeyboardUser: false,
    fontSize: 'medium',
    colorScheme: 'light',
  }),
}));

describe('PremiumButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<PremiumButton>Click me</PremiumButton>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<PremiumButton onClick={handleClick}>Click me</PremiumButton>);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(mockTriggerHaptic).toHaveBeenCalledWith('medium');
  });

  it('handles keyboard navigation', async () => {
    const handleClick = jest.fn();
    render(<PremiumButton onClick={handleClick}>Click me</PremiumButton>);
    
    const button = screen.getByRole('button');
    button.focus();
    
    await userEvent.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    await userEvent.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('shows loading state correctly', () => {
    render(<PremiumButton loading>Loading...</PremiumButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('applies different variants correctly', () => {
    const { rerender } = render(<PremiumButton variant="primary">Primary</PremiumButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-gradient-to-r');
    
    rerender(<PremiumButton variant="glass">Glass</PremiumButton>);
    expect(screen.getByRole('button')).toHaveClass('backdrop-blur');
  });

  it('handles accessibility props correctly', () => {
    render(
      <PremiumButton
        aria-label="Custom label"
        aria-describedby="description"
        aria-pressed={true}
        role="button"
      >
        Button
      </PremiumButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
    expect(button).toHaveAttribute('aria-describedby', 'description');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(<PremiumButton>Click me</PremiumButton>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('PremiumCard', () => {
  it('renders correctly with default props', () => {
    render(
      <PremiumCard>
        <div>Card content</div>
      </PremiumCard>
    );
    
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies different variants correctly', () => {
    const { rerender } = render(
      <PremiumCard variant="glass">
        <div>Glass card</div>
      </PremiumCard>
    );
    expect(screen.getByText('Glass card').parentElement).toHaveClass('backdrop-blur');
    
    rerender(
      <PremiumCard variant="holographic">
        <div>Holographic card</div>
      </PremiumCard>
    );
    expect(screen.getByText('Holographic card').parentElement).toHaveClass('text-white');
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(
      <PremiumCard onClick={handleClick}>
        <div>Clickable card</div>
      </PremiumCard>
    );
    
    const card = screen.getByText('Clickable card').parentElement;
    await userEvent.click(card!);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation', async () => {
    const handleClick = jest.fn();
    render(
      <PremiumCard onClick={handleClick} tabIndex={0}>
        <div>Keyboard accessible card</div>
      </PremiumCard>
    );
    
    const card = screen.getByText('Keyboard accessible card').parentElement;
    card?.focus();
    
    await userEvent.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(
      <PremiumCard>
        <div>Card content</div>
      </PremiumCard>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('PremiumInput', () => {
  it('renders correctly with label', () => {
    render(<PremiumInput label="Email" placeholder="Enter your email" />);
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  it('handles input changes', async () => {
    const handleChange = jest.fn();
    render(<PremiumInput onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test@example.com');
    
    expect(handleChange).toHaveBeenCalledWith('test@example.com');
  });

  it('shows error state correctly', () => {
    render(<PremiumInput error="This field is required" />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('handles different variants', () => {
    const { rerender } = render(<PremiumInput variant="glass" />);
    expect(screen.getByRole('textbox').parentElement).toHaveClass('backdrop-blur');
    
    rerender(<PremiumInput variant="floating" />);
    expect(screen.getByRole('textbox').parentElement).toHaveClass('relative');
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(<PremiumInput label="Email" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('MobileSwipeCard', () => {
  const mockOnSwipeLeft = jest.fn();
  const mockOnSwipeRight = jest.fn();
  const mockOnSwipeUp = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pet information correctly', () => {
    render(
      <MobileSwipeCard
        pet={mockPet}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );
    
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Golden Retriever')).toBeInTheDocument();
    expect(screen.getByText('3 years old')).toBeInTheDocument();
  });

  it('handles action button clicks', async () => {
    render(
      <MobileSwipeCard
        pet={mockPet}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );
    
    // Test pass button
    const passButton = screen.getByLabelText('Pass on this pet');
    await userEvent.click(passButton);
    expect(mockOnSwipeLeft).toHaveBeenCalledWith(mockPet);
    
    // Test like button
    const likeButton = screen.getByLabelText('Like this pet');
    await userEvent.click(likeButton);
    expect(mockOnSwipeRight).toHaveBeenCalledWith(mockPet);
    
    // Test super like button
    const superLikeButton = screen.getByLabelText('Super like this pet');
    await userEvent.click(superLikeButton);
    expect(mockOnSwipeUp).toHaveBeenCalledWith(mockPet);
  });

  it('handles keyboard navigation', async () => {
    render(
      <MobileSwipeCard
        pet={mockPet}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );
    
    const card = screen.getByRole('button');
    card.focus();
    
    // Test arrow key navigation
    await userEvent.keyboard('{ArrowLeft}');
    expect(mockOnSwipeLeft).toHaveBeenCalledWith(mockPet);
    
    await userEvent.keyboard('{ArrowRight}');
    expect(mockOnSwipeRight).toHaveBeenCalledWith(mockPet);
    
    await userEvent.keyboard('{ArrowUp}');
    expect(mockOnSwipeUp).toHaveBeenCalledWith(mockPet);
  });

  it('shows photo navigation for multiple photos', () => {
    render(
      <MobileSwipeCard
        pet={mockPet}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );
    
    // Should show photo indicators
    const indicators = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.includes('Go to photo')
    );
    expect(indicators).toHaveLength(2);
  });

  it('handles photo navigation', async () => {
    render(
      <MobileSwipeCard
        pet={mockPet}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );
    
    const nextButton = screen.getByLabelText('Next photo');
    await userEvent.click(nextButton);
    
    // Should show second photo indicator as active
    const indicators = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.includes('Go to photo')
    );
    expect(indicators[1]).toHaveClass('bg-white');
  });

  it('provides comprehensive screen reader content', () => {
    render(
      <MobileSwipeCard
        pet={mockPet}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );
    
    // Check for screen reader content
    expect(screen.getByText('Pet name: Max')).toBeInTheDocument();
    expect(screen.getByText('Age: 3 years old')).toBeInTheDocument();
    expect(screen.getByText('Breed: Golden Retriever')).toBeInTheDocument();
    expect(screen.getByText('Personality: Playful, Friendly, Energetic')).toBeInTheDocument();
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(
      <MobileSwipeCard
        pet={mockPet}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Component Integration Tests', () => {
  it('components work together in a form', async () => {
    const handleSubmit = jest.fn();
    
    render(
      <form onSubmit={handleSubmit}>
        <PremiumInput
          label="Email"
          type="email"
          required
          aria-describedby="email-help"
        />
        <div id="email-help">Enter your email address</div>
        
        <PremiumButton type="submit" variant="primary">
          Submit
        </PremiumButton>
      </form>
    );
    
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);
    
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('components maintain consistent styling', () => {
    render(
      <div>
        <PremiumCard variant="glass" className="mb-4">
          <PremiumInput label="Name" variant="glass" />
        </PremiumCard>
        
        <PremiumButton variant="glass">
          Glass Button
        </PremiumButton>
      </div>
    );
    
    const card = screen.getByText('Name').closest('[class*="backdrop-blur"]');
    const input = screen.getByLabelText('Name').closest('[class*="backdrop-blur"]');
    const button = screen.getByRole('button');
    
    expect(card).toHaveClass('backdrop-blur');
    expect(input).toHaveClass('backdrop-blur');
    expect(button).toHaveClass('backdrop-blur');
  });
});

describe('Performance Tests', () => {
  it('components render efficiently', () => {
    const startTime = performance.now();
    
    render(
      <div>
        {Array.from({ length: 100 }, (_, i) => (
          <PremiumButton key={i}>Button {i}</PremiumButton>
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render 100 buttons in under 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it('animations respect reduced motion preference', () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(<PremiumButton>Button</PremiumButton>);
    
    const button = screen.getByRole('button');
    // Should not have animation classes when reduced motion is preferred
    expect(button).not.toHaveClass('animate-bounce');
  });
});
