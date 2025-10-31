/**
 * Playdate Discovery Types
 * Type definitions for playdate matching functionality
 */
export interface PlaydateMatch {
  id: string;
  pet1: {
    _id: string;
    name: string;
    breed?: string;
    age?: number;
    playStyle?: string[];
    energy?: number;
  };
  pet2: {
    _id: string;
    name: string;
    breed?: string;
    age?: number;
    playStyle?: string[];
    energy?: number;
  };
  compatibilityScore: number;
  compatibilityFactors: {
    playStyle: number;
    energy: number;
    size: number;
    sociability: number;
    location: number;
  };
  recommendedActivities: string[];
  safetyNotes?: string[];
  distanceKm: number;
}

export interface PlaydateFilters {
  distance: number;
  playStyles: string[];
  energy?: number;
  size?: 'small' | 'medium' | 'large';
}

