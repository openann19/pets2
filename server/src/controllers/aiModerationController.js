/**
 * AI Content Moderation Controller
 * Analyzes text and images using OpenAI and DeepSeek AI
 */

const { z } = require('zod');
const logger = require('../utils/logger');
const axios = require('axios');
const { notifyContentFlagged } = require('../services/adminNotifications');

/**
 * OpenAI Moderation API Integration
 * Uses GPT-4 moderation endpoint
 */
const analyzeWithOpenAI = async (text, apiKey) => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/moderations',
            { input: text },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                timeout: 10000,
            }
        );

        const result = response.data.results[0];

        return {
            flagged: result.flagged,
            scores: {
                toxicity: result.category_scores.hate + result.category_scores['hate/threatening'],
                hate_speech: result.category_scores.hate,
                sexual_content: result.category_scores.sexual + result.category_scores['sexual/minors'],
                violence: result.category_scores.violence + result.category_scores['violence/graphic'],
                spam: result.category_scores['self-harm'] || 0,
            },
            categories: Object.keys(result.categories).filter(k => result.categories[k]),
            provider: 'openai',
        };
    } catch (error) {
        logger.error('OpenAI moderation failed', { error: error.message });
        throw new Error('OpenAI moderation service unavailable');
    }
};

/**
 * DeepSeek API Integration
 * Uses DeepSeek AI for content analysis
 */
const analyzeWithDeepSeek = async (text, apiKey) => {
    try {
        const response = await axios.post(
            'https://api.deepseek.com/v1/chat/completions',
            {
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a content moderation AI. Analyze the following text and return a JSON object with scores (0.0-1.0) for: toxicity, hate_speech, sexual_content, violence, spam. Also include a "flagged" boolean if any score is above 0.7.'
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 0.1,
                max_tokens: 200,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                timeout: 15000,
            }
        );

        const content = response.data.choices[0].message.content;
        const parsed = JSON.parse(content);

        return {
            flagged: parsed.flagged || false,
            scores: {
                toxicity: parsed.toxicity || 0,
                hate_speech: parsed.hate_speech || 0,
                sexual_content: parsed.sexual_content || 0,
                violence: parsed.violence || 0,
                spam: parsed.spam || 0,
            },
            categories: Object.keys(parsed).filter(k => k !== 'flagged' && parsed[k] > 0.7),
            provider: 'deepseek',
        };
    } catch (error) {
        logger.error('DeepSeek moderation failed', { error: error.message });
        throw new Error('DeepSeek moderation service unavailable');
    }
};

/**
 * Fallback mock analysis for testing
 */
const analyzeMock = async (text) => {
    const seed = Math.abs((text || '').length || 1);
    const random = (offset) => (Math.sin(seed + offset) + 1) / 4; // deterministic-ish 0-0.5
    const scores = {
        toxicity: random(0),
        hate_speech: random(1),
        sexual_content: random(2),
        violence: random(3),
        spam: random(4),
    };

    const flagged = Object.entries(scores).some(([, score]) => score > 0.7);

    return {
        flagged,
        scores,
        categories: Object.keys(scores).filter(k => scores[k] > 0.7),
        provider: 'mock',
    };
};

/**
 * Main text analysis function - routes to appropriate provider
 */
const analyzeTextContent = async (text, provider = 'mock', apiKey = null) => {
    switch (provider) {
        case 'openai':
            if (!apiKey) throw new Error('OpenAI API key required');
            return await analyzeWithOpenAI(text, apiKey);
        case 'deepseek':
            if (!apiKey) throw new Error('DeepSeek API key required');
            return await analyzeWithDeepSeek(text, apiKey);
        default:
            return await analyzeMock(text);
    }
};

/**
 * Image analysis placeholder - can integrate AWS Rekognition
 */
const analyzeImageContent = async (imageUrl) => {
    // Mock for now - integrate AWS Rekognition or similar
    const seed = Math.abs((imageUrl || '').length || 1);
    const random = (offset) => (Math.cos(seed + offset) + 1) / 3; // deterministic-ish 0-0.66
    const scores = {
        explicit: random(0),
        suggestive: random(1),
        violence: random(2) / 1.5,
        gore: random(3) / 2,
    };

    const flagged = Object.entries(scores).some(([, score]) => score > 0.75);

    return {
        flagged,
        scores,
        categories: Object.keys(scores).filter(k => scores[k] > 0.75),
        provider: 'mock',
    };
};

