import express, { type Request, type Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import logger from '../utils/logger';
import Pet from '../models/Pet';
import { type IUserDocument } from '../models/User';

interface AuthenticatedRequest extends Request {
  userId: string;
  user?: IUserDocument;
}

interface Archetype {
  name: string;
  description: string;
  icon: string;
  traits: string[];
  compatibility: string[];
  energyLevel: string;
  independence: string;
  sociability: string;
}

interface PersonalityArchetypes {
  [key: string]: Archetype;
}

const router: Router = express.Router();

// Pet personality archetypes
const PERSONALITY_ARCHETYPES: PersonalityArchetypes = {
  'the-playful-explorer': {
    name: 'The Playful Explorer',
    description: 'Adventurous, curious, and always ready for new experiences',
    icon: '🎯',
    traits: ['energetic', 'playful', 'curious', 'adventurous', 'social'],
    compatibility: ['the-social-butterfly', 'the-energetic-athlete'],
    energyLevel: 'high',
    independence: 'medium',
    sociability: 'high'
  },
  'the-cautious-cuddler': {
    name: 'The Cautious Cuddler',
    description: 'Gentle, loving, and prefers familiar environments',
    icon: '🤗',
    traits: ['calm', 'gentle', 'shy', 'loving', 'good-with-kids'],
    compatibility: ['the-independent-thinker', 'the-social-butterfly'],
    energyLevel: 'low',
    independence: 'low',
    sociability: 'medium'
  },
  'the-social-butterfly': {
    name: 'The Social Butterfly',
    description: 'Outgoing, friendly, and loves meeting new friends',
    icon: '🦋',
    traits: ['friendly', 'social', 'good-with-pets', 'good-with-strangers', 'playful'],
    compatibility: ['the-playful-explorer', 'the-cautious-cuddler'],
    energyLevel: 'medium',
    independence: 'medium',
    sociability: 'high'
  },
  'the-independent-thinker': {
    name: 'The Independent Thinker',
    description: 'Smart, self-reliant, and enjoys their own company',
    icon: '🧠',
    traits: ['intelligent', 'independent', 'calm', 'trained', 'gentle'],
    compatibility: ['the-cautious-cuddler', 'the-energetic-athlete'],
    energyLevel: 'medium',
    independence: 'high',
    sociability: 'low'
  },
  'the-energetic-athlete': {
    name: 'The Energetic Athlete',
    description: 'Active, strong, and always up for physical challenges',
    icon: '🏃',
    traits: ['energetic', 'active', 'athletic', 'playful', 'strong'],
    compatibility: ['the-playful-explorer', 'the-independent-thinker'],
    energyLevel: 'very-high',
    independence: 'high',
    sociability: 'medium'
  }
};

// @desc    Generate pet personality archetype
// @route   POST /api/personality/generate
// @access  Private
router.post('/generate', authenticateToken, [
  body('petId').isMongoId().withMessage('Valid pet ID is required'),
  body('breed').optional().isString().withMessage('Breed must be a string'),
  body('age').optional().isInt({ min: 0 }).withMessage('Age must be a positive integer'),
  body('personalityTags').optional().isArray().withMessage('Personality tags must be an array'),
  body('description').optional().isString().withMessage('Description must be a string')
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

    const { petId, breed, age, personalityTags = [], description = '' } = req.body;

    // Analyze pet data to determine personality archetype
    const analysisResult = await analyzePetPersonality({
      breed,
      age,
      personalityTags,
      description
    });

    // Generate compatibility insights
    const compatibilityInsights = generateCompatibilityInsights(analysisResult);

    res.json({
      success: true,
      data: {
        petId,
        primaryArchetype: analysisResult.primaryArchetype,
        secondaryArchetype: analysisResult.secondaryArchetype,
        personalityScore: analysisResult.personalityScore,
        description: analysisResult.description,
        compatibilityTips: analysisResult.compatibilityTips,
        compatibilityInsights,
        traits: analysisResult.traits,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Personality generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate personality archetype',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Get personality compatibility between two pets
// @route   POST /api/personality/compatibility
// @access  Private
router.post('/compatibility', authenticateToken, [
  body('pet1Id').isMongoId().withMessage('Valid pet1 ID is required'),
  body('pet2Id').isMongoId().withMessage('Valid pet2 ID is required'),
  body('interactionType').optional().isIn(['playdate', 'mating', 'adoption', 'cohabitation']).withMessage('Invalid interaction type')
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

    const { pet1Id, pet2Id, interactionType = 'playdate' } = req.body;

    // Get personality data for both pets (in real implementation, fetch from database)
    const pet1Personality = await getPetPersonality(pet1Id);
    const pet2Personality = await getPetPersonality(pet2Id);

    if (!pet1Personality || !pet2Personality) {
      return res.status(404).json({
        success: false,
        message: 'Pet personality data not found'
      });
    }

    // Calculate compatibility score
    const compatibilityScore = calculatePersonalityCompatibility(
      pet1Personality,
      pet2Personality,
      interactionType
    );

    // Generate detailed compatibility analysis
    const compatibilityAnalysis = generateDetailedCompatibilityAnalysis(
      pet1Personality,
      pet2Personality,
      interactionType
    );

    res.json({
      success: true,
      data: {
        pet1Id,
        pet2Id,
        interactionType,
        compatibilityScore,
        analysis: compatibilityAnalysis,
        recommendations: generateRecommendations(compatibilityScore, interactionType),
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Personality compatibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate personality compatibility',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Get all personality archetypes
// @route   GET /api/personality/archetypes
// @access  Private
router.get('/archetypes', authenticateToken, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        archetypes: PERSONALITY_ARCHETYPES
      }
    });
  } catch (error) {
    logger.error('Get archetypes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch personality archetypes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper functions
interface PetData {
  breed?: string;
  age?: number;
  personalityTags?: string[];
  description?: string;
}

interface AnalysisResult {
  primaryArchetype: string;
  secondaryArchetype: string;
  personalityScore: {
    energy: number;
    independence: number;
    sociability: number;
  };
  description: string;
  compatibilityTips: string;
  traits: string[];
}

async function analyzePetPersonality(petData: PetData): Promise<AnalysisResult> {
  const { breed, age, personalityTags = [], description = '' } = petData;

  // Score each archetype based on pet data
  const archetypeScores: { [key: string]: number } = {};

  for (const [key, archetype] of Object.entries(PERSONALITY_ARCHETYPES)) {
    let score = 0;

    // Score based on personality tags overlap
    const tagOverlap = (personalityTags || []).filter((tag: string) =>
      archetype.traits.includes(tag)
    ).length;
    score += tagOverlap * 20;

    // Score based on breed characteristics (simplified)
    if (breed) {
      const breedScore = getBreedPersonalityScore(breed, archetype.traits);
      score += breedScore * 15;
    }

    // Score based on age (younger pets tend to be more energetic)
    if (age !== undefined) {
      if (archetype.energyLevel === 'high' && age < 3) score += 10;
      if (archetype.energyLevel === 'low' && age > 5) score += 10;
    }

    // Score based on description keywords
    if (description) {
      const descriptionScore = analyzeDescriptionKeywords(description, archetype.traits);
      score += descriptionScore * 10;
    }

    archetypeScores[key] = score;
  }

  // Get primary and secondary archetypes
  const sortedArchetypes = Object.entries(archetypeScores)
    .sort(([, a], [, b]) => b - a);

  const primaryKey = sortedArchetypes[0][0];
  const secondaryKey = sortedArchetypes[1][0];

  const primaryArchetype = PERSONALITY_ARCHETYPES[primaryKey];
  const secondaryArchetype = PERSONALITY_ARCHETYPES[secondaryKey];

  // Generate description and compatibility tips
  const personalityDescription = generatePersonalityDescription(primaryArchetype, secondaryArchetype);
  const compatibilityTips = generateCompatibilityTips(primaryArchetype);

  return {
    primaryArchetype: primaryKey,
    secondaryArchetype: secondaryKey,
    personalityScore: {
      energy: getEnergyScore(primaryArchetype.energyLevel),
      independence: getIndependenceScore(primaryArchetype.independence),
      sociability: getSociabilityScore(primaryArchetype.sociability)
    },
    description: personalityDescription,
    compatibilityTips,
    traits: primaryArchetype.traits
  };
}

function getBreedPersonalityScore(breed: string, archetypeTraits: string[]): number {
  const breedTraits: { [key: string]: string[] } = {
    'golden retriever': ['friendly', 'energetic', 'good-with-kids'],
    'labrador': ['friendly', 'energetic', 'good-with-kids'],
    'german shepherd': ['intelligent', 'protective', 'trained'],
    'french bulldog': ['calm', 'friendly', 'good-with-kids'],
    'siamese': ['vocal', 'social', 'intelligent'],
    'persian': ['calm', 'gentle', 'quiet'],
    'maine coon': ['friendly', 'gentle', 'good-with-kids']
  };

  const traits = breedTraits[breed.toLowerCase()] || [];
  const overlap = traits.filter(trait => archetypeTraits.includes(trait)).length;
  return overlap / Math.max(traits.length, 1);
}

function analyzeDescriptionKeywords(description: string, archetypeTraits: string[]): number {
  const keywords = description.toLowerCase().split(/\s+/);
  const traitKeywords: { [key: string]: string[] } = {
    'energetic': ['active', 'energetic', 'playful', 'bouncy'],
    'calm': ['calm', 'gentle', 'quiet', 'peaceful'],
    'friendly': ['friendly', 'social', 'outgoing', 'loving'],
    'intelligent': ['smart', 'intelligent', 'clever', 'quick'],
    'playful': ['playful', 'fun', 'games', 'toys']
  };

  let score = 0;
  for (const trait of archetypeTraits) {
    const traitWords = traitKeywords[trait] || [];
    const matches = keywords.filter(word => traitWords.includes(word)).length;
    score += matches;
  }

  return Math.min(score, 5); // Cap at 5
}

function generatePersonalityDescription(primary: Archetype, secondary?: Archetype): string {
  const descriptions: { [key: string]: string } = {
    'the-playful-explorer': `${primary.name} - ${primary.description} Secondary influence: ${secondary?.name ?? 'N/A'} adds ${secondary?.traits?.slice(0, 2).join(', ') || 'balanced temperament'}.`,
    'the-cautious-cuddler': `${primary.name} - ${primary.description} Secondary influence: ${secondary?.name ?? 'N/A'} encourages ${secondary?.traits?.slice(0, 2).join(', ') || 'gentle interactions'}.`,
    'the-social-butterfly': `${primary.name} - ${primary.description} Secondary influence: ${secondary?.name ?? 'N/A'} enhances ${secondary?.traits?.slice(0, 2).join(', ') || 'social adaptability'}.`,
    'the-independent-thinker': `${primary.name} - ${primary.description} Secondary influence: ${secondary?.name ?? 'N/A'} contributes ${secondary?.traits?.slice(0, 2).join(', ') || 'thoughtful balance'}.`,
    'the-energetic-athlete': `${primary.name} - ${primary.description} Secondary influence: ${secondary?.name ?? 'N/A'} supports ${secondary?.traits?.slice(0, 2).join(', ') || 'motivated routines'}.`
  };

  return descriptions[primary.name.toLowerCase().replace(/\s+/g, '-')] || primary.description;
}

function generateCompatibilityTips(archetype: Archetype): string {
  const tips: { [key: string]: string } = {
    'the-playful-explorer': 'Best matches with other energetic pets who love adventure and play.',
    'the-cautious-cuddler': 'Thrives with gentle, patient pets who respect their need for space.',
    'the-social-butterfly': 'Gets along with most pets but especially loves other social, friendly companions.',
    'the-independent-thinker': 'Prefers pets who are calm and don\'t require constant attention.',
    'the-energetic-athlete': 'Needs active companions who can keep up with their energy level.'
  };

  const key = archetype.name.toLowerCase().replace(/\s+/g, '-');
  return tips[key] || 'Compatibility depends on individual personality and circumstances.';
}

function generateCompatibilityInsights(analysisResult: AnalysisResult) {
  const { personalityScore, primaryArchetype, secondaryArchetype } = analysisResult;

  return {
    energyMatch: personalityScore.energy > 6
      ? 'Високата енергия предполага активни партньори.'
      : 'По-ниската енергия пасва на спокойни срещи.',
    socialMatch: personalityScore.sociability > 6
      ? 'Социалните любимци обожават групови занимания.'
      : 'По-интровертните любимци предпочитат индивидуални срещи.',
    independenceMatch: personalityScore.independence > 6
      ? 'Самостоятелните любимци ценят пространство и време за адаптация.'
      : 'По-зависимите любимци се нуждаят от внимателно въвеждане.',
    archetypeSummary: `Основен архетип: ${primaryArchetype}. Допълващ архетип: ${secondaryArchetype}.`
  };
}

async function getPetPersonality(petId: string) {
  try {
    const pet = await Pet.findById(petId).lean();

    if (!pet || !(pet as any).aiData || !(pet as any).aiData.personalityArchetype) {
      return null;
    }

    return {
      petId: pet._id.toString(),
      primaryArchetype: (pet as any).aiData.personalityArchetype?.primary || 'the-playful-explorer',
      secondaryArchetype: (pet as any).aiData.personalityArchetype?.secondary || 'the-social-butterfly',
      personalityScore: {
        energy: (pet as any).aiData.personalityScore?.energy || 5,
        independence: (pet as any).aiData.personalityScore?.independence || 5,
        sociability: (pet as any).aiData.personalityScore?.socialness || 5
      },
      traits: (pet as any).personalityTags || []
    };
  } catch (error) {
    logger.error('Error fetching pet personality:', error);
    return null;
  }
}

function calculatePersonalityCompatibility(pet1: any, pet2: any, interactionType: string): number {
  const scores = {
    energy: Math.abs(pet1.personalityScore.energy - pet2.personalityScore.energy),
    independence: Math.abs(pet1.personalityScore.independence - pet2.personalityScore.independence),
    sociability: Math.abs(pet1.personalityScore.sociability - pet2.personalityScore.sociability)
  };

  const weights: { [key: string]: { energy: number; independence: number; sociability: number } } = {
    playdate: { energy: 0.5, independence: 0.2, sociability: 0.3 },
    mating: { energy: 0.3, independence: 0.2, sociability: 0.5 },
    adoption: { energy: 0.4, independence: 0.4, sociability: 0.2 },
    cohabitation: { energy: 0.3, independence: 0.5, sociability: 0.2 }
  };

  const { energy, independence, sociability } = weights[interactionType] || weights.playdate;
  const weightedDifference =
    scores.energy * energy +
    scores.independence * independence +
    scores.sociability * sociability;

  const compatibilityScore = Math.max(0, 100 - (weightedDifference * 10));

  return Math.round(compatibilityScore);
}

function generateDetailedCompatibilityAnalysis(pet1: any, pet2: any, interactionType: string) {
  return {
    energyCompatibility: {
      score: Math.max(0, 100 - Math.abs(pet1.personalityScore.energy - pet2.personalityScore.energy) * 10),
      description: `Енергийна съвместимост спрямо сценарий "${interactionType}"`
    },
    socialCompatibility: {
      score: Math.max(0, 100 - Math.abs(pet1.personalityScore.sociability - pet2.personalityScore.sociability) * 10),
      description: `Социална динамика при "${interactionType}"`
    },
    independenceCompatibility: {
      score: Math.max(0, 100 - Math.abs(pet1.personalityScore.independence - pet2.personalityScore.independence) * 10),
      description: `Ниво на независимост в контекст "${interactionType}"`
    }
  };
}

function generateRecommendations(compatibilityScore: number, interactionType: string): string[] {
  const baseRecommendations: { [key: string]: string } = {
    playdate: 'Планирайте кратки и наблюдавани срещи.',
    mating: 'Работете с ветеринар за поетапно запознаване.',
    adoption: 'Осигурете адаптационен период и безопасно пространство.',
    cohabitation: 'Следете споделените ресурси и отделните зони за почивка.'
  };

  if (compatibilityScore >= 80) {
    return ['Отлична съвместимост – очаквайте бърза адаптация.', baseRecommendations[interactionType] || baseRecommendations.playdate];
  } else if (compatibilityScore >= 60) {
    return ['Добра съвместимост с дребни забележки.', baseRecommendations[interactionType] || baseRecommendations.playdate];
  } else if (compatibilityScore >= 40) {
    return ['Умерена съвместимост – подходете внимателно.', baseRecommendations[interactionType] || baseRecommendations.playdate];
  }

  return ['Ниска съвместимост – преценете алтернативи или различен тип взаимодействие.', baseRecommendations[interactionType] || baseRecommendations.playdate];
}

function getEnergyScore(energyLevel: string): number {
  const scores: { [key: string]: number } = { 'low': 2, 'medium': 5, 'high': 8, 'very-high': 10 };
  return scores[energyLevel] || 5;
}

function getIndependenceScore(independence: string): number {
  const scores: { [key: string]: number } = { 'low': 2, 'medium': 5, 'high': 8 };
  return scores[independence] || 5;
}

function getSociabilityScore(sociability: string): number {
  const scores: { [key: string]: number } = { 'low': 2, 'medium': 5, 'high': 8 };
  return scores[sociability] || 5;
}

export default router;

