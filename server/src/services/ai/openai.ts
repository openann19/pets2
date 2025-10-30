import OpenAI from 'openai';
import logger from '../../utils/logger';

/**
 * OpenAI client instance
 * Initialize with API key from environment
 */
export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

if (!openai) {
  logger.warn('⚠️ OpenAI API key not configured. Set OPENAI_API_KEY in environment.');
}

/**
 * Generate a pet bio using OpenAI
 */
export async function generatePetBio(pet: {
  name: string;
  breed?: string;
  age?: number;
  traits?: string[];
}): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI not configured');
  }

  const systemPrompt = 'You write charming, ~50-word bios for pets on a dating app. Be warm, playful, and concise.';
  const userPrompt = `Name: ${pet.name}\nBreed: ${pet.breed ?? 'Unknown'}\nAge: ${pet.age ?? 'Unknown'}\nTraits: ${(pet.traits ?? []).join(', ')}\nTone: warm, playful, concise.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    return completion.choices[0].message.content || 'A friendly pet looking for a match!';
  } catch (error) {
    logger.error('OpenAI bio generation failed', { error });
    throw error;
  }
}

