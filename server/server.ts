import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { ipKeyGenerator } from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import 'dotenv/config';
import logger, { type ExtendedLogger } from './src/utils/logger';
import { FLAGS } from './src/config/flags';

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0' as const,
    info: {
      title: 'PawfectMatch API',
      version: '1.0.0',
      description: 'AI-powered pet matching platform API',
    },
    servers: [
      {
        url: process.env.CLIENT_URL || 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http' as const,
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Database connection with optimized indexes
const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL ||
      'mongodb://localhost:27017/pawfectmatch';

    const conn = await mongoose.connect(mongoURI, {
      // Modern MongoDB connection options (Mongoose 8 defaults used)
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    });

    logger.info(`🍃 MongoDB Connected: ${conn.connection.host}`);

    // Create optimized database indexes
    const { createIndexes } = await import('./src/utils/databaseIndexes');
    await createIndexes();
    logger.info('📊 Database indexes created successfully');

  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Validate environment variables before starting
await import('./src/utils/validateEnv');

// Initialize Sentry (must be before other imports)
const {
  initSentry
} = await import('./src/config/sentry');

const app: any = express();

// Initialize Sentry for production environment
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  initSentry(app);
  logger.info('🔍 Sentry monitoring enabled');
} else {
  logger.info('⚠️ Sentry monitoring disabled - not in production or missing DSN');
}

// Import routes
const authRoutes = await import('./src/routes/auth');
const userRoutes = await import('./src/routes/users');
const petRoutes = await import('./src/routes/pets');
const matchRoutes = await import('./src/routes/matches');
const chatRoutes = await import('./src/routes/chat');
const aiRoutes = await import('./src/routes/ai');
const aiPhotoRoutes = await import('./src/routes/ai.photo');
const aiCompatRoutes = await import('./src/routes/ai.compat');
const premiumRoutes = await import('./src/routes/premium');
const analyticsRoutes = await import('./src/routes/analytics');
const adminRoutes = await import('./src/routes/admin');
const adminAnalyticsRoutes = await import('./src/routes/admin.analytics');
const adminServicesRoutes = await import('./src/routes/adminServices');
const accountRoutes = await import('./src/routes/account');
const memoriesRoutes = await import('./src/routes/memories');
const webhookRoutes = await import('./src/routes/webhooks');
const biometricRoutes = await import('./src/routes/biometric');
const leaderboardRoutes = await import('./src/routes/leaderboard');
const notificationRoutes = await import('./src/routes/notifications');
// Manual moderation routes  
const moderationUserRoutes = await import('./src/routes/moderation');
const adminEnhancedFeaturesRoutes = await import('./src/routes/adminEnhancedFeatures');
const moderationAdminRoutes = await import('./src/routes/moderationAdmin');
const communityRoutes = await import('./src/routes/community'); // Import community routes
const aiModerationRoutes = await import('./src/routes/aiModeration');
const aiModerationAdminRoutes = await import('./src/routes/aiModerationAdmin');
const adminModerationRoutes = await import('./src/routes/adminModeration');
// const favoritesRoutes = await import('./routes/favorites'); // Import favorites routes
// const storiesRoutes = await import('./routes/stories');
const conversationsRoutes = await import('./src/routes/conversations');
const profileRoutes = await import('./src/routes/profile');
const adoptionRoutes = await import('./src/routes/adoption');
const petActivityRoutes = await import('./src/routes/petActivity');
// New routes for map feature
const homeRoutes = await import('./src/routes/home');
const settingsRoutes = await import('./src/routes/settings');
const revenuecatRoutes = await import('./src/routes/revenuecat');
const liveRoutes = await import('./src/routes/live');
const livekitWebhookRoutes = await import('./src/routes/livekitWebhooks');
const mapActivityRoutes = await import('./src/routes/mapActivity');
const voiceNotesRoutes = await import('./src/routes/voiceNotes');

// Import middleware
const errorHandler = await import('./src/middleware/errorHandler');
const { authenticateToken, requireAdmin } = await import('./src/middleware/auth');
const { csrfProtection, setCsrfToken } = await import('./src/middleware/csrf');
const { requestIdMiddleware } = await import('./src/middleware/requestId');

const httpServer = createServer(app);

// Socket.io setup with CORS - moved to initializeSocket function
// Make io available in all requests - handled in initializeSocket

// 2025 Enhanced Security Middleware - Modern Web Security Standards
app.use(helmet({
  // Content Security Policy (CSP) with strict rules
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'none'"],  // Deny by default - explicit allowance required
      scriptSrc: [
        "'self'",
        "'strict-dynamic'",   // Support nonce-based script loading
        "https://js.stripe.com", // Payment processing
        "https://cdn.jsdelivr.net", // CDN for libraries
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for modern styling frameworks
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net",
        "data:"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://res.cloudinary.com", // Image hosting
        "https://storage.googleapis.com", // Optional cloud storage
        "https://cdn.jsdelivr.net",
        "blob:"
      ],
      mediaSrc: [
        "'self'",
        "blob:",
        "https://res.cloudinary.com" // Video/audio hosting
      ],
      connectSrc: [
        "'self'",
        process.env.CLIENT_URL || "http://localhost:3000",
        "https://api.stripe.com",
        "https://api.cloudinary.com",
        "https://*.sentry.io",  // Error reporting
        "https://vitals.vercel-insights.com" // Performance monitoring
      ],
      frameSrc: [
        "'self'",
        "https://js.stripe.com",  // Payment frames
        "https://hooks.stripe.com" // Stripe webhooks
      ],
      objectSrc: ["'none'"],  // Disallow <object>, <embed>, and <applet>
      baseUri: ["'self'"],    // Restrict base URI for relative URLs
      formAction: ["'self'"], // Restrict form submissions
      frameAncestors: ["'none'"], // Disallow framing (anti-clickjacking)
      // upgradeInsecureRequests handled at proxy level; omit here
      workerSrc: ["'self'", "blob:"],  // Web workers
      manifestSrc: ["'self'"],  // Web app manifest
    },
    reportOnly: process.env.NODE_ENV !== 'production' // Report only in dev
  },

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: "same-site" },

  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false,  // Required for external resources

  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: { policy: "same-origin" },

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 63072000,  // 2 years in seconds
    includeSubDomains: true,
    preload: true
  },

  // Other security headers
  noSniff: true,  // X-Content-Type-Options
  // X-XSS-Protection header deprecated; rely on CSP
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },

  // Disable X-Powered-By header
  hidePoweredBy: true,

  // Disable DNS Prefetch
  dnsPrefetchControl: { allow: false },
}));

