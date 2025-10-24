/**
 * Success Stories Service
 * Manages user testimonials and success stories from CMS
 */
import { logger } from './logger';
class SuccessStoriesService {
    apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    cmsApiUrl = process.env.NEXT_PUBLIC_CMS_API_URL;
    cmsApiKey = process.env.CMS_API_KEY;
    /**
     * Get success stories from CMS or database
     */
    async getSuccessStories(options = {}) {
        try {
            const { limit = 10, featured, tags, cursor } = options;
            // Try CMS first, fallback to database
            if (this.cmsApiUrl && this.cmsApiKey) {
                return await this.getStoriesFromCMS({ limit, featured, tags, cursor });
            }
            else {
                return await this.getStoriesFromDatabase({ limit, featured, tags, cursor });
            }
        }
        catch (error) {
            logger.error('Failed to fetch success stories', error);
            return this.getFallbackStories(options.limit || 10);
        }
    }
    /**
     * Get featured success stories
     */
    async getFeaturedStories(limit = 5) {
        const response = await this.getSuccessStories({ limit, featured: true });
        return response.stories;
    }
    /**
     * Get stories by tags
     */
    async getStoriesByTags(tags, limit = 10) {
        const response = await this.getSuccessStories({ limit, tags });
        return response.stories;
    }
    /**
     * Submit a new success story
     */
    async submitSuccessStory(story) {
        try {
            const response = await fetch(`${this.apiUrl}/api/success-stories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(story)
            });
            if (!response.ok) {
                throw new Error('Failed to submit success story');
            }
            const data = await response.json();
            return data.story;
        }
        catch (error) {
            logger.error('Failed to submit success story', error);
            return null;
        }
    }
    /**
     * Get stories from CMS (Notion/Contentful)
     */
    async getStoriesFromCMS(options) {
        const params = new URLSearchParams({
            limit: options.limit.toString(),
            ...(options.featured && { featured: 'true' }),
            ...(options.tags && { tags: options.tags.join(',') }),
            ...(options.cursor && { cursor: options.cursor })
        });
        const response = await fetch(`${this.cmsApiUrl}/success-stories?${params}`, {
            headers: {
                'Authorization': `Bearer ${this.cmsApiKey}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`CMS API error: ${response.status}`);
        }
        const data = await response.json();
        return {
            stories: data.stories.map(this.transformCMSStory),
            total: data.total,
            hasMore: data.hasMore,
            nextCursor: data.nextCursor
        };
    }
    /**
     * Get stories from database
     */
    async getStoriesFromDatabase(options) {
        const params = new URLSearchParams({
            limit: options.limit.toString(),
            ...(options.featured && { featured: 'true' }),
            ...(options.tags && { tags: options.tags.join(',') }),
            ...(options.cursor && { cursor: options.cursor })
        });
        const response = await fetch(`${this.apiUrl}/api/success-stories?${params}`);
        if (!response.ok) {
            throw new Error(`Database API error: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
    /**
     * Transform CMS story to our format
     */
    transformCMSStory(cmsStory) {
        return {
            id: cmsStory.id,
            title: cmsStory.title,
            content: cmsStory.content,
            author: {
                name: cmsStory.author?.name || 'Anonymous',
                location: cmsStory.author?.location || 'Unknown',
                avatar: cmsStory.author?.avatar,
                petName: cmsStory.author?.petName || 'Unknown Pet',
                petBreed: cmsStory.author?.petBreed || 'Mixed',
                petPhoto: cmsStory.author?.petPhoto
            },
            match: {
                petName: cmsStory.match?.petName || 'Unknown Pet',
                petBreed: cmsStory.match?.petBreed || 'Mixed',
                petPhoto: cmsStory.match?.petPhoto,
                matchDate: cmsStory.match?.matchDate || new Date().toISOString(),
                location: cmsStory.match?.location || 'Unknown'
            },
            rating: cmsStory.rating || 5,
            tags: cmsStory.tags || [],
            featured: cmsStory.featured || false,
            createdAt: cmsStory.createdAt || new Date().toISOString(),
            updatedAt: cmsStory.updatedAt || new Date().toISOString()
        };
    }
    /**
     * Get fallback stories when APIs are unavailable
     */
    getFallbackStories(limit) {
        const fallbackStories = [
            {
                id: '1',
                title: 'Bella Found Her Perfect Playmate!',
                content: 'After months of searching for the right companion for my Golden Retriever Bella, we finally found Max through PawfectMatch. They hit it off immediately and now have weekly playdates at the dog park. The compatibility scoring was spot on!',
                author: {
                    name: 'Sarah M.',
                    location: 'San Francisco, CA',
                    petName: 'Bella',
                    petBreed: 'Golden Retriever',
                    petPhoto: '/images/fallback-dog-1.jpg'
                },
                match: {
                    petName: 'Max',
                    petBreed: 'Labrador Retriever',
                    petPhoto: '/images/fallback-dog-2.jpg',
                    matchDate: '2024-01-15',
                    location: 'San Francisco, CA'
                },
                rating: 5,
                tags: ['dogs', 'playdates', 'golden-retriever', 'labrador'],
                featured: true,
                createdAt: '2024-01-20T10:00:00Z',
                updatedAt: '2024-01-20T10:00:00Z'
            },
            {
                id: '2',
                title: 'Luna and Charlie: A Match Made in Heaven',
                content: 'My shy cat Luna was having trouble socializing, but PawfectMatch helped us find Charlie, another gentle soul. They now spend their days cuddling and playing together. The AI matching was incredible!',
                author: {
                    name: 'Michael R.',
                    location: 'Austin, TX',
                    petName: 'Luna',
                    petBreed: 'Persian Cat',
                    petPhoto: '/images/fallback-cat-1.jpg'
                },
                match: {
                    petName: 'Charlie',
                    petBreed: 'British Shorthair',
                    petPhoto: '/images/fallback-cat-2.jpg',
                    matchDate: '2024-02-10',
                    location: 'Austin, TX'
                },
                rating: 5,
                tags: ['cats', 'shy-pets', 'persian', 'british-shorthair'],
                featured: true,
                createdAt: '2024-02-15T14:30:00Z',
                updatedAt: '2024-02-15T14:30:00Z'
            },
            {
                id: '3',
                title: 'From Strangers to Best Friends',
                content: 'Rocky and Zeus became instant best friends thanks to PawfectMatch. Their owners are now great friends too! We go on hiking trips together every weekend.',
                author: {
                    name: 'Jennifer L.',
                    location: 'Denver, CO',
                    petName: 'Rocky',
                    petBreed: 'German Shepherd',
                    petPhoto: '/images/fallback-dog-3.jpg'
                },
                match: {
                    petName: 'Zeus',
                    petBreed: 'Rottweiler',
                    petPhoto: '/images/fallback-dog-4.jpg',
                    matchDate: '2024-03-05',
                    location: 'Denver, CO'
                },
                rating: 5,
                tags: ['dogs', 'hiking', 'german-shepherd', 'rottweiler'],
                featured: false,
                createdAt: '2024-03-10T09:15:00Z',
                updatedAt: '2024-03-10T09:15:00Z'
            }
        ];
        return {
            stories: fallbackStories.slice(0, limit),
            total: fallbackStories.length,
            hasMore: false
        };
    }
}
// Create singleton instance
export const successStoriesService = new SuccessStoriesService();
// React hook for success stories
export function useSuccessStories() {
    const [stories, setStories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const fetchStories = async (options = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await successStoriesService.getSuccessStories(options);
            setStories(response.stories);
            setHasMore(response.hasMore);
            return response;
        }
        catch (error) {
            setError(error.message);
            return null;
        }
        finally {
            setIsLoading(false);
        }
    };
    const fetchFeaturedStories = async (limit = 5) => {
        setIsLoading(true);
        setError(null);
        try {
            const featuredStories = await successStoriesService.getFeaturedStories(limit);
            setStories(featuredStories);
            return featuredStories;
        }
        catch (error) {
            setError(error.message);
            return [];
        }
        finally {
            setIsLoading(false);
        }
    };
    const submitStory = async (story) => {
        setIsLoading(true);
        setError(null);
        try {
            const newStory = await successStoriesService.submitSuccessStory(story);
            if (newStory) {
                setStories(prev => [newStory, ...prev]);
            }
            return newStory;
        }
        catch (error) {
            setError(error.message);
            return null;
        }
        finally {
            setIsLoading(false);
        }
    };
    return {
        stories,
        isLoading,
        error,
        hasMore,
        fetchStories,
        fetchFeaturedStories,
        submitStory
    };
}
export default successStoriesService;
//# sourceMappingURL=success-stories.js.map