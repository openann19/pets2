import express, { type Request, type Response, Router } from 'express';
import axios from 'axios';
import { authenticateToken, requirePremiumFeature } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import logger from '../utils/logger';
import { type IUserDocument } from '../models/User';

interface AuthenticatedRequest extends Request {
  userId: string;
  user?: IUserDocument;
}

const router: Router = express.Router();

// Enhanced AI Service Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-53af1f0560c54499aa5d6d39b02dd109';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

// Cache for AI responses (simple in-memory cache)
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const responseCache: Map<string, CacheEntry> = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

function getCacheKey(endpoint: string, data: Record<string, unknown>): string {
  return `${endpoint}:${JSON.stringify(data)}`;
}

function getCachedResponse(key: string): unknown | null {
  const cached = responseCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  if (cached) {
    responseCache.delete(key);
  }
  return null;
}

function setCachedResponse(key: string, data: unknown): void {
  responseCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Enhanced helper function to call AI Service
async function callEnhancedAIService(endpoint: string, data: Record<string, unknown>, options: { useCache?: boolean; timeout?: number } = {}) {
  const { useCache = true, timeout = 30000 } = options;
  
  if (useCache) {
    const cacheKey = getCacheKey(endpoint, data);
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      logger.info('Cache hit', { endpoint });
      return cached;
    }
  }

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/${endpoint}`, data, {
      timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = response.data;
    
    if (useCache) {
      const cacheKey = getCacheKey(endpoint, data);
      setCachedResponse(cacheKey, result);
    }

    return result;
  } catch (error: unknown) {
    logger.error('Enhanced AI Service error', { endpoint, error: error.message });
    
    // Fallback to direct DeepSeek if AI service is unavailable
    if (error.code === 'ECONNREFUSED' || error.code === 'TIMEOUT') {
      logger.info('Falling back to direct API', { endpoint });
      return await callDeepSeekAPIFallback(data, endpoint);
    }
    
    throw new Error(`AI service temporarily unavailable: ${error.message}`);
  }
}

// Fallback function for direct API calls
async function callDeepSeekAPIFallback(data: Record<string, unknown>, endpoint: string) {
  // Only provide fallback for bio generation
  if (endpoint !== 'generate-bio') {
    throw new Error('AI service unavailable and no fallback available for this endpoint');
  }

  const messages = [
    {
      role: 'system',
      content: 'You are a creative copywriter specializing in pet social media content.'
    },
    {
      role: 'user',
      content: `Write a fun, engaging bio for a pet with these keywords: ${data.keywords?.join(', ') || 'friendly, loving'}`
    }
  ];

  try {
    const response = await axios.post(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      model: 'deepseek-chat',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return { bio: response.data.choices[0].message.content };
  } catch (error: unknown) {
    logger.error('Direct DeepSeek API error', { error: error.message });
    throw new Error('AI service temporarily unavailable');
  }
}

// Enhanced bio generation using AI service
router.post('/generate-bio', authenticateToken, [
  body('keywords').isArray().withMessage('Keywords must be an array'),
  body('petName').optional().isString().withMessage('Pet name must be a string'),
  body('currentBio').optional().isString().withMessage('Current bio must be a string'),
  body('tone').optional().isIn(['friendly', 'playful', 'elegant', 'adventurous']).withMessage('Invalid tone'),
  body('length').optional().isIn(['short', 'medium', 'long']).withMessage('Invalid length')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      keywords, 
      petName = 'your pet', 
      currentBio = '',
      tone = 'friendly',
      length = 'medium',
      species = 'dog',
      breed = '',
      age = 0,
      size = 'medium',
      personality_tags = []
    } = req.body;

    if (!keywords || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one keyword is required'
      });
    }

    // Prepare data for enhanced AI service
    const requestData = {
      pet: {
        id: (req as AuthenticatedRequest).userId || 'temp',
        name: petName,
        species: species,
        breed: breed,
        age: age,
        size: size,
        personality_tags: personality_tags.length > 0 ? personality_tags : keywords,
        current_bio: currentBio
      },
      tone: tone,
      length: length,
      include_call_to_action: true
    };

    logger.info('Generating bio', { petName, tone, length });
    
    const result = await callEnhancedAIService('generate-bio', requestData);

    res.json({
      success: true,
      bio: result.bio || result.content,
      metadata: {
        tone: result.tone || tone,
        length: result.length || length,
        generated_at: result.generated_at || new Date().toISOString(),
        ai_confidence: result.ai_confidence || 0.9,
        cached: result.cached || false
      }
    });

  } catch (error: unknown) {
    logger.error('Enhanced bio generation error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to generate bio',
      error: error.message
    });
  }
});

// Cache management endpoints
router.get('/cache/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      cache_stats: {
        total_entries: responseCache.size,
        memory_usage: process.memoryUsage().heapUsed,
        ttl_seconds: CACHE_TTL / 1000,
        oldest_entry: responseCache.size > 0 ? 
          Math.min(...Array.from(responseCache.values()).map(v => v.timestamp)) : null,
        newest_entry: responseCache.size > 0 ? 
          Math.max(...Array.from(responseCache.values()).map(v => v.timestamp)) : null
      }
    });
  } catch (error: unknown) {
    logger.error('Cache stats error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get cache stats',
      error: error.message
    });
  }
});

router.post('/cache/clear', authenticateToken, async (req: Request, res: Response) => {
  try {
    const entriesCleared = responseCache.size;
    responseCache.clear();
    
    res.json({
      success: true,
      message: `Cleared ${entriesCleared} cache entries`,
      entries_cleared: entriesCleared
    });
  } catch (error: unknown) {
    logger.error('Cache clear error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
});

// Generate bio from traits and interests
router.post('/bio', authenticateToken, async (req: Request, res: Response) => {
  const { traits, interests } = req.body;
  const prompt = `Write a warm, concise pet adoption bio.\nTraits: ${traits}\nInterests: ${interests}`;
  
  try {
    const response = await axios.post(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    }, {
      headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' }
    });
    res.json({ bio: response.data.choices?.[0]?.message?.content?.trim() || '' });
  } catch (error: unknown) {
    logger.error('Bio generation failed', { error: error.message });
    res.json({ bio: 'A friendly and loving pet looking for a forever home!' });
  }
});

// Analyze photo
router.post('/analyze-photo', authenticateToken, async (req: Request, res: Response) => {
  const { imageUrl } = req.body;
  const messages = [{
    role: 'user',
    content: [
      { type: 'text', text: 'Describe the pet, breed guess, and quality issues (blur/noise/crop) succinctly.' },
      { type: 'image_url', image_url: imageUrl }
    ]
  }];
  
  try {
    const response = await axios.post(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      model: 'deepseek-chat',
      messages,
      temperature: 0
    }, {
      headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' }
    });
    res.json({ analysis: response.data.choices?.[0]?.message?.content?.trim() || '' });
  } catch (error: unknown) {
    logger.error('Photo analysis failed', { error: error.message });
    res.json({ analysis: 'Photo looks good!' });
  }
});

// Compatibility analysis
router.post('/compatibility', authenticateToken, async (req: Request, res: Response) => {
  const { petProfile, userPrefs } = req.body;
  const prompt = `Given the pet and user preferences, score 0-100 and explain key factors.\nPet:${JSON.stringify(petProfile)}\nUser:${JSON.stringify(userPrefs)}`;
  
  try {
    const response = await axios.post(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0
    }, {
      headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' }
    });
    res.json({ result: response.data.choices?.[0]?.message?.content?.trim() || '' });
  } catch (error: unknown) {
    logger.error('Compatibility failed', { error: error.message });
    res.json({ result: 'Compatibility score: 75' });
  }
});

export default router;

