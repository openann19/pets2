import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PremiumButton from './PremiumButton';

describe('PremiumButton Component', () => {
  it('renders children correctly', () => {
    render(<PremiumButton>Click me</PremiumButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<PremiumButton onClick={handleClick}>Click me</PremiumButton>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant styles', () => {
    const { rerender } = render(<PremiumButton variant="primary">Primary</PremiumButton>);
    const primaryButton = screen.getByText('Primary').closest('button');
    expect(primaryButton).toHaveStyle('background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)');

    rerender(<PremiumButton variant="secondary">Secondary</PremiumButton>);
    const secondaryButton = screen.getByText('Secondary').closest('button');
    expect(secondaryButton).toHaveStyle('background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)');

    rerender(<PremiumButton variant="danger">Danger</PremiumButton>);
    const dangerButton = screen.getByText('Danger').closest('button');
    expect(dangerButton).toHaveStyle('background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%)');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<PremiumButton size="sm">Small</PremiumButton>);
    const smallButton = screen.getByText('Small').closest('button');
    expect(smallButton).toHaveClass('px-3', 'sm:px-4', 'py-2', 'text-sm', 'min-h-[36px]');

    rerender(<PremiumButton size="md">Medium</PremiumButton>);
    const mediumButton = screen.getByText('Medium').closest('button');
    expect(mediumButton).toHaveClass('px-4', 'sm:px-6', 'py-3', 'text-base', 'min-h-[44px]');

    rerender(<PremiumButton size="lg">Large</PremiumButton>);
    const largeButton = screen.getByText('Large').closest('button');
    expect(largeButton).toHaveClass('px-6', 'sm:px-8', 'py-4', 'text-lg', 'min-h-[52px]');
  });

  it('shows loading state correctly', () => {
    render(<PremiumButton loading>Loading</PremiumButton>);
    const loadingButton = screen.getByText('Loading').closest('button');
    expect(loadingButton).toBeDisabled();
    
    // Check if loading spinner is present
    const loadingSpinner = loadingButton?.querySelector('[data-testid="loading-spinner"]');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    const handleClick = jest.fn();
    render(<PremiumButton loading onClick={handleClick}>Loading</PremiumButton>);

    fireEvent.click(screen.getByText('Loading'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    const handleClick = jest.fn();
    render(<PremiumButton disabled onClick={handleClick}>Disabled</PremiumButton>);

    fireEvent.click(screen.getByText('Disabled'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
