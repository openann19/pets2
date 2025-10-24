/**
 * AI-Powered Name Suggestions Service
 * Uses DeepSeek API to generate cute pet names
 */
export interface PetInfo {
    species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
    breed?: string;
    gender?: 'male' | 'female' | 'unknown';
    age?: number;
    personality?: string[];
    color?: string;
    size?: 'tiny' | 'small' | 'medium' | 'large' | 'extra-large';
}
export interface NameSuggestion {
    name: string;
    meaning: string;
    category: 'classic' | 'trendy' | 'unique' | 'cute' | 'strong';
    popularity: 'rare' | 'uncommon' | 'common' | 'popular';
    pronunciation?: string;
    origin?: string;
}
export interface NameSuggestionsResponse {
    suggestions: NameSuggestion[];
    total: number;
    petInfo: PetInfo;
    generatedAt: string;
}
declare class AINameSuggestionService {
    private apiUrl;
    private apiKey;
    /**
     * Generate name suggestions for a pet
     */
    generateNameSuggestions(petInfo: PetInfo, count?: number, categories?: string[]): Promise<NameSuggestionsResponse>;
    /**
     * Get name suggestions by category
     */
    getNamesByCategory(category: NameSuggestion['category'], species: PetInfo['species'], count?: number): Promise<NameSuggestion[]>;
    /**
     * Get trending pet names
     */
    getTrendingNames(species: PetInfo['species'], count?: number): Promise<NameSuggestion[]>;
    /**
     * Get unique/rare names
     */
    getUniqueNames(species: PetInfo['species'], count?: number): Promise<NameSuggestion[]>;
    /**
     * Build AI prompt for name suggestions
     */
    private buildNameSuggestionPrompt;
    /**
     * Parse AI response into structured suggestions
     */
    private parseNameSuggestions;
    /**
     * Parse text-based AI response
     */
    private parseTextResponse;
    /**
     * Categorize a name based on its characteristics
     */
    private categorizeName;
    /**
     * Estimate name popularity
     */
    private estimatePopularity;
    /**
     * Generate pronunciation guide
     */
    private generatePronunciation;
    /**
     * Get fallback suggestions when AI is unavailable
     */
    private getFallbackSuggestions;
}
export declare const aiNameSuggestionService: AINameSuggestionService;
export declare function useNameSuggestions(): {
    suggestions: any;
    isLoading: any;
    error: any;
    generateSuggestions: (petInfo: PetInfo, count?: number, categories?: string[]) => Promise<NameSuggestionsResponse | null>;
    getTrendingNames: (species: PetInfo["species"], count?: number) => Promise<NameSuggestion[]>;
    getUniqueNames: (species: PetInfo["species"], count?: number) => Promise<NameSuggestion[]>;
};
export default aiNameSuggestionService;
//# sourceMappingURL=ai-name-suggestions.d.ts.map