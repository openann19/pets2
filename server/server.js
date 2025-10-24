const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const { createServer } = require('http');
const { Server: _Server } = require('socket.io');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();
const logger = require('./src/utils/logger');

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
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
          type: 'http',
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
const connectDB = async () => {
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
    const { createIndexes } = require('./src/utils/databaseIndexes');
    await createIndexes();
    logger.info('📊 Database indexes created successfully');

  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Validate environment variables before starting
require('./src/utils/validateEnv')();

// Initialize Sentry (must be before other imports)
const {
  initSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler
} = require('./src/config/sentry');

const app = express();

// Initialize Sentry for production environment
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  initSentry(app);
  app.use(sentryRequestHandler());
  app.use(sentryTracingHandler());
  logger.info('🔍 Sentry monitoring enabled');
} else {
  logger.info('⚠️ Sentry monitoring disabled - not in production or missing DSN');
}

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const petRoutes = require('./src/routes/pets');
const matchRoutes = require('./src/routes/matches');
const chatRoutes = require('./src/routes/chat');
const aiRoutes = require('./src/routes/ai');
const premiumRoutes = require('./src/routes/premium');
const analyticsRoutes = require('./src/routes/analytics');
const adminRoutes = require('./src/routes/admin');
const accountRoutes = require('./src/routes/account');
const memoriesRoutes = require('./src/routes/memories');
const webhookRoutes = require('./src/routes/webhooks');
const biometricRoutes = require('./src/routes/biometric');
const leaderboardRoutes = require('./src/routes/leaderboard');
const notificationRoutes = require('./src/routes/notifications');
// Manual moderation routes
const moderationRoutes = require('./routes/moderationRoutes');
const moderationUserRoutes = require('./src/routes/moderation');
const uploadRoutes = require('./routes/uploadRoutes');
const adminEnhancedFeaturesRoutes = require('./src/routes/adminEnhancedFeatures');
const moderationAdminRoutes = require('./src/routes/moderationAdmin');
const communityRoutes = require('./src/routes/community'); // Import community routes
const aiModerationRoutes = require('./src/routes/aiModeration');
const aiModerationAdminRoutes = require('./src/routes/aiModerationAdmin');
const adminModerationRoutes = require('./src/routes/adminModeration');
const favoritesRoutes = require('./routes/favorites'); // Import favorites routes
const storiesRoutes = require('./routes/stories');
const conversationsRoutes = require('./src/routes/conversations');
const profileRoutes = require('./src/routes/profile');
const adoptionRoutes = require('./src/routes/adoption');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');
const { authenticateToken, requireAdmin } = require('./src/middleware/auth');
const { csrfProtection, setCsrfToken } = require('./src/middleware/csrf');
const { requestIdMiddleware } = require('./src/middleware/requestId');

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
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // Default: 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Default: 100 requests per window
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
  max: parseInt(process.env.RATE_LIMIT_PREMIUM_MAX) || 300, // Higher limit for premium users
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
  if (['production', 'staging'].includes(process.env.NODE_ENV)) {
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

app.use(cors({
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
app.use(morgan('combined'));

// Database connection function is already defined above

// Health check routes (public - no auth required)
const healthRoutes = require('./src/routes/health');
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes); // Also available under /api prefix
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
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/pets', authenticateToken, petRoutes);
app.use('/api/matches', authenticateToken, matchRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/premium', authenticateToken, premiumRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/account', authenticateToken, accountRoutes);
app.use('/api/memories', authenticateToken, memoriesRoutes);
app.use('/api/map', authenticateToken, require('./src/routes/map'));
app.use('/api/events', authenticateToken, require('./src/routes/events'));
app.use('/api/personality', authenticateToken, require('./src/routes/personality'));
app.use('/api/dashboard', authenticateToken, require('./src/routes/dashboard'));
app.use('/api/admin', authenticateToken, requireAdmin, adminRoutes);
// Manual moderation endpoints (with CSRF protection for cookie auth)
app.use('/api/moderation', csrfProtection, authenticateToken, requireAdmin, moderationRoutes);
app.use('/api/user/moderation', csrfProtection, moderationUserRoutes);
app.use('/api/admin/moderation', csrfProtection, moderationAdminRoutes);
app.use('/api/ai/moderation', authenticateToken, aiModerationRoutes);
app.use('/api/admin/ai/moderation', csrfProtection, aiModerationAdminRoutes);
app.use('/api/upload', csrfProtection, authenticateToken, uploadRoutes);
app.use('/api/community', authenticateToken, communityRoutes); // Register community routes
app.use('/api/favorites', favoritesRoutes); // Favorites routes handle auth per-route
app.use('/api/stories', authenticateToken, storiesRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/profile', profileRoutes); // Profile routes (handles auth internally)
app.use('/api/adoption', adoptionRoutes); // Adoption routes (handles auth internally)

// Enhanced 2025 Features Routes
app.use('/api/auth/biometric', biometricRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/user/notifications', notificationRoutes);
app.use('/api/notifications', notificationRoutes);

// Admin Enhanced Features Routes
app.use('/api/admin/enhanced-features', adminEnhancedFeaturesRoutes);

// Admin Moderation Routes
app.use('/api/admin/moderation', authenticateToken, requireAdmin, adminModerationRoutes);

// Webhooks - no auth required, verification handled within the route handlers
app.use('/api/webhooks', webhookRoutes);

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
let socketInstance;
let io;
if (process.env.NODE_ENV !== 'test') {
  socketInstance = initializeSocket(httpServer);
  io = socketInstance.io;
}

// Socket.io services (only when not in test mode)
if (process.env.NODE_ENV !== 'test') {
  // Socket.io for real-time chat
  const chatSocket = require('./src/services/chatSocket');
  chatSocket(io);

  // Initialize admin notifications service
  const adminNotifications = require('./src/services/adminNotifications');
  adminNotifications.setSocketIO(io);
  adminNotifications.setupAdminRoom(io);

  // Inject Socket.io into moderation routes for real-time updates
  moderationRoutes.setSocketIO(io);

  // Socket.io for pulse
  const pulseSocket = require('./src/sockets/pulse');
  pulseSocket(io);

  // Socket.io for suggestions
  try {
    const suggestionsSocket = require('./src/sockets/suggestions');
    suggestionsSocket(io);
  } catch (error) {
    logger.warn('⚠️ Suggestions socket module not found or failed to load');
  }

  // Socket.io for WebRTC calling
  try {
    const webrtcSocket = require('./src/sockets/webrtc');
    const webrtcService = webrtcSocket(io);
    logger.info('✅ WebRTC signaling service initialized');

    // Make WebRTC service available globally for admin functions
    global.webrtcService = webrtcService;
  } catch (error) {
    logger.warn('⚠️ WebRTC socket module not found or failed to load:', { error: error.message });
  }

  // Socket.io for Map tracking
  try {
    const MapSocketServer = require('./src/sockets/mapSocket');
    const mapSocketServer = new MapSocketServer(httpServer);
    logger.info('🗺️ Map socket server initialized');

    // Make map service available globally
    global.mapSocketServer = mapSocketServer;
  } catch (error) {
    logger.warn('⚠️ Map socket module not found or failed to load:', { error: error.message });
  }
}

// Sentry error handler (must be before other error handlers)
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  app.use(sentryErrorHandler());
  logger.info('🔍 Sentry error handler enabled');
}

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler (generic middleware, no path-to-regexp)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Start server function
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  const listen = (portToTry) => {
    httpServer.listen(portToTry, () => {
      logger.info(`🌟 PawfectMatch Premium Server running on port ${portToTry}`);
      logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
    }).on('error', (err) => {
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
module.exports = app;
module.exports.app = app;
module.exports.httpServer = httpServer;
