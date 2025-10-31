/**
 * Translation Service
 * Phase 2 Product Enhancement - Chat Translation via proxy
 */

import Translation from '../models/Translation';
import logger from '../utils/logger';
import type { TranslationRequest, TranslationResponse } from '@pawfectmatch/core/types/phase2-contracts';

/**
 * Detect language from text (simple heuristic, can be enhanced)
 */
async function detectLanguage(text: string): Promise<string> {
  // Simple heuristic: check for common patterns
  // In production, use a proper language detection library
  const spanishPatterns = /[áéíóúñ¿¡]/i;
  const frenchPatterns = /[àâäéèêëïîôùûüÿç]/i;
  const germanPatterns = /[äöüßÄÖÜ]/i;
  
  if (spanishPatterns.test(text)) return 'es';
  if (frenchPatterns.test(text)) return 'fr';
  if (germanPatterns.test(text)) return 'de';
  
  // Default to English
  return 'en';
}

/**
 * Translate text using external provider (proxy pattern)
 * This service proxies requests to avoid exposing API keys to clients
 */
async function translateText(
  text: string,
  srcLang: string,
  tgtLang: string
): Promise<{ translatedText: string; confidence: number; provider: string }> {
  try {
    // Check if we have Google Translate API key
    const apiKey = process.env['GOOGLE_TRANSLATE_API_KEY'];
    
    if (apiKey) {
      // Use Google Translate API
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: srcLang,
            target: tgtLang,
            format: 'text',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Google Translate API error: ${response.status}`);
      }

      const data = await response.json() as any;
      const translatedText = data.data?.translations?.[0]?.translatedText || text;
      
      return {
        translatedText,
        confidence: 0.9, // Google Translate typically high confidence
        provider: 'google',
      };
    }

    // Fallback: Use a free/open-source service if available
    // For now, return original text with low confidence
    logger.warn('Translation API key not configured, returning original text', {
      srcLang,
      tgtLang,
    });

    return {
      translatedText: text,
      confidence: 0.0,
      provider: 'none',
    };
  } catch (error) {
    logger.error('Translation failed', { error, srcLang, tgtLang });
    throw error;
  }
}

/**
 * Get or create translation for a message
 */
export async function getTranslation(
  request: TranslationRequest
): Promise<TranslationResponse> {
  try {
    // Check cache first
    const cacheKey = `${request.msgId}_${request.tgtLang}`;
    const cached = await Translation.findOne({
      msgId: request.msgId,
      tgtLang: request.tgtLang,
      cachedUntil: { $gt: new Date() },
    }).lean();

    if (cached) {
      logger.debug('Translation cache hit', { msgId: request.msgId, tgtLang: request.tgtLang });
      
      return {
        success: true,
        data: {
          msgId: cached.msgId,
          srcLang: cached.srcLang,
          tgtLang: cached.tgtLang,
          text: cached.text,
          quality: cached.quality,
          cachedUntil: cached.cachedUntil.toISOString(),
          provider: cached.provider,
          confidence: cached.confidence,
        },
      };
    }

    // Detect source language if not provided
    let srcLang = request.srcLang;
    if (!srcLang) {
      srcLang = await detectLanguage(request.msgText);
    }

    // Translate
    const { translatedText, confidence, provider } = await translateText(
      request.msgText,
      srcLang,
      request.tgtLang
    );

    // Determine quality based on confidence
    const quality: 'high' | 'low' = confidence >= 0.85 ? 'high' : 'low';

    // Cache for 24 hours
    const cachedUntil = new Date();
    cachedUntil.setHours(cachedUntil.getHours() + 24);

    // Save to cache
    const translation = await Translation.create({
      msgId: request.msgId,
      srcLang,
      tgtLang: request.tgtLang,
      text: translatedText,
      quality,
      cachedUntil,
      provider,
      confidence,
    });

    logger.info('Translation created', {
      msgId: request.msgId,
      srcLang,
      tgtLang: request.tgtLang,
      quality,
      provider,
    });

    return {
      success: true,
      data: {
        msgId: translation.msgId,
        srcLang: translation.srcLang,
        tgtLang: translation.tgtLang,
        text: translation.text,
        quality: translation.quality,
        cachedUntil: translation.cachedUntil.toISOString(),
        provider: translation.provider,
        confidence: translation.confidence,
      },
    };
  } catch (error) {
    logger.error('Failed to get translation', { error, request });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Clean up expired translations (called by cron job)
 */
export async function cleanupExpiredTranslations(): Promise<number> {
  try {
    const result = await Translation.deleteMany({
      cachedUntil: { $lt: new Date() },
    });

    logger.info('Expired translations cleaned up', { count: result.deletedCount });
    return result.deletedCount || 0;
  } catch (error) {
    logger.error('Failed to cleanup expired translations', { error });
    throw error;
  }
}

