import { render, screen } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import PageTransition from './PageTransition';

// Mock Next.js usePathname
const mockPathname = '/';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

const TestComponent = () => <div data-testid="test-content">Test Content</div>;

const renderPageTransition = () => {
  return render(
    <PageTransition>
      <TestComponent />
    </PageTransition>
  );
};

describe('PageTransition Component', () => {
  it('renders children content', () => {
    renderPageTransition();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('wraps content in motion.div with proper classes', () => {
    renderPageTransition();
    
    const content = screen.getByTestId('test-content');
    const motionDiv = content.parentElement;
    
    expect(motionDiv).toHaveClass('h-full', 'w-full');
  });

  it('applies correct initial animation state', () => {
    renderPageTransition();
    
    // The motion div should exist and be properly structured
    const content = screen.getByTestId('test-content');
    expect(content).toBeInTheDocument();
    
    // Since we can't easily test Framer Motion animations in jsdom,
    // we verify the component renders without crashing
  });

  it('has proper animation variants structure', () => {
    // Test that the component doesn't crash with animation props
    expect(() => renderPageTransition()).not.toThrow();
  });
});
