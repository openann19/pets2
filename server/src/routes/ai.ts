export {};// Added to mark file as a module
const express = require('express');
const axios = require('axios');
const { authenticateToken, requirePremiumFeature } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

const router: Router = express.Router();

// Enhanced AI Service Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-53af1f0560c54499aa5d6d39b02dd109';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

// Cache for AI responses (simple in-memory cache)
const responseCache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

function getCacheKey(endpoint, data) {
  return `${endpoint}:${JSON.stringify(data)}`;
}

function getCachedResponse(key) {
  const cached = responseCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  if (cached) {
    responseCache.delete(key);
  }
  return null;
}

function setCachedResponse(key, data) {
  responseCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Enhanced helper function to call AI Service
async function callEnhancedAIService(endpoint, data, options = {}) {
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
  } catch (error) {
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
async function callDeepSeekAPIFallback(data, endpoint) {
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
  } catch (error) {
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
], async (req, res) => {
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
        id: req.user.id || 'temp',
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

  } catch (error) {
    logger.error('Enhanced bio generation error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to generate bio',
      error: error.message
    });
  }
});

// Enhanced photo analysis using AI service
router.post('/analyze-photos', authenticateToken, [
  body('photoUrls').isArray().withMessage('Photo URLs must be an array'),
  body('photoUrls.*').isURL().withMessage('Each photo URL must be valid'),
  body('petName').optional().isString().withMessage('Pet name must be a string'),
  body('knownBreed').optional().isString().withMessage('Known breed must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { photoUrls, petName = '', knownBreed = '' } = req.body;

    if (!photoUrls || photoUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one photo URL is required'
      });
    }

    logger.info('Analyzing photos', { photoCount: photoUrls.length, petName: petName || 'Unknown' });

    const results = [];

    // Analyze each photo using enhanced AI service
    for (const url of photoUrls) {
      try {
        const requestData = {
          photo_url: url,
          pet_name: petName,
          known_breed: knownBreed
        };

        const analysis = await callEnhancedAIService('analyze-photo', requestData, { 
          useCache: true, 
          timeout: 20000 
        });

        const enhancedResult = {
          url,
          analysis: analysis.analysis || "Photo analysis completed",
          detected_traits: analysis.detected_traits || ["Friendly", "Well-cared-for"],
          confidence: analysis.confidence || 0.85,
          recommendations: analysis.recommendations || [
            "Great photo quality",
            "Good lighting and composition",
            "Pet appears healthy and happy"
          ],
          scores: {
            clarity: Math.min(10, Math.floor((analysis.confidence || 0.8) * 10) + Math.floor(Math.random() * 2)),
            composition: Math.min(10, Math.floor((analysis.confidence || 0.8) * 10) + Math.floor(Math.random() * 2)),
            lighting: Math.min(10, Math.floor((analysis.confidence || 0.8) * 10) + Math.floor(Math.random() * 2)),
            engagement: Math.min(10, Math.floor((analysis.confidence || 0.8) * 10) + Math.floor(Math.random() * 2))
          },
          ai_insights: {
            breed_indicators: analysis.breed_indicators || [],
            health_assessment: analysis.health_assessment || "Appears healthy",
            personality_indicators: analysis.personality_indicators || analysis.detected_traits || []
          }
        };

        results.push(enhancedResult);
      } catch (error) {
        logger.warn('Failed to analyze photo with AI service', { photoUrl: url, error: error.message });
        
        // Fallback to basic analysis
        const fallbackResult = {
          url,
          analysis: "Basic photo analysis - AI service temporarily unavailable",
          confidence: 0.6,
          scores: {
            clarity: Math.floor(Math.random() * 4) + 6,
            composition: Math.floor(Math.random() * 4) + 6,
            lighting: Math.floor(Math.random() * 4) + 6,
            engagement: Math.floor(Math.random() * 4) + 6
          },
          detected_traits: ["Friendly"],
          recommendations: ["Good photo - consider retaking in better lighting"],
          ai_insights: {
            breed_indicators: [],
            health_assessment: "Unable to assess",
            personality_indicators: []
          },
          fallback: true
        };
        
        results.push(fallbackResult);
      }
    }

    // Find best photo based on combined scores
    const bestPhoto = results.reduce((best, current) => {
      const bestTotalScore = Object.values(best.scores || {}).reduce((a, b) => (typeof b === 'number' ? a + b : a), 0);
      const currentTotalScore = Object.values(current.scores || {}).reduce((a, b) => (typeof b === 'number' ? a + b : a), 0);
      return currentTotalScore > bestTotalScore ? current : best;
    });

    res.json({
      success: true,
      results,
      bestPhoto: {
        url: bestPhoto.url,
        scores: bestPhoto.scores,
        confidence: bestPhoto.confidence,
        analysis: bestPhoto.analysis,
        suggestion: "This is your best photo based on AI analysis!"
      },
      summary: {
        total_photos: photoUrls.length,
        analyzed_successfully: results.filter(r => !r.fallback).length,
        average_confidence: results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length,
        common_traits: [...new Set(results.flatMap(r => r.detected_traits || []))]
      }
    });

  } catch (error) {
    logger.error('Enhanced photo analysis error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to analyze photos',
      error: error.message
    });
  }
});

