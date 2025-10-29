/**
 * AI Package Exports for PawfectMatch
 * Real DeepSeek AI integration for pet matching and analysis
 */

export { AIMatchingAlgorithm, aiMatchingAlgorithm } from './matching/algorithm';
export { createDeepSeekService, DeepSeekService } from './services/deepSeekService';
export { createMatchingService, PetMatchingService } from './services/matchingService';
export { createPetPhotoAnalysis, PetPhotoAnalysis } from './vision/petAnalysis';

export type { MatchResult, PetProfile, UserPreferences } from './matching/algorithm';
export type { AnalysisResult, PetPhotoAnalysisData } from './vision/petAnalysis';

export type { DeepSeekConfig, DeepSeekError, DeepSeekResponse } from './services/deepSeekService';

export type { MatchingServiceConfig } from './services/matchingService';
