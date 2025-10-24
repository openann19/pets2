export declare function getBlurData(url: string): Promise<string>;
export declare function getBlurDataBatch(urls: string[]): Promise<Record<string, string>>;
export declare function getPetPhotoBlur(url: string, width?: number, height?: number): Promise<string>;
export declare function validateImageUrl(url: string): Promise<boolean>;
export declare function getValidatedBlurData(url: string): Promise<string | null>;
export declare function getCachedBlurData(url: string): Promise<string>;
export declare function clearBlurCache(): void;
export declare function getBlurCacheSize(): number;
//# sourceMappingURL=getBlur.d.ts.map