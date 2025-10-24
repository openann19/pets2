/**
 * Test setup for Account API tests
 * This file sets up the required globals and mocks for testing Next.js API routes
 */
import { expect } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock the global Request and Response objects required by Next.js
class MockRequest {
    url: string;
    method: string;
    headers: Headers;
    body: any;

    constructor(input: string | URL, init?: RequestInit) {
        this.url = typeof input === 'string' ? input : input.toString();
        this.method = init?.method || 'GET';
        this.headers = new Headers(init?.headers);
        this.body = init?.body;
    }

    json() {
        return Promise.resolve(typeof this.body === 'string' ? JSON.parse(this.body) : this.body);
    }
}

// Mock the global Request constructor
(global as any).Request = MockRequest;

// Add expect to global for Jest expectations
(global as any).expect = expect;

export { };
