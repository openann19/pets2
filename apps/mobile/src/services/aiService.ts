import { api } from './api';

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

export async function generateBio(params: BioGenerationParams): Promise<string> {
  const { request } = await import('./api');
  const response = await request('/ai/generate-bio', {
    method: 'POST',
    body: params,
  });
  return (response as any).bio;
}

export async function analyzePhoto(url: string): Promise<PhotoAnalysisResult> {
  const { request } = await import('./api');
  const response = await request('/ai/analyze-photo', {
    method: 'POST',
    body: { url },
  });
  return response as PhotoAnalysisResult;
}

export async function computeCompatibility(a: any, b: any): Promise<CompatibilityResult> {
  const { request } = await import('./api');
  const response = await request('/ai/compatibility', {
    method: 'POST',
    body: { a, b },
  });
  return response as CompatibilityResult;
}
