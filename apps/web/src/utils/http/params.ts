/**
 * Convert a params object (including numbers, booleans, arrays, undefined/null) into a query string.
 * - Skips null/undefined
 * - Repeats keys for array values: key=a&key=b
 */
export function serializeParams(params) {
    if (!params)
        return '';
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value == null)
            continue;
        if (Array.isArray(value)) {
            for (const v of value) {
                if (v == null)
                    continue;
                search.append(key, String(v));
            }
        }
        else {
            search.append(key, String(value));
        }
    }
    return search.toString();
}
export function toURLSearchParams(params) {
    const s = serializeParams(params);
    return new URLSearchParams(s);
}
//# sourceMappingURL=params.js.map