export {};// Added to mark file as a module
const Joi = require('joi');

// Custom validation middleware using Joi
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

// Common validation schemas
const schemas = {
  // Stripe configuration schema
  stripeConfig: Joi.object({
    secretKey: Joi.string().pattern(/^sk_(test|live)_[0-9a-zA-Z]{24,}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid Stripe secret key format'
      }),
    publishableKey: Joi.string().pattern(/^pk_(test|live)_[0-9a-zA-Z]{24,}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid Stripe publishable key format'
      }),
    webhookSecret: Joi.string().pattern(/^whsec_[0-9a-zA-Z]{24,}$/)
      .allow('')
      .optional()
      .messages({
        'string.pattern.base': 'Invalid Stripe webhook secret format'
      }),
    isLiveMode: Joi.boolean().optional()
  }),
  
  // DeepSeek AI configuration schema
  aiConfig: Joi.object({
    apiKey: Joi.string().pattern(/^sk-[0-9a-zA-Z]{32,}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid DeepSeek API key format'
      }),
    baseUrl: Joi.string().uri().required(),
    model: Joi.string().required(),
    maxTokens: Joi.number().integer().min(1).max(8192).required(),
    temperature: Joi.number().min(0).max(1).required()
  }),
  
  // Google Maps configuration schema
  mapsConfig: Joi.object({
    apiKey: Joi.string().pattern(/^AIza[0-9A-Za-z-_]{35}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid Google Maps API key format'
      }),
    quotaLimit: Joi.number().integer().min(0).optional(),
    billingAccount: Joi.string().optional()
  }),
  
  // External service configuration schema
  serviceConfig: Joi.object({
    apiKey: Joi.string().required(),
    endpoint: Joi.string().uri().required(),
    limit: Joi.number().integer().min(0).optional(),
    isActive: Joi.boolean().optional()
  })
};

module.exports = {
  validateRequest,
  schemas
};
