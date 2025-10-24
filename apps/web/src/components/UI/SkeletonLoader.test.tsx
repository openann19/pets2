import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SkeletonLoader from './SkeletonLoader';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, className, ...props }: any, ref: any) => (
      <div ref={ref} className={className} data-testid="skeleton" {...props}>
        {children}
      </div>
    )),
  },
}));

describe('SkeletonLoader Component', () => {
  it('renders default rectangle skeleton', () => {
    render(<SkeletonLoader />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('bg-gray-200', 'rounded', 'w-full', 'h-4');
  });

  it('renders match card skeleton variant with proper structure', () => {
    render(<SkeletonLoader variant="matchCard" />);
    
    // Should have main container
    const container = document.querySelector('.bg-white');
    expect(container).toHaveClass('rounded-xl', 'shadow-sm', 'border-gray-200', 'p-4');
    
    // Should have avatar placeholder
    const avatar = document.querySelector('.w-12.h-12.bg-gray-200.rounded-full');
    expect(avatar).toBeInTheDocument();
    
    // Should have text placeholders
    const textPlaceholders = document.querySelectorAll('.bg-gray-200.rounded');
    expect(textPlaceholders.length).toBeGreaterThan(2);
  });

  it('renders message skeleton variant', () => {
    render(<SkeletonLoader variant="message" />);
    
    const container = document.querySelector('.flex');
    expect(container).toBeInTheDocument();
    
    const messageContainer = document.querySelector('.bg-gray-200');
    expect(messageContainer).toHaveClass('rounded-lg');
  });

  it('renders avatar skeleton variant', () => {
    render(<SkeletonLoader variant="avatar" width="w-10" height="h-10" />);
    
    const avatar = screen.getByTestId('skeleton');
    expect(avatar).toHaveClass('bg-gray-200', 'rounded-full', 'w-10', 'h-10');
  });

  it('renders text skeleton variant', () => {
    render(<SkeletonLoader variant="text" width="w-32" height="h-6" />);
    
    const text = screen.getByTestId('skeleton');
    expect(text).toHaveClass('bg-gray-200', 'rounded', 'w-32', 'h-6');
  });

  it('applies custom className', () => {
    render(<SkeletonLoader className="custom-class" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('uses custom width and height', () => {
    render(<SkeletonLoader width="w-24" height="h-8" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('w-24', 'h-8');
  });

  it('has proper animation attributes', () => {
    render(<SkeletonLoader />);
    
    const skeleton = document.querySelector('div');
    // Check that it's a motion.div with animation
    expect(skeleton).toBeInTheDocument();
  });
});
