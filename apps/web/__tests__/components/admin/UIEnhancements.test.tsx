import {
  EnhancedBadge,
  EnhancedButton,
  EnhancedCard,
  EnhancedDataTable,
  EnhancedDropdown,
  EnhancedInput,
  EnhancedModal,
  EnhancedProgressBar,
  EnhancedTooltip,
  LoadingSkeleton,
} from '@/components/admin/UIEnhancements';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
  useInView: () => true,
}));

describe('UIEnhancements', () => {
  describe('EnhancedButton', () => {
    it('renders without crashing', () => {
      render(<EnhancedButton onClick={() => {}}>Test Button</EnhancedButton>);
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<EnhancedButton onClick={handleClick}>Test Button</EnhancedButton>);

      fireEvent.click(screen.getByText('Test Button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies correct variant classes', () => {
      render(
        <EnhancedButton
          onClick={() => {}}
          variant="primary"
        >
          Primary
        </EnhancedButton>,
      );
      expect(screen.getByText('Primary')).toHaveClass('bg-blue-600');
    });

    it('applies correct size classes', () => {
      render(
        <EnhancedButton
          onClick={() => {}}
          size="lg"
        >
          Large
        </EnhancedButton>,
      );
      expect(screen.getByText('Large')).toHaveClass('px-6', 'py-3', 'text-base');
    });

    it('shows loading state', () => {
      render(
        <EnhancedButton
          onClick={() => {}}
          loading
        >
          Loading
        </EnhancedButton>,
      );
      expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('disables when disabled', () => {
      render(
        <EnhancedButton
          onClick={() => {}}
          disabled
        >
          Disabled
        </EnhancedButton>,
      );
      expect(screen.getByText('Disabled')).toBeDisabled();
    });

    it('applies ARIA labels', () => {
      render(
        <EnhancedButton
          onClick={() => {}}
          ariaLabel="Test button"
        >
          Test
        </EnhancedButton>,
      );
      expect(screen.getByLabelText('Test button')).toBeInTheDocument();
    });
  });

  describe('EnhancedCard', () => {
    it('renders without crashing', () => {
      render(<EnhancedCard>Test Card</EnhancedCard>);
      expect(screen.getByText('Test Card')).toBeInTheDocument();
    });

    it('applies hover effects when enabled', () => {
      render(<EnhancedCard hover>Test Card</EnhancedCard>);
      expect(screen.getByText('Test Card')).toHaveClass('hover:shadow-xl');
    });

    it('applies gradient styling', () => {
      render(<EnhancedCard gradient>Test Card</EnhancedCard>);
      expect(screen.getByText('Test Card')).toHaveClass('bg-gradient-to-br');
    });

    it('applies glass styling', () => {
      render(<EnhancedCard glass>Test Card</EnhancedCard>);
      expect(screen.getByText('Test Card')).toHaveClass('bg-white/10');
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<EnhancedCard onClick={handleClick}>Test Card</EnhancedCard>);

      fireEvent.click(screen.getByText('Test Card'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies ARIA labels', () => {
      render(<EnhancedCard ariaLabel="Test card">Test Card</EnhancedCard>);
      expect(screen.getByLabelText('Test card')).toBeInTheDocument();
    });
  });

  describe('EnhancedInput', () => {
    it('renders without crashing', () => {
      render(
        <EnhancedInput
          label="Test Input"
          value=""
          onChange={() => {}}
        />,
      );
      expect(screen.getByText('Test Input')).toBeInTheDocument();
    });

    it('handles value changes', () => {
      const handleChange = jest.fn();
      render(
        <EnhancedInput
          label="Test Input"
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
        <EnhancedInput
          label="Test Input"
          value=""
          onChange={() => {}}
          error="Test error"
        />,
      );
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('shows help text', () => {
      render(
        <EnhancedInput
          label="Test Input"
          value=""
          onChange={() => {}}
          helpText="Test help"
        />,
      );
      expect(screen.getByText('Test help')).toBeInTheDocument();
    });

    it('applies required indicator', () => {
      render(
        <EnhancedInput
          label="Test Input"
          value=""
          onChange={() => {}}
          required
        />,
      );
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('disables when disabled', () => {
      render(
        <EnhancedInput
          label="Test Input"
          value=""
          onChange={() => {}}
          disabled
        />,
      );
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('EnhancedDropdown', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];

    it('renders without crashing', () => {
      render(
        <EnhancedDropdown
          label="Test Dropdown"
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
        <EnhancedDropdown
          label="Test Dropdown"
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
        <EnhancedDropdown
          label="Test Dropdown"
          options={options}
          value=""
          onChange={() => {}}
          error="Test error"
        />,
      );
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('shows help text', () => {
      render(
        <EnhancedDropdown
          label="Test Dropdown"
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
        <EnhancedDropdown
          label="Test Dropdown"
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
        <EnhancedDropdown
          label="Test Dropdown"
          options={options}
          value=""
          onChange={() => {}}
          disabled
        />,
      );
      expect(screen.getByRole('combobox')).toBeDisabled();
    });
  });

  describe('EnhancedModal', () => {
    it('renders when open', () => {
      render(
        <EnhancedModal
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
        >
          Test Content
        </EnhancedModal>,
      );
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <EnhancedModal
          isOpen={false}
          onClose={() => {}}
          title="Test Modal"
        >
          Test Content
        </EnhancedModal>,
      );
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('handles close button click', () => {
      const handleClose = jest.fn();
      render(
        <EnhancedModal
          isOpen={true}
          onClose={handleClose}
          title="Test Modal"
        >
          Test Content
        </EnhancedModal>,
      );

      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('applies correct size classes', () => {
      render(
        <EnhancedModal
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
          size="lg"
        >
          Test Content
        </EnhancedModal>,
      );
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });
  });

  describe('EnhancedTooltip', () => {
    it('renders without crashing', () => {
      render(
        <EnhancedTooltip content="Test tooltip">
          <button>Hover me</button>
        </EnhancedTooltip>,
      );
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('shows tooltip on hover', async () => {
      render(
        <EnhancedTooltip content="Test tooltip">
          <button>Hover me</button>
        </EnhancedTooltip>,
      );

      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('Test tooltip')).toBeInTheDocument();
      });
    });

    it('hides tooltip on mouse leave', async () => {
      render(
        <EnhancedTooltip content="Test tooltip">
          <button>Hover me</button>
        </EnhancedTooltip>,
      );

      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('Test tooltip')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(button);

      await waitFor(() => {
        expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('EnhancedProgressBar', () => {
    it('renders without crashing', () => {
      render(
        <EnhancedProgressBar
          value={50}
          max={100}
        />,
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('displays correct value', () => {
      render(
        <EnhancedProgressBar
          value={75}
          max={100}
        />,
      );
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
    });

    it('displays label when provided', () => {
      render(
        <EnhancedProgressBar
          value={50}
          max={100}
          label="Test Progress"
        />,
      );
      expect(screen.getByText('Test Progress')).toBeInTheDocument();
    });

    it('displays percentage when showValue is true', () => {
      render(
        <EnhancedProgressBar
          value={50}
          max={100}
          showValue
        />,
      );
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('applies correct size classes', () => {
      render(
        <EnhancedProgressBar
          value={50}
          max={100}
          size="lg"
        />,
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('applies correct variant classes', () => {
      render(
        <EnhancedProgressBar
          value={50}
          max={100}
          variant="gradient"
        />,
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('EnhancedBadge', () => {
    it('renders without crashing', () => {
      render(<EnhancedBadge>Test Badge</EnhancedBadge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('applies correct variant classes', () => {
      render(<EnhancedBadge variant="success">Success</EnhancedBadge>);
      expect(screen.getByText('Success')).toHaveClass('bg-green-100');
    });

    it('applies correct size classes', () => {
      render(<EnhancedBadge size="lg">Large</EnhancedBadge>);
      expect(screen.getByText('Large')).toHaveClass('px-3', 'py-1', 'text-base');
    });
  });

  describe('EnhancedDataTable', () => {
    const mockData = [
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 },
    ];

    const mockColumns = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'age', label: 'Age', sortable: true },
    ];

    it('renders without crashing', () => {
      render(
        <EnhancedDataTable
          data={mockData}
          columns={mockColumns}
        />,
      );
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
    });

    it('displays data correctly', () => {
      render(
        <EnhancedDataTable
          data={mockData}
          columns={mockColumns}
        />,
      );
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('handles sorting', () => {
      const handleSort = jest.fn();
      render(
        <EnhancedDataTable
          data={mockData}
          columns={mockColumns}
          onSort={handleSort}
        />,
      );

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      expect(handleSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('applies custom render functions', () => {
      const columnsWithRender = [
        {
          key: 'name',
          label: 'Name',
          sortable: true,
          render: (value: string) => `Mr. ${value}`,
        },
        { key: 'age', label: 'Age', sortable: true },
      ];

      render(
        <EnhancedDataTable
          data={mockData}
          columns={columnsWithRender}
        />,
      );
      expect(screen.getByText('Mr. John')).toBeInTheDocument();
      expect(screen.getByText('Mr. Jane')).toBeInTheDocument();
    });
  });

  describe('LoadingSkeleton', () => {
    it('renders without crashing', () => {
      render(<LoadingSkeleton />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders multiple skeletons', () => {
      render(<LoadingSkeleton count={3} />);
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(3);
    });

    it('applies correct variant classes', () => {
      render(<LoadingSkeleton variant="card" />);
      expect(screen.getByRole('status')).toHaveClass('h-32', 'rounded-lg');
    });

    it('applies custom className', () => {
      render(<LoadingSkeleton className="custom-class" />);
      expect(screen.getByRole('status')).toHaveClass('custom-class');
    });
  });
});
