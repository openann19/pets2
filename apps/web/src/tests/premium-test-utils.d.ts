/**
 * 🧪 PREMIUM TEST UTILITIES
 * Advanced testing utilities for premium components and animations
 */
import { type ReactElement } from 'react';
import { type RenderOptions, type RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
    queryClient?: QueryClient;
    mockAuth?: any;
    motionConfig?: any;
}
export declare const renderWithProviders: (ui: ReactElement, options?: RenderWithProvidersOptions) => RenderResult & {
    user: ReturnType<typeof userEvent.setup>;
};
export declare const animationTestUtils: {
    skipAnimations: () => void;
    waitForAnimation: (duration?: number) => Promise<void>;
    expectAnimationStates: (element: any, states: any) => Promise<void>;
};
export declare const socketTestUtils: {
    createMockSocket: () => {
        on: jest.Mock<void, [event: any, handler: any], any>;
        off: jest.Mock<void, [event: any, handler: any], any>;
        emit: jest.Mock<any, any, any>;
        disconnect: jest.Mock<any, any, any>;
        connect: jest.Mock<any, any, any>;
        connected: boolean;
        id: string;
        simulateEvent: (event: any, data: any) => void;
        getEventHandlers: () => Map<any, any>;
    };
    testRealTimeFeature: (component: any, event: any, data: any, expectedOutcome: any) => Promise<{
        mockSocket: {
            on: jest.Mock<void, [event: any, handler: any], any>;
            off: jest.Mock<void, [event: any, handler: any], any>;
            emit: jest.Mock<any, any, any>;
            disconnect: jest.Mock<any, any, any>;
            connect: jest.Mock<any, any, any>;
            connected: boolean;
            id: string;
            simulateEvent: (event: any, data: any) => void;
            getEventHandlers: () => Map<any, any>;
        };
        user: import("@testing-library/user-event").UserEvent;
    }>;
};
export declare const apiTestUtils: {
    mockApiResponse: (data: any, status?: number) => void;
    mockApiError: (message: any, status?: number) => void;
    testApiIntegration: (component: any, apiCall: any, expectedData: any) => Promise<{
        user: import("@testing-library/user-event").UserEvent;
    }>;
};
export declare const premiumTestUtils: {
    testButtonVariants: (ButtonComponent: any) => Promise<void>;
    testCardVariants: (CardComponent: any) => Promise<void>;
    testHapticFeedback: () => {
        mockVibrate: jest.Mock<any, any, any>;
    };
    testSoundEffects: () => {
        mockAudioContext: {
            createOscillator: jest.Mock<{
                connect: jest.Mock<any, any, any>;
                start: jest.Mock<any, any, any>;
                stop: jest.Mock<any, any, any>;
                frequency: {
                    setValueAtTime: jest.Mock<any, any, any>;
                };
            }, [], any>;
            createGain: jest.Mock<{
                connect: jest.Mock<any, any, any>;
                gain: {
                    setValueAtTime: jest.Mock<any, any, any>;
                    exponentialRampToValueAtTime: jest.Mock<any, any, any>;
                };
            }, [], any>;
            destination: {};
            currentTime: number;
        };
    };
};
export declare const performanceTestUtils: {
    measureRenderTime: (component: any) => Promise<number>;
    testMemoryLeaks: (ComponentFactory: any, iterations?: number) => Promise<{
        initialMemory: any;
        finalMemory: any;
        memoryIncrease: number;
        hasLeak: boolean;
    }>;
    testAnimationPerformance: (component: any) => Promise<{
        duration: number;
        isSmooth: boolean;
    }>;
};
export declare const errorBoundaryTestUtils: {
    testErrorBoundary: (ComponentThatThrows: any, ErrorBoundary: any) => Promise<{
        container: HTMLElement;
    }>;
    createThrowingComponent: (errorMessage?: string) => () => never;
};
export declare const a11yTestUtils: {
    testKeyboardNavigation: (component: any) => Promise<{
        user: import("@testing-library/user-event").UserEvent;
        firstFocusable: Element | null;
    }>;
    testScreenReader: (component: any) => {
        elementsWithAria: NodeListOf<Element>;
    };
    testColorContrast: (component: any) => {
        textElements: NodeListOf<Element>;
    };
};
export { renderWithProviders as render, animationTestUtils, socketTestUtils, apiTestUtils, premiumTestUtils, performanceTestUtils, errorBoundaryTestUtils, a11yTestUtils, };
export { screen, waitFor, userEvent };
export * from '@testing-library/react';
declare const _default: {
    render: (ui: ReactElement, options?: RenderWithProvidersOptions) => RenderResult & {
        user: ReturnType<typeof userEvent.setup>;
    };
    animation: {
        skipAnimations: () => void;
        waitForAnimation: (duration?: number) => Promise<void>;
        expectAnimationStates: (element: any, states: any) => Promise<void>;
    };
    socket: {
        createMockSocket: () => {
            on: jest.Mock<void, [event: any, handler: any], any>;
            off: jest.Mock<void, [event: any, handler: any], any>;
            emit: jest.Mock<any, any, any>;
            disconnect: jest.Mock<any, any, any>;
            connect: jest.Mock<any, any, any>;
            connected: boolean;
            id: string;
            simulateEvent: (event: any, data: any) => void;
            getEventHandlers: () => Map<any, any>;
        };
        testRealTimeFeature: (component: any, event: any, data: any, expectedOutcome: any) => Promise<{
            mockSocket: {
                on: jest.Mock<void, [event: any, handler: any], any>;
                off: jest.Mock<void, [event: any, handler: any], any>;
                emit: jest.Mock<any, any, any>;
                disconnect: jest.Mock<any, any, any>;
                connect: jest.Mock<any, any, any>;
                connected: boolean;
                id: string;
                simulateEvent: (event: any, data: any) => void;
                getEventHandlers: () => Map<any, any>;
            };
            user: import("@testing-library/user-event").UserEvent;
        }>;
    };
    api: {
        mockApiResponse: (data: any, status?: number) => void;
        mockApiError: (message: any, status?: number) => void;
        testApiIntegration: (component: any, apiCall: any, expectedData: any) => Promise<{
            user: import("@testing-library/user-event").UserEvent;
        }>;
    };
    premium: {
        testButtonVariants: (ButtonComponent: any) => Promise<void>;
        testCardVariants: (CardComponent: any) => Promise<void>;
        testHapticFeedback: () => {
            mockVibrate: jest.Mock<any, any, any>;
        };
        testSoundEffects: () => {
            mockAudioContext: {
                createOscillator: jest.Mock<{
                    connect: jest.Mock<any, any, any>;
                    start: jest.Mock<any, any, any>;
                    stop: jest.Mock<any, any, any>;
                    frequency: {
                        setValueAtTime: jest.Mock<any, any, any>;
                    };
                }, [], any>;
                createGain: jest.Mock<{
                    connect: jest.Mock<any, any, any>;
                    gain: {
                        setValueAtTime: jest.Mock<any, any, any>;
                        exponentialRampToValueAtTime: jest.Mock<any, any, any>;
                    };
                }, [], any>;
                destination: {};
                currentTime: number;
            };
        };
    };
    performance: {
        measureRenderTime: (component: any) => Promise<number>;
        testMemoryLeaks: (ComponentFactory: any, iterations?: number) => Promise<{
            initialMemory: any;
            finalMemory: any;
            memoryIncrease: number;
            hasLeak: boolean;
        }>;
        testAnimationPerformance: (component: any) => Promise<{
            duration: number;
            isSmooth: boolean;
        }>;
    };
    errorBoundary: {
        testErrorBoundary: (ComponentThatThrows: any, ErrorBoundary: any) => Promise<{
            container: HTMLElement;
        }>;
        createThrowingComponent: (errorMessage?: string) => () => never;
    };
    a11y: {
        testKeyboardNavigation: (component: any) => Promise<{
            user: import("@testing-library/user-event").UserEvent;
            firstFocusable: Element | null;
        }>;
        testScreenReader: (component: any) => {
            elementsWithAria: NodeListOf<Element>;
        };
        testColorContrast: (component: any) => {
            textElements: NodeListOf<Element>;
        };
    };
};
export default _default;
//# sourceMappingURL=premium-test-utils.d.ts.map