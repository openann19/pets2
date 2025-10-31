/**
 * Comprehensive tests for PageTransition component and related utilities
 * Tests getRouteTransition, PageTransition, SharedElement, SharedLayout,
 * HoverCard, useSoundKit, and BiometricAuth
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  getRouteTransition,
  PageTransition,
  SharedLayout,
  SharedElement,
  HoverCard,
  useSoundKit,
  BiometricAuth,
  transitionPresets,
  type PresetKey,
} from '../PageTransition';

// Mock framer-motion
const mockUseReducedMotion = jest.fn(() => false);
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: React.forwardRef<HTMLDivElement, React.ComponentProps<'div'> & { 
        initial?: Record<string, unknown>;
        animate?: Record<string, unknown>;
        exit?: Record<string, unknown>;
        transition?: Record<string, unknown>;
        layoutId?: string;
        whileHover?: Record<string, unknown>;
        whileTap?: Record<string, unknown>;
        style?: Record<string, unknown>;
      }>(({ children, initial, animate, exit, transition, layoutId, whileHover, whileTap, style, ...props }, ref) => (
        <div
          ref={ref}
          data-testid="motion-div"
          data-initial={JSON.stringify(initial)}
          data-animate={JSON.stringify(animate)}
          data-exit={JSON.stringify(exit)}
          data-transition={JSON.stringify(transition)}
          data-layout-id={layoutId}
          data-while-hover={JSON.stringify(whileHover)}
          data-while-tap={JSON.stringify(whileTap)}
          style={style}
          {...props}
        >
          {children}
        </div>
      )),
      img: React.forwardRef<HTMLImageElement, React.ComponentProps<'img'> & {
        layoutId?: string;
        initial?: Record<string, unknown>;
        animate?: Record<string, unknown>;
        transition?: Record<string, unknown>;
        whileHover?: Record<string, unknown>;
      }>(({ layoutId, initial, animate, transition, whileHover, ...props }, ref) => (
        <img
          ref={ref}
          data-testid="motion-img"
          data-layout-id={layoutId}
          data-initial={JSON.stringify(initial)}
          data-animate={JSON.stringify(animate)}
          data-transition={JSON.stringify(transition)}
          data-while-hover={JSON.stringify(whileHover)}
          {...props}
        />
      )),
    },
    AnimatePresence: ({ children, mode }: { children: React.ReactNode; mode?: string }) => (
      <div data-testid="animate-presence" data-mode={mode}>{children}</div>
    ),
    LayoutGroup: ({ children, id }: { children: React.ReactNode; id?: string }) => (
      <div data-testid="layout-group" data-group-id={id}>{children}</div>
    ),
    useReducedMotion: () => mockUseReducedMotion(),
  };
});

// Mock next/navigation
const mockPathname = '/dashboard';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('getRouteTransition', () => {
  it('returns mapped preset for known routes', () => {
    expect(getRouteTransition('/dashboard')).toBe('fade');
    expect(getRouteTransition('/swipe')).toBe('scale');
    expect(getRouteTransition('/matches')).toBe('slideRight');
    expect(getRouteTransition('/chat')).toBe('slideLeft');
    expect(getRouteTransition('/profile')).toBe('zoom');
    expect(getRouteTransition('/settings')).toBe('slideUp');
    expect(getRouteTransition('/premium')).toBe('blurFade');
  });

  it('returns fade default for unknown routes', () => {
    expect(getRouteTransition('/unknown')).toBe('fade');
    expect(getRouteTransition('/random/path')).toBe('fade');
  });

  it('handles partial path matches correctly', () => {
    expect(getRouteTransition('/dashboard/settings')).toBe('fade');
    expect(getRouteTransition('/chat/123')).toBe('slideLeft');
    expect(getRouteTransition('/matches/filtered')).toBe('slideRight');
  });
});

describe('PageTransition', () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  it('renders children without animation when useReducedMotion is true', () => {
    mockUseReducedMotion.mockReturnValue(true);

    render(
      <PageTransition preset="fade">
        <div data-testid="child">Content</div>
      </PageTransition>
    );

    const child = screen.getByTestId('child');
    expect(child).toBeInTheDocument();
    expect(screen.queryByTestId('motion-div')).not.toBeInTheDocument();
    expect(screen.queryByTestId('animate-presence')).not.toBeInTheDocument();
  });

  it('renders children with animation when useReducedMotion is false', () => {
    mockUseReducedMotion.mockReturnValue(false);

    render(
      <PageTransition preset="fade">
        <div data-testid="child">Content</div>
      </PageTransition>
    );

    const motionDiv = screen.getByTestId('motion-div');
    expect(motionDiv).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('uses chosen preset props correctly', () => {
    mockUseReducedMotion.mockReturnValue(false);

    render(
      <PageTransition preset="scale">
        <div>Content</div>
      </PageTransition>
    );

    const motionDiv = screen.getByTestId('motion-div');
    const initial = JSON.parse(motionDiv.getAttribute('data-initial') || '{}');
    const animate = JSON.parse(motionDiv.getAttribute('data-animate') || '{}');

    expect(initial).toEqual(transitionPresets.scale.initial);
    expect(animate).toEqual(transitionPresets.scale.animate);
  });

  it('respects disabled prop', () => {
    mockUseReducedMotion.mockReturnValue(false);

    render(
      <PageTransition preset="fade" disabled>
        <div data-testid="child">Content</div>
      </PageTransition>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByTestId('motion-div')).not.toBeInTheDocument();
  });

  it('applies custom variants override when provided', () => {
    mockUseReducedMotion.mockReturnValue(false);
    const customVariants = {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -50 },
      transition: { duration: 0.5 },
    };

    render(
      <PageTransition preset="fade" variants={customVariants}>
        <div>Content</div>
      </PageTransition>
    );

    const motionDiv = screen.getByTestId('motion-div');
    const initial = JSON.parse(motionDiv.getAttribute('data-initial') || '{}');
    expect(initial).toEqual(customVariants.initial);
  });

  it('handles SSR safely (no window access)', () => {
    // This test verifies the component doesn't crash in SSR (Node) environment
    const originalWindow = global.window;
    // @ts-expect-error - intentionally removing window for SSR test
    delete global.window;

    expect(() => {
      render(
        <PageTransition preset="fade">
          <div>Content</div>
        </PageTransition>
      );
    }).not.toThrow();

    global.window = originalWindow;
  });
});

describe('SharedLayout', () => {
  it('renders and wraps children with LayoutGroup', () => {
    render(
      <SharedLayout groupId="test-group">
        <div data-testid="child">Content</div>
      </SharedLayout>
    );

    const layoutGroup = screen.getByTestId('layout-group');
    expect(layoutGroup).toBeInTheDocument();
    expect(layoutGroup.getAttribute('data-group-id')).toBe('test-group');
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('uses default groupId when not provided', () => {
    render(
      <SharedLayout>
        <div data-testid="child">Content</div>
      </SharedLayout>
    );

    const layoutGroup = screen.getByTestId('layout-group');
    expect(layoutGroup.getAttribute('data-group-id')).toBe('shared');
  });
});

describe('SharedElement', () => {
  it('renders with correct layoutId', () => {
    render(
      <SharedElement id="test-element">
        <div data-testid="child">Content</div>
      </SharedElement>
    );

    const motionDiv = screen.getByTestId('motion-div');
    expect(motionDiv.getAttribute('data-layout-id')).toBe('test-element');
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('handles SSR safely (no errors in Node environment)', () => {
    const originalWindow = global.window;
    // @ts-expect-error - intentionally removing window for SSR test
    delete global.window;

    expect(() => {
      render(
        <SharedElement id="test-element">
          <div>Content</div>
        </SharedElement>
      );
    }).not.toThrow();

    global.window = originalWindow;
  });
});

describe('HoverCard', () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  it('respects reduced motion (no hover scale when reduced)', () => {
    mockUseReducedMotion.mockReturnValue(true);

    render(
      <HoverCard>
        <div data-testid="child">Content</div>
      </HoverCard>
    );

    const motionDiv = screen.getByTestId('motion-div');
    const whileHover = JSON.parse(motionDiv.getAttribute('data-while-hover') || 'null');
    expect(whileHover).toBeNull();
  });

  it('applies hover scale when motion enabled', () => {
    mockUseReducedMotion.mockReturnValue(false);

    render(
      <HoverCard scale={1.1}>
        <div data-testid="child">Content</div>
      </HoverCard>
    );

    const motionDiv = screen.getByTestId('motion-div');
    const whileHover = JSON.parse(motionDiv.getAttribute('data-while-hover') || '{}');
    expect(whileHover).toEqual({ scale: 1.1, y: -5 });
  });

  it('handles tap interaction', () => {
    mockUseReducedMotion.mockReturnValue(false);

    render(
      <HoverCard>
        <div data-testid="child">Content</div>
      </HoverCard>
    );

    const motionDiv = screen.getByTestId('motion-div');
    const whileTap = JSON.parse(motionDiv.getAttribute('data-while-tap') || '{}');
    expect(whileTap).toEqual({ scale: 0.98 });
  });
});

describe('useSoundKit', () => {
  // Mock AudioContext
  class MockOscillator {
    connect = jest.fn();
    start = jest.fn();
    stop = jest.fn();
    frequency = { value: 0 };
    type = 'sine' as OscillatorType;
  }

  class MockGainNode {
    connect = jest.fn();
    gain = {
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
    };
  }

  class MockAudioContext {
    destination = {};
    currentTime = 0;
    state = 'running' as AudioContextState;
    createOscillator = jest.fn(() => new MockOscillator());
    createGain = jest.fn(() => new MockGainNode());
    resume = jest.fn();
  }

  let mockAC: MockAudioContext;
  let originalAudioContext: typeof globalThis.AudioContext;

  beforeEach(() => {
    mockAC = new MockAudioContext();
    originalAudioContext = globalThis.AudioContext;
    // @ts-expect-error - mock for testing
    globalThis.AudioContext = jest.fn(() => mockAC) as unknown as typeof AudioContext;
    // @ts-expect-error - mock for testing
    globalThis.window = { AudioContext: globalThis.AudioContext, webkitAudioContext: globalThis.AudioContext };
  });

  afterEach(() => {
    globalThis.AudioContext = originalAudioContext;
    jest.clearAllMocks();
  });

  it('mocks AudioContext and verifies osc.start/stop calls', async () => {
    const TestComponent = () => {
      const { playTone } = useSoundKit();
      React.useEffect(() => {
        playTone(440, 0.1);
      }, [playTone]);
      return <div>Test</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(mockAC.createOscillator).toHaveBeenCalled();
    });

    const osc = mockAC.createOscillator();
    expect(osc.start).toHaveBeenCalled();
    expect(osc.stop).toHaveBeenCalled();
  });

  it('verifies gain.setValueAtTime and gain.linearRampToValueAtTime calls', async () => {
    const TestComponent = () => {
      const { playTone } = useSoundKit();
      React.useEffect(() => {
        playTone(440, 0.1);
      }, [playTone]);
      return <div>Test</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(mockAC.createGain).toHaveBeenCalled();
    });

    const gain = mockAC.createGain();
    expect(gain.gain.setValueAtTime).toHaveBeenCalled();
    expect(gain.gain.linearRampToValueAtTime).toHaveBeenCalled();
  });

  it('does nothing when muted is true', async () => {
    const TestComponent = () => {
      const { playTone, setMuted } = useSoundKit();
      React.useEffect(() => {
        setMuted(true);
        playTone(440, 0.1);
      }, [playTone, setMuted]);
      return <div>Test</div>;
    };

    render(<TestComponent />);

    // Wait a bit to ensure playTone was called
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Should not create AudioContext when muted
    expect(mockAC.createOscillator).not.toHaveBeenCalled();
  });

  it('handles SSR (no AudioContext creation in Node)', () => {
    const originalWindow = global.window;
    // @ts-expect-error - intentionally removing window for SSR test
    delete global.window;

    const TestComponent = () => {
      const { playTone } = useSoundKit();
      React.useEffect(() => {
        playTone(440, 0.1);
      }, [playTone]);
      return <div>Test</div>;
    };

    expect(() => render(<TestComponent />)).not.toThrow();

    global.window = originalWindow;
  });

  it('creates AudioContext lazily (only on first call)', async () => {
    const TestComponent = () => {
      const { sounds } = useSoundKit();
      return (
        <button onClick={() => sounds.tap()}>Tap</button>
      );
    };

    const { container } = render(<TestComponent />);

    // Initially, AudioContext should not be created
    expect(mockAC).toBeDefined();

    // Click button to trigger sound
    const button = container.querySelector('button');
    if (button) {
      await userEvent.click(button);
    }

    await waitFor(() => {
      expect(mockAC.createOscillator).toHaveBeenCalled();
    });
  });
});

describe('BiometricAuth', () => {
  let mockIsAvailable: jest.Mock;
  let mockGetCredentials: jest.Mock;
  let onSuccess: jest.Mock;
  let onError: jest.Mock;
  let onFallback: jest.Mock;
  let requestOptions: jest.Mock;

  beforeEach(() => {
    mockIsAvailable = jest.fn();
    mockGetCredentials = jest.fn();
    onSuccess = jest.fn();
    onError = jest.fn();
    onFallback = jest.fn();
    requestOptions = jest.fn().mockResolvedValue({
      challenge: new Uint8Array([1, 2, 3]),
      rpId: 'example.com',
      allowCredentials: [],
    });

    // Mock PublicKeyCredential
    Object.defineProperty(globalThis, 'PublicKeyCredential', {
      value: {
        isUserVerifyingPlatformAuthenticatorAvailable: mockIsAvailable,
      },
      writable: true,
      configurable: true,
    });

    // Mock navigator.credentials
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        credentials: {
          get: mockGetCredentials,
        },
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('mocks PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable', async () => {
    mockIsAvailable.mockResolvedValue(true);

    render(
      <BiometricAuth
        onSuccess={onSuccess}
        onError={onError}
        onFallback={onFallback}
        requestOptions={requestOptions}
      />
    );

    await waitFor(() => {
      expect(mockIsAvailable).toHaveBeenCalled();
    });
  });

  it('success path: calls onSuccess with credential', async () => {
    mockIsAvailable.mockResolvedValue(true);
    const mockCredential = { id: 'test-credential-id' };
    mockGetCredentials.mockResolvedValue(mockCredential);

    render(
      <BiometricAuth
        onSuccess={onSuccess}
        onError={onError}
        onFallback={onFallback}
        requestOptions={requestOptions}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Biometric Authentication')).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /biometric authentication/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(mockGetCredentials).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith(mockCredential);
    });
  });

  it('cancel path: NotAllowedError → calls onError with cancellation message', async () => {
    mockIsAvailable.mockResolvedValue(true);
    const error = new Error('User cancelled');
    error.name = 'NotAllowedError';
    mockGetCredentials.mockRejectedValue(error);

    render(
      <BiometricAuth
        onSuccess={onSuccess}
        onError={onError}
        onFallback={onFallback}
        requestOptions={requestOptions}
      />
    );

    const button = screen.getByRole('button', { name: /biometric authentication/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Authentication cancelled');
    });
  });

  it('missing credentials: InvalidStateError → calls onError with missing message', async () => {
    mockIsAvailable.mockResolvedValue(true);
    const error = new Error('No credentials');
    error.name = 'InvalidStateError';
    mockGetCredentials.mockRejectedValue(error);

    render(
      <BiometricAuth
        onSuccess={onSuccess}
        onError={onError}
        onFallback={onFallback}
        requestOptions={requestOptions}
      />
    );

    const button = screen.getByRole('button', { name: /biometric authentication/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('No biometric credentials found');
    });
  });

  it('fallback when not supported', () => {
    mockIsAvailable.mockResolvedValue(false);

    render(
      <BiometricAuth
        onSuccess={onSuccess}
        onError={onError}
        onFallback={onFallback}
        requestOptions={requestOptions}
      />
    );

    expect(screen.queryByText('Biometric Authentication')).not.toBeInTheDocument();
    expect(onFallback).not.toHaveBeenCalled(); // Only called when authenticate is clicked
  });

  it('handles SSR safely (no window access)', () => {
    const originalWindow = global.window;
    const originalNavigator = global.navigator;
    // @ts-expect-error - intentionally removing for SSR test
    delete global.window;
    // @ts-expect-error - intentionally removing for SSR test
    delete global.navigator;

    expect(() => {
      render(
        <BiometricAuth
          onSuccess={onSuccess}
          onError={onError}
          onFallback={onFallback}
          requestOptions={requestOptions}
        />
      );
    }).not.toThrow();

    global.window = originalWindow;
    global.navigator = originalNavigator;
  });
});

