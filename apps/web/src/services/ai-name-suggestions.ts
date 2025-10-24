/**
 * AI-Powered Name Suggestions Service
 * Uses DeepSeek API to generate cute pet names
 */
import { logger } from './logger';
class AINameSuggestionService {
    apiUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
    apiKey = process.env.DEEPSEEK_API_KEY;
    /**
     * Generate name suggestions for a pet
     */
    async generateNameSuggestions(petInfo, count = 10, categories = ['classic', 'trendy', 'unique', 'cute']) {
        try {
            const prompt = this.buildNameSuggestionPrompt(petInfo, count, categories);
            const response = await fetch(`${this.apiUrl}/ai/generate-names`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    prompt,
                    max_tokens: 1000,
                    temperature: 0.8,
                    pet_info: petInfo
                })
            });
            if (!response.ok) {
                throw new Error(`AI service error: ${response.status}`);
            }
            const data = await response.json();
            const suggestions = this.parseNameSuggestions(data.response, petInfo);
            logger.info('Name suggestions generated', {
                petInfo,
                count: suggestions.length,
                categories
            });
            return {
                suggestions,
                total: suggestions.length,
                petInfo,
                generatedAt: new Date().toISOString()
            };
        }
        catch (error) {
            logger.error('Name suggestion generation failed', error);
            // Fallback to predefined suggestions
            return this.getFallbackSuggestions(petInfo, count);
        }
    }
    /**
     * Get name suggestions by category
     */
    async getNamesByCategory(category, species, count = 5) {
        const petInfo = { species };
        const response = await this.generateNameSuggestions(petInfo, count, [category]);
        return response.suggestions;
    }
    /**
     * Get trending pet names
     */
    async getTrendingNames(species, count = 10) {
        return this.getNamesByCategory('trendy', species, count);
    }
    /**
     * Get unique/rare names
     */
    async getUniqueNames(species, count = 10) {
        return this.getNamesByCategory('unique', species, count);
    }
    /**
     * Build AI prompt for name suggestions
     */
    buildNameSuggestionPrompt(petInfo, count, categories) {
        const { species, breed, gender, age, personality, color, size } = petInfo;
        let prompt = `Generate ${count} creative and appealing pet names for a ${species}`;
        if (breed)
            prompt += ` (${breed} breed)`;
        if (gender && gender !== 'unknown')
            prompt += ` that is ${gender}`;
        if (age)
            prompt += `, approximately ${age} years old`;
        if (size)
            prompt += `, ${size} size`;
        if (color)
            prompt += `, ${color} colored`;
        if (personality && personality.length > 0) {
            prompt += `, with personality traits: ${personality.join(', ')}`;
        }
        prompt += `.\n\nFocus on these categories: ${categories.join(', ')}.\n\n`;
        prompt += `For each name, provide:
1. The name itself
2. A brief meaning or origin (1-2 sentences)
3. Category (${categories.join(' | ')})
4. Popularity level (rare | uncommon | common | popular)
5. Pronunciation guide (if needed)

Format as JSON array with this structure:
[
  {
    "name": "Example",
    "meaning": "Brief meaning or origin",
    "category": "classic",
    "popularity": "common",
    "pronunciation": "ex-AM-pul",
    "origin": "Latin"
  }
]

Make sure names are:
- Easy to pronounce and remember
- Appropriate for the pet's characteristics
- Not too long (1-2 syllables preferred)
- Culturally appropriate
- Unique and memorable`;
        return prompt;
    }
    /**
     * Parse AI response into structured suggestions
     */
    parseNameSuggestions(aiResponse, petInfo) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const suggestions = JSON.parse(jsonMatch[0]);
                return suggestions.map((suggestion) => ({
                    name: suggestion.name || 'Unknown',
                    meaning: suggestion.meaning || 'No meaning provided',
                    category: suggestion.category || 'classic',
                    popularity: suggestion.popularity || 'common',
                    pronunciation: suggestion.pronunciation,
                    origin: suggestion.origin
                }));
            }
            // Fallback: parse text response
            return this.parseTextResponse(aiResponse, petInfo);
        }
        catch (error) {
            logger.warn('Failed to parse AI response, using fallback', error);
            return this.getFallbackSuggestions(petInfo, 5).suggestions;
        }
    }
    /**
     * Parse text-based AI response
     */
    parseTextResponse(text, petInfo) {
        const lines = text.split('\n').filter(line => line.trim());
        const suggestions = [];
        for (let i = 0; i < lines.length; i += 3) {
            const nameLine = lines[i];
            const meaningLine = lines[i + 1];
            if (nameLine && meaningLine) {
                const name = nameLine.replace(/^\d+\.\s*/, '').trim();
                const meaning = meaningLine.trim();
                if (name && meaning) {
                    suggestions.push({
                        name,
                        meaning,
                        category: this.categorizeName(name, petInfo),
                        popularity: this.estimatePopularity(name),
                        pronunciation: this.generatePronunciation(name)
                    });
                }
            }
        }
        return suggestions;
    }
    /**
     * Categorize a name based on its characteristics
     */
    categorizeName(name, petInfo) {
        const lowerName = name.toLowerCase();
        // Classic names
        if (['max', 'bella', 'luna', 'charlie', 'lucy', 'cooper', 'sadie', 'milo', 'lola', 'jack'].includes(lowerName)) {
            return 'classic';
        }
        // Trendy names
        if (['zeus', 'atlas', 'nova', 'sage', 'river', 'phoenix', 'aurora', 'cosmo', 'zen', 'koda'].includes(lowerName)) {
            return 'trendy';
        }
        // Unique names
        if (name.length > 6 || /[^a-zA-Z]/.test(name) || !['a', 'e', 'i', 'o', 'u'].some(v => lowerName.includes(v))) {
            return 'unique';
        }
        // Cute names
        if (['biscuit', 'muffin', 'peanut', 'honey', 'sugar', 'cookie', 'cupcake', 'pumpkin', 'pepper', 'ginger'].includes(lowerName)) {
            return 'cute';
        }
        return 'classic';
    }
    /**
     * Estimate name popularity
     */
    estimatePopularity(name) {
        const lowerName = name.toLowerCase();
        // Popular names
        const popularNames = ['max', 'bella', 'luna', 'charlie', 'lucy', 'cooper', 'sadie', 'milo', 'lola', 'jack'];
        if (popularNames.includes(lowerName))
            return 'popular';
        // Common names
        const commonNames = ['buddy', 'rocky', 'bear', 'duke', 'prince', 'king', 'lady', 'princess', 'queen', 'angel'];
        if (commonNames.includes(lowerName))
            return 'common';
        // Uncommon names
        if (name.length <= 4 && /^[a-z]+$/.test(lowerName))
            return 'uncommon';
        return 'rare';
    }
    /**
     * Generate pronunciation guide
     */
    generatePronunciation(name) {
        // Simple pronunciation generation
        return name.toLowerCase().split('').join('-');
    }
    /**
     * Get fallback suggestions when AI is unavailable
     */
    getFallbackSuggestions(petInfo, count) {
        const { species, gender } = petInfo;
        const fallbackNames = {
            dog: {
                male: ['Max', 'Buddy', 'Charlie', 'Cooper', 'Rocky', 'Bear', 'Duke', 'Zeus', 'Jack', 'Toby'],
                female: ['Bella', 'Luna', 'Lucy', 'Sadie', 'Lola', 'Molly', 'Daisy', 'Maggie', 'Sophie', 'Chloe'],
                unknown: ['Max', 'Bella', 'Charlie', 'Luna', 'Cooper', 'Lucy', 'Rocky', 'Sadie', 'Bear', 'Lola']
            },
            cat: {
                male: ['Oliver', 'Leo', 'Milo', 'Charlie', 'Max', 'Jack', 'Loki', 'Oscar', 'George', 'Simon'],
                female: ['Luna', 'Bella', 'Lily', 'Lucy', 'Nala', 'Kitty', 'Chloe', 'Sophie', 'Mia', 'Cleo'],
                unknown: ['Oliver', 'Luna', 'Leo', 'Bella', 'Milo', 'Lily', 'Charlie', 'Lucy', 'Max', 'Nala']
            },
            bird: {
                male: ['Charlie', 'Kiwi', 'Sunny', 'Rio', 'Paco', 'Mango', 'Pepper', 'Coco', 'Blue', 'Sky'],
                female: ['Luna', 'Bella', 'Sunny', 'Kiwi', 'Pepper', 'Coco', 'Blue', 'Sky', 'Rain', 'Storm'],
                unknown: ['Charlie', 'Luna', 'Kiwi', 'Sunny', 'Rio', 'Bella', 'Paco', 'Pepper', 'Mango', 'Coco']
            },
            rabbit: {
                male: ['Bunny', 'Thumper', 'Peter', 'Oreo', 'Pepper', 'Cocoa', 'Mocha', 'Caramel', 'Honey', 'Ginger'],
                female: ['Bunny', 'Thumper', 'Luna', 'Bella', 'Daisy', 'Rose', 'Lily', 'Poppy', 'Ivy', 'Willow'],
                unknown: ['Bunny', 'Thumper', 'Luna', 'Bella', 'Oreo', 'Daisy', 'Pepper', 'Rose', 'Cocoa', 'Lily']
            },
            other: {
                male: ['Max', 'Buddy', 'Charlie', 'Rocky', 'Bear', 'Duke', 'Zeus', 'Jack', 'Toby', 'Oscar'],
                female: ['Bella', 'Luna', 'Lucy', 'Sadie', 'Lola', 'Molly', 'Daisy', 'Maggie', 'Sophie', 'Chloe'],
                unknown: ['Max', 'Bella', 'Charlie', 'Luna', 'Rocky', 'Lucy', 'Bear', 'Sadie', 'Duke', 'Lola']
            }
        };
        const names = fallbackNames[species]?.[gender || 'unknown'] || fallbackNames.other.unknown;
        const selectedNames = names.slice(0, count);
        const suggestions = selectedNames.map(name => ({
            name,
            meaning: `A classic and timeless name perfect for your ${species}`,
            category: 'classic',
            popularity: 'common',
            pronunciation: name.toLowerCase().split('').join('-'),
            origin: 'English'
        }));
        return {
            suggestions,
            total: suggestions.length,
            petInfo,
            generatedAt: new Date().toISOString()
        };
    }
}
// Create singleton instance
export const aiNameSuggestionService = new AINameSuggestionService();
// React hook for name suggestions
export function useNameSuggestions() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const generateSuggestions = async (petInfo, count = 10, categories = ['classic', 'trendy', 'unique', 'cute']) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await aiNameSuggestionService.generateNameSuggestions(petInfo, count, categories);
            setSuggestions(response.suggestions);
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
    const getTrendingNames = async (species, count = 10) => {
        setIsLoading(true);
        setError(null);
        try {
            const names = await aiNameSuggestionService.getTrendingNames(species, count);
            setSuggestions(names);
            return names;
        }
        catch (error) {
            setError(error.message);
            return [];
        }
        finally {
            setIsLoading(false);
        }
    };
    const getUniqueNames = async (species, count = 10) => {
        setIsLoading(true);
        setError(null);
        try {
            const names = await aiNameSuggestionService.getUniqueNames(species, count);
            setSuggestions(names);
            return names;
        }
        catch (error) {
            setError(error.message);
            return [];
        }
        finally {
            setIsLoading(false);
        }
    };
    return {
        suggestions,
        isLoading,
        error,
        generateSuggestions,
        getTrendingNames,
        getUniqueNames
    };
}
export default aiNameSuggestionService;
//# sourceMappingURL=ai-name-suggestions.js.map