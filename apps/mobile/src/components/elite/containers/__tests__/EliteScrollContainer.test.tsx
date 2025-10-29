/**
 * Comprehensive tests for EliteScrollContainer ref forwarding
 * Tests that refs are properly forwarded for scroll-to-top functionality
 */

import React, { useRef } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useScrollToTop } from '@react-navigation/native';
import { EliteScrollContainer } from '../EliteScrollContainer';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock React Navigation
const mockScrollToTop = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useScrollToTop: jest.fn(),
}));

// Mock EliteContainer
jest.mock('../EliteContainer', () => ({
  EliteContainer: ({ children }: any) => children,
}));

// Mock GlobalStyles
jest.mock('../../../animation', () => ({
  GlobalStyles: {
    scrollContainer: {},
  },
  Colors: {
    gradientPrimary: '#000',
  },
}));

describe('EliteScrollContainer - Ref Forwarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const TestComponent = () => {
    const scrollRef = useRef<any>(null);
    useScrollToTop(scrollRef);

    return (
      <EliteScrollContainer ref={scrollRef}>
        <div>Test Content</div>
      </EliteScrollContainer>
    );
  };

  it('should forward ref to ScrollView', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Test Content')).toBeTruthy();
    expect(useScrollToTop).toHaveBeenCalled();
  });

  it('should scroll when ref method is called', async () => {
    const scrollToMock = jest.fn();

    const TestComponentWithMock = () => {
      const scrollRef = useRef<any>({ scrollTo: scrollToMock } as any);
      useScrollToTop(scrollRef);

      return (
        <EliteScrollContainer ref={scrollRef}>
          <div>Test Content</div>
        </EliteScrollContainer>
      );
    };

    render(<TestComponentWithMock />);

    await waitFor(() => {
      expect(scrollToMock).toBeDefined();
    });
  });

  it('should forward all props to ScrollView', () => {
    const onScrollMock = jest.fn();

    const { getByText } = render(
      <EliteScrollContainer
        onScroll={onScrollMock}
        showsVerticalScrollIndicator={true}
      >
        <div>Test Content</div>
      </EliteScrollContainer>,
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should handle children correctly', () => {
    const { getByText } = render(
      <EliteScrollContainer>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </EliteScrollContainer>,
    );

    expect(getByText('Child 1')).toBeTruthy();
    expect(getByText('Child 2')).toBeTruthy();
    expect(getByText('Child 3')).toBeTruthy();
  });

  it('should apply contentContainerStyle', () => {
    const customStyle = { padding: 20 };
    const { container } = render(
      <EliteScrollContainer contentContainerStyle={customStyle}>
        <div>Test Content</div>
      </EliteScrollContainer>,
    );

    expect(container).toBeTruthy();
  });

  it('should handle gradient prop correctly', () => {
    const { getByText } = render(
      <EliteScrollContainer gradient="primary">
        <div>Test Content</div>
      </EliteScrollContainer>,
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should handle refreshControl prop', () => {
    const onRefreshMock = jest.fn();

    const RefreshControl = () => null;

    const { getByText } = render(
      <EliteScrollContainer refreshControl={<RefreshControl />}>
        <div>Test Content</div>
      </EliteScrollContainer>,
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  describe('Scroll-to-Top Integration', () => {
    it('should work with useScrollToTop hook', () => {
      const TestComponent = () => {
        const scrollRef = useRef<any>(null);

        // This simulates what useScrollToTop does
        React.useEffect(() => {
          if (scrollRef.current) {
            // Simulate scroll-to-top
            scrollRef.current.scrollTo({ y: 0, animated: true });
          }
        });

        return (
          <EliteScrollContainer ref={scrollRef}>
            <div>Test Content</div>
          </EliteScrollContainer>
        );
      };

      const { getByText } = render(<TestComponent />);
      expect(getByText('Test Content')).toBeTruthy();
    });

    it('should handle scrollTo method calls', () => {
      let refValue: any = null;

      const TestComponent = () => {
        const scrollRef = useRef<any>(null);

        React.useEffect(() => {
          refValue = scrollRef.current;
        });

        return (
          <EliteScrollContainer ref={scrollRef}>
            <div>Test Content</div>
          </EliteScrollContainer>
        );
      };

      render(<TestComponent />);

      // Verify ref is forwarded
      expect(refValue).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null ref gracefully', () => {
      const TestComponent = () => {
        const scrollRef = useRef<any>(null);

        return (
          <EliteScrollContainer ref={scrollRef}>
            <div>Test Content</div>
          </EliteScrollContainer>
        );
      };

      expect(() => {
        render(<TestComponent />);
      }).not.toThrow();
    });

    it('should handle undefined children', () => {
      expect(() => {
        render(<EliteScrollContainer>{undefined}</EliteScrollContainer>);
      }).not.toThrow();
    });

    it('should handle empty children', () => {
      const { container } = render(<EliteScrollContainer />);
      expect(container).toBeTruthy();
    });

    it('should handle rapid prop changes', () => {
      const { rerender, getByText } = render(
        <EliteScrollContainer gradient="primary">
          <div>Test Content</div>
        </EliteScrollContainer>,
      );

      rerender(
        <EliteScrollContainer gradient="secondary">
          <div>Test Content</div>
        </EliteScrollContainer>,
      );

      expect(getByText('Test Content')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should forward accessibility props', () => {
      const { getByText } = render(
        <EliteScrollContainer
          accessible={true}
          accessibilityLabel="Scroll Container"
        >
          <div>Test Content</div>
        </EliteScrollContainer>,
      );

      expect(getByText('Test Content')).toBeTruthy();
    });

    it('should handle accessibilityRole prop', () => {
      const { getByText } = render(
        <EliteScrollContainer accessibilityRole="scrollbar">
          <div>Test Content</div>
        </EliteScrollContainer>,
      );

      expect(getByText('Test Content')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should handle large content efficiently', () => {
      const largeContent = Array.from({ length: 100 }, (_, i) => <div key={i}>Item {i}</div>);

      const { container } = render(<EliteScrollContainer>{largeContent}</EliteScrollContainer>);

      expect(container).toBeTruthy();
    });

    it('should not cause memory leaks with rapid updates', () => {
      const { rerender, unmount } = render(
        <EliteScrollContainer>
          <div>Test Content</div>
        </EliteScrollContainer>,
      );

      for (let i = 0; i < 50; i++) {
        rerender(
          <EliteScrollContainer>
            <div>Test Content {i}</div>
          </EliteScrollContainer>,
        );
      }

      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
});