// Additional modern security headers (2025 standards)
app.use((req, res, next) => {
  // Deny framing completely
  res.setHeader('X-Frame-Options', 'DENY');

  // Enhanced permissions policy (successor to Feature-Policy)
  res.setHeader('Permissions-Policy', [
    'camera=(self)',
    'microphone=(self)',
    'geolocation=(self)',
    'payment=(self)'
  ].join(', '));

  // Clear-Site-Data header for logout routes
  if (req.path === '/api/auth/logout') {
    res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
  }

  // For API responses, add security headers
  if (req.path.startsWith('/api/') && !req.path.includes('/health')) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('Pragma', 'no-cache');

    // Add X-Response-Time header for performance monitoring
    const startHrTime = process.hrtime();
    res.on('finish', () => {
      const elapsedHrTime = process.hrtime(startHrTime);
      const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1000000;

      // Log response time for monitoring
      logger.performance('API Response', Math.round(elapsedTimeInMs), {
        path: req.path,
        method: req.method,
        statusCode: res.statusCode
      });
    });
  }

  next();
});

// 2025 Advanced Rate Limiting with Machine Learning Detection
const isTestEnv = process.env.NODE_ENV === 'test';

// Rate limit configuration with reasonable defaults
const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // Default: 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Default: 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
};

// Authentication rate limiter - more strict
const authLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 5 * 60 * 1000, // 5 minutes for auth endpoints
  max: 10, // 10 auth attempts per 5 minutes
  message: {
    status: 429,
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: Math.ceil(rateLimitConfig.windowMs / 60000)
  },
  keyGenerator: (req) => {
    // Use both IP and username (if provided) to prevent username enumeration
    const username = req.body?.username || req.body?.email || '';
    // Use library-provided IPv6-safe helper
    return username ? `${ipKeyGenerator(req)}_${username}` : ipKeyGenerator(req);
  },
  skip: (req) => {
    // Skip rate limiting for password reset verification
    return req.path === '/api/auth/reset-password/verify';
  },
  handler: (req, res, next, options) => {
    // Log security event
    logger.security('Rate limit exceeded for auth', {
      ip: req.ip,
      path: req.path,
      headers: req.headers['user-agent']
    });
    res.status(options.statusCode).json(options.message);
  }
});

