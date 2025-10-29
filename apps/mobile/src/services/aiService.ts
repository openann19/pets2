import { api } from './api';
import type { Pet } from '@pawfectmatch/core';

export interface BioGenerationParams {
  petName: string;
  keywords: string[];
  tone?: 'playful' | 'professional' | 'casual' | 'romantic' | 'funny';
  length?: 'short' | 'medium' | 'long';
  petType?: string;
  age?: number;
  breed?: string;
}

export interface BioGenerationResult {
  bio: string;
  keywords: string[];
  sentiment: { score: number; label: string };
  matchScore: number;
}

export interface PhotoAnalysisResult {
  labels: string[];
  lighting: number;
  sharpness: number;
  score: number;
}

export interface CompatibilityResult {
  score: number;
  breakdown: {
    breed: number;
    size: number;
    energy: number;
    age: number;
    traits: number;
  };
}

export interface PetCompatibilityData {
  id: string;
  name: string;
  breed: string;
  age: number;
  size: string;
  species: string;
  gender: string;
  personality?: string[];
  energyLevel?: number;
}

export async function generateBio(params: BioGenerationParams): Promise<string> {
  // Validate required parameters
  if (!params.petName || params.petName.trim().length === 0) {
    throw new Error('Pet name is required and cannot be empty');
  }

  if (!params.keywords || params.keywords.length === 0) {
    throw new Error('At least one keyword is required');
  }

  if (params.keywords.some((keyword) => !keyword || keyword.trim().length === 0)) {
    throw new Error('All keywords must be non-empty strings');
  }

  const { request } = await import('./api');
  const response = await request<BioGenerationResult>('/ai/generate-bio', {
    method: 'POST',
    body: params,
  });
  return response.bio;
}

export async function analyzePhoto(url: string): Promise<PhotoAnalysisResult> {
  const { request } = await import('./api');
  const response = await request('/ai/analyze-photo', {
    method: 'POST',
    body: { url },
  });
  return response as PhotoAnalysisResult;
}

export async function computeCompatibility(
  petA: Pet | PetCompatibilityData,
  petB: Pet | PetCompatibilityData,
): Promise<CompatibilityResult> {
  const { request } = await import('./api');
  const response = await request<CompatibilityResult>('/ai/compatibility', {
    method: 'POST',
    body: { a: petA, b: petB },
  });
  return response;
}
