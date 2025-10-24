/**
 * Test Utilities for React Components
 * Provides testing helpers and utilities for component testing
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import React, {} from 'react';
// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
    }),
    useParams: () => ({
        matchId: 'test-match-id',
    }),
    useSearchParams: () => ({
        get: jest.fn(),
    }),
    usePathname: () => '/test-path',
}));
// Mock Next.js Image component
jest.mock('next/image', () => {
    return function MockImage({ src, alt, ...props }) {
        return <img src={src} alt={alt} {...props}/>;
    };
});
// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: 'div',
        span: 'span',
        button: 'button',
        img: 'img',
        h1: 'h1',
        h2: 'h2',
        h3: 'h3',
        p: 'p',
        section: 'section',
        article: 'article',
        header: 'header',
        footer: 'footer',
        nav: 'nav',
        main: 'main',
        aside: 'aside',
        form: 'form',
        input: 'input',
        textarea: 'textarea',
        select: 'select',
        option: 'option',
        label: 'label',
        ul: 'ul',
        ol: 'ol',
        li: 'li',
        table: 'table',
        thead: 'thead',
        tbody: 'tbody',
        tr: 'tr',
        td: 'td',
        th: 'th',
    },
    AnimatePresence: ({ children }) => children,
    useMotionValue: () => ({ get: () => 0, set: jest.fn() }),
    useSpring: (value) => value,
    useTransform: (value) => value,
}));
// Mock socket.io-client
jest.mock('socket.io-client', () => ({
    io: jest.fn(() => ({
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
        connected: true,
        id: 'test-socket-id',
    })),
}));
// Mock API service
jest.mock('@/services/api', () => ({
    api: {
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        getPets: jest.fn(),
        getMatches: jest.fn(),
        sendMessage: jest.fn(),
        setToken: jest.fn(),
        clearToken: jest.fn(),
        getToken: jest.fn(),
    },
    chatAPI: {
        getMessages: jest.fn(),
        sendMessage: jest.fn(),
        getConversations: jest.fn(),
    },
    petsAPI: {
        getSwipeablePets: jest.fn(),
        likePet: jest.fn(),
        passPet: jest.fn(),
    },
    matchesAPI: {
        getMatches: jest.fn(),
        getMatch: jest.fn(),
    },
}));
// Mock auth context
jest.mock('@/components/providers/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            isPremium: false,
        },
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        isLoading: false,
        isAuthenticated: true,
    }),
}));
// Mock socket hook
jest.mock('@/hooks/useSocket', () => ({
    useSocket: () => ({
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        connected: true,
        id: 'test-socket-id',
    }),
}));
// Create a test query client
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            cacheTime: 0,
        },
        mutations: {
            retry: false,
        },
    },
});
const AllTheProviders = ({ children }) => {
    const queryClient = createTestQueryClient();
    return (<QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>);
};
const customRender = (ui, options) => {
    const { queryClient, ...renderOptions } = options || {};
    const Wrapper = ({ children }) => (<QueryClientProvider client={queryClient || createTestQueryClient()}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </QueryClientProvider>);
    return render(ui, { wrapper: Wrapper, ...renderOptions });
};
// Test data factories
export const createMockPet = (overrides = {}) => ({
    id: 'test-pet-id',
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'male',
    size: 'large',
    bio: 'A friendly and energetic dog who loves to play.',
    photos: ['https://example.com/photo1.jpg'],
    location: {
        coordinates: [-122.4194, 37.7749],
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
    },
    owner: {
        id: 'test-owner-id',
        name: 'John Doe',
        email: 'john@example.com',
    },
    ...overrides,
});
export const createMockMatch = (overrides = {}) => ({
    id: 'test-match-id',
    pets: [
        createMockPet({ id: 'pet-1' }),
        createMockPet({ id: 'pet-2', name: 'Luna' }),
    ],
    users: [
        { id: 'user-1', name: 'John Doe' },
        { id: 'user-2', name: 'Jane Smith' },
    ],
    createdAt: new Date().toISOString(),
    lastMessage: {
        id: 'msg-1',
        content: 'Hello!',
        senderId: 'user-1',
        timestamp: new Date().toISOString(),
    },
    unreadCount: 0,
    ...overrides,
});
export const createMockMessage = (overrides = {}) => ({
    id: 'test-message-id',
    senderId: 'test-user-id',
    content: 'Hello, how are you?',
    timestamp: new Date().toISOString(),
    read: false,
    type: 'text',
    ...overrides,
});
export const createMockUser = (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    isPremium: false,
    createdAt: new Date().toISOString(),
    ...overrides,
});
// Utility functions
export const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const mockApiResponse = (data, success = true) => ({
    success,
    data,
    message: success ? 'Success' : 'Error',
});
export const mockApiError = (message = 'API Error', status = 400) => {
    const error = new Error(message);
    error.status = status;
    return error;
};
// Mock localStorage
export const mockLocalStorage = () => {
    const store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value;
        }),
        removeItem: jest.fn((key) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            Object.keys(store).forEach(key => delete store[key]);
        }),
        length: Object.keys(store).length,
        key: jest.fn((index) => Object.keys(store)[index] || null),
    };
};
// Mock IntersectionObserver
export const mockIntersectionObserver = () => {
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver;
};
// Mock ResizeObserver
export const mockResizeObserver = () => {
    const mockResizeObserver = jest.fn();
    mockResizeObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null,
    });
    window.ResizeObserver = mockResizeObserver;
};
// Mock matchMedia
export const mockMatchMedia = () => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    });
};
// Setup function for tests
export const setupTestEnvironment = () => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage(),
        writable: true,
    });
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
        value: mockLocalStorage(),
        writable: true,
    });
    // Mock IntersectionObserver
    mockIntersectionObserver();
    // Mock ResizeObserver
    mockResizeObserver();
    // Mock matchMedia
    mockMatchMedia();
    // Mock console methods to reduce noise in tests
    const originalError = console.error;
    const originalWarn = console.warn;
    console.error = (...args) => {
        if (typeof args[0] === 'string' &&
            (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
                args[0].includes('Warning: validateDOMNesting'))) {
            return;
        }
        originalError.call(console, ...args);
    };
    console.warn = (...args) => {
        if (typeof args[0] === 'string' &&
            args[0].includes('componentWillReceiveProps has been renamed')) {
            return;
        }
        originalWarn.call(console, ...args);
    };
};
// Cleanup function for tests
export const cleanupTestEnvironment = () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
};
// Re-export everything from testing-library
export * from '@testing-library/react';
export { AllTheProviders, customRender as render };
//# sourceMappingURL=test-utils.jsx.map
//# sourceMappingURL=test-utils.jsx.map