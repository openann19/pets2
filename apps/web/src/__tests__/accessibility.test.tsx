import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AccessibilityProvider, AccessibilitySettings } from '@/components/AccessibilityProvider';
import { GlobalErrorBoundary } from '@/components/ErrorBoundary/GlobalErrorBoundary';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('AccessibilityProvider', () => {
    it('should render without accessibility violations', async () => {
      const { container } = render(
        <AccessibilityProvider>
          <div>Test content</div>
        </AccessibilityProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should initialize with system preferences', () => {
      // Mock reduced motion preference
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <AccessibilityProvider>
          <div>Test content</div>
        </AccessibilityProvider>
      );

      expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
    });

    it('should apply high contrast mode', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'accessibility-high-contrast') return 'true';
        return null;
      });

      render(
        <AccessibilityProvider>
          <div>Test content</div>
        </AccessibilityProvider>
      );

      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    });

    it('should detect keyboard navigation', () => {
      render(
        <AccessibilityProvider>
          <div>Test content</div>
        </AccessibilityProvider>
      );

      // Simulate Tab key press
      fireEvent.keyDown(document, { key: 'Tab' });

      expect(document.documentElement.classList.contains('focus-visible')).toBe(true);
    });
  });

  describe('AccessibilitySettings', () => {
    it('should render without accessibility violations', async () => {
      const { container } = render(
        <AccessibilityProvider>
          <AccessibilitySettings />
        </AccessibilityProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper labels for all form controls', () => {
      render(
        <AccessibilityProvider>
          <AccessibilitySettings />
        </AccessibilityProvider>
      );

      // Check for proper labels
      expect(screen.getByLabelText(/reduce motion/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/high contrast/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/font size/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/screen reader/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/keyboard navigation/i)).toBeInTheDocument();
    });

    it('should save preferences to localStorage', () => {
      render(
        <AccessibilityProvider>
          <AccessibilitySettings />
        </AccessibilityProvider>
      );

      const reducedMotionCheckbox = screen.getByLabelText(/reduce motion/i);
      fireEvent.click(reducedMotionCheckbox);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'accessibility-reduced-motion',
        'true'
      );
    });

    it('should load saved preferences from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'accessibility-font-size') return 'large';
        return null;
      });

      render(
        <AccessibilityProvider>
          <AccessibilitySettings />
        </AccessibilityProvider>
      );

      const fontSizeSelect = screen.getByLabelText(/font size/i);
      expect(fontSizeSelect.value).toBe('large');
    });
  });

  describe('GlobalErrorBoundary', () => {
    const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    };

    it('should render without accessibility violations', async () => {
      const { container } = render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={false} />
        </GlobalErrorBoundary>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should catch errors and display error UI', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/try again/i)).toBeInTheDocument();
      expect(screen.getByText(/go home/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should have proper ARIA attributes in error state', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      consoleSpy.mockRestore();
    });

    it('should allow retry after error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      const retryButton = screen.getByText(/try again/i);
      fireEvent.click(retryButton);

      // Should show the component again (no error)
      expect(screen.getByText('No error')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation', () => {
      render(
        <AccessibilityProvider>
          <div>
            <button>First button</button>
            <button>Second button</button>
            <button>Third button</button>
          </div>
        </AccessibilityProvider>
      );

      const firstButton = screen.getByText('First button');
      const secondButton = screen.getByText('Second button');
      const thirdButton = screen.getByText('Third button');

      // Focus first button
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);

      // Tab to second button
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(document.activeElement).toBe(secondButton);

      // Tab to third button
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(document.activeElement).toBe(thirdButton);
    });

    it('should support Enter key activation', () => {
      const handleClick = jest.fn();
      
      render(
        <AccessibilityProvider>
          <button onClick={handleClick}>Clickable button</button>
        </AccessibilityProvider>
      );

      const button = screen.getByText('Clickable button');
      button.focus();

      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });

    it('should support Space key activation', () => {
      const handleClick = jest.fn();
      
      render(
        <AccessibilityProvider>
          <button onClick={handleClick}>Clickable button</button>
        </AccessibilityProvider>
      );

      const button = screen.getByText('Clickable button');
      button.focus();

      fireEvent.keyDown(button, { key: ' ' });
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Screen Reader Support', () => {
    it('should announce messages to screen readers', () => {
      const TestComponent = () => {
        const { announceToScreenReader } = useAccessibility();
        
        return (
          <button onClick={() => announceToScreenReader('Test announcement')}>
            Announce
          </button>
        );
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const button = screen.getByText('Announce');
      fireEvent.click(button);

      // Check if announcement element was created
      const announcement = document.querySelector('[aria-live]');
      expect(announcement).toBeInTheDocument();
    });

    it('should have skip to content functionality', () => {
      render(
        <AccessibilityProvider>
          <div>
            <main id="main-content">Main content</main>
          </div>
        </AccessibilityProvider>
      );

      const skipButton = screen.getByText(/skip to main content/i);
      fireEvent.click(skipButton);

      const mainContent = document.getElementById('main-content');
      expect(document.activeElement).toBe(mainContent);
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient color contrast in high contrast mode', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'accessibility-high-contrast') return 'true';
        return null;
      });

      const { container } = render(
        <AccessibilityProvider>
          <div className="text-gray-900 bg-white">
            <h1>High contrast text</h1>
            <p>This text should have sufficient contrast</p>
          </div>
        </AccessibilityProvider>
      );

      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    });
  });

  describe('Focus Management', () => {
    it('should show focus indicators when using keyboard', () => {
      render(
        <AccessibilityProvider>
          <button>Test button</button>
        </AccessibilityProvider>
      );

      const button = screen.getByText('Test button');
      
      // Simulate keyboard focus
      fireEvent.keyDown(document, { key: 'Tab' });
      button.focus();

      expect(document.documentElement.classList.contains('focus-visible')).toBe(true);
    });

    it('should hide focus indicators when using mouse', () => {
      render(
        <AccessibilityProvider>
          <button>Test button</button>
        </AccessibilityProvider>
      );

      const button = screen.getByText('Test button');
      
      // Simulate mouse click
      fireEvent.mouseDown(button);

      expect(document.documentElement.classList.contains('focus-visible')).toBe(false);
    });
  });
});

// Helper function to use accessibility context in tests
function useAccessibility() {
  const context = React.useContext(require('@/components/AccessibilityProvider').AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
