import { body, validationResult, ValidationChain, Request, ValidationError } from 'express-validator';
import type { Request as ExpressRequest, Response, NextFunction } from 'express';

/**
 * Type for validation chains
 */
type ValidationChainArray = ValidationChain[];

/**
 * Validation patterns for common use cases
 */
export const patterns = {
  stripeSecretKey: /^sk_(test|live)_[0-9a-zA-Z]{24,}$/,
  stripePublishableKey: /^pk_(test|live)_[0-9a-zA-Z]{24,}$/,
  stripeWebhookSecret: /^whsec_[0-9a-zA-Z]{24,}$/,
  googleApiKey: /^AIza[0-9A-Za-z-_]{35}$/,
  deepseekApiKey: /^sk-[0-9a-zA-Z]{32,}$/,
  mongoId: /^[0-9a-fA-F]{24}$/,
  url: /^(https?:\/\/)[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}(:[0-9]{1,5})?(\/[^\s]*)?$/
};

/**
 * Validator middleware
 * Executes validations and returns errors if any
 */
export const validate = (validations: ValidationChainArray) => {
  return async (req: ExpressRequest, res: Response, next: NextFunction): Promise<void> => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }
    
    // Return validation errors
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  };
};

/**
 * Common validation schemas
 */
export const schemas = {
  stripeConfig: [
    body('secretKey')
      .optional()
      .matches(patterns.stripeSecretKey)
      .withMessage('Invalid Stripe secret key format'),
    body('publishableKey')
      .optional()
      .matches(patterns.stripePublishableKey)
      .withMessage('Invalid Stripe publishable key format'),
    body('webhookSecret')
      .optional()
      .matches(patterns.stripeWebhookSecret)
      .withMessage('Invalid Stripe webhook secret format'),
    body('isLiveMode')
      .optional()
      .isBoolean()
      .withMessage('isLiveMode must be a boolean')
  ],
  
  aiConfig: [
    body('apiKey')
      .optional()
      .matches(patterns.deepseekApiKey)
      .withMessage('Invalid DeepSeek API key format'),
    body('baseUrl')
      .optional()
      .isURL()
      .withMessage('Invalid base URL'),
    body('model')
      .optional()
      .isString()
      .withMessage('Model must be a string'),
    body('maxTokens')
      .optional()
      .isInt({ min: 1, max: 8192 })
      .withMessage('maxTokens must be an integer between 1 and 8192'),
    body('temperature')
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage('temperature must be a float between 0 and 1')
  ],
  
  mapsConfig: [
    body('apiKey')
      .optional()
      .matches(patterns.googleApiKey)
      .withMessage('Invalid Google Maps API key format'),
    body('quotaLimit')
      .optional()
      .isInt({ min: 0 })
      .withMessage('quotaLimit must be a positive integer'),
    body('billingAccount')
      .optional()
      .isString()
      .withMessage('billingAccount must be a string')
  ],
  
  settings: [
    body('STORY_DAILY_CAP')
      .optional()
      .isInt({ min: 0 })
      .withMessage('STORY_DAILY_CAP must be a non-negative integer'),
    body('REDIS_URL')
      .optional()
      .matches(patterns.url)
      .withMessage('REDIS_URL must be a valid URL')
  ]
};
