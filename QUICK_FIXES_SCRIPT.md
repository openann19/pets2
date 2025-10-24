# 🔧 Quick Fixes - Run These NOW

## 1. Fix API Port Mismatch (2 minutes)

```bash
# Edit next.config.js
sed -i 's/localhost:5001/localhost:5000/g' apps/web/next.config.js
```

## 2. Enable TypeScript Strict Checking (5 minutes)

```bash
# Edit next.config.js - remove these lines:
# typescript: { ignoreBuildErrors: true },
# eslint: { ignoreDuringBuilds: true },

# Then fix errors:
cd apps/web && npm run build
# Fix each error one by one
```

## 3. Add Environment Validation (10 minutes)

Create `server/src/utils/validateEnv.js`:
```javascript
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'STRIPE_SECRET_KEY',
  'CLOUDINARY_API_KEY'
];

module.exports = function validateEnv() {
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  }
  
  // Validate JWT_SECRET is not default
  if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
    console.error('❌ JWT_SECRET is still using default value!');
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated');
};
```

Add to `server/server.js` line 11:
```javascript
require('./src/utils/validateEnv')();
```

## 4. Replace Console.logs (30 minutes)

```bash
# Create proper logger
cd server/src/utils
cat > logger.js << 'EOF'
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
EOF

# Replace console.log in all controllers
find server/src/controllers -name "*.js" -exec sed -i 's/console\.log/logger.info/g' {} \;
find server/src/controllers -name "*.js" -exec sed -i 's/console\.error/logger.error/g' {} \;
```

## 5. Fix MongoDB Memory Server (5 minutes)

```bash
# Remove from package.json
cd server
npm uninstall mongodb-memory-server

# Update server.js to use real MongoDB only
```

## 6. Add Rate Limiting to Auth Routes (15 minutes)

Edit `server/src/routes/auth.js`:
```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many auth attempts, please try again later'
});

// Apply to routes:
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
```

## 7. Fix Swipe Page Type Errors (10 minutes)

The swipe page needs proper Match type. Run:
```bash
cd apps/web/app/(protected)/swipe
# Already fixed in our last edit - just verify it compiles
npm run build
```

## 8. Add Health Check Endpoint (10 minutes)

Create `server/src/routes/health.js`:
```javascript
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {}
  };

  try {
    // Check MongoDB
    health.checks.mongodb = mongoose.connection.readyState === 1 ? 'up' : 'down';
    
    // Check memory
    const mem = process.memoryUsage();
    health.checks.memory = {
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + 'MB'
    };
    
    res.json(health);
  } catch (error) {
    health.status = 'unhealthy';
    health.error = error.message;
    res.status(503).json(health);
  }
});

module.exports = router;
```

Add to server.js:
```javascript
app.use('/health', require('./src/routes/health'));
```

## 9. Generate Strong JWT Secret (1 minute)

```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy output and add to .env:
# JWT_SECRET=<generated-secret-here>
```

## 10. Quick Security Headers (5 minutes)

Already have Helmet, but tighten it:

```javascript
// server/server.js - update helmet config:
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", process.env.CLIENT_URL],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## Run All Quick Fixes

```bash
#!/bin/bash
set -e

echo "🔧 Running quick fixes..."

# 1. Fix port
sed -i 's/localhost:5001/localhost:5000/g' apps/web/next.config.js

# 2. Generate JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo "JWT_SECRET=$JWT_SECRET" >> .env

# 3. Install missing deps if needed
cd server && npm install winston

echo "✅ Quick fixes applied!"
echo "⚠️  Still need to manually:"
echo "   - Enable TypeScript strict mode"
echo "   - Replace console.logs"
echo "   - Add health check route"
echo "   - Test everything!"
```

Save as `quick-fixes.sh` and run:
```bash
chmod +x quick-fixes.sh
./quick-fixes.sh
```
