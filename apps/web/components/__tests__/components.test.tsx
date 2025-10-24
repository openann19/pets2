/**
 * Web Components Test Suite
 * Comprehensive tests for production-hardened web components and stores
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mock the logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});

describe('Button Component', () => {
  const { Button } = require('../ui/Button');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-600');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-600');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  it('shows loading state', () => {
    render(<Button loading>Loading...</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('prevents clicks when disabled or loading', async () => {
    const handleClick = jest.fn();

    const { rerender } = render(<Button disabled onClick={handleClick}>Disabled</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();

    rerender(<Button loading onClick={handleClick}>Loading</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('supports icons', () => {
    render(
      <Button leftIcon="←" rightIcon="→">
        With Icons
      </Button>
    );

    expect(screen.getByText('←')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();
    expect(screen.getByText('With Icons')).toBeInTheDocument();
  });

  it('logs button interactions', async () => {
    const { logger } = require('@pawfectmatch/core');

    render(<Button>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(logger.debug).toHaveBeenCalledWith('Button clicked', {
        variant: 'primary',
        size: 'md',
      });
    });
  });
});

describe('ErrorBoundary Component', () => {
  const { ErrorBoundary } = require('../components/ui/ErrorBoundary');

  const ProblemComponent = () => {
    throw new Error('Test error');
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders fallback UI on error', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('logs errors appropriately', () => {
    const { logger } = require('@pawfectmatch/core');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemComponent />
      </ErrorBoundary>
    );

    expect(logger.error).toHaveBeenCalledWith(
      'React Error Boundary caught error',
      expect.objectContaining({
        error: 'Test error',
        componentStack: expect.any(String),
      })
    );

    consoleSpy.mockRestore();
  });

  it('allows custom fallback UI', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Custom error message</div>}>
        <ProblemComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('resets error boundary on retry', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary>
        <ProblemComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click retry
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    // Re-render with normal content
    rerender(
      <ErrorBoundary>
        <div>Normal content after retry</div>
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText('Normal content after retry')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});

describe('UI Store', () => {
  const { useUIStore } = require('../stores/uiStore');

  beforeEach(() => {
    // Reset store state
    useUIStore.setState({
      theme: 'light',
      systemTheme: 'light',
      modals: [],
      notifications: [],
      loadingStates: [],
      sidebarOpen: false,
      mobileMenuOpen: false,
    });
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('Theme Management', () => {
    it('sets theme correctly', () => {
      const { setTheme } = useUIStore.getState();

      setTheme('dark');
      expect(useUIStore.getState().theme).toBe('dark');

      setTheme('system');
      expect(useUIStore.getState().theme).toBe('system');
    });

    it('persists theme to localStorage', () => {
      const { setTheme } = useUIStore.getState();

      setTheme('dark');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ui-store',
        JSON.stringify({ state: { theme: 'dark' }, version: 0 })
      );
    });
  });

  describe('Modal Management', () => {
    it('opens and closes modals', () => {
      const { openModal, closeModal } = useUIStore.getState();

      openModal({
        id: 'test-modal',
        component: () => React.createElement('div'),
      });

      expect(useUIStore.getState().modals).toHaveLength(1);
      expect(useUIStore.getState().modals[0].isOpen).toBe(true);

      closeModal('test-modal');

      // Modal should still exist but be closed
      expect(useUIStore.getState().modals).toHaveLength(1);
      expect(useUIStore.getState().modals[0].isOpen).toBe(false);
    });

    it('closes all modals', () => {
      const { openModal, closeAllModals } = useUIStore.getState();

      openModal({
        id: 'modal1',
        component: () => React.createElement('div'),
      });
      openModal({
        id: 'modal2',
        component: () => React.createElement('div'),
      });

      expect(useUIStore.getState().modals).toHaveLength(2);

      closeAllModals();

      expect(useUIStore.getState().modals).toHaveLength(2);
      expect(useUIStore.getState().modals.every(m => !m.isOpen)).toBe(true);
    });
  });

  describe('Notification Management', () => {
    it('adds and removes notifications', () => {
      const { addNotification, removeNotification } = useUIStore.getState();

      addNotification({
        type: 'success',
        title: 'Success!',
        message: 'Operation completed',
      });

      expect(useUIStore.getState().notifications).toHaveLength(1);
      expect(useUIStore.getState().notifications[0].type).toBe('success');

      const notificationId = useUIStore.getState().notifications[0].id;
      removeNotification(notificationId);

      expect(useUIStore.getState().notifications).toHaveLength(0);
    });

    it('auto-removes notifications after duration', async () => {
      jest.useFakeTimers();
      const { addNotification } = useUIStore.getState();

      addNotification({
        type: 'info',
        title: 'Test',
        duration: 1000,
      });

      expect(useUIStore.getState().notifications).toHaveLength(1);

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(useUIStore.getState().notifications).toHaveLength(0);
      });

      jest.useRealTimers();
    });
  });

  describe('Loading States', () => {
    it('manages loading states', () => {
      const { setLoading, removeLoading, updateLoadingProgress } = useUIStore.getState();

      setLoading({
        id: 'test-loading',
        message: 'Loading data...',
        progress: 50,
      });

      expect(useUIStore.getState().loadingStates).toHaveLength(1);
      expect(useUIStore.getState().loadingStates[0].progress).toBe(50);

      updateLoadingProgress('test-loading', 75);
      expect(useUIStore.getState().loadingStates[0].progress).toBe(75);

      removeLoading('test-loading');
      expect(useUIStore.getState().loadingStates).toHaveLength(0);
    });
  });
});

describe('AppLayout Component', () => {
  const { AppLayout } = require('../components/layout/AppLayout');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(
      <AppLayout>
        <div>Test content</div>
      </AppLayout>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('PawfectMatch')).toBeInTheDocument();
  });

  it('shows/hides header based on props', () => {
    const { rerender } = render(
      <AppLayout showHeader={false}>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.queryByText('PawfectMatch')).not.toBeInTheDocument();

    rerender(
      <AppLayout showHeader={true}>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByText('PawfectMatch')).toBeInTheDocument();
  });

  it('includes error boundary', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const ProblemChild = () => {
      throw new Error('Test error');
    };

    render(
      <AppLayout>
        <ProblemChild />
      </AppLayout>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('updates document title', () => {
    render(
      <AppLayout title="Test Page">
        <div>Content</div>
      </AppLayout>
    );

    expect(document.title).toBe('Test Page');
  });
});
