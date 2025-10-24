/**
 * Toast Component Tests
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '../toast';

// Test component that uses the toast hook
const TestComponent = () => {
  const toast = useToast();

  return (
    <div>
      <button onClick={() => toast.success('Success', 'Success message')}>
        Show Success
      </button>
      <button onClick={() => toast.error('Error', 'Error message')}>
        Show Error
      </button>
      <button onClick={() => toast.warning('Warning', 'Warning message')}>
        Show Warning
      </button>
      <button onClick={() => toast.info('Info', 'Info message')}>
        Show Info
      </button>
    </div>
  );
};

describe('Toast Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('ToastProvider', () => {
    it('should render children', () => {
      render(
        <ToastProvider>
          <div>Test Content</div>
        </ToastProvider>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should throw error when useToast is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const BadComponent = () => {
        useToast();
        return null;
      };

      expect(() => render(<BadComponent />)).toThrow(
        'useToast must be used within ToastProvider'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Toast notifications', () => {
    it('should show success toast', async () => {
      const user = userEvent.setup({ delay: null });
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByText('Show Success'));

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('should show error toast', async () => {
      const user = userEvent.setup({ delay: null });
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByText('Show Error'));

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should show warning toast', async () => {
      const user = userEvent.setup({ delay: null });
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByText('Show Warning'));

      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    it('should show info toast', async () => {
      const user = userEvent.setup({ delay: null });
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByText('Show Info'));

      expect(screen.getByText('Info')).toBeInTheDocument();
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });
  });

  describe('Toast behavior', () => {
    it('should auto-dismiss after duration', async () => {
      const user = userEvent.setup({ delay: null });
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByText('Show Success'));

      expect(screen.getByText('Success')).toBeInTheDocument();

      // Fast-forward time by 5 seconds (default duration)
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Success')).not.toBeInTheDocument();
      });
    });

    it('should allow manual dismissal', async () => {
      const user = userEvent.setup({ delay: null });
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByText('Show Success'));

      expect(screen.getByText('Success')).toBeInTheDocument();

      // Click the X button
      const closeButton = screen.getByRole('button', { name: '' }); // X button has no text
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Success')).not.toBeInTheDocument();
      });
    });

    it('should stack multiple toasts', async () => {
      const user = userEvent.setup({ delay: null });
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByText('Show Success'));
      await user.click(screen.getByText('Show Error'));
      await user.click(screen.getByText('Show Warning'));

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('should handle toast without message', async () => {
      const TestComponentNoMessage = () => {
        const toast = useToast();
        return (
          <button onClick={() => toast.success('Title Only')}>
            Show Toast
          </button>
        );
      };

      const user = userEvent.setup({ delay: null });
      
      render(
        <ToastProvider>
          <TestComponentNoMessage />
        </ToastProvider>
      );

      await user.click(screen.getByText('Show Toast'));

      expect(screen.getByText('Title Only')).toBeInTheDocument();
    });

    it('should use longer duration for error toasts', async () => {
      const user = userEvent.setup({ delay: null });
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByText('Show Error'));

      expect(screen.getByText('Error')).toBeInTheDocument();

      // Fast-forward by 5 seconds (default duration)
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Error toast should still be visible (7s duration)
      expect(screen.getByText('Error')).toBeInTheDocument();

      // Fast-forward by another 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Toast animations', () => {
    it('should animate in', async () => {
      const user = userEvent.setup({ delay: null });
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByText('Show Success'));

      const toast = screen.getByText('Success').closest('div');
      expect(toast).toBeInTheDocument();
    });

    it('should animate out on dismiss', async () => {
      const user = userEvent.setup({ delay: null });
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByText('Show Success'));

      const closeButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('svg') // Find the X button
      );
      
      if (closeButton) {
        await user.click(closeButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('Success')).not.toBeInTheDocument();
      });
    });
  });

  describe('Toast types and styling', () => {
    it('should render success toast with correct styling', async () => {
      const user = userEvent.setup({ delay: null });
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByText('Show Success'));

      const toast = screen.getByText('Success').closest('div');
      expect(toast).toHaveClass('bg-green-50');
    });

    it('should render error toast with correct styling', async () => {
      const user = userEvent.setup({ delay: null });
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByText('Show Error'));

      const toast = screen.getByText('Error').closest('div');
      expect(toast).toHaveClass('bg-red-50');
    });

    it('should render warning toast with correct styling', async () => {
      const user = userEvent.setup({ delay: null });
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByText('Show Warning'));

      const toast = screen.getByText('Warning').closest('div');
      expect(toast).toHaveClass('bg-yellow-50');
    });

    it('should render info toast with correct styling', async () => {
      const user = userEvent.setup({ delay: null });
      
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByText('Show Info'));

      const toast = screen.getByText('Info').closest('div');
      expect(toast).toHaveClass('bg-blue-50');
    });
  });
});