// API Rate Limiter - general endpoints
const apiLimiter = rateLimit({
  ...rateLimitConfig,
  message: {
    status: 429,
    success: false,
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: Math.ceil(rateLimitConfig.windowMs / 60000)
  },
  skip: (req) => {
    // Skip rate limiting for health check and OPTIONS requests
    return req.path === '/api/health' || req.method === 'OPTIONS';
  },
  keyGenerator: (req) => {
    // Use authenticated user ID if available, otherwise IP
    const userId = req.userId || req.user?.id;
    return userId ? `user_${userId}` : ipKeyGenerator(req);
  },
  handler: (req, res, next, options) => {
    // Log rate limit exceeded
    logger.warn('API rate limit exceeded', {
      ip: req.ip,
      userId: req.userId || req.user?.id,
      path: req.path,
      method: req.method
    });
    res.status(options.statusCode).json(options.message);
  }
});

// Premium features rate limiter - more generous limits for paying customers
const _premiumLimiter = rateLimit({
  ...rateLimitConfig,
  max: parseInt(process.env.RATE_LIMIT_PREMIUM_MAX || '300'), // Higher limit for premium users
  keyGenerator: (req) => {
    const userId = req.userId || req.user?.id;
    return userId ? `premium_${userId}` : ipKeyGenerator(req);
  },
  skip: (req) => {
    // Skip for premium users with active subscription
    return req.user?.subscription?.status === 'active';
  }
});

// Webhook rate limiter - different rules for external services
const _webhookLimiter = rateLimit({
  ...rateLimitConfig,
  max: 60, // Allow more frequent webhook calls
  message: {
    status: 429,
    error: 'Too many webhook requests'
  },
  skip: (req) => {
    // Skip rate limiting for Stripe signature validated webhooks
    return req.stripeEventVerified === true;
  }
});

// Apply different rate limits to different routes (disabled in test env)
if (!isTestEnv) {
  app.use('/api/auth', authLimiter);
  app.use('/api/', apiLimiter);
}

// 2025 Enhanced CORS configuration with environment-specific rules
const corsOrigins = (() => {
  // Parse allowed origins from environment variable
  const configuredOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : [];

  // Production or staging - use configured origins only
  if (['production', 'staging'].includes(process.env.NODE_ENV || '')) {
    return [
      process.env.CLIENT_URL,
      process.env.ADMIN_URL,
      ...configuredOrigins
    ].filter(Boolean); // Remove falsy values
  }

  // Development - allow localhost with different ports
  return [
    process.env.CLIENT_URL || 'http://localhost:3000',
    process.env.ADMIN_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    ...configuredOrigins
  ].filter(Boolean);
})();

// Log configured CORS origins
logger.info(`CORS configured with ${corsOrigins.length} allowed origins`, {
  origins: process.env.NODE_ENV === 'production' ? '[REDACTED]' : corsOrigins
});

const corsMiddleware = await import('cors');
app.use(corsMiddleware.default({
  origin: (origin, callback) => {
    // Special cases
    if (!origin) {
      // Allow requests with no origin (mobile apps, curl)
      return callback(null, true);
    }

    // Check against configured origins
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Development mode - dynamic localhost detection
    if (process.env.NODE_ENV !== 'production' &&
      (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin))) {
      logger.debug(`Allowing development origin: ${origin}`);
      return callback(null, true);
    }

    // Log and reject
    logger.security('CORS blocked request', { blockedOrigin: origin });
    return callback(new Error('CORS: Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID',
    'X-API-KEY',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers'
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'Retry-After'
  ],
  maxAge: 86400 // 24 hours - how long preflight requests can be cached
}));

// Request ID for tracing and correlation
app.use(requestIdMiddleware);

// Body parsing & compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CSRF protection - set token for all requests, validate on state-changing operations
app.use(setCsrfToken);

// Logging
const morganMiddleware = await import('morgan');
app.use(morganMiddleware.default('combined'));

// Database connection function is already defined above

// Health check routes (public - no auth required)
const healthRoutes = await import('./src/routes/health');
app.use('/health', healthRoutes.default);
app.use('/api/health', healthRoutes.default); // Also available under /api prefix
// Explicit liveness and readiness endpoints for healthchecks
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'live' });
});
app.get('/health/ready', async (req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  const uptime = process.uptime();
  res.status(mongoReady ? 200 : 503).json({ status: mongoReady ? 'ready' : 'degraded', mongoReady, uptime });
});

