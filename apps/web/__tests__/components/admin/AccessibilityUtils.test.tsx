import {
  AccessibleButton,
  AccessibleDropdown,
  AccessibleFormField,
  AccessibleLoadingSpinner,
  AccessibleModal,
  AccessibleProgressBar,
  AriaLiveRegion,
  SkipLink,
  SrOnly,
  useAnnouncement,
  useColorScheme,
  useFocusManagement,
  useFocusTrap,
  useHighContrastMode,
  useKeyboardNavigation,
  useReducedMotion,
} from '@/components/admin/AccessibilityUtils';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button {...props}>{children}</button>
    ),
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock React Portal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('AccessibilityUtils', () => {
  describe('AriaLiveRegion', () => {
    it('renders without crashing', () => {
      render(<AriaLiveRegion message="Test announcement" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('announces messages', () => {
      render(<AriaLiveRegion message="Test announcement" />);
      expect(screen.getByText('Test announcement')).toBeInTheDocument();
    });

    it('applies correct priority', () => {
      render(
        <AriaLiveRegion
          message="Test announcement"
          priority="assertive"
        />,
      );
      const region = screen.getByRole('status');
      expect(region).toHaveAttribute('aria-live', 'assertive');
    });

    it('clears announcements after timeout', async () => {
      render(<AriaLiveRegion message="Test announcement" />);
      expect(screen.getByText('Test announcement')).toBeInTheDocument();

      await waitFor(
        () => {
          expect(screen.queryByText('Test announcement')).not.toBeInTheDocument();
        },
        { timeout: 1500 },
      );
    });
  });

  describe('AccessibleButton', () => {
    it('renders without crashing', () => {
      render(<AccessibleButton onClick={() => {}}>Test Button</AccessibleButton>);
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<AccessibleButton onClick={handleClick}>Test Button</AccessibleButton>);

      fireEvent.click(screen.getByText('Test Button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies ARIA labels', () => {
      render(
        <AccessibleButton
          onClick={() => {}}
          ariaLabel="Test button"
        >
          Test
        </AccessibleButton>,
      );
      expect(screen.getByLabelText('Test button')).toBeInTheDocument();
    });

    it('applies ARIA described by', () => {
      render(
        <div>
          <div id="description">Button description</div>
          <AccessibleButton
            onClick={() => {}}
            ariaDescribedBy="description"
          >
            Test
          </AccessibleButton>
        </div>,
      );
      expect(screen.getByLabelText('Test')).toHaveAttribute('aria-describedby', 'description');
    });

    it('disables when disabled', () => {
      render(
        <AccessibleButton
          onClick={() => {}}
          disabled
        >
          Disabled
        </AccessibleButton>,
      );
      expect(screen.getByText('Disabled')).toBeDisabled();
    });

    it('applies correct variant classes', () => {
      render(
        <AccessibleButton
          onClick={() => {}}
          variant="danger"
        >
          Danger
        </AccessibleButton>,
      );
      expect(screen.getByText('Danger')).toHaveClass('bg-red-600');
    });
  });

  describe('AccessibleModal', () => {
    it('renders when open', () => {
      render(
        <AccessibleModal
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
        >
          Test Content
        </AccessibleModal>,
      );
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <AccessibleModal
          isOpen={false}
          onClose={() => {}}
          title="Test Modal"
        >
          Test Content
        </AccessibleModal>,
      );
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('applies correct ARIA attributes', () => {
      render(
        <AccessibleModal
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
        >
          Test Content
        </AccessibleModal>,
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('handles escape key', () => {
      const handleClose = jest.fn();
      render(
        <AccessibleModal
          isOpen={true}
          onClose={handleClose}
          title="Test Modal"
        >
          Test Content
        </AccessibleModal>,
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('handles close button click', () => {
      const handleClose = jest.fn();
      render(
        <AccessibleModal
          isOpen={true}
          onClose={handleClose}
          title="Test Modal"
        >
          Test Content
        </AccessibleModal>,
      );

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('AccessibleFormField', () => {
    it('renders without crashing', () => {
      render(
        <AccessibleFormField
          label="Test Field"
          id="test-field"
          value=""
          onChange={() => {}}
        />,
      );
      expect(screen.getByText('Test Field')).toBeInTheDocument();
    });

    it('handles value changes', () => {
      const handleChange = jest.fn();
      render(
        <AccessibleFormField
          label="Test Field"
          id="test-field"
          value=""
          onChange={handleChange}
        />,
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalledWith('test');
    });

    it('shows error state', () => {
      render(
        <AccessibleFormField
          label="Test Field"
          id="test-field"
          value=""
          onChange={() => {}}
          error="Test error"
        />,
      );
      expect(screen.getByText('Test error')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows help text', () => {
      render(
        <AccessibleFormField
          label="Test Field"
          id="test-field"
          value=""
          onChange={() => {}}
          helpText="Test help"
        />,
      );
      expect(screen.getByText('Test help')).toBeInTheDocument();
    });

    it('applies required indicator', () => {
      render(
        <AccessibleFormField
          label="Test Field"
          id="test-field"
          value=""
          onChange={() => {}}
          required
        />,
      );
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('disables when disabled', () => {
      render(
        <AccessibleFormField
          label="Test Field"
          id="test-field"
          value=""
          onChange={() => {}}
          disabled
        />,
      );
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('AccessibleDropdown', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];

    it('renders without crashing', () => {
      render(
        <AccessibleDropdown
          label="Test Dropdown"
          id="test-dropdown"
          options={options}
          value=""
          onChange={() => {}}
        />,
      );
      expect(screen.getByText('Test Dropdown')).toBeInTheDocument();
    });

    it('handles value changes', () => {
      const handleChange = jest.fn();
      render(
        <AccessibleDropdown
          label="Test Dropdown"
          id="test-dropdown"
          options={options}
          value=""
          onChange={handleChange}
        />,
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'option1' } });
      expect(handleChange).toHaveBeenCalledWith('option1');
    });

    it('shows error state', () => {
      render(
        <AccessibleDropdown
          label="Test Dropdown"
          id="test-dropdown"
          options={options}
          value=""
          onChange={() => {}}
          error="Test error"
        />,
      );
      expect(screen.getByText('Test error')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows help text', () => {
      render(
        <AccessibleDropdown
          label="Test Dropdown"
          id="test-dropdown"
          options={options}
          value=""
          onChange={() => {}}
          helpText="Test help"
        />,
      );
      expect(screen.getByText('Test help')).toBeInTheDocument();
    });

    it('applies required indicator', () => {
      render(
        <AccessibleDropdown
          label="Test Dropdown"
          id="test-dropdown"
          options={options}
          value=""
          onChange={() => {}}
          required
        />,
      );
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('disables when disabled', () => {
      render(
        <AccessibleDropdown
          label="Test Dropdown"
          id="test-dropdown"
          options={options}
          value=""
          onChange={() => {}}
          disabled
        />,
      );
      expect(screen.getByRole('combobox')).toBeDisabled();
    });
  });

  describe('AccessibleLoadingSpinner', () => {
    it('renders without crashing', () => {
      render(<AccessibleLoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('applies correct ARIA label', () => {
      render(<AccessibleLoadingSpinner label="Loading content" />);
      expect(screen.getByLabelText('Loading content')).toBeInTheDocument();
    });

    it('applies correct size classes', () => {
      render(<AccessibleLoadingSpinner size="lg" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('AccessibleProgressBar', () => {
    it('renders without crashing', () => {
      render(
        <AccessibleProgressBar
          value={50}
          max={100}
        />,
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('displays correct value', () => {
      render(
        <AccessibleProgressBar
          value={75}
          max={100}
        />,
      );
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
    });

    it('displays label when provided', () => {
      render(
        <AccessibleProgressBar
          value={50}
          max={100}
          label="Test Progress"
        />,
      );
      expect(screen.getByText('Test Progress')).toBeInTheDocument();
    });

    it('displays percentage when showValue is true', () => {
      render(
        <AccessibleProgressBar
          value={50}
          max={100}
          showValue
        />,
      );
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('applies correct size classes', () => {
      render(
        <AccessibleProgressBar
          value={50}
          max={100}
          size="lg"
        />,
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('SrOnly', () => {
    it('renders without crashing', () => {
      render(<SrOnly>Screen reader only text</SrOnly>);
      expect(screen.getByText('Screen reader only text')).toBeInTheDocument();
    });

    it('applies screen reader only classes', () => {
      render(<SrOnly>Screen reader only text</SrOnly>);
      expect(screen.getByText('Screen reader only text')).toHaveClass('sr-only');
    });
  });

  describe('SkipLink', () => {
    it('renders without crashing', () => {
      render(<SkipLink href="#main">Skip to main content</SkipLink>);
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    });

    it('applies correct href', () => {
      render(<SkipLink href="#main">Skip to main content</SkipLink>);
      expect(screen.getByText('Skip to main content')).toHaveAttribute('href', '#main');
    });

    it('applies focus styles', () => {
      render(<SkipLink href="#main">Skip to main content</SkipLink>);
      const link = screen.getByText('Skip to main content');
      expect(link).toHaveClass('focus:not-sr-only');
    });
  });

  describe('useFocusManagement', () => {
    it('provides focus management functions', () => {
      const TestComponent = () => {
        const { saveFocus, restoreFocus, trapFocus } = useFocusManagement();
        return (
          <div>
            <button onClick={saveFocus}>Save Focus</button>
            <button onClick={restoreFocus}>Restore Focus</button>
            <div ref={(el) => el && trapFocus(el)}>Trap Focus</div>
          </div>
        );
      };

      render(<TestComponent />);
      expect(screen.getByText('Save Focus')).toBeInTheDocument();
      expect(screen.getByText('Restore Focus')).toBeInTheDocument();
      expect(screen.getByText('Trap Focus')).toBeInTheDocument();
    });
  });

  describe('useKeyboardNavigation', () => {
    it('provides keyboard navigation functions', () => {
      const TestComponent = () => {
        const { selectedIndex, containerRef } = useKeyboardNavigation(
          ['item1', 'item2'],
          () => {},
          () => {},
        );
        return (
          <div ref={containerRef}>
            <div>Selected: {selectedIndex}</div>
          </div>
        );
      };

      render(<TestComponent />);
      expect(screen.getByText('Selected: -1')).toBeInTheDocument();
    });
  });

  describe('useAnnouncement', () => {
    it('provides announcement functions', () => {
      const TestComponent = () => {
        const { announce } = useAnnouncement();
        return <button onClick={() => announce('Test announcement')}>Announce</button>;
      };

      render(<TestComponent />);
      expect(screen.getByText('Announce')).toBeInTheDocument();
    });
  });

  describe('useFocusTrap', () => {
    it('provides focus trap ref', () => {
      const TestComponent = () => {
        const containerRef = useFocusTrap(true);
        return <div ref={containerRef}>Focus Trap</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText('Focus Trap')).toBeInTheDocument();
    });
  });

  describe('useHighContrastMode', () => {
    it('detects high contrast mode', () => {
      const TestComponent = () => {
        const isHighContrast = useHighContrastMode();
        return <div>High Contrast: {isHighContrast ? 'Yes' : 'No'}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText(/High Contrast:/)).toBeInTheDocument();
    });
  });

  describe('useReducedMotion', () => {
    it('detects reduced motion preference', () => {
      const TestComponent = () => {
        const prefersReducedMotion = useReducedMotion();
        return <div>Reduced Motion: {prefersReducedMotion ? 'Yes' : 'No'}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText(/Reduced Motion:/)).toBeInTheDocument();
    });
  });

  describe('useColorScheme', () => {
    it('detects color scheme preference', () => {
      const TestComponent = () => {
        const colorScheme = useColorScheme();
        return <div>Color Scheme: {colorScheme}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText(/Color Scheme:/)).toBeInTheDocument();
    });
  });
});
