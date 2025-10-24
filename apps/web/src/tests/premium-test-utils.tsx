/**
 * 🧪 PREMIUM TEST UTILITIES
 * Advanced testing utilities for premium components and animations
 */
import React, {} from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, MotionConfig } from 'framer-motion';
const TestProviders = ({ children, queryClient, motionConfig = { transition: { duration: 0.01 } }, // Fast animations for tests
mockAuth }) => {
    // Create default query client if none provided
    const defaultQueryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                cacheTime: 0,
                staleTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });
    const client = queryClient || defaultQueryClient;
    return (<QueryClientProvider client={client}>
      <MotionConfig {...motionConfig}>
        {children}
      </MotionConfig>
    </QueryClientProvider>);
};
export const renderWithProviders = (ui, options = {}) => {
    const { queryClient, mockAuth, motionConfig, ...renderOptions } = options;
    const Wrapper = ({ children }) => (<TestProviders queryClient={queryClient} mockAuth={mockAuth} motionConfig={motionConfig}>
        {children}
      </TestProviders>);
    return {
        user: userEvent.setup(),
        ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    };
};
// ====== ANIMATION TESTING UTILITIES ======
export const animationTestUtils = {
    // Skip animations in tests
    skipAnimations: () => {
        beforeEach(() => {
            // Mock framer-motion to skip animations
            jest.mock('framer-motion', () => ({
                ...jest.requireActual('framer-motion'),
                motion: new Proxy({}, {
                    get: (target, prop) => {
                        const MotionComponent = jest.requireActual('framer-motion').motion[prop];
                        return React.forwardRef((props, ref) => {
                            const { animate, initial, exit, transition, ...domProps } = props;
                            return React.createElement(prop, { ...domProps, ref });
                        });
                    },
                }),
            }));
        });
    },
    // Wait for animation to complete
    waitForAnimation: async (duration = 500) => {
        await new Promise(resolve => setTimeout(resolve, duration));
    },
    // Test animation states
    expectAnimationStates: async (element, states) => {
        for (const state of states) {
            await waitFor(() => {
                expect(element).toHaveAttribute('data-animation-state', state);
            });
        }
    },
};
// ====== SOCKET TESTING UTILITIES ======
export const socketTestUtils = {
    // Mock socket instance
    createMockSocket: () => {
        const eventHandlers = new Map();
        return {
            on: jest.fn((event, handler) => {
                eventHandlers.set(event, handler);
            }),
            off: jest.fn((event, handler) => {
                eventHandlers.delete(event);
            }),
            emit: jest.fn(),
            disconnect: jest.fn(),
            connect: jest.fn(),
            connected: true,
            id: 'mock-socket-id',
            // Test helpers
            simulateEvent: (event, data) => {
                const handler = eventHandlers.get(event);
                if (handler)
                    handler(data);
            },
            getEventHandlers: () => eventHandlers,
        };
    },
    // Test real-time features
    testRealTimeFeature: async (component, event, data, expectedOutcome) => {
        const mockSocket = socketTestUtils.createMockSocket();
        // Mock useSocket hook
        jest.doMock('../hooks/useEnhancedSocket', () => ({
            useEnhancedSocket: () => ({ socket: mockSocket }),
        }));
        const { user } = renderWithProviders(component);
        // Simulate socket event
        mockSocket.simulateEvent(event, data);
        // Wait for UI update
        await waitFor(() => {
            expect(screen.getByText(expectedOutcome)).toBeInTheDocument();
        });
        return { mockSocket, user };
    },
};
// ====== API TESTING UTILITIES ======
export const apiTestUtils = {
    // Mock API responses
    mockApiResponse: (data, status = 200) => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: status < 400,
            status,
            json: () => Promise.resolve(data),
            text: () => Promise.resolve(JSON.stringify(data)),
        }));
    },
    // Mock API error
    mockApiError: (message, status = 500) => {
        global.fetch = jest.fn(() => Promise.reject(new Error(message)));
    },
    // Test API integration
    testApiIntegration: async (component, apiCall, expectedData) => {
        apiTestUtils.mockApiResponse(expectedData);
        const { user } = renderWithProviders(component);
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(apiCall), expect.any(Object));
        });
        return { user };
    },
};
// ====== PREMIUM COMPONENT TESTING ======
export const premiumTestUtils = {
    // Test premium button variants
    testButtonVariants: async (ButtonComponent) => {
        const variants = ['primary', 'secondary', 'glass', 'gradient', 'neon', 'holographic'];
        for (const variant of variants) {
            const { container } = renderWithProviders(<ButtonComponent variant={variant}>Test Button</ButtonComponent>);
            const button = container.querySelector('button');
            expect(button).toBeInTheDocument();
            expect(button).toHaveClass('premium-button'); // Custom class from design system
        }
    },
    // Test premium card variants
    testCardVariants: async (CardComponent) => {
        const variants = ['default', 'glass', 'elevated', 'gradient', 'neon', 'holographic'];
        for (const variant of variants) {
            const { container } = renderWithProviders(<CardComponent variant={variant}>Test Content</CardComponent>);
            const card = container.firstChild;
            expect(card).toBeInTheDocument();
        }
    },
    // Test haptic feedback (mock)
    testHapticFeedback: () => {
        const mockVibrate = jest.fn();
        Object.defineProperty(navigator, 'vibrate', {
            value: mockVibrate,
            writable: true,
        });
        return { mockVibrate };
    },
    // Test sound effects (mock)
    testSoundEffects: () => {
        const mockAudioContext = {
            createOscillator: jest.fn(() => ({
                connect: jest.fn(),
                start: jest.fn(),
                stop: jest.fn(),
                frequency: { setValueAtTime: jest.fn() },
            })),
            createGain: jest.fn(() => ({
                connect: jest.fn(),
                gain: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
            })),
            destination: {},
            currentTime: 0,
        };
        // Mock AudioContext for testing
        (global as any).AudioContext = jest.fn(() => mockAudioContext);
        (global as any).webkitAudioContext = jest.fn(() => mockAudioContext);
        return { mockAudioContext };
    },
};
// ====== PERFORMANCE TESTING UTILITIES ======
export const performanceTestUtils = {
    // Measure component render time
    measureRenderTime: async (component) => {
        const start = performance.now();
        renderWithProviders(component);
        const end = performance.now();
        return end - start;
    },
    // Test for memory leaks
    testMemoryLeaks: async (ComponentFactory, iterations = 100) => {
        const initialMemory = performance.memory?.usedJSHeapSize || 0;
        // Render and unmount multiple times
        for (let i = 0; i < iterations; i++) {
            const { unmount } = renderWithProviders(ComponentFactory());
            unmount();
        }
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
        const finalMemory = performance.memory?.usedJSHeapSize || 0;
        const memoryIncrease = finalMemory - initialMemory;
        return {
            initialMemory,
            finalMemory,
            memoryIncrease,
            hasLeak: memoryIncrease > 1024 * 1024, // More than 1MB increase
        };
    },
    // Test animation performance
    testAnimationPerformance: async (component) => {
        const { container } = renderWithProviders(component);
        // Trigger animation
        const animatedElement = container.querySelector('[data-testid="animated-element"]');
        if (animatedElement) {
            const start = performance.now();
            // Simulate user interaction that triggers animation
            await userEvent.hover(animatedElement);
            // Wait for animation to complete
            await animationTestUtils.waitForAnimation(300);
            const end = performance.now();
            return {
                duration: end - start,
                isSmooth: (end - start) < 500, // Should complete in under 500ms
            };
        }
        return { duration: 0, isSmooth: true };
    },
};
// ====== ERROR BOUNDARY TESTING ======
export const errorBoundaryTestUtils = {
    // Test error boundary behavior
    testErrorBoundary: async (ComponentThatThrows, ErrorBoundary) => {
        // Suppress console.error for this test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const { container } = renderWithProviders(<ErrorBoundary>
        <ComponentThatThrows />
      </ErrorBoundary>);
        // Should show error UI instead of crashing
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
        consoleSpy.mockRestore();
        return { container };
    },
    // Create component that throws error
    createThrowingComponent: (errorMessage = 'Test error') => {
        return () => {
            throw new Error(errorMessage);
        };
    },
};
// ====== ACCESSIBILITY TESTING ======
export const a11yTestUtils = {
    // Test keyboard navigation
    testKeyboardNavigation: async (component) => {
        const { user } = renderWithProviders(component);
        // Test tab navigation
        await user.tab();
        const firstFocusable = document.activeElement;
        expect(firstFocusable).not.toBe(document.body);
        // Test escape key
        await user.keyboard('{Escape}');
        return { user, firstFocusable };
    },
    // Test screen reader compatibility
    testScreenReader: (component) => {
        const { container } = renderWithProviders(component);
        // Check for ARIA labels
        const elementsWithAria = container.querySelectorAll('[aria-label], [aria-labelledby], [role]');
        expect(elementsWithAria.length).toBeGreaterThan(0);
        return { elementsWithAria };
    },
    // Test color contrast (basic check)
    testColorContrast: (component) => {
        const { container } = renderWithProviders(component);
        // This is a basic implementation - in production, use a proper contrast checking library
        const textElements = container.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, button');
        textElements.forEach(element => {
            const styles = window.getComputedStyle(element);
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;
            // Basic check - ensure text isn't transparent
            expect(color).not.toBe('rgba(0, 0, 0, 0)');
            expect(color).not.toBe('transparent');
        });
        return { textElements };
    },
};
// ====== EXPORTS ======
export { renderWithProviders as render, animationTestUtils, socketTestUtils, apiTestUtils, premiumTestUtils, performanceTestUtils, errorBoundaryTestUtils, a11yTestUtils, };
// Re-export common testing utilities
export { screen, waitFor, userEvent };
export * from '@testing-library/react';
// ====== DEFAULT EXPORT ======
export default {
    render: renderWithProviders,
    animation: animationTestUtils,
    socket: socketTestUtils,
    api: apiTestUtils,
    premium: premiumTestUtils,
    performance: performanceTestUtils,
    errorBoundary: errorBoundaryTestUtils,
    a11y: a11yTestUtils,
};
//# sourceMappingURL=premium-test-utils.jsx.map
//# sourceMappingURL=premium-test-utils.jsx.map