/**
 * CSRF Token Provider Component
 */
export declare function CsrfProvider({ children }: {
    children: any;
}): JSX.Element;
/**
 * Hook to access CSRF token
 *
 * @example
 * const { token, refreshToken } = useCsrfToken();
 *
 * fetch('/api/endpoint', {
 *   method: 'POST',
 *   headers: {
 *     'x-csrf-token': token || '',
 *   },
 * });
 */
export declare function useCsrfToken(): {
    token: null;
    refreshToken: () => Promise<void>;
    isLoading: boolean;
};
/**
 * Higher-order function to wrap fetch with CSRF token
 *
 * @example
 * const csrfFetch = withCsrfToken(fetch);
 * await csrfFetch('/api/endpoint', { method: 'POST' });
 */
export declare function withCsrfToken(fetchFn: any): (input: any, init: any) => Promise<any>;
/**
 * Get CSRF token header for manual requests
 *
 * @example
 * const headers = getCsrfHeaders();
 * await fetch('/api/endpoint', {
 *   method: 'POST',
 *   headers,
 * });
 */
export declare function getCsrfHeaders(): {
    'x-csrf-token'?: never;
} | {
    'x-csrf-token': string;
};
//# sourceMappingURL=CsrfProvider.d.ts.map