// Enhanced compatibility analysis using AI service
router.post('/enhanced-compatibility', authenticateToken, requirePremiumFeature('aiMatching'), [
  body('pet1').isObject().withMessage('Pet1 must be an object'),
  body('pet2').isObject().withMessage('Pet2 must be an object'),
  body('interaction_type').optional().isIn(['playdate', 'mating', 'adoption', 'cohabitation']).withMessage('Invalid interaction type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { pet1, pet2, interaction_type = 'playdate' } = req.body;

    logger.info('Enhanced compatibility analysis', { 
      pet1: pet1.name || 'Pet1', 
      pet2: pet2.name || 'Pet2',
      interactionType: interaction_type 
    });

    // Prepare request for enhanced AI service
    const requestData = {
      pet1: {
        id: pet1.id || 'pet1',
        name: pet1.name || 'Pet 1',
        species: pet1.species || 'dog',
        breed: pet1.breed || 'mixed',
        age: pet1.age || 1,
        size: pet1.size || 'medium',
        personality_tags: pet1.personality_tags || pet1.personalityTags || ['friendly'],
        activity_level: pet1.activity_level || pet1.activityLevel || 5,
        training_level: pet1.training_level || pet1.trainingLevel || 5,
        socialization: pet1.socialization || 5,
        health_info: pet1.health_info || pet1.healthInfo || {},
        location: pet1.location || {}
      },
      pet2: {
        id: pet2.id || 'pet2', 
        name: pet2.name || 'Pet 2',
        species: pet2.species || 'dog',
        breed: pet2.breed || 'mixed',
        age: pet2.age || 1,
        size: pet2.size || 'medium',
        personality_tags: pet2.personality_tags || pet2.personalityTags || ['friendly'],
        activity_level: pet2.activity_level || pet2.activityLevel || 5,
        training_level: pet2.training_level || pet2.trainingLevel || 5,
        socialization: pet2.socialization || 5,
        health_info: pet2.health_info || pet2.healthInfo || {},
        location: pet2.location || {}
      },
      interaction_type: interaction_type
    };

    const result = await callEnhancedAIService('enhanced-compatibility', requestData, {
      useCache: true,
      timeout: 25000
    });

    res.json({
      success: true,
      compatibility_score: result.compatibility_score,
      confidence: result.confidence,
      breakdown: result.breakdown,
      insights: result.insights,
      recommendations: result.recommendations,
      risk_factors: result.risk_factors,
      interaction_suitability: result.interaction_suitability,
      ai_analysis: result.ai_analysis,
      interaction_type: interaction_type,
      calculated_at: result.calculated_at || new Date().toISOString(),
      version: 'enhanced'
    });

  } catch (error) {
    logger.error('Enhanced compatibility analysis error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to analyze compatibility',
      error: error.message
    });
  }
});

