/**
 * Test Utilities for React Components
 * Provides testing helpers and utilities for component testing
 */
import { QueryClient } from '@tanstack/react-query';
import { type RenderOptions, type RenderResult } from '@testing-library/react';
import React, { type PropsWithChildren, type ReactElement } from 'react';
declare const AllTheProviders: React.FC<PropsWithChildren>;
declare const customRender: (ui: ReactElement, options?: Omit<RenderOptions, "wrapper"> & {
    queryClient?: QueryClient;
}) => RenderResult;
export declare const createMockPet: (overrides?: {}) => {
    id: string;
    name: string;
    species: string;
    breed: string;
    age: number;
    gender: string;
    size: string;
    bio: string;
    photos: string[];
    location: {
        coordinates: number[];
        city: string;
        state: string;
        country: string;
    };
    owner: {
        id: string;
        name: string;
        email: string;
    };
};
export declare const createMockMatch: (overrides?: {}) => {
    id: string;
    pets: {
        id: string;
        name: string;
        species: string;
        breed: string;
        age: number;
        gender: string;
        size: string;
        bio: string;
        photos: string[];
        location: {
            coordinates: number[];
            city: string;
            state: string;
            country: string;
        };
        owner: {
            id: string;
            name: string;
            email: string;
        };
    }[];
    users: {
        id: string;
        name: string;
    }[];
    createdAt: string;
    lastMessage: {
        id: string;
        content: string;
        senderId: string;
        timestamp: string;
    };
    unreadCount: number;
};
export declare const createMockMessage: (overrides?: {}) => {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
    read: boolean;
    type: string;
};
export declare const createMockUser: (overrides?: {}) => {
    id: string;
    email: string;
    name: string;
    isPremium: boolean;
    createdAt: string;
};
export declare const waitFor: (ms: any) => Promise<unknown>;
export declare const mockApiResponse: (data: any, success?: boolean) => {
    success: boolean;
    data: any;
    message: string;
};
export declare const mockApiError: (message?: string, status?: number) => Error;
export declare const mockLocalStorage: () => {
    getItem: jest.Mock<any, [key: any], any>;
    setItem: jest.Mock<void, [key: any, value: any], any>;
    removeItem: jest.Mock<void, [key: any], any>;
    clear: jest.Mock<void, [], any>;
    length: number;
    key: jest.Mock<string | null, [index: any], any>;
};
export declare const mockIntersectionObserver: () => void;
export declare const mockResizeObserver: () => void;
export declare const mockMatchMedia: () => void;
export declare const setupTestEnvironment: () => void;
export declare const cleanupTestEnvironment: () => void;
export * from '@testing-library/react';
export { AllTheProviders, customRender as render };
//# sourceMappingURL=test-utils.d.ts.map