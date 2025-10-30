/**
 * AI-Powered Pet Matching Algorithm for PawfectMatch
 * Advanced compatibility scoring system with machine learning insights
 */

export interface PetProfile {
  _id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'fish' | 'reptile' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female' | 'unknown';
  size: 'small' | 'medium' | 'large' | 'extra-large';
  temperament: string[];
  activityLevel: number; // 1-10 scale
  specialNeeds: string[];
  medicalHistory: string[];
  location: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
  };
  photos: string[];
  bio: string;
  tags: string[];
  preferences: {
    otherPets: boolean;
    children: boolean;
    apartment: boolean;
    yard: boolean;
  };
  ownerExperience: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: 'low' | 'medium' | 'high';
}

export interface UserPreferences {
  species: string[];
  breedPreferences: string[];
  ageRange: [number, number];
  genderPreference: 'male' | 'female' | 'any';
  sizePreference: string[];
  temperamentPreferences: string[];
  activityLevelRange: [number, number];
  specialNeedsTolerance: boolean;
  locationRadius: number; // in miles
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: 'low' | 'medium' | 'high';
  lifestyleFactors: {
    hasOtherPets: boolean;
    hasChildren: boolean;
    apartmentLiving: boolean;
    hasYard: boolean;
  };
}

export interface MatchResult {
  pet: PetProfile;
  compatibilityScore: number;
  breakdown: {
    species: number;
    breed: number;
    age: number;
    temperament: number;
    activity: number;
    location: number;
    lifestyle: number;
    specialNeeds: number;
  };
  reasons: string[];
  concerns: string[];
  recommendations: string[];
}

/**
 * Advanced AI Matching Algorithm
 */
export class AIMatchingAlgorithm {
  private readonly weights = {
    species: 25, // Species compatibility is most important
    breed: 15, // Breed preferences
    age: 10, // Age compatibility
    temperament: 20, // Personality match
    activity: 15, // Energy level match
    location: 10, // Geographic proximity
    lifestyle: 5, // Lifestyle factors
    specialNeeds: 0, // Special needs (bonus/penalty)
  };

  /**
   * Calculate comprehensive compatibility score
   */
  public calculateMatchScore(pet: PetProfile, userPreferences: UserPreferences): MatchResult {
    const breakdown = {
      species: this.calculateSpeciesScore(pet, userPreferences),
      breed: this.calculateBreedScore(pet, userPreferences),
      age: this.calculateAgeScore(pet, userPreferences),
      temperament: this.calculateTemperamentScore(pet, userPreferences),
      activity: this.calculateActivityScore(pet, userPreferences),
      location: this.calculateLocationScore(pet, userPreferences),
      lifestyle: this.calculateLifestyleScore(pet, userPreferences),
      specialNeeds: this.calculateSpecialNeedsScore(pet, userPreferences),
    };

    // Calculate weighted total score
    const compatibilityScore = Object.entries(breakdown).reduce((total, [key, score]) => {
      const weight = this.weights[key as keyof typeof this.weights];
      return total + score * weight;
    }, 0);

    // Generate insights
    const reasons = this.generateReasons(pet, userPreferences, breakdown);
    const concerns = this.generateConcerns(pet, userPreferences, breakdown);
    const recommendations = this.generateRecommendations(pet, userPreferences, breakdown);

    return {
      pet,
      compatibilityScore: Math.round(compatibilityScore),
      breakdown,
      reasons,
      concerns,
      recommendations,
    };
  }

  /**
   * Species compatibility scoring
   */
  private calculateSpeciesScore(pet: PetProfile, preferences: UserPreferences): number {
    if (preferences.species.includes(pet.species)) {
      return 100;
    }

    // Partial credit for related species
    const relatedSpecies = this.getRelatedSpecies(pet.species);
    const hasRelated = preferences.species.some((species) => relatedSpecies.includes(species));

    return hasRelated ? 60 : 0;
  }

