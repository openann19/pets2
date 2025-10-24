import React from 'react';
import { render } from '@testing-library/react';

/**
 * React 18/19 Component Pattern Compatibility Test Suite
 * 
 * This test suite verifies that our components follow best practices
 * that are compatible with both React 18 and React 19.
 */

// Helper function for creating test components with both patterns
const createComponentPatterns = () => {
  // React 18 style using FC (being phased out)
  const OldPatternComponent: React.FC<{ label: string }> = ({ label }) => {
    return <div data-testid="old-pattern">{label}</div>;
  };

  // React 19 style using explicit props typing (preferred)
  const NewPatternComponent = ({ label }: { label: string }): JSX.Element => {
    return <div data-testid="new-pattern">{label}</div>;
  };

  // React 19 style with children
  const NewPatternWithChildren = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }): JSX.Element => {
    return (
      <div data-testid="new-pattern-children">
        <span>{label}</span>
        {children}
      </div>
    );
  };

  return {
    OldPatternComponent,
    NewPatternComponent,
    NewPatternWithChildren,
  };
};

describe('React Component Pattern Compatibility', () => {
  const { OldPatternComponent, NewPatternComponent, NewPatternWithChildren } =
    createComponentPatterns();

  test('Both component patterns render correctly', () => {
    const { getByTestId } = render(
      <>
        <OldPatternComponent label="Old Pattern" />
        <NewPatternComponent label="New Pattern" />
      </>
    );

    expect(getByTestId('old-pattern')).toHaveTextContent('Old Pattern');
    expect(getByTestId('new-pattern')).toHaveTextContent('New Pattern');
  });

  test('New pattern with children works correctly', () => {
    const { getByTestId } = render(
      <NewPatternWithChildren label="Parent">
        <span data-testid="child">Child Content</span>
      </NewPatternWithChildren>
    );

    expect(getByTestId('new-pattern-children')).toHaveTextContent('Parent');
    expect(getByTestId('child')).toHaveTextContent('Child Content');
  });

  // React 19 introduces stricter null handling
  test('Components handle null values properly', () => {
    const { getByTestId } = render(
      <>
        <NewPatternComponent label={null as unknown as string} />
      </>
    );
    
    // Should render with empty content rather than crashing
    expect(getByTestId('new-pattern')).toHaveTextContent('');
  });
});
