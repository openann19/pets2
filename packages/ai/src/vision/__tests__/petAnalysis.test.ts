import {
  createPetPhotoAnalysis,
  type AnalysisResult,
  type PetPhotoAnalysisData,
} from '../petAnalysis';

// Note: PetPhotoAnalysis initializes DeepSeek connection asynchronously in constructor.
// We test error path before initialization and utility methods not requiring DOM.

describe('PetPhotoAnalysis', () => {
  test('analyzePhoto returns not initialized error before service is ready', async () => {
    const analysis = createPetPhotoAnalysis({ apiKey: 'test-key' });

    const res: AnalysisResult = await analysis.analyzePhoto('BASE64');

    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
    expect(res.error).toMatch(/not initialized/i);
  });

  test('isAnalysisReliable respects thresholds', () => {
    const analysis = createPetPhotoAnalysis({ apiKey: 'test-key' });

    const good: PetPhotoAnalysisData = {
      species: 'dog',
      breed: 'lab',
      confidence: 0.8,
      age: 3,
      health: { overall: 'good', conditions: [], recommendations: [] },
      characteristics: { size: 'medium', color: [], markings: [], features: [] },
      temperament: [],
      quality: { photoScore: 0.7, lighting: 'good', clarity: 'good' },
    };

    const bad: PetPhotoAnalysisData = {
      species: 'dog',
      breed: 'lab',
      confidence: 0.6,
      age: 3,
      health: { overall: 'good', conditions: [], recommendations: [] },
      characteristics: { size: 'medium', color: [], markings: [], features: [] },
      temperament: [],
      quality: { photoScore: 0.6, lighting: 'good', clarity: 'good' },
    };

    expect(analysis.isAnalysisReliable(good)).toBe(true);
    expect(analysis.isAnalysisReliable(bad)).toBe(false);
  });
});