  /**
   * Breed compatibility scoring
   */
  private calculateBreedScore(pet: PetProfile, preferences: UserPreferences): number {
    if (preferences.breedPreferences.includes(pet.breed)) {
      return 100;
    }

    // Check for breed groups/families
    const breedGroup = this.getBreedGroup(pet.breed);
    const hasGroupMatch = preferences.breedPreferences.some(
      (breed) => this.getBreedGroup(breed) === breedGroup,
    );

    return hasGroupMatch ? 70 : 50; // Default 50% for any breed
  }

  /**
   * Age compatibility scoring
   */
  private calculateAgeScore(pet: PetProfile, preferences: UserPreferences): number {
    const [minAge, maxAge] = preferences.ageRange;

    if (pet.age >= minAge && pet.age <= maxAge) {
      return 100;
    }

    // Gradual penalty for age outside range
    const ageDiff = Math.min(Math.abs(pet.age - minAge), Math.abs(pet.age - maxAge));

    return Math.max(0, 100 - ageDiff * 10);
  }

  /**
   * Temperament compatibility scoring
   */
  private calculateTemperamentScore(pet: PetProfile, preferences: UserPreferences): number {
    if (pet.temperament.length === 0) {
      return 50; // Neutral score for unknown temperament
    }

    const matchingTraits = pet.temperament.filter((trait) =>
      preferences.temperamentPreferences.includes(trait),
    );

    const matchRatio = matchingTraits.length / pet.temperament.length;

    // Bonus for high match ratio
    if (matchRatio >= 0.8) return 100;
    if (matchRatio >= 0.6) return 80;
    if (matchRatio >= 0.4) return 60;
    if (matchRatio >= 0.2) return 40;

    return 20;
  }

  /**
   * Activity level compatibility scoring
   */
  private calculateActivityScore(pet: PetProfile, preferences: UserPreferences): number {
    const [minActivity, maxActivity] = preferences.activityLevelRange;

    if (pet.activityLevel >= minActivity && pet.activityLevel <= maxActivity) {
      return 100;
    }

    // Calculate distance from preferred range
    const distance = Math.min(
      Math.abs(pet.activityLevel - minActivity),
      Math.abs(pet.activityLevel - maxActivity),
    );

    return Math.max(0, 100 - distance * 15);
  }

  /**
   * Location compatibility scoring
   */
  private calculateLocationScore(_pet: PetProfile, _preferences: UserPreferences): number {
    // This would typically use geolocation services
    // For now, return a base score
    return 80; // Assume reasonable proximity
  }

