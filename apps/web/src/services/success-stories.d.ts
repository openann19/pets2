/**
 * Success Stories Service
 * Manages user testimonials and success stories from CMS
 */
export interface SuccessStory {
    id: string;
    title: string;
    content: string;
    author: {
        name: string;
        location: string;
        avatar?: string;
        petName: string;
        petBreed: string;
        petPhoto?: string;
    };
    match: {
        petName: string;
        petBreed: string;
        petPhoto?: string;
        matchDate: string;
        location: string;
    };
    rating: number;
    tags: string[];
    featured: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface SuccessStoriesResponse {
    stories: SuccessStory[];
    total: number;
    hasMore: boolean;
    nextCursor?: string;
}
declare class SuccessStoriesService {
    private apiUrl;
    private cmsApiUrl;
    private cmsApiKey;
    /**
     * Get success stories from CMS or database
     */
    getSuccessStories(options?: {
        limit?: number;
        featured?: boolean;
        tags?: string[];
        cursor?: string;
    }): Promise<SuccessStoriesResponse>;
    /**
     * Get featured success stories
     */
    getFeaturedStories(limit?: number): Promise<SuccessStory[]>;
    /**
     * Get stories by tags
     */
    getStoriesByTags(tags: string[], limit?: number): Promise<SuccessStory[]>;
    /**
     * Submit a new success story
     */
    submitSuccessStory(story: {
        title: string;
        content: string;
        authorName: string;
        authorLocation: string;
        petName: string;
        petBreed: string;
        matchPetName: string;
        matchPetBreed: string;
        matchDate: string;
        matchLocation: string;
        rating: number;
        tags: string[];
    }): Promise<SuccessStory | null>;
    /**
     * Get stories from CMS (Notion/Contentful)
     */
    private getStoriesFromCMS;
    /**
     * Get stories from database
     */
    private getStoriesFromDatabase;
    /**
     * Transform CMS story to our format
     */
    private transformCMSStory;
    /**
     * Get fallback stories when APIs are unavailable
     */
    private getFallbackStories;
}
export declare const successStoriesService: SuccessStoriesService;
export declare function useSuccessStories(): {
    stories: any;
    isLoading: any;
    error: any;
    hasMore: any;
    fetchStories: (options?: Parameters<typeof successStoriesService.getSuccessStories>[0]) => Promise<SuccessStoriesResponse | null>;
    fetchFeaturedStories: (limit?: number) => Promise<SuccessStory[]>;
    submitStory: (story: Parameters<typeof successStoriesService.submitSuccessStory>[0]) => Promise<SuccessStory | null>;
};
export default successStoriesService;
//# sourceMappingURL=success-stories.d.ts.map