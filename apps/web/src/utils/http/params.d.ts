export type Primitive = string | number | boolean;
export type QueryValue = Primitive | null | undefined | Array<Primitive | null | undefined>;
export type QueryParams = Record<string, QueryValue>;
/**
 * Convert a params object (including numbers, booleans, arrays, undefined/null) into a query string.
 * - Skips null/undefined
 * - Repeats keys for array values: key=a&key=b
 */
export declare function serializeParams(params?: QueryParams): string;
export declare function toURLSearchParams(params?: QueryParams): URLSearchParams;
//# sourceMappingURL=params.d.ts.map