const textModerationSchema = z.object({
    context: z.enum(['pet_description', 'message', 'profile_bio', 'comment', 'other']).optional(),
}).extend({
    text: z.string().min(1).max(10000),
});

const imageModerationSchema = z.object({
    context: z.enum(['pet_photo', 'profile_photo', 'chat_image', 'other']).optional(),
}).extend({
    imageUrl: z.string().url(),
});

exports.moderateText = async (req, res) => {
    try {
        const parsed = textModerationSchema.parse(req.body);

        // Fetch moderation settings to get provider and API key
        let settings = await ModerationSettings.findOne();
        if (!settings) {
            settings = await ModerationSettings.create({});
        }

        const provider = settings.provider || 'mock';
        const apiKey = settings.apiKeys?.[provider] || null;

        // Analyze content with configured provider
        const result = await analyzeTextContent(parsed.text, provider, apiKey);

        // Check if content exceeds thresholds
        const violatedCategories = [];
        const enabledCategories = settings.enabledCategories?.text || [];

        for (const category of enabledCategories) {
            const score = result.scores[category];
            const threshold = settings.textThresholds?.[category];
            if (score && threshold && score >= threshold) {
                violatedCategories.push({ category, score, threshold });
            }
        }

        const shouldFlag = violatedCategories.length > 0;

        logger.info('Text moderation completed', {
            userId: req.user?._id,
            context: parsed.context,
            provider: result.provider,
            flagged: shouldFlag,
            violatedCategories,
        });

        // Send real-time notification to admins if content is flagged
        if (shouldFlag) {
            notifyContentFlagged({
                contentType: 'text',
                contentId: parsed.text.substring(0, 50), // First 50 chars as preview
                userId: req.user?._id,
                scores: result.scores,
                violatedCategories,
                provider: result.provider,
            });
        }

        return res.json({
            success: true,
            data: {
                flagged: shouldFlag,
                scores: result.scores,
                categories: result.categories,
                violatedCategories,
                action: shouldFlag ? 'flag_for_review' : 'allow',
                provider: result.provider,
            },
        });
    } catch (error) {
        logger.error('Text moderation failed', { error: error.message });
        const status = error.name === 'ZodError' ? 400 : 500;
        return res.status(status).json({ success: false, message: 'Moderation failed' });
    }
};

exports.moderateImage = async (req, res) => {
    try {
        const parsed = imageModerationSchema.parse(req.body);
        const result = await analyzeImageContent(parsed.imageUrl);

        logger.info('Image moderation completed', {
            userId: req.user?._id,
            context: parsed.context,
            flagged: result.flagged,
            categories: result.categories,
        });

        return res.json({
            success: true,
            data: {
                flagged: result.flagged,
                scores: result.scores,
                categories: result.categories,
                action: result.flagged ? 'block' : 'allow',
            },
        });
    } catch (error) {
        logger.error('Image moderation failed', { error: error.message });
        const status = error.name === 'ZodError' ? 400 : 500;
        return res.status(status).json({ success: false, message: 'Moderation failed' });
    }
};

// AI Moderation Settings (Admin)
const ModerationSettings = require('../models/ModerationSettings');

exports.getSettings = async (req, res) => {
    try {
        let settings = await ModerationSettings.findOne();
        if (!settings) {
            // Create default settings
            settings = await ModerationSettings.create({
                textThresholds: {
                    toxicity: 0.7,
                    hate_speech: 0.7,
                    sexual_content: 0.75,
                    violence: 0.7,
                    spam: 0.8,
                },
                imageThresholds: {
                    explicit: 0.75,
                    suggestive: 0.8,
                    violence: 0.7,
                    gore: 0.75,
                },
                autoActions: {
                    block: true,
                    flag_for_review: true,
                    notify_admins: true,
                },
                enabledCategories: {
                    text: ['toxicity', 'hate_speech', 'sexual_content', 'violence', 'spam'],
                    image: ['explicit', 'suggestive', 'violence', 'gore'],
                },
            });
        }
        return res.json({ success: true, data: settings });
    } catch (error) {
        logger.error('Failed to fetch moderation settings', { error: error.message });
        return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const settings = await ModerationSettings.findOneAndUpdate(
            {},
            { $set: req.body },
            { new: true, upsert: true }
        );
        logger.info('Moderation settings updated', { adminId: req.user._id });
        return res.json({ success: true, data: settings });
    } catch (error) {
        logger.error('Failed to update moderation settings', { error: error.message });
        return res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
};
