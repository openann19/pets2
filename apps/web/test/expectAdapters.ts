/**
 * Jest Expect Adapters for PawfectMatch Web App
 * Provides compatibility layer and safe DOM assertions for Jest tests
 * Functions instead of monkey-patching expect for explicit usage
 */

import { expect } from '@jest/globals';

// Safe DOM element checks
export const hasClass = (element: Element | null, className: string): boolean => {
    return element?.classList?.contains(className) ?? false;
};

export const isInDocument = (element: Element | null): boolean => {
    return element !== null && document.contains(element);
};

// Assertion adapters
export const expectEqual = <T>(actual: T, expected: T, _message?: string): void => {
    expect(actual).toEqual(expected);
};

export const expectDeepEqual = <T>(actual: T, expected: T, _message?: string): void => {
    expect(actual).toEqual(expected);
};

export const expectInDocument = (element: Element | null, _message?: string): void => {
    expect(isInDocument(element)).toBe(true);
};

export const expectHasClass = (element: Element | null, className: string, _message?: string): void => {
    expect(hasClass(element, className)).toBe(true);
};

export const expectThrows = (fn: () => unknown, expectedError?: string | RegExp | Error): void => {
    if (expectedError !== undefined) {
        expect(fn).toThrow(expectedError);
    } else {
        expect(fn).toThrow();
    }
};

export const expectContains = (container: string | unknown[] | null, value: unknown, _message?: string): void => {
    if (Array.isArray(container)) {
        expect(container).toContain(value);
    } else if (typeof container === 'string') {
        expect(container).toContain(value);
    } else {
        throw new Error('expectContains: container must be string or array');
    }
};

export const expectNotEqual = <T>(actual: T, expected: T, _message?: string): void => {
    expect(actual).not.toEqual(expected);
};

export const expectNotInDocument = (element: Element | null, _message?: string): void => {
    expect(isInDocument(element)).toBe(false);
};

export const expectNotHasClass = (element: Element | null, className: string, _message?: string): void => {
    expect(hasClass(element, className)).toBe(false);
};

export const expectNotThrows = (fn: () => unknown, _message?: string): void => {
    expect(fn).not.toThrow();
};

export const expectNotContains = (container: string | unknown[] | null, value: unknown, _message?: string): void => {
    if (Array.isArray(container)) {
        expect(container).not.toContain(value);
    } else if (typeof container === 'string') {
        expect(container).not.toContain(value);
    } else {
        throw new Error('expectNotContains: container must be string or array');
    }
};

// Type guards for safe DOM operations
export const assertElement = (element: Element | null): element is Element => {
    return element !== null && element instanceof Element;
};

export const assertHTMLElement = (element: Element | null): element is HTMLElement => {
    return element !== null && element instanceof HTMLElement;
};

// Safe DOM accessors
export const safeGetAttribute = (element: Element | null, attribute: string): string | null => {
    return element?.getAttribute(attribute) ?? null;
};

export const safeGetTextContent = (element: Element | null): string => {
    return element?.textContent ?? '';
};

export const safeQuerySelector = (parent: Element | Document, selector: string): Element | null => {
    return parent.querySelector(selector);
};

export const safeQuerySelectorAll = (parent: Element | Document, selector: string): Element[] => {
    return Array.from(parent.querySelectorAll(selector));
};

// Re-export expect for compatibility
export { expect };
