export interface ContentFilterConfig {
    blockedKeywords?: string[];
    caseSensitive?: boolean;
    replacement?: string;
}
export declare function filterContent(input: string, config?: ContentFilterConfig): {
    output: string;
    matched: string[];
};
//# sourceMappingURL=contentFilter.d.ts.map