export interface PersonalityArchetype {
    name: string;
    description: string;
    icon: string;
    traits: string[];
    compatibility: string[];
    energyLevel: 'low' | 'medium' | 'high' | 'very-high';
    independence: 'low' | 'medium' | 'high';
    sociability: 'low' | 'medium' | 'high';
}
export interface PersonalityScore {
    energy: number;
    independence: number;
    sociability: number;
}
export interface PetPersonality {
    petId: string;
    primaryArchetype: string;
    secondaryArchetype: string;
    personalityScore: PersonalityScore;
    description: string;
    compatibilityTips: string;
    compatibilityInsights: {
        energyMatch: string;
        socialMatch: string;
        independenceMatch: string;
    };
    traits: string[];
    createdAt: string;
}
export interface CompatibilityAnalysis {
    pet1Id: string;
    pet2Id: string;
    interactionType: 'playdate' | 'mating' | 'adoption' | 'cohabitation';
    compatibilityScore: number;
    compatibility_score?: number;
    analysis: {
        energyCompatibility: {
            score: number;
            description: string;
        };
        socialCompatibility: {
            score: number;
            description: string;
        };
        independenceCompatibility: {
            score: number;
            description: string;
        };
    };
    recommendations: string[];
    interview_questions?: string[];
    factors?: string[];
    recommendation?: string;
    createdAt: string;
}
declare class PersonalityService {
    /**
     * Generate personality archetype for a pet
     */
    generatePersonality(data: {
        petId: string;
        breed?: string;
        age?: number;
        personalityTags?: string[];
        description?: string;
    }): Promise<PetPersonality>;
    /**
     * Get personality compatibility between two pets
     */
    getCompatibility(data: {
        pet1Id: string;
        pet2Id: string;
        interactionType?: 'playdate' | 'mating' | 'adoption' | 'cohabitation';
    }): Promise<CompatibilityAnalysis>;
    /**
     * Get all personality archetypes
     */
    getArchetypes(): Promise<Record<string, PersonalityArchetype>>;
    /**
     * Get archetype by key
     */
    getArchetype(key: string): Promise<PersonalityArchetype | null>;
    /**
     * Calculate personality compatibility score
     */
    calculateCompatibilityScore(pet1: PetPersonality, pet2: PetPersonality): number;
    /**
     * Get compatibility level description
     */
    getCompatibilityLevel(score: number): {
        level: string;
        color: string;
        description: string;
    };
    /**
     * Get energy level description
     */
    getEnergyLevelDescription(score: number): string;
    /**
     * Get independence level description
     */
    getIndependenceLevelDescription(score: number): string;
    /**
     * Get sociability level description
     */
    getSociabilityLevelDescription(score: number): string;
}
export declare const personalityService: PersonalityService;
export default personalityService;
//# sourceMappingURL=PersonalityService.d.ts.map