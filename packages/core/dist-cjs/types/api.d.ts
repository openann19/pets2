/**
 * Common API and TypeScript utility types
 * Used to enforce type safety across the application
 */
/**
 * Standard API response type with generic data
 */
export type ApiResponse<T = unknown> = {
    success: boolean;
    data?: T;
    message?: string;
    error?: Error;
};
/**
 * Ensures a value is not null or undefined
 * Use with type guards: `if (isNonNullable(value)) { ... }`
 */
export declare function isNonNullable<T>(value: T): value is NonNullable<T>;
/**
 * Type guard for checking if a value is an Error
 */
export declare function isError(value: unknown): value is Error;
/**
 * Ensures a value is an array
 * If not already an array, wraps it in an array
 */
export declare function ensureArray<T>(value: T | T[]): T[];
/**
 * Type-safe object property access
 */
export declare function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] | undefined;
/**
 * Type for replacing 'any' in event handlers
 */
export type EventHandler<E = Event> = (event: E) => void;
/**
 * Type for handling nullish values safely
 */
export type Nullish<T> = T | null | undefined;
/**
 * Type for tracking loading/error states in async operations
 */
export type AsyncState<T> = {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
};
//# sourceMappingURL=api.d.ts.map