// API Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes.default);
app.use('/api/users', authenticateToken, userRoutes.default);
app.use('/api/pets', authenticateToken, petRoutes.default);
app.use('/api/matches', authenticateToken, matchRoutes.default);
app.use('/api/matches/search', authenticateToken, (await import('./src/routes/matches.search')).default);
app.use('/api/chat', authenticateToken, chatRoutes.default);
app.use('/api/chat', authenticateToken, voiceNotesRoutes.default);
app.use('/api/ai', authenticateToken, aiRoutes.default);
app.use('/api/ai', authenticateToken, aiPhotoRoutes.default);
app.use('/api/ai', authenticateToken, aiCompatRoutes.default);
app.use('/api/premium', authenticateToken, premiumRoutes.default);
app.use('/api/analytics', authenticateToken, analyticsRoutes.default);
app.use('/api/account', authenticateToken, accountRoutes.default);
app.use('/api', (await import('./src/routes/swipe')).default);
app.use('/api/memories', authenticateToken, memoriesRoutes.default);
app.use('/api/map', authenticateToken, (await import('./src/routes/map')).default);
app.use('/api/events', authenticateToken, (await import('./src/routes/events')).default);
app.use('/api/personality', authenticateToken, (await import('./src/routes/personality')).default);
app.use('/api/dashboard', authenticateToken, (await import('./src/routes/dashboard')).default);
app.use('/api/admin', authenticateToken, requireAdmin, adminRoutes.default);
app.use('/api/admin/analytics', authenticateToken, requireAdmin, adminAnalyticsRoutes.default);
app.use('/api/admin/services', authenticateToken, requireAdmin, adminServicesRoutes.default);
app.use('/api/admin/system', authenticateToken, requireAdmin, (await import('./src/routes/adminSystem')).default);
app.use('/api/admin/security', authenticateToken, requireAdmin, (await import('./src/routes/adminSecurity')).default);
app.use('/api/admin/subscriptions', authenticateToken, requireAdmin, (await import('./src/routes/adminSubscriptions')).default);
app.use('/api/admin/chats', authenticateToken, requireAdmin, (await import('./src/routes/adminChatModeration')).default);
app.use('/api/admin/uploads', authenticateToken, requireAdmin, (await import('./src/routes/adminUploadModeration')).default);
// Manual moderation endpoints (with CSRF protection for cookie auth)
app.use('/api/moderation', csrfProtection, authenticateToken, requireAdmin, moderationRoutes.default);
app.use('/api/user/moderation', csrfProtection, moderationUserRoutes.default);
app.use('/api/admin/moderation', csrfProtection, moderationAdminRoutes.default);
app.use('/api/ai/moderation', authenticateToken, aiModerationRoutes.default);
app.use('/api/admin/ai/moderation', csrfProtection, aiModerationAdminRoutes.default);
app.use('/api/upload', authenticateToken, (await import('./src/routes/upload')).default);
app.use('/api/uploads', (await import('./src/routes/uploads')).default);
// Cloudinary upload routes
app.use('/api/upload', (await import('./src/routes/uploadPhoto')).default);

// Enhanced Upload & Verification Routes (per PHOTOVERIFICATION spec)
const uploadRoutes = await import('./src/routes/uploadRoutes');
const verificationRoutes = await import('./src/routes/verification');
const moderateRoutes = await import('./src/routes/moderate');
app.use('/api/uploads', authenticateToken, uploadRoutes.default);
app.use('/api/verification', verificationRoutes.default);
app.use('/api/admin', authenticateToken, requireAdmin, moderateRoutes.default);

app.use('/api/community', authenticateToken, communityRoutes.default); // Register community routes
app.use('/api/favorites', favoritesRoutes.default); // Favorites routes handle auth per-route
app.use('/api/stories', authenticateToken, storiesRoutes.default);
app.use('/api/conversations', conversationsRoutes.default);
app.use('/api/profile', profileRoutes.default); // Profile routes (handles auth internally)
app.use('/api/adoption', adoptionRoutes.default); // Adoption routes (handles auth internally)
app.use('/api', petActivityRoutes.default); // Pet activity routes
app.use('/api/map', authenticateToken, mapActivityRoutes.default); // Map activity routes

// Enhanced 2025 Features Routes
app.use('/api/auth/biometric', biometricRoutes.default);
app.use('/api/leaderboard', leaderboardRoutes.default);
app.use('/api/user/notifications', notificationRoutes.default);
app.use('/api/notifications', notificationRoutes.default);