  /**
   * Lifestyle compatibility scoring
   */
  private calculateLifestyleScore(pet: PetProfile, preferences: UserPreferences): number {
    let score = 50; // Base score

    // Check lifestyle compatibility
    if (preferences.lifestyleFactors.hasOtherPets === pet.preferences.otherPets) {
      score += 15;
    }

    if (preferences.lifestyleFactors.hasChildren === pet.preferences.children) {
      score += 15;
    }

    if (preferences.lifestyleFactors.apartmentLiving === pet.preferences.apartment) {
      score += 10;
    }

    if (preferences.lifestyleFactors.hasYard === pet.preferences.yard) {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Special needs compatibility scoring
   */
  private calculateSpecialNeedsScore(pet: PetProfile, preferences: UserPreferences): number {
    if (pet.specialNeeds.length === 0) {
      return 0; // No special needs, no bonus/penalty
    }

    if (preferences.specialNeedsTolerance) {
      return 20; // Bonus for being able to handle special needs
    }

    return -30; // Penalty for special needs without tolerance
  }

  /**
   * Generate positive reasons for the match
   */
  private generateReasons(
    pet: PetProfile,
    preferences: UserPreferences,
    breakdown: MatchResult['breakdown'],
  ): string[] {
    const reasons: string[] = [];

    if (breakdown.species >= 80) {
      reasons.push(`${pet.species} matches your preferred species`);
    }

    if (breakdown.breed >= 80) {
      reasons.push(`${pet.breed} is one of your preferred breeds`);
    }

    if (breakdown.age >= 80) {
      reasons.push(`Age ${String(pet.age)} fits your preferred age range`);
    }

    if (breakdown.temperament >= 80) {
      const matchingTraits = pet.temperament.filter((trait) =>
        preferences.temperamentPreferences.includes(trait),
      );
      reasons.push(`Shares ${String(matchingTraits.length)} temperament traits you prefer`);
    }

    if (breakdown.activity >= 80) {
      reasons.push(`Activity level ${String(pet.activityLevel)}/10 matches your lifestyle`);
    }

    if (breakdown.lifestyle >= 80) {
      reasons.push(`Lifestyle preferences align well`);
    }

    return reasons;
  }

  /**
   * Generate potential concerns about the match
   */
  private generateConcerns(
    pet: PetProfile,
    _preferences: UserPreferences,
    breakdown: MatchResult['breakdown'],
  ): string[] {
    const concerns: string[] = [];

    if (breakdown.age < 50) {
      concerns.push(`Age ${String(pet.age)} may not match your preferences`);
    }

    if (breakdown.temperament < 50) {
      concerns.push(`Temperament may not align with your preferences`);
    }

    if (breakdown.activity < 50) {
      concerns.push(
        `Activity level may be too ${pet.activityLevel > 5 ? 'high' : 'low'} for your lifestyle`,
      );
    }

    if (breakdown.specialNeeds < 0) {
      concerns.push(`Has special needs that may require extra care`);
    }

    if (pet.medicalHistory.length > 0) {
      concerns.push(`Has medical history that may require ongoing care`);
    }

    return concerns;
  }

  /**
   * Generate recommendations for the match
   */
  private generateRecommendations(
    pet: PetProfile,
    preferences: UserPreferences,
    breakdown: MatchResult['breakdown'],
  ): string[] {
    const recommendations: string[] = [];

    if (breakdown.activity < 70) {
      recommendations.push(
        `Consider if you can provide ${pet.activityLevel > 5 ? 'high' : 'low'} activity level care`,
      );
    }

    if (pet.specialNeeds.length > 0) {
      recommendations.push(`Research care requirements for: ${pet.specialNeeds.join(', ')}`);
    }

    if (preferences.experienceLevel === 'beginner' && pet.ownerExperience === 'advanced') {
      recommendations.push(`May require more experience than you currently have`);
    }

    if (pet.timeCommitment === 'high' && preferences.timeCommitment === 'low') {
      recommendations.push(`Requires significant time commitment`);
    }

    return recommendations;
  }

  /**
   * Get related species for partial matching
   */
  private getRelatedSpecies(species: string): string[] {
    const relatedMap: Record<string, string[]> = {
      dog: ['wolf', 'coyote'],
      cat: ['lion', 'tiger', 'leopard'],
      bird: ['parrot', 'canary', 'finch'],
      fish: ['goldfish', 'tropical', 'saltwater'],
      reptile: ['lizard', 'snake', 'turtle'],
    };

    return relatedMap[species] ?? [];
  }

  /**
   * Get breed group for family matching
   */
  private getBreedGroup(breed: string): string {
    // Simplified breed grouping
    const breedGroups: Record<string, string[]> = {
      working: ['german_shepherd', 'rottweiler', 'boxer'],
      sporting: ['labrador', 'golden_retriever', 'spaniel'],
      herding: ['border_collie', 'australian_shepherd', 'corgi'],
      toy: ['poodle', 'chihuahua', 'pomeranian'],
      hound: ['beagle', 'bloodhound', 'greyhound'],
      terrier: ['jack_russell', 'scottish_terrier', 'bull_terrier'],
    };

    for (const [group, breeds] of Object.entries(breedGroups)) {
      if (breeds.includes(breed.toLowerCase())) {
        return group;
      }
    }

    return 'mixed';
  }
}

export const aiMatchingAlgorithm = new AIMatchingAlgorithm();