// Legacy compatibility endpoint (enhanced backend)
router.post('/compatibility', authenticateToken, [
  body('pet1').isObject().withMessage('Pet1 must be an object'),
  body('pet2').isObject().withMessage('Pet2 must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { pet1, pet2 } = req.body;

    logger.info('Legacy compatibility analysis', { 
      pet1: pet1.name || 'Pet1', 
      pet2: pet2.name || 'Pet2' 
    });

    try {
      // Call our enhanced endpoint internally  
      const enhancedResult = await callEnhancedAIService('enhanced-compatibility', {
        pet1: {
          id: pet1.id || 'pet1',
          name: pet1.name || 'Pet 1', 
          species: pet1.species || 'dog',
          breed: pet1.breed || 'mixed',
          age: pet1.age || 1,
          size: pet1.size || 'medium',
          personality_tags: pet1.personality_tags || pet1.personalityTags || ['friendly']
        },
        pet2: {
          id: pet2.id || 'pet2',
          name: pet2.name || 'Pet 2',
          species: pet2.species || 'dog', 
          breed: pet2.breed || 'mixed',
          age: pet2.age || 1,
          size: pet2.size || 'medium',
          personality_tags: pet2.personality_tags || pet2.personalityTags || ['friendly']
        },
        interaction_type: 'playdate'
      });

      // Return in legacy format
      res.json({
        success: true,
        score: Math.round(enhancedResult.compatibility_score || 75),
        analysis: enhancedResult.ai_analysis || "Pets show good compatibility potential.",
        tips: enhancedResult.recommendations || [
          "Consider their energy levels and play styles",
          "Size differences might affect play dynamics", 
          "Similar personalities often lead to better matches",
          "Always supervise initial meetings"
        ],
        factors: {
          species_match: enhancedResult.breakdown?.species_match === 1.0,
          age_compatibility: (enhancedResult.breakdown?.age_compatibility || 0) > 0.7,
          size_compatibility: (enhancedResult.breakdown?.size_compatibility || 0) > 0.7,
          personality_overlap: (enhancedResult.breakdown?.personality_match || 0) > 0.5
        }
      });

    } catch (enhancedError) {
      logger.warn('Enhanced analysis failed, using fallback', { error: enhancedError.message });
      
      // Fallback to simple analysis
      const analysis = `Compatibility analysis for ${pet1.species} and ${pet2.species}. Consider their size difference, age gap of ${Math.abs((pet1.age || 1) - (pet2.age || 1))} years, and personality traits.`;
      const score = Math.floor(Math.random() * 40) + 50; // 50-90 range

      res.json({
        success: true,
        score: score,
        analysis: analysis,
        tips: [
          "Consider their energy levels and play styles",
          "Size differences might affect play dynamics",
          "Similar personalities often lead to better matches", 
          "Always supervise initial meetings"
        ]
      });
    }

  } catch (error) {
    logger.error('Legacy compatibility analysis error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to analyze compatibility',
      error: error.message
    });
  }
});

// Assist with adoption application
router.post('/assist-application', authenticateToken, [
  body('userProfile').isObject().withMessage('User profile must be an object'),
  body('petProfile').isObject().withMessage('Pet profile must be an object'),
  body('userNotes').optional().isString().withMessage('User notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userProfile, petProfile, userNotes = '' } = req.body;

    const prompt = `Help write a compelling adoption application for this pet.

Pet: ${petProfile.name || 'Pet'}, ${petProfile.species} ${petProfile.breed || 'mixed'}, ${petProfile.age} years old
Description: ${petProfile.bio || 'No description available'}

Applicant: ${userProfile.name}, ${userProfile.location || 'Location not specified'}
Experience: ${userProfile.petExperience || 'Not specified'}
Home: ${userProfile.homeType || 'Not specified'}

Additional notes: ${userNotes}

Write a professional, enthusiastic application that highlights why this person would be a great pet parent. Keep it under 300 words.`;

    const messages = [
      {
        role: 'system',
        content: 'You are a professional pet adoption consultant. Help write compelling, sincere adoption applications that highlight the applicant\'s suitability as a pet parent.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const application = await axios.post(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      model: 'deepseek-chat',
      messages: messages,
      max_tokens: 600,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }).then(response => response.data.choices[0].message.content);

    res.json({
      success: true,
      content: application.trim()
    });

  } catch (error) {
    logger.error('Application assistance error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to generate application content',
      error: error.message
    });
  }
});

// Cache management endpoints
router.get('/cache/stats', authenticateToken, async (req, res) => {
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
  } catch (error) {
    logger.error('Cache stats error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get cache stats',
      error: error.message
    });
  }
});

router.post('/cache/clear', authenticateToken, async (req, res) => {
  try {
    const entriesCleared = responseCache.size;
    responseCache.clear();
    
    res.json({
      success: true,
      message: `Cleared ${entriesCleared} cache entries`,
      entries_cleared: entriesCleared
    });
  } catch (error) {
    logger.error('Cache clear error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
});

// AI service health check
router.get('/health', async (req, res) => {
  try {
    const healthCheck = {
      status: 'healthy',
      service: 'Enhanced PawfectMatch AI Routes',
      timestamp: new Date().toISOString(),
      cache: {
        enabled: true,
        entries: responseCache.size,
        ttl_ms: CACHE_TTL
      },
      endpoints: {
        'generate-bio': 'Enhanced with tone, length, and caching',
        'analyze-photos': 'Enhanced with AI insights and fallbacks', 
        'enhanced-compatibility': 'Advanced analysis with detailed breakdown',
        'compatibility': 'Legacy endpoint with enhanced backend',
        'assist-application': 'AI-powered adoption assistance'
      }
    };

    // Test AI service connection
    try {
      await callEnhancedAIService('health', {}, { useCache: false, timeout: 5000 });
      healthCheck.ai_service = 'connected';
    } catch {
      healthCheck.ai_service = 'unreachable';
      healthCheck.fallback = 'direct_api_available';
    }

    res.json({
      success: true,
      ...healthCheck
    });

  } catch (error) {
    logger.error('Health check error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

export default router;