// Map feature routes
app.use('/api', homeRoutes.default);
app.use('/api', settingsRoutes.default);
app.use('/api', revenuecatRoutes.default);

// Admin Enhanced Features Routes
app.use('/api/admin/enhanced-features', adminEnhancedFeaturesRoutes.default);

// Admin Moderation Routes
app.use('/api/admin/moderation', authenticateToken, requireAdmin, adminModerationRoutes.default);

// Admin Safety Moderation Routes (for photo analysis and safety)
app.use('/api/admin/safety-moderation', authenticateToken, requireAdmin, (await import('./src/routes/adminSafetyModeration')).default);

// Live streaming routes (if flag is enabled)
if (FLAGS.GO_LIVE) {
  app.use('/api/live', liveRoutes.default);
  app.use('/api', livekitWebhookRoutes.default);
}

// Webhooks - no auth required, verification handled within the route handlers
app.use('/api/webhooks', webhookRoutes.default);

// Legacy health check (deprecated - use /health instead)
app.get('/api/health/legacy', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Initialize WebSocket for real-time features (only when not in test mode)
let socketInstance: any;
let io: any;
if (process.env.NODE_ENV !== 'test') {
  const { initializeSocket } = await import('./socket');
  socketInstance = initializeSocket(httpServer);
  io = socketInstance.io;
}

// Socket.io services (only when not in test mode)
if (process.env.NODE_ENV !== 'test') {
  // Socket.io for real-time chat
  const { default: chatSocket } = await import('./src/services/chatSocket');
  chatSocket(io);

  // Socket.io for live streaming
  const { default: liveSocket } = await import('./src/sockets/liveSocket');
  liveSocket(io);

  // Initialize admin notifications service
  const { default: adminNotifications } = await import('./src/services/adminNotifications');
  adminNotifications.setSocketIO(io);
  adminNotifications.setupAdminRoom(io);

  // Inject Socket.io into moderation routes for real-time updates
  if (moderationRoutes.default.setSocketIO) {
    moderationRoutes.default.setSocketIO(io);
  }

  // Socket.io for pulse
  const { default: pulseSocket } = await import('./src/sockets/pulse');
  pulseSocket(io);

  // Socket.io for suggestions
  try {
    const { default: suggestionsSocket } = await import('./src/sockets/suggestions');
    suggestionsSocket(io);
  } catch (error) {
    logger.warn('⚠️ Suggestions socket module not found or failed to load');
  }

  // Socket.io for WebRTC calling
  try {
    const { default: webrtcSocket } = await import('./src/sockets/webrtc');
    const webrtcService = webrtcSocket(io);
    logger.info('✅ WebRTC signaling service initialized');

    // Make WebRTC service available globally for admin functions
    (global as any).webrtcService = webrtcService;
  } catch (error) {
    logger.warn('⚠️ WebRTC socket module not found or failed to load:', { error: (error as Error).message });
  }

  // Socket.io for Map tracking
  try {
    const { MapSocketServer } = await import('./src/sockets/mapSocket');
    const mapSocketServer = new MapSocketServer(httpServer);
    logger.info('🗺️ Map socket server initialized');

    // Make map service available globally
    (global as any).mapSocketServer = mapSocketServer;
  } catch (error) {
    logger.warn('⚠️ Map socket module not found or failed to load:', { error: (error as Error).message });
  }
}

// Sentry error handler (must be before other error handlers)
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  app.use(sentryErrorHandler());
  logger.info('🔍 Sentry error handler enabled');
}

// Error handling middleware (must be last)
app.use(errorHandler.default);

// 404 handler (generic middleware, no path-to-regexp)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Start server function
const startServer = async (): Promise<void> => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  const listen = (portToTry: number) => {
    httpServer.listen(portToTry, () => {
      logger.info(`🌟 PawfectMatch Premium Server running on port ${portToTry}`);
      logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        logger.warn(`⚠️ Port ${portToTry} in use, trying ${portToTry + 1}`);
        listen(portToTry + 1);
      } else {
        throw err;
      }
    });
  };

  listen(PORT);
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received, shutting down gracefully');
  // Clean up socket connections
  if (socketInstance && socketInstance.cleanup) {
    socketInstance.cleanup();
  }
  httpServer.close(() => {
    logger.info('✅ Process terminated');
  });
});

// Start the server only if this file is run directly (not when imported by tests)
if (require.main === module) {
  startServer().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

// Export for testing: default export is the app function, with attached properties
export default app;
export { app, httpServer };
