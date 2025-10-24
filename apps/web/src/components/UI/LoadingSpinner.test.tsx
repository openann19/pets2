import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    let spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();

    rerender(<LoadingSpinner size="medium" />);
    spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();

    rerender(<LoadingSpinner size="large" />);
    spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('custom-class');
  });

  it('has correct accessibility attributes', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
    expect(spinner).toHaveAttribute('role', 'img');
  });

  it('renders paw print animations', () => {
    const { container } = render(<LoadingSpinner />);

    // Check that SVG elements are present (paw prints)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('applies custom color', () => {
    const customColor = '#FF0000';
    const { container } = render(<LoadingSpinner color={customColor} />);

    const svgs = container.querySelectorAll('svg');
    svgs.forEach(svg => {
      expect(svg).toHaveAttribute('fill', customColor);
    });
  });
});
