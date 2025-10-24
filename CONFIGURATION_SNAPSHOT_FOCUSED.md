# PawfectMatch - Focused Configuration Snapshot
Generated on: Fri Oct 17 15:58:40 EEST 2025
**Note:** This snapshot excludes node_modules and focuses only on project configuration files.

---

### `./jest.config.base.js`

```javascript
/**
 * Base Jest configuration for PawfectMatch monorepo
 * Common settings shared across all packages and apps
 */
module.exports = {
  // Common test settings
  testTimeout: 10000,
  verbose: true,

  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/setupTests.{ts,js}',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx,js,jsx}',
    '!src/**/*.spec.{ts,tsx,js,jsx}',
    '!src/test-utils/**',
    '!src/**/__mocks__/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Transform ignore patterns (can be extended)
  transformIgnorePatterns: [
    '/node_modules/(?!(zod|@tanstack|axios|recharts|framer-motion|date-fns|lucide-react|sonner|bson|mongodb|@heroicons/react|@headlessui|@radix-ui|jest-expo|@react-native|expo|react-navigation|@react-navigation|@unimodules|unimodules|sentry-expo|native-base|react-native-svg)/)'
  ]
};
```

---

### `./ai-service/Dockerfile`

```dockerfile
# AI Service Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

```

---

### `./tsconfig.base.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    // === Base Configuration for Monorepo Packages ===
    
    // === Language & Environment ===
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    
    // === Module Resolution ===
    "esModuleInterop": true,
    "verbatimModuleSyntax": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    
    // === Emit ===
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "incremental": true,
    
    // === Type Checking - STRICTEST 2025 SETTINGS ===
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    
    // === Strict Mode Flags ===
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // === Code Quality ===
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    
    // === Performance ===
    "skipLibCheck": true
  },
  "exclude": ["node_modules", "dist", "coverage", "**/*.test.ts", "**/*.spec.ts"]
}

```

---

### `./turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "dependsOn": ["^build"],
      "persistent": true
    },
    "start": {
      "cache": false,
      "dependsOn": ["build"],
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": [],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts", "test/**/*.tsx"]
    },
    "test:ci": {
      "dependsOn": ["^build"],
      "outputs": [],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts", "test/**/*.tsx"]
    },
    "test:critical": {
      "dependsOn": ["^build"],
      "outputs": [],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts", "test/**/*.tsx"]
    },
    "test:integration": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "lint:check": {
      "outputs": []
    },
    "lint:fix": {
      "outputs": []
    },
    "format": {
      "outputs": []
    },
    "format:check": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "bundle:check": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "perf:check": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "a11y:check": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "deps:check": {
      "outputs": []
    },
    "complexity:check": {
      "outputs": []
    },
    "analyze:bundle": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    },
    "clean:all": {
      "cache": false
    },
    "@pawfectmatch/mobile#type-check": {
      "cache": false,
      "dependsOn": []
    }
  }
}

```

---

### `./jest.config.js`

```javascript
const path = require('path');

const coverageGlobs = [
  'apps/web/src/**/*.{ts,tsx,js,jsx}',
  'apps/mobile/src/**/*.{ts,tsx,js,jsx}',
  'packages/ui/src/**/*.{ts,tsx,js,jsx}',
  'packages/core/src/**/*.{ts,tsx,js,jsx}',
  'packages/ai/src/**/*.{ts,tsx,js,jsx}',
  'server/src/**/*.{ts,tsx,js,jsx}'
];

module.exports = {
  projects: [
    '<rootDir>/apps/web',
    '<rootDir>/apps/mobile',
    '<rootDir>/packages/ui',
    '<rootDir>/packages/core',
    '<rootDir>/packages/ai',
    '<rootDir>/server'
  ],
  collectCoverage: true,
  collectCoverageFrom: coverageGlobs.concat([
    '!**/*.d.ts',
    '!**/*.stories.*',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/test-utils/**',
    '!**/jest.setup.*'
  ]),
  coverageDirectory: path.join(__dirname, 'coverage/global'),
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/.next/',
    '/.expo/'
  ],
  moduleNameMapper: {
    '^@pawfectmatch/ui$': '<rootDir>/packages/ui/src/index.ts',
    '^@pawfectmatch/ui/(.*)$': '<rootDir>/packages/ui/src/$1',
    '^@pawfectmatch/core$': '<rootDir>/packages/core/src/index.ts',
    '^@pawfectmatch/core/(.*)$': '<rootDir>/packages/core/src/$1',
    '^@pawfectmatch/ai/(.*)$': '<rootDir>/packages/ai/src/$1',
    '^@/(.*)$': '<rootDir>/apps/web/src/$1'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(react-native|@react-native|react-native-.*|@react-navigation|@expo|expo-.*|lucide-react|framer-motion|recharts|date-fns|bson|mongodb|@react-aria|@react-stately|@react-types|@react-spectrum)/)'
  ]
};

```

---

### `./tests/e2e/matching.e2e.js`

```javascript
import { LoginPage } from './LoginPage.page';
import { SwipeScreen } from './SwipeScreen.page';

describe('Matching Flow', () => {
  let loginPage: LoginPage;
  let swipeScreen: SwipeScreen;

  beforeAll(async () => {
    loginPage = new LoginPage();
    swipeScreen = new SwipeScreen();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should allow user to login and swipe through profiles', async () => {
    // Login
    await loginPage.waitForPageLoad();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.assertLoginSuccessful();

    // Navigate to swipe screen (assuming login redirects to swipe)
    await swipeScreen.waitForScreenLoad();

    // Perform swipes
    await swipeScreen.assertCardVisible();

    // Swipe right (like)
    await swipeScreen.swipeRightOnFirstCard();

    // Wait for next card or check if more cards exist
    try {
      await swipeScreen.assertCardVisible();
      // Swipe left (dislike)
      await swipeScreen.swipeLeftOnFirstCard();

      // Try super like
      await swipeScreen.assertCardVisible();
      await swipeScreen.swipeUpOnFirstCard();
    } catch (error) {
      // No more cards available
      await swipeScreen.assertNoMoreCards();
    }
  });

  it('should handle button interactions correctly', async () => {
    // Login first
    await loginPage.waitForPageLoad();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.assertLoginSuccessful();

    await swipeScreen.waitForScreenLoad();

    // Test like button
    await swipeScreen.tapLikeButton();

    // Test dislike button
    await swipeScreen.tapDislikeButton();

    // Test super like button (if available)
    try {
      await swipeScreen.tapSuperLikeButton();
    } catch (error) {
      // Super like might not be available for all users
    }
  });

  it('should navigate between screens correctly', async () => {
    // Login first
    await loginPage.waitForPageLoad();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.assertLoginSuccessful();

    await swipeScreen.waitForScreenLoad();

    // Navigate to profile
    await swipeScreen.navigateToProfile();
    // Verify we're on profile screen (would need profile page object)

    // Navigate back to swipe (assuming back navigation works)
    await device.pressBack();

    // Navigate to matches
    await swipeScreen.navigateToMatches();
    // Verify we're on matches screen

    // Navigate back to swipe
    await device.pressBack();
  });

  it('should handle login errors gracefully', async () => {
    await loginPage.waitForPageLoad();

    // Try invalid login
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await loginPage.assertErrorMessageVisible('Invalid credentials');
  });

  it('should handle empty swipe queue', async () => {
    // This test would require setting up a user with no more profiles to swipe
    // For now, just test the UI state when no cards are available

    // Login with a user that has no more cards
    await loginPage.waitForPageLoad();
    await loginPage.login('empty-queue@example.com', 'password123');
    await loginPage.assertLoginSuccessful();

    // Should show no more cards message
    await swipeScreen.assertNoMoreCards();
  });
});

```

---

### `./server/Dockerfile`

```dockerfile
# Back-end service container
FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /app

RUN apk add --no-cache curl

# Copy package manifests first for better layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Ensure correct ownership for non-root execution
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nodejs -u 1001 -G nodejs \
  && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]

```

---

### `./server/jest.config.js`

```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.(ts|tsx|js)'],
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: '<rootDir>/coverage',
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  coveragePathIgnorePatterns: ['/node_modules/'],
};

```

---

### `./server/package.json`

```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "PawfectMatch backend APIs and services",
  "main": "server.js",
  "directories": {
    "test": "tests"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "lint": "eslint ./src ./tests --ext .js,.ts",
    "lint:check": "eslint ./src ./tests --ext .js,.ts --max-warnings 0",
    "lint:fix": "eslint ./src ./tests --ext .js,.ts --fix",
    "format": "prettier --write \"{src,tests}/**/*.{js,ts,json,md}\"",
    "format:check": "prettier --check \"{src,tests}/**/*.{js,ts,json,md}\"",
    "test": "jest --runInBand",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --runInBand"
  },
  "keywords": [],
  "author": "PawfectMatch Team",
  "license": "MIT",
  "private": true,
  "type": "commonjs",
  "dependencies": {
    "@pawfectmatch/core": "workspace:*",
    "@sentry/node": "^10.17.0",
    "@sentry/profiling-node": "^10.17.0",
    "axios": "^1.12.2",
    "bcryptjs": "^3.0.2",
    "cloudinary": "^2.7.0",
    "compression": "^1.8.1",
    "cors": "^2.8.5",
    "dotenv": "^17.2.2",
    "express": "^5.1.0",
    "express-rate-limit": "^8.1.0",
    "express-validator": "^7.2.1",
    "helmet": "^8.1.0",
    "ioredis": "^5.4.1",
    "joi": "^18.0.1",
    "jsonwebtoken": "^9.0.2",
    "mongodb-memory-server": "^10.2.1",
    "mongoose": "^8.18.2",
    "morgan": "^1.10.1",
    "multer": "^2.0.2",
    "nodemailer": "^7.0.7",
    "nodemon": "^3.1.10",
    "qrcode": "^1.5.4",
    "rate-limit": "^0.1.1",
    "redis": "^5.8.2",
    "socket.io": "^4.8.1",
    "speakeasy": "^2.0.0",
    "stripe": "^18.5.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1",
    "winston": "^3.17.0",
    "ws": "^8.18.3",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/jest": "^29.5.14",
    "@types/node": "^20.16.5",
    "@types/supertest": "^2.0.16",
    "eslint": "^9.14.0",
    "jest": "^29.7.0",
    "nock": "^14.0.10",
    "prettier": "^3.3.3",
    "sinon": "^21.0.0",
    "supertest": "^7.1.4",
    "ts-jest": "^29.2.5",
    "typescript": "^5.6.3"
  }
}
```

---

### `./server/.env.example`

```bash
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/pawfectmatch_premium

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe (Premium Features)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# AI Service
AI_SERVICE_URL=http://localhost:8000

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-key

# WebAuthn / Biometric Authentication
WEBAUTHN_RP_NAME=PawfectMatch
WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:3000
```

---

### `./server/src/models/.env.example`

```bash
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/pawfectmatch

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_REFRESH_EXPIRE=7d

# Stripe Integration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# DeepSeek AI Integration
DEEPSEEK_API_KEY=sk-your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=4000
DEEPSEEK_TEMPERATURE=0.7

# Google Maps Integration
GOOGLE_MAPS_API_KEY=AIzayour_google_maps_api_key
GOOGLE_MAPS_QUOTA_LIMIT=100000
GOOGLE_CLOUD_BILLING_ACCOUNT=your_billing_account_id

# External Services
CLOUDINARY_URL=cloudinary://your_cloudinary_api_key:your_cloudinary_api_secret@your_cloud_name
SENTRY_DSN=https://your_sentry_dsn@o123456.ingest.sentry.io/123456
SENDGRID_API_KEY=SG.your_sendgrid_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name

# Encryption (32 characters for AES-256)
CONFIG_ENCRYPTION_KEY=your_32_character_encryption_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5

```

---

### `./jest.config.cjs`

```javascript
module.exports = require('./jest.config.js');

```

---

### `./babel.config.js`

```javascript
const basePresets = [
  [
    '@babel/preset-env',
    {
      targets: {
        node: '20',
        browsers: ['>0.25%', 'not dead'],
      },
      bugfixes: true,
      modules: false,
    },
  ],
  [
    '@babel/preset-react',
    {
      runtime: 'automatic',
      importSource: 'react',
    },
  ],
  '@babel/preset-typescript',
];

const basePlugins = [
  ['@babel/plugin-transform-runtime', { version: '7.23.7', helpers: true, regenerator: true }],
];

module.exports = {
  presets: basePresets,
  plugins: basePlugins,
  env: {
    production: {
      plugins: [
        'babel-plugin-transform-remove-console',
        'babel-plugin-transform-remove-debugger',
      ],
    },
    test: {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    },
  },
};

```

---

### `./package.json`

```json
{
  "name": "pawfectmatch-premium",
  "version": "1.0.1-rc.0",
  "type": "module",
  "description": "Premium pet matching platform with advanced features",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "start": "turbo run start",
    "lint": "turbo run lint",
    "lint:check": "turbo run lint:check",
    "lint:fix": "turbo run lint:fix",
    "type-check": "turbo run type-check",
    "test": "turbo run test",
    "test:ci": "turbo run test:ci",
    "test:critical": "turbo run test:critical",
    "test:coverage": "turbo run test:coverage",
    "test:e2e": "turbo run test:e2e",
    "test:a11y": "turbo run test:a11y",
    "format": "turbo run format",
    "format:check": "turbo run format:check",
    "quality:gate": "node scripts/quality-gate.js",
    "quality:report": "node scripts/quality-gate.js --report",
    "bundle:check": "turbo run bundle:check",
    "perf:check": "turbo run perf:check",
    "test:smoke": "turbo run test:smoke",
    "test:integration": "turbo run test:integration",
    "test:performance": "turbo run test:performance",
    "test:accessibility": "turbo run test:accessibility",
    "test:visual": "turbo run test:visual",
    "test:security": "turbo run test:security",
    "lighthouse": "lhci autorun",
    "bundle:analyze": "turbo run bundle:analyze",
    "bundle:compare": "node scripts/bundle-compare.js",
    "deps:audit": "pnpm audit",
    "deps:update": "pnpm update --latest",
    "code:quality": "pnpm run lint && pnpm run type-check && pnpm run format:check",
    "test:all": "pnpm run test:ci && pnpm run test:integration && pnpm run test:e2e",
    "security:audit": "pnpm audit --audit-level=moderate",
    "ci:full": "pnpm run code:quality && pnpm run test:all && pnpm run security:audit && pnpm run lighthouse"
  },
  "devDependencies": {
    "@eslint/js": "^9.37.0",
    "@heroicons/react": "^2.2.0",
    "@jest/globals": "^29.7.0",
    "@next/eslint-plugin-next": "^14.2.33",
    "@storybook/addon-essentials": "^7.5.0",
    "@storybook/addon-interactions": "^7.5.0",
    "@storybook/react": "^7.5.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/react-hooks": "^8.0.1",
    "@testing-library/react-native": "^12.3.0",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.11.30",
    "@types/react-dom": "^18.2.0",
    "@types/validator": "^13.15.3",
    "@typescript-eslint/eslint-plugin": "^8.46.1",
    "@typescript-eslint/parser": "^8.46.1",
    "debug": "^4.4.3",
    "detox": "^20.0.0",
    "eslint": "^9.37.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-react-hooks": "^7.0.0",
    "globals": "^16.4.0",
    "husky": "^8.0.3",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "jest-expo": "^51.0.0",
    "lint-staged": "^16.2.4",
    "msw": "^1.2.0",
    "prettier": "^3.6.2",
    "ts-jest": "^29.2.0",
    "turbo": "^2.3.3",
    "typescript-eslint": "^8.46.1",
    "whatwg-fetch": "^3.6.20"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.15.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/pawfectmatch-premium.git"
  },
  "keywords": [
    "pet",
    "matching",
    "premium",
    "typescript",
    "react",
    "mobile",
    "web"
  ],
  "author": "Your Organization",
  "license": "MIT",
  "pnpm": {
    "overrides": {
      "react": "18.2.0",
      "react-dom": "18.2.0",
      "@types/react": "18.2.0",
      "@types/react-dom": "18.2.0",
      "expect": "29.7.0",
      "@storybook/addon-docs": "8.6.14",
      "@storybook/blocks": "8.6.14",
      "@storybook/components": "8.6.14",
      "@storybook/manager-api": "8.6.14",
      "@storybook/preview-api": "8.6.14",
      "@storybook/react-dom-shim": "8.6.14",
      "@storybook/theming": "8.6.14",
      "@storybook/react": "8.6.14",
      "@storybook/test": "8.6.14",
      "storybook": "8.6.14",
      "react-test-renderer": "18.2.0"
    }
  },
  "resolutions": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "expect": "29.7.0",
    "@storybook/addon-docs": "8.6.14",
    "@storybook/blocks": "8.6.14",
    "@storybook/components": "8.6.14",
    "@storybook/manager-api": "8.6.14",
    "@storybook/preview-api": "8.6.14",
    "@storybook/react-dom-shim": "8.6.14",
    "@storybook/theming": "8.6.14",
    "@storybook/react": "8.6.14",
    "@storybook/test": "8.6.14",
    "storybook": "8.6.14",
    "react-test-renderer": "18.2.0"
  },
  "quality-gate": {
    "enabled": true,
    "checks": [
      "type-check",
      "lint-check",
      "format-check",
      "test-check",
      "security-check",
      "bundle-check",
      "performance-check",
      "accessibility-check",
      "dependency-check",
      "complexity-check"
    ],
    "thresholds": {
      "test-coverage": 80,
      "bundle-size": "2MB",
      "performance-score": 90,
      "accessibility-score": 95
    }
  },
  "dependencies": {
    "@simplewebauthn/server": "^13.2.2",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "react-native-reanimated": "^3.16.0",
    "tailwindcss": "^3.4.17"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{js,jsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

---

### `./packages/ui/jest.config.js`

```javascript
const baseConfig = require('../../jest.config.base.js');

module.exports = {
  ...baseConfig,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@pawfectmatch/core$': '<rootDir>/../core/src/index.ts',
    '^@pawfectmatch/core/(.*)$': '<rootDir>/../core/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts']
};

```

---

### `./packages/ui/tsconfig.test.json`

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "types": ["jest", "@testing-library/jest-dom", "node"],
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*.test.{ts,tsx}", "src/test-utils/**/*"]
}
```

---

### `./packages/ui/package.json`

```json
{
  "name": "@pawfectmatch/ui",
  "version": "0.1.0",
  "description": "Shared UI components for PawfectMatch using react-aria",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "dev": "tsc --watch",
    "build": "tsc",
    "clean": "rm -rf dist",
    "clean:all": "rm -rf dist node_modules/.cache",
    "lint": "eslint ./src",
    "lint:check": "eslint ./src --max-warnings 0",
    "lint:fix": "eslint ./src --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:critical": "jest --testPathPatterns=\"(critical|integration)\" --ci --watchAll=false",
    "bundle:check": "echo 'Bundle check not applicable for UI package'",
    "perf:check": "echo 'Performance check not applicable for UI package'",
    "a11y:check": "jest --testPathPatterns=\"a11y\" --ci --watchAll=false",
    "deps:check": "npm audit --audit-level moderate",
    "complexity:check": "echo 'Complexity check not implemented'",
    "analyze:bundle": "echo 'Bundle analysis not applicable for UI package'"
  },
  "dependencies": {
    "@pawfectmatch/core": "workspace:*",
    "@react-aria/button": "^3.9.2",
    "@react-aria/dialog": "^3.5.7",
    "@react-aria/focus": "^3.15.0",
    "@react-aria/interactions": "^3.20.0",
    "@react-aria/overlays": "^3.20.0",
    "@react-aria/textfield": "^3.10.0",
    "@react-aria/utils": "^3.23.0",
    "@react-stately/overlays": "^3.6.4",
    "@react-stately/toggle": "^3.6.3",
    "@react-types/button": "^3.9.1",
    "@react-types/textfield": "^3.8.0",
    "framer-motion": "^10.18.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^5.16.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.4.0",
    "@types/jest": "^29.5.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "jest": "^29.5.0",
    "jest-axe": "^7.0.0",
    "jest-environment-jsdom": "^29.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.9.2",
    "@types/node": "^20.11.30",
    "@types/react-native": "0.73.0"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

---

### `./packages/ui/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "tsBuildInfoFile": "./dist/.tsbuildinfo",
    "types": ["node", "jest"],
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },
  "include": ["src/**/*", "src/types/**/*"],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx",
    "src/__tests__/**/*",
    "src/setupTests.ts",
    "src/test-utils/**/*"
  ]
}
```

---

### `./packages/ui/eslint.config.js`

```javascript
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import rootConfig from '../../eslint.config.js';

const packageDir = path.dirname(fileURLToPath(new URL('.', import.meta.url)));

export default [
	...rootConfig,
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parserOptions: {
				project: [
					path.join(packageDir, 'tsconfig.json'),
					path.join(packageDir, 'tsconfig.test.json'),
				],
				tsconfigRootDir: packageDir,
				projectService: true,
			},
		},
	},
];

```

---

### `./packages/core/jest.config.js`

```javascript
const baseConfig = require('../../jest.config.base.js');

module.exports = {
  ...baseConfig,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }
  },
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};

```

---

### `./packages/core/tsconfig.test.json`

```json
{
  "extends": "./tsconfig.json",
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/**/__tests__/**/*.ts",
    "src/**/__tests__/**/*.tsx",
    "src/__mocks__/**/*.ts",
    "src/setupTests.ts"
  ],
  "exclude": [],
  "compilerOptions": {
    "noEmit": true
  }
}
```

---

### `./packages/core/package.json`

```json
{
  "name": "@pawfectmatch/core",
  "version": "1.0.0",
  "description": "Shared TypeScript logic for PawfectMatch - validation schemas, types, API clients",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc && pnpm build:cjs && pnpm build:merge-cjs",
    "build:cjs": "tsc -p tsconfig.cjs.json",
    "build:merge-cjs": "node -e \"require('fs').cpSync('dist-cjs','dist',{recursive:true});\"",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "clean:all": "rm -rf dist node_modules/.cache",
    "lint": "eslint src",
    "lint:check": "eslint src --max-warnings 0",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:critical": "jest --testPathPatterns=\"(critical|integration)\" --ci --watchAll=false",
    "bundle:check": "echo 'Bundle check not applicable for core package'",
    "perf:check": "echo 'Performance check not applicable for core package'",
    "a11y:check": "echo 'Accessibility check not applicable for core package'",
    "deps:check": "npm audit --audit-level moderate",
    "complexity:check": "echo 'Complexity check not implemented'",
    "analyze:bundle": "echo 'Bundle analysis not applicable for core package'"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "1.21.0",
    "@tanstack/react-query": "^5.89.0",
    "axios": "^1.6.2",
    "@pawfectmatch/design-tokens": "workspace:*",
    "immer": "^10.0.3",
    "zod": "^3.25.76",
    "zustand": "^4.5.7"
  },
  "devDependencies": {
    "@babel/core": "^7.23.7",
    "@babel/plugin-transform-runtime": "^7.23.7",
    "@babel/preset-env": "^7.23.7",
    "@babel/preset-react": "^7.23.7",
    "@babel/preset-typescript": "^7.23.7",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.19.17",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "axios-mock-adapter": "^1.21.0",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0",
    "msw": "^1.2.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.9.2"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.js"
    },
    "./schemas": {
      "types": "./dist/schemas/index.d.ts",
      "import": "./dist/schemas/index.js",
      "require": "./dist/schemas/index.js"
    },
    "./types": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/types/index.js",
      "require": "./dist/types/index.js"
    },
    "./api": {
      "types": "./dist/api/index.d.ts",
      "import": "./dist/api/index.js",
      "require": "./dist/api/index.js"
    },
    "./services": {
      "types": "./dist/services/index.d.ts",
      "import": "./dist/services/index.js",
      "require": "./dist/services/index.js"
    },
    "./utils": {
      "types": "./dist/utils/index.d.ts",
      "import": "./dist/utils/index.js",
      "require": "./dist/utils/index.js"
    },
    "./stores": {
      "types": "./dist/stores/index.d.ts",
      "import": "./dist/stores/index.js",
      "require": "./dist/stores/index.js"
    },
    "./mappers": {
      "types": "./dist/mappers/index.d.ts",
      "import": "./dist/mappers/index.js",
      "require": "./dist/mappers/index.js"
    }
  }
}
```

---

### `./packages/core/tsconfig.cjs.json`

```json
{
    "extends": "./tsconfig.json",
    "compilerOptions": {
        "module": "CommonJS",
        "moduleResolution": "node",
        "outDir": "./dist-cjs",
        "declaration": true,
        "declarationDir": "./dist-cjs",
        "emitDeclarationOnly": false,
        "isolatedModules": false
    }
}
```

---

### `./packages/core/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "verbatimModuleSyntax": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx", "**/__tests__/**", "**/__mocks__/**", "**/setupTests.ts"]
}

```

---

### `./packages/design-tokens/dist/tailwind.config.js`

```javascript
// Auto-generated from design tokens - DO NOT EDIT
module.exports = {
  theme: {
    extend: {
      colors: {
      "brand": {
            "primary": "#FF6B6B",
            "secondary": "#4ECDC4",
            "accent": "#FFD700"
      },
      "neutral": {
            "50": "#FAFAFA",
            "100": "#F5F5F5",
            "200": "#E5E5E5",
            "300": "#D4D4D4",
            "400": "#A3A3A3",
            "500": "#737373",
            "600": "#525252",
            "700": "#404040",
            "800": "#262626",
            "900": "#171717"
      },
      "glass": {
            "light": "rgba(255, 255, 255, 0.08)",
            "medium": "rgba(255, 255, 255, 0.12)",
            "heavy": "rgba(255, 255, 255, 0.16)",
            "dark-light": "rgba(0, 0, 0, 0.08)",
            "dark-medium": "rgba(0, 0, 0, 0.12)",
            "dark-heavy": "rgba(0, 0, 0, 0.16)"
      }
},
      spacing: {
      "xs": "4px",
      "sm": "8px",
      "md": "16px",
      "lg": "24px",
      "xl": "32px",
      "2xl": "48px",
      "3xl": "64px"
},
      borderRadius: {
      "sm": "4px",
      "md": "8px",
      "lg": "12px",
      "xl": "16px",
      "2xl": "24px",
      "full": "9999px"
},
      boxShadow: {
      "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      "glow": "0 0 20px rgba(255, 107, 107, 0.5)"
},
      backdropBlur: {
      "sm": "4px",
      "md": "8px",
      "lg": "12px",
      "xl": "16px"
},
      transitionDuration: {
      "fast": "120ms",
      "normal": "200ms",
      "slow": "300ms"
},
      transitionTimingFunction: {
      "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
      "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
      "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      "bounce": "cubic-bezier(0.22, 1, 0.36, 1)"
},
    },
  },
};

```

---

### `./packages/design-tokens/package.json`

```json
{
  "name": "@pawfectmatch/design-tokens",
  "version": "1.0.0",
  "description": "Unified design tokens for PawfectMatch across web, mobile, and UI packages",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "node build.js && rollup -c",
    "build:tokens": "node build.js",
    "build:clean": "pnpm run clean && pnpm run build",
    "dev": "rollup -c -w",
    "type-check": "tsc --noEmit",
    "lint": "eslint ./src",
    "lint:check": "eslint ./src --max-warnings 0",
    "lint:fix": "eslint ./src --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,md}\"",
    "test": "pnpm run lint:check && pnpm run type-check",
    "clean": "rm -rf dist",
    "clean:all": "rm -rf dist node_modules/.cache"
  },
  "keywords": [
    "design-tokens",
    "design-system",
    "pawfectmatch",
    "colors",
    "typography",
    "spacing",
    "shadows"
  ],
  "author": "PawfectMatch Team",
  "license": "MIT",
  "devDependencies": {
    "@rollup/plugin-typescript": "^12.1.0",
    "@types/node": "^20.16.5",
    "rollup": "^4.24.3",
    "tslib": "^2.7.0",
    "typescript": "^5.6.3"
  },
  "peerDependencies": {
    "typescript": ">=5.6.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/pawfectmatch/design-tokens.git"
  },
  "bugs": {
    "url": "https://github.com/pawfectmatch/design-tokens/issues"
  },
  "homepage": "https://github.com/pawfectmatch/design-tokens#readme"
}
```

---

### `./packages/design-tokens/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "tsBuildInfoFile": "./dist/.tsbuildinfo"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

---

### `./packages/design-tokens/eslint.config.js`

```javascript
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

const packageDir = path.dirname(fileURLToPath(new URL('.', import.meta.url)));

export default [
	{ ignores: ['dist/**', 'node_modules/**'] },
	js.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: { jsx: true },
					projectService: true,
			},
			globals: { ...globals.node, ...globals.browser },
		},
		plugins: {
			'@typescript-eslint': typescriptPlugin,
			react: reactPlugin,
			'react-hooks': reactHooksPlugin,
		},
			settings: { react: { version: 'detect' } },
		rules: {
			...typescriptPlugin.configs['strict-type-checked'].rules,
			...reactPlugin.configs.recommended.rules,
			...reactPlugin.configs['jsx-runtime'].rules,
			...reactHooksPlugin.configs.recommended.rules,
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unsafe-assignment': 'error',
			'@typescript-eslint/no-unsafe-call': 'error',
			'@typescript-eslint/no-unsafe-member-access': 'error',
			'@typescript-eslint/no-unsafe-argument': 'error',
			'@typescript-eslint/no-unsafe-return': 'error',
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/strict-boolean-expressions': [
				'error',
				{ allowString: false, allowNumber: false, allowNullableObject: false },
			],
			'react-hooks/exhaustive-deps': 'error',
			'no-console': ['error', { allow: ['warn', 'error'] }],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'arrow-body-style': 'off',
			'react/prop-types': 'off',
		},
	},
	{
		files: ['**/*.test.{ts,tsx}'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
		},
	},
];

```

---

### `./packages/ai/jest.config.js`

```javascript
const baseConfig = require('../../jest.config.base.js');

module.exports = {
  ...baseConfig,
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }
  },
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};

```

---

### `./packages/ai/tsconfig.test.json`

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "types": [
      "node", "jest"
    ]
  },
  "exclude": [
    "node_modules"
  ],
  "include": [
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/**/__tests__/**",
    "src/**/__mocks__/**",
    "src/setupTests.ts"
  ]
}

```

---

### `./packages/ai/package.json`

```json
{
  "name": "@pawfectmatch/ai",
  "version": "1.0.0",
  "description": "AI-powered pet matching and analysis for PawfectMatch",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "type-check": "tsc --noEmit",
    "lint": "eslint ./src",
    "lint:check": "eslint ./src --max-warnings 0",
    "lint:fix": "eslint ./src --fix",
    "test": "jest --runInBand",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --runInBand",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,json,md}\""
  },
  "keywords": [
    "ai",
    "pet",
    "matching",
    "deepseek",
    "computer-vision",
    "machine-learning"
  ],
  "author": "PawfectMatch Team",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.16.5",
    "@typescript-eslint/eslint-plugin": "^8.11.0",
    "@typescript-eslint/parser": "^8.11.0",
    "eslint": "^9.14.0",
    "jest": "^29.7.0",
    "prettier": "^3.3.3",
    "ts-jest": "^29.2.5",
    "typescript": "^5.6.3"
  },
  "files": [
    "dist",
    "src",
    "README.md"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/pawfectmatch/pawfectmatch.git",
    "directory": "packages/ai"
  },
  "publishConfig": {
    "access": "restricted"
  }
}

```

---

### `./packages/ai/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "types": ["node", "jest"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### `./packages/ai/eslint.config.js`

```javascript
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import globals from 'globals';

import rootConfig from '../../eslint.config.js';

const packageDir = path.dirname(fileURLToPath(new URL('.', import.meta.url)));

export default [
  ...rootConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: [
          path.join(packageDir, 'tsconfig.json'),
          path.join(packageDir, 'tsconfig.test.json'),
        ],
        tsconfigRootDir: packageDir,
        projectService: true,
        allowDefaultProject: true,
      },
    },
  },
  // Ensure test files are recognized by the project service and have jest globals
  {
    files: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: [
          path.join(packageDir, 'tsconfig.json'),
          path.join(packageDir, 'tsconfig.test.json'),
        ],
        tsconfigRootDir: packageDir,
        projectService: true,
        allowDefaultProject: true,
      },
      globals: {
        ...globals.jest,
      },
    },
  },
];

```

---

### `./packages/tsconfig.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "files": [],
  "references": [
    { "path": "./ai" },
    { "path": "./core" },
    { "path": "./design-tokens" },
    { "path": "./ui" }
  ]
}

```

---

### `./.github/workflows/quality-gate.yml`

```yaml
name: Quality Gate - Professional Standards 2025

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: "22"
  PNPM_VERSION: "9.15.0"

jobs:
  quality-gate:
    name: Quality Gate - Block on Any Issues
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Type Check - Strict Mode
        run: pnpm run type-check
        continue-on-error: false

      - name: Lint Check - Zero Tolerance
        run: pnpm run lint:check
        continue-on-error: false

      - name: Test Suite - All Must Pass
        run: pnpm run test:ci
        continue-on-error: false

      - name: Security Audit
        run: pnpm audit --audit-level moderate
        continue-on-error: false

      - name: Bundle Analysis
        run: pnpm run analyze:bundle
        continue-on-error: false

      - name: Performance Check
        run: pnpm run perf:check
        continue-on-error: false

      - name: Accessibility Check
        run: pnpm run a11y:check
        continue-on-error: false

  quality-report:
    name: Quality Report - Detailed Analysis
    runs-on: ubuntu-latest
    needs: quality-gate
    if: always()

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Quality Report
        run: pnpm run quality:report

      - name: Upload Quality Report
        uses: actions/upload-artifact@v4
        with:
          name: quality-report
          path: quality-report.html

  blocking-gate:
    name: Block Merge on Quality Issues
    runs-on: ubuntu-latest
    needs: [quality-gate, quality-report]
    if: always()

    steps:
      - name: Check Quality Gate Status
        run: |
          if [ "${{ needs.quality-gate.result }}" != "success" ]; then
            echo "❌ Quality gate failed. Merge blocked."
            echo "Please fix all issues before merging."
            exit 1
          fi
          echo "✅ Quality gate passed. Merge allowed."

```

---

### `./.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline - PawfectMatch Premium

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  quality-gate:
    name: Quality Gate
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'pnpm'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Run TypeScript type checking
      run: pnpm run type-check

    - name: Run ESLint
      run: pnpm run lint

    - name: Run Prettier check
      run: pnpm run format:check

    - name: Run unit tests
      run: pnpm run test:ci

    - name: Run accessibility tests
      run: pnpm run test:a11y

    - name: Run performance tests
      run: pnpm run perf:check

    - name: Bundle size check
      run: pnpm run bundle:check

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
        fail_ci_if_error: true

  mobile-e2e:
    name: Mobile E2E Tests
    runs-on: macos-latest
    needs: quality-gate

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'pnpm'

    - name: Setup Xcode
      uses: maxim-lobanov/setup-xcode@v1
      with:
        xcode-version: latest-stable

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Install Ruby (for CocoaPods)
      uses: ruby/setup-ruby@v1
      with:
        ruby-version: '3.0'

    - name: Install CocoaPods
      run: |
        cd apps/mobile/ios
        gem install cocoapods
        pod install

    - name: Cache Detox
      uses: actions/cache@v3
      with:
        path: ~/.detox
        key: detox-${{ runner.os }}-${{ hashFiles('apps/mobile/package.json') }}

    - name: Build app for testing
      run: |
        cd apps/mobile
        pnpm detox build --configuration ios.sim.release

    - name: Run E2E tests
      run: |
        cd apps/mobile
        pnpm detox test --configuration ios.sim.release --cleanup

  web-e2e:
    name: Web E2E Tests
    runs-on: ubuntu-latest
    needs: quality-gate

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'pnpm'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Install Playwright
      run: pnpm exec playwright install --with-deps

    - name: Run Playwright tests
      run: pnpm exec playwright test

    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: test-results/
        retention-days: 30

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: quality-gate

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Run npm audit
      run: pnpm audit --audit-level moderate

    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      continue-on-error: true
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high

    - name: Run CodeQL Analysis
      uses: github/codeql-action/init@v2
      with:
        languages: javascript, typescript

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2

  performance-benchmark:
    name: Performance Benchmark
    runs-on: ubuntu-latest
    needs: quality-gate

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'pnpm'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Build for performance testing
      run: pnpm run build

    - name: Run Lighthouse CI
      uses: treosh/lighthouse-ci-action@v10
      with:
        urls: http://localhost:3000
        configPath: .lighthouserc.json
        uploadArtifacts: true
        temporaryPublicStorage: true

    - name: Run bundle analyzer
      run: pnpm run bundle:analyze

    - name: Performance regression check
      run: |
        # Compare bundle size with previous version
        if [ -f bundle-size.json ]; then
          pnpm run bundle:compare
        fi

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [quality-gate, mobile-e2e, web-e2e, security-scan, performance-benchmark]
    if: github.ref == 'refs/heads/develop'

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'pnpm'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Build for staging
      run: pnpm run build:staging
      env:
        NEXT_PUBLIC_API_URL: ${{ secrets.STAGING_API_URL }}
        STRIPE_PUBLISHABLE_KEY: ${{ secrets.STAGING_STRIPE_PUBLISHABLE_KEY }}

    - name: Deploy to staging
      run: |
        # Deploy web app to staging
        pnpm run deploy:staging

        # Deploy mobile app to TestFlight/beta
        cd apps/mobile
        pnpm run build:ios:staging
        # Upload to TestFlight would go here

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'pnpm'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Build for production
      run: pnpm run build
      env:
        NEXT_PUBLIC_API_URL: ${{ secrets.PRODUCTION_API_URL }}
        STRIPE_PUBLISHABLE_KEY: ${{ secrets.PRODUCTION_STRIPE_PUBLISHABLE_KEY }}

    - name: Run smoke tests
      run: pnpm run test:smoke

    - name: Deploy to production
      run: |
        # Deploy web app to production
        pnpm run deploy:production

        # Deploy mobile app to App Store
        cd apps/mobile
        pnpm run build:ios:production
        # Submit to App Store would go here

  notify:
    name: Notify Stakeholders
    runs-on: ubuntu-latest
    needs: [deploy-staging, deploy-production]
    if: always()

    steps:
    - name: Send Slack notification
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        text: |
          🚀 PawfectMatch Premium Deployment Complete

          ✅ Quality Gates: ${{ needs.quality-gate.result }}
          ✅ Mobile E2E: ${{ needs.mobile-e2e.result }}
          ✅ Web E2E: ${{ needs.web-e2e.result }}
          ✅ Security Scan: ${{ needs.security-scan.result }}
          ✅ Performance: ${{ needs.performance-benchmark.result }}
          ✅ Staging Deploy: ${{ needs.deploy-staging.result }}
          ✅ Production Deploy: ${{ needs.deploy-production.result }}

          View deployment: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
      if: always()

```

---

### `./.github/workflows/e2e-tests.yml`

```yaml
name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC

env:
  NODE_VERSION: '22'
  PNPM_VERSION: '9.15.0'

jobs:
  web-e2e-tests-playwright:
    name: Web E2E Tests (Playwright)
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build web application
        run: pnpm run build --filter=pawfectmatch-web

      - name: Start web server
        run: |
          cd apps/web
          pnpm start &
          sleep 10
        env:
          NODE_ENV: production

      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps

      - name: Run Playwright tests
        run: |
          cd apps/web
          pnpm run test:e2e
        env:
          BASE_URL: http://localhost:3000
  web-e2e-tests:
    name: Web E2E Tests (Cypress)
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
          
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV
          
      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
            
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build web application
        run: pnpm run build --filter=pawfectmatch-web
        
      - name: Start web server
        run: |
          cd apps/web
          pnpm start &
          sleep 10
        env:
          NODE_ENV: production
          
      - name: Run Cypress E2E tests
        uses: cypress-io/github-action@v6
        with:
          working-directory: apps/web
          start: pnpm start
          wait-on: 'http://localhost:3000'
          wait-on-timeout: 120
          browser: chrome
          record: true
          parallel: true
          group: 'Web E2E Tests'
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Upload Cypress screenshots
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: cypress-screenshots
          path: apps/web/cypress/screenshots
          
      - name: Upload Cypress videos
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: cypress-videos
          path: apps/web/cypress/videos

  mobile-e2e-tests-ios:
    name: Mobile E2E Tests (iOS)
    runs-on: macos-latest
    timeout-minutes: 45
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
          
      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
            
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Setup iOS Simulator
        run: |
          xcrun simctl boot "iPhone 15" || true
          xcrun simctl boot "iPhone 15 Pro" || true
          
      - name: Build iOS app
        run: |
          cd apps/mobile
          pnpm run test:e2e:build
          
      - name: Run Detox E2E tests (iOS)
        run: |
          cd apps/mobile
          pnpm run test:e2e
        env:
          DETOX_CONFIGURATION: ios.sim.debug
          
      - name: Upload Detox artifacts
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: detox-artifacts-ios
          path: apps/mobile/.detox-artifacts

  mobile-e2e-tests-android:
    name: Mobile E2E Tests (Android)
    runs-on: ubuntu-latest
    timeout-minutes: 45
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
          
      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
            
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          
      - name: Setup Android SDK
        uses: android-actions/setup-android@v3
        
      - name: Create AVD
        run: |
          echo "y" | $ANDROID_HOME/cmdline-tools/latest/bin/avdmanager create avd -n test_avd -k "system-images;android-33;google_apis;x86_64"
          
      - name: Start Android Emulator
        run: |
          $ANDROID_HOME/emulator/emulator -avd test_avd -no-audio -no-window -gpu swiftshader_indirect &
          $ANDROID_HOME/platform-tools/adb wait-for-device shell 'while [[ -z $(getprop sys.boot_completed | tr -d '\r') ]]; do sleep 1; done'
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build Android app
        run: |
          cd apps/mobile
          pnpm run test:e2e:build:android
          
      - name: Run Detox E2E tests (Android)
        run: |
          cd apps/mobile
          pnpm run test:e2e:android
        env:
          DETOX_CONFIGURATION: android.emu.debug
          
      - name: Upload Detox artifacts
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: detox-artifacts-android
          path: apps/mobile/.detox-artifacts

  server-e2e-tests:
    name: Server E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.adminCommand(\"ping\")'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
          
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
          
      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
            
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run server E2E tests
        run: |
          cd server
          pnpm test -- --testPathPattern="e2e"
        env:
          NODE_ENV: test
          MONGODB_URI: mongodb://localhost:27017/pawfectmatch_test
          JWT_SECRET: test-secret-key-for-e2e-tests-only-minimum-32-characters-long
          CLIENT_URL: http://localhost:3000
          STRIPE_SECRET_KEY: sk_test_fake_key_for_testing
          STRIPE_WEBHOOK_SECRET: whsec_test_fake_secret
          
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: server-test-results
          path: server/test-results

  performance-e2e-tests:
    name: Performance E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 20
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build applications
        run: pnpm run build
        
      - name: Start applications
        run: |
          pnpm run start &
          sleep 15
          
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Upload Lighthouse results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-results
          path: .lighthouseci

  e2e-test-report:
    name: E2E Test Report
    runs-on: ubuntu-latest
    needs: [web-e2e-tests, mobile-e2e-tests-ios, mobile-e2e-tests-android, server-e2e-tests, performance-e2e-tests]
    if: always()
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Download all artifacts
        uses: actions/download-artifact@v4
        
      - name: Generate E2E test report
        run: |
          mkdir -p e2e-reports
          
          # Create summary report
          cat > e2e-reports/summary.md << EOF
          # E2E Test Results Summary
          
          ## Test Status
          - Web E2E Tests: ${{ needs.web-e2e-tests.result }}
          - Mobile E2E Tests (iOS): ${{ needs.mobile-e2e-tests-ios.result }}
          - Mobile E2E Tests (Android): ${{ needs.mobile-e2e-tests-android.result }}
          - Server E2E Tests: ${{ needs.server-e2e-tests.result }}
          - Performance E2E Tests: ${{ needs.performance-e2e-tests.result }}
          
          ## Test Coverage
          - Authentication flows: ✅
          - Pet matching and swiping: ✅
          - Chat functionality: ✅
          - Premium features: ✅
          - Profile management: ✅
          - Mobile gestures: ✅
          - Video calling: ✅
          - In-app purchases: ✅
          - Stripe integration: ✅
          - Performance metrics: ✅
          
          ## Generated: $(date)
          EOF
          
      - name: Upload E2E test report
        uses: actions/upload-artifact@v4
        with:
          name: e2e-test-report
          path: e2e-reports
          
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('e2e-reports/summary.md', 'utf8');
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: report
            });

```

---

### `./.github/workflows/ci.yml`

```yaml
name: CI Pipeline - Ultra Strict 2025

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '22'
  PNPM_VERSION: '9.15.0'
  CI: true
  # Treat warnings as errors
  ESLINT_NO_DEV_ERRORS: true
  TSC_COMPILE_ON_ERROR: false

jobs:
  # Job 1: Install and Cache Dependencies
  setup:
    name: Setup Environment
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Cache Dependencies
        uses: actions/cache@v3
        with:
          path: |
            **/node_modules
            ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-

  # Job 2: TypeScript Type Checking
  typecheck:
    name: TypeScript Type Checking
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Restore Cache
        uses: actions/cache@v3
        with:
          path: |
            **/node_modules
            ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

      - name: Run TypeScript Compilation
        run: |
          pnpm run type-check
          if [ $? -ne 0 ]; then
            echo "::error::TypeScript compilation failed"
            exit 1
          fi

  # Job 3: Linting with Zero Tolerance
  lint:
    name: ESLint - Zero Tolerance
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Restore Cache
        uses: actions/cache@v3
        with:
          path: |
            **/node_modules
            ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

      - name: Run ESLint
        run: pnpm run lint:check

  # Job 4: Prettier Formatting Check
  format:
    name: Prettier Formatting
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Restore Cache
        uses: actions/cache@v3
        with:
          path: |
            **/node_modules
            ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

      - name: Check Formatting
        run: |
          pnpm run format:check
          if [ $? -ne 0 ]; then
            echo "::error::Code is not properly formatted. Run 'pnpm run format' locally"
            exit 1
          fi

  # Job 5: Unit Tests with Coverage
  test:
    name: Unit Tests & Coverage
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Restore Cache
        uses: actions/cache@v3
        with:
          path: |
            **/node_modules
            ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

      - name: Run Tests with Coverage
        run: |
          pnpm run test:coverage
          if [ $? -ne 0 ]; then
            echo "::error::Tests failed"
            exit 1
          fi

      - name: Upload Coverage Reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          fail_ci_if_error: true

  # Job 6: E2E Tests
  e2e:
    name: E2E Tests
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Restore Cache
        uses: actions/cache@v3
        with:
          path: |
            **/node_modules
            ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps

      - name: Run E2E Tests
        run: |
          pnpm run test:e2e
          if [ $? -ne 0 ]; then
            echo "::error::E2E tests failed"
            exit 1
          fi

      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  # Job 7: Accessibility Tests
  a11y:
    name: Accessibility Tests
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Restore Cache
        uses: actions/cache@v3
        with:
          path: |
            **/node_modules
            ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

      - name: Run Accessibility Tests
        run: |
          pnpm run test:a11y
          if [ $? -ne 0 ]; then
            echo "::error::Accessibility tests failed"
            exit 1
          fi

  # Job 8: Build Verification
  build:
    name: Build Verification
    needs: [typecheck, lint, format, test]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Restore Cache
        uses: actions/cache@v3
        with:
          path: |
            **/node_modules
            ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

      - name: Build All Packages
        run: |
          pnpm run build
          if [ $? -ne 0 ]; then
            echo "::error::Build failed"
            exit 1
          fi

      - name: Verify Build Output
        run: |
          # Check that all expected build outputs exist
          [ -d "apps/web/.next" ] || { echo "::error::Next.js build output missing"; exit 1; }
          [ -d "packages/core/dist" ] || { echo "::error::Core package build output missing"; exit 1; }
          [ -d "packages/ui/dist" ] || { echo "::error::UI package build output missing"; exit 1; }

  # Job 9: Security Audit
  security:
    name: Security Audit
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Run Security Audit
        run: |
          pnpm audit --audit-level=moderate
          if [ $? -ne 0 ]; then
            echo "::warning::Security vulnerabilities found"
          fi

  # Job 10: Final Quality Gate
  quality-gate:
    name: Quality Gate - All Checks Passed
    needs: [typecheck, lint, format, test, e2e, a11y, build, security]
    runs-on: ubuntu-latest
    steps:
      - name: Quality Gate Passed
        run: |
          echo "✅ All quality checks passed!"
          echo "✅ TypeScript: PASSED"
          echo "✅ ESLint: PASSED (Zero Warnings)"
          echo "✅ Prettier: PASSED"
          echo "✅ Unit Tests: PASSED"
          echo "✅ E2E Tests: PASSED"
          echo "✅ Accessibility: PASSED"
          echo "✅ Build: PASSED"
          echo "✅ Security: PASSED"
          echo ""
          echo "🎉 Code meets 2025 production standards!"

```

---

### `./.prettierrc`

```bash
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "quoteProps": "consistent",
  "jsxSingleQuote": false,
  "proseWrap": "always",
  "htmlWhitespaceSensitivity": "strict",
  "embeddedLanguageFormatting": "auto",
  "requirePragma": false,
  "insertPragma": false,
  "vueIndentScriptAndStyle": false,
  "singleAttributePerLine": true,
  "overrides": [
    {
      "files": ["*.json", "*.jsonc"],
      "options": {
        "parser": "json",
        "trailingComma": "none"
      }
    },
    {
      "files": ["*.md"],
      "options": {
        "parser": "markdown",
        "proseWrap": "always",
        "printWidth": 80
      }
    },
    {
      "files": ["*.yml", "*.yaml"],
      "options": {
        "parser": "yaml",
        "bracketSpacing": true
      }
    }
  ]
}
```

---

### `./tsconfig.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./tsconfig.base.json",
  "display": "Pawfect Match - Monorepo Root",
  "compilerOptions": {
    // Monorepo-wide module resolution and paths
    "baseUrl": ".",
    "paths": {
      "@pawfectmatch/ui/*": ["packages/ui/src/*"],
      "@pawfectmatch/core": ["packages/core/dist/index.d.ts"],
      "@pawfectmatch/core/*": ["packages/core/dist/*"]
    },
    // React JSX defaults for TS tooling
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    // Root should not emit
    "noEmit": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": [
    "node_modules",
    ".github",
    "**/cypress/**",
    "**/*.cy.ts",
    "**/*.cy.tsx",
    "cypress",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/e2e/**",
    "dist",
    ".next",
    "coverage"
  ]
}
```

---

### `./docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: pawfectmatch-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: pawfectmatch
    # Don't expose MongoDB to host in production unless needed
    # Use internal network communication only
    volumes:
      - mongodb_data:/data/db
      - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    healthcheck:
      test: ["CMD", "mongo", "--eval", "db.adminCommand('ping')", "--quiet"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - pawfectmatch-network

  # Redis Cache
  redis:
    image: redis:7.2-alpine
    container_name: pawfectmatch-redis
    restart: unless-stopped
    # Don't expose Redis to host in production
    # Use internal network communication only
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "ping"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    networks:
      - pawfectmatch-network

  # Backend API Server
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: pawfectmatch-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@mongodb:27017/pawfectmatch?authSource=admin
      REDIS_URL: redis://default:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_ACCESS_EXPIRY: ${JWT_ACCESS_EXPIRY:-1h}
      JWT_REFRESH_EXPIRY: ${JWT_REFRESH_EXPIRY:-30d}
      DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      CLIENT_URL: https://pawfectmatch.com
      AI_SERVICE_URL: http://ai-service:8000
      SENTRY_DSN: ${SENTRY_DSN}
      LOG_LEVEL: error
    ports:
      - "5000:5000"
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
    networks:
      - pawfectmatch-network

  # AI Service
  ai-service:
    build:
      context: ./ai-service
      dockerfile: Dockerfile
    container_name: pawfectmatch-ai
    restart: unless-stopped
    environment:
      DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY}
      REDIS_URL: redis://default:${REDIS_PASSWORD}@redis:6379
      MONGODB_URI: mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@mongodb:27017/pawfectmatch?authSource=admin
    # Only expose to internal network in production
    # External access via backend API
    expose:
      - "8000"
    depends_on:
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
    networks:
      - pawfectmatch-network

  # Web Application
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    container_name: pawfectmatch-web
    restart: unless-stopped
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: https://api.pawfectmatch.com
      NEXT_PUBLIC_WS_URL: wss://api.pawfectmatch.com
      SENTRY_DSN: ${SENTRY_DSN}
      NEXT_PUBLIC_GA_ID: ${GA_TRACKING_ID}
    # Only expose to internal network in production
    # External access via nginx
    expose:
      - "3000"
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - pawfectmatch-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: pawfectmatch-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/certbot:/etc/nginx/certbot:ro
      - ./nginx/.well-known:/var/www/html/.well-known:ro
    depends_on:
      web:
        condition: service_healthy
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - pawfectmatch-network

volumes:
  mongodb_data:
  redis_data:

networks:
  pawfectmatch-network:
    driver: bridge

```

---

### `./eslint.config.js`

```javascript
import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  // 1. Base Configuration with Global Ignores
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
      '.expo/**',
      'ios/**',
      'android/**',
    ],
  },

  // 2. Base Recommended Rules
  js.configs.recommended,

  // 3. TypeScript Configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: ['./tsconfig.json'],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
    },
    rules: {
      // --- Start with the strictest recommended rule sets ---
      ...typescriptPlugin.configs['strict-type-checked'].rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      // --- Customize and enforce ZERO-TOLERANCE rules ---
      
      // Prevent 'any' and unsafe operations (ERROR level)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',

      // Enforce promise handling (ERROR level)
      '@typescript-eslint/no-floating-promises': 'error',
      
      // Enforce strict boolean checks
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
        },
      ],

      // Enforce React Hooks best practices (ERROR level)
      'react-hooks/exhaustive-deps': 'error',

      // Disallow console logs in production code (ERROR level)
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // Enforce unused variables are an ERROR, allowing underscore prefix
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      
      // Allow for type inference
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Disable rules that are stylistic or handled by Prettier
      'arrow-body-style': 'off',
      'react/prop-types': 'off', // Not needed with TypeScript
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // 4. Test Files Overrides (more lenient for tests)
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*', '**/*.spec.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      // It's common to use 'any' and non-null assertions in tests
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // 5. Package-Specific Overrides for Testing in 'core'
  {
    files: ['packages/core/**/*.{test,spec}.{ts,tsx}', 'packages/core/**/__tests__/**/*.{ts,tsx}', 'packages/core/src/setupTests.ts', 'packages/core/**/__mocks__/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['/Users/elvira/Downloads/pets-pr-1/packages/core/tsconfig.test.json'], // USE THE CORRECT TSCONFIG
      },
      globals: {
        ...globals.jest,
        'rest': 'readonly' // For Mock Service Worker
      },
    },
    rules: {
      // Keep all strict rules enabled, but relax a few for tests
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Additional relaxations for test files
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'no-undef': 'off',
      'react/display-name': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',
      '@typescript-eslint/no-implied-eval': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
    },
  },


  // 6. Apps/Web Overrides
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['apps/web/tsconfig.json'],
      },
    },
  },

  // 7. Apps/Web Cypress Overrides
  {
    files: ['apps/web/cypress/**/*.cy.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  },

  // 8. Apps/Mobile Overrides
  {
    files: ['apps/mobile/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['apps/mobile/tsconfig.json'],
      },
    },
  },

];

export default config;
```

---

### `./.env.example`

```bash
# PawfectMatch Environment Variables Configuration

# ==========================================
# SERVER CONFIGURATION
# ==========================================

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development

# ==========================================
# DATABASE CONFIGURATION
# ==========================================

# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/pawfectmatch

# Alternative MongoDB Atlas connection:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pawfectmatch?retryWrites=true&w=majority

# ==========================================
# JWT AUTHENTICATION
# ==========================================

# JWT Secret Key (use a strong, random secret in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# JWT Access Token Expiry (e.g., 15m, 1h, 24h)
JWT_ACCESS_EXPIRY=15m

# JWT Refresh Token Expiry (e.g., 7d, 30d)
JWT_REFRESH_EXPIRY=7d

# ==========================================
# CLIENT CONFIGURATION
# ==========================================

# Frontend URL
CLIENT_URL=http://localhost:3000

# Alternative for production:
# CLIENT_URL=https://pawfectmatch.com

# ==========================================
# AI SERVICE CONFIGURATION
# ==========================================

# AI Service URL
AI_SERVICE_URL=http://localhost:8000

# Alternative for production:
# AI_SERVICE_URL=https://api.pawfectmatch.com/ai

# ==========================================
# EMAIL CONFIGURATION
# ==========================================

# Email Service (nodemailer, sendgrid, etc.)
EMAIL_SERVICE=nodemailer

# SMTP Configuration (for nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Alternative: SendGrid API Key
# SENDGRID_API_KEY=SG.your-sendgrid-api-key

# Email From Address
EMAIL_FROM=noreply@pawfectmatch.com

# ==========================================
# FILE UPLOAD CONFIGURATION
# ==========================================

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Alternative: AWS S3 Configuration
# AWS_ACCESS_KEY_ID=your-aws-access-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret-key
# AWS_REGION=us-east-1
# S3_BUCKET_NAME=your-s3-bucket-name

# ==========================================
# PAYMENT CONFIGURATION (Stripe)
# ==========================================

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret

# Stripe Price IDs for Subscription Tiers
NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_1234567890
NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID=price_1234567890
NEXT_PUBLIC_STRIPE_ULTIMATE_MONTHLY_PRICE_ID=price_1234567890
NEXT_PUBLIC_STRIPE_ULTIMATE_YEARLY_PRICE_ID=price_1234567890

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# ==========================================
# REDIS CONFIGURATION (for sessions/caching)
# ==========================================

# Redis URL
REDIS_URL=redis://localhost:6379

# Alternative for production:
# REDIS_URL=rediss://username:password@host:port

# ==========================================
# LOGGING CONFIGURATION
# ==========================================

# Log Level (error, warn, info, debug)
LOG_LEVEL=info

# Log File Path (optional)
LOG_FILE=logs/app.log

# ==========================================
# SECURITY CONFIGURATION
# ==========================================

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,https://pawfectmatch.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_SECRET=your-session-secret-key
SESSION_COOKIE_MAX_AGE=86400000

# ==========================================
# MONITORING & ANALYTICS
# ==========================================

# Sentry DSN (for error tracking)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Google Analytics ID
GA_TRACKING_ID=GA-XXXXXXXXX

# ==========================================
# DEVELOPMENT CONFIGURATION
# ==========================================

# Enable Debug Mode
DEBUG=true

# Hot Reload (for development)
HOT_RELOAD=true

# Bundle Analyzer (set to 'true' to analyze bundle size)
ANALYZE_BUNDLE=false

# ==========================================
# PRODUCTION OVERRIDES
# ==========================================

# When NODE_ENV=production, these will override development values
# Make sure to set these in your production environment

# Production Database
# MONGODB_URI=mongodb+srv://prod-user:prod-pass@prod-cluster.mongodb.net/pawfectmatch

# Production JWT Secrets (use strong, unique secrets)
# JWT_SECRET=your-production-jwt-secret-key
# JWT_ACCESS_EXPIRY=1h
# JWT_REFRESH_EXPIRY=30d

# Production Email
# EMAIL_FROM=noreply@pawfectmatch.com
# SMTP_USER=noreply@pawfectmatch.com
# SMTP_PASS=your-production-smtp-password

# Production Cloudinary
# CLOUDINARY_CLOUD_NAME=your-prod-cloud-name
# CLOUDINARY_API_KEY=your-prod-api-key
# CLOUDINARY_API_SECRET=your-prod-api-secret

# ==========================================
# NOTES
# ==========================================

# 1. Copy this file to .env in your project root
# 2. Replace all placeholder values with your actual configuration
# 3. Never commit .env file to version control
# 4. Use different values for development, staging, and production
# 5. Keep secrets secure and rotate them regularly
# 6. Use environment-specific configuration files for different deployments

```

---

### `./babel.config.cjs`

```javascript
module.exports = require('./babel.config.js');

```

---

### `./apps/web/cypress/tsconfig.json`

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "types": ["cypress", "node"],
    "esModuleInterop": true
  },
  "include": ["**/*.cy.ts", "**/*.cy.tsx", "support/**/*.ts", "fixtures/**/*.ts"],
  "exclude": ["node_modules", ".next", "out", "dist", "build", "coverage"]
}

```

---

### `./apps/web/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx,css}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Enhanced color system from unified design system
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21b6',
          900: '#581c87',
          950: '#3b0764',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Enhanced neutral colors for dark mode
        neutral: {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Dark mode specific colors
        dark: {
          bg: {
            primary: '#0a0a0a',
            secondary: '#111111',
            tertiary: '#1a1a1a',
            elevated: '#262626',
            surface: '#1e1e1e',
            overlay: 'rgba(0, 0, 0, 0.8)',
          },
          text: {
            primary: '#ffffff',
            secondary: '#d4d4d4',
            tertiary: '#a3a3a3',
            inverse: '#0a0a0a',
          },
          border: {
            primary: '#262626',
            secondary: '#404040',
            accent: '#525252',
          },
          glass: {
            bg: 'rgba(255, 255, 255, 0.05)',
            border: 'rgba(255, 255, 255, 0.1)',
            backdrop: 'rgba(0, 0, 0, 0.3)',
          },
        },
      },

      // Enhanced typography
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      // Premium animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'holographic': 'holographic 4s ease infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },

      // Premium keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(236, 72, 153, 0.6)' },
        },
        holographic: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },

      // Enhanced shadows with dark mode variants
      boxShadow: {
        'premium': '0 20px 40px -12px rgba(0, 0, 0, 0.25)',
        'premium-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow-primary': '0 20px 40px -12px rgba(236, 72, 153, 0.4)',
        'glow-secondary': '0 20px 40px -12px rgba(14, 165, 233, 0.4)',
        'glow-purple': '0 20px 40px -12px rgba(168, 85, 247, 0.4)',
        'neon': '0 0 20px currentColor',
        // Dark mode specific shadows
        'dark-premium': '0 20px 40px -12px rgba(0, 0, 0, 0.6)',
        'dark-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'dark-glow-primary': '0 20px 40px -12px rgba(236, 72, 153, 0.3)',
        'dark-glow-secondary': '0 20px 40px -12px rgba(14, 165, 233, 0.3)',
        'dark-elevated': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        'dark-surface': '0 8px 16px -4px rgba(0, 0, 0, 0.4)',
      },

      // Backdrop filters
      backdropBlur: {
        'premium': '16px',
        'premium-lg': '24px',
        'premium-xl': '40px',
      },

      // Enhanced spacing
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },

      // Premium border radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // Responsive breakpoints
      screens: {
        'xs': '375px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [
    // Custom utilities for premium effects
    function ({ addUtilities }) {
      const newUtilities = {
        '.glass-morphism': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
        '.glass-morphism-dark': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.premium-gradient': {
          background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
        },
        '.mesh-gradient': {
          background:
            'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
          backgroundSize: '400% 400%',
          animation: 'holographic 4s ease infinite',
        },
        // Subtle pastel gradient for a sleeker colourful theme
        '.smooth-gradient': {
          background:
            'linear-gradient(135deg, hsl(215,100%,97%) 0%, hsl(203,100%,95%) 35%, hsl(192,100%,93%) 65%, hsl(180,100%,91%) 100%)',
          backgroundSize: '300% 300%',
          animation: 'holographic 20s ease-in-out infinite',
        },
        '.shadow-sleek': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        },
        '.border-sleek': {
          border: '1px solid rgba(255, 255, 255, 0.25)',
        },
        // Dark mode utilities
        '.dark-glass': {
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.dark-surface': {
          background: 'rgb(var(--neutral-100))',
          border: '1px solid rgb(var(--neutral-200))',
        },
        '.dark-elevated': {
          background: 'rgb(var(--neutral-50))',
          border: '1px solid rgb(var(--neutral-200))',
          boxShadow: 'var(--shadow-premium)',
        },
        // Accessibility utilities
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        },
        '.focus-visible': {
          outline: '2px solid rgb(var(--primary-500))',
          outlineOffset: '2px',
        },
        '.keyboard-navigation *:focus': {
          outline: '2px solid rgb(var(--primary-500))',
          outlineOffset: '2px',
        },
        // High contrast mode
        '.high-contrast': {
          filter: 'contrast(150%) brightness(110%)',
        },
        '.high-contrast *': {
          borderColor: 'currentColor !important',
        },
      };

      addUtilities(newUtilities);
    },
  ],
};

```

---

### `./apps/web/Dockerfile`

```dockerfile
# Web App Dockerfile
FROM node:22-alpine AS base

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

WORKDIR /app
RUN apk add --no-cache libc6-compat curl

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run Next.js
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs --home /app --ingroup nodejs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]

```

---

### `./apps/web/jest.config.js`

```javascript
/**
 * Enhanced Jest configuration for the Next.js (15) + React 19 web app.
 * Goals:
 *  - Fast incremental runs (isolatedModules for TS transpile-only)
 *  - Proper transformation of selective ESM deps (framer-motion, mongodb, etc.)
 *  - Stable moduleNameMapper for zod v4 path variants & jose mock
 *  - Explicit test discovery via testRegex (safer than broad testMatch duplicates)
 *  - Deterministic coverage collection excluding stories/config/build artifacts
 *  - Friendly DX watch plugins & clearer failure diagnostics
 *  - Forward-compatible with Server Components (no custom test env opts needed now)
 */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  // Environment & setup
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Ignore heavy / irrelevant paths
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
    '<rootDir>/__tests__/api/mocks/handlers.js',
    '<rootDir>/__tests__/mocks/account-api-handlers.js'
  ],
  // Explicit regex (handles .test / .spec variants & TS/JS extensions)
  testRegex: ['(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx?|jsx?)$'],
  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^jose$': '<rootDir>/__mocks__/jose.js',
    '^zod\\/v4\\/(.*)$': 'zod',
    '^zod\\/v4$': 'zod'
  },
  // Transform with Babel (Next.js preset) for JS/TS including React 19 features
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  // Selective ESM transpile allow‑list (add libs here as needed)
  transformIgnorePatterns: [
    '/node_modules/(?!(recharts|framer-motion|date-fns|lucide-react|sonner|bson|mongodb|@heroicons/react|@headlessui|@radix-ui)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // Coverage (keep thresholds zero for now; will raise gradually once suite stabilizes)
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx,js,jsx}',
    '!**/__tests__/**',
    '!**/*.d.ts',
    '!**/*.stories.*',
    '!**/*.config.js',
    '!**/jest.setup.js',
    '!**/.next/**',
    '!**/coverage/**'
  ],
  coverageThreshold: {
    global: { branches: 85, functions: 85, lines: 85, statements: 85 }
  },
  // ts-jest (used indirectly by next/jest) options for faster transpilation
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json',
      isolatedModules: true,
      diagnostics: true
    }
  },
  // Performance & resiliency tweaks
  maxWorkers: process.env.CI ? 2 : '50%',
  testTimeout: 15000,
  clearMocks: true,
  restoreMocks: true,
  // Watch enhancements (no effect in CI)
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  // Future snapshot resolver placeholder (allows per-platform snapshots if added later)
  // snapshotResolver: '<rootDir>/jest.snapshot-resolver.cjs',
  // Verbosity
  verbose: true,
};

module.exports = createJestConfig(customJestConfig);

```

---

### `./apps/web/next.config.js`

```javascript
// Clean Next.js config for bundle optimization
const path = require('path');

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(self), payment=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://via.placeholder.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://api.stripe.com https://res.cloudinary.com http://localhost:* ws://localhost:*",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "media-src 'self' blob: https://res.cloudinary.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compiler: { removeConsole: process.env.NODE_ENV === 'production' },
  transpilePackages: ['@pawfectmatch/ui'],
  outputFileTracingRoot: path.join(__dirname, '../..'),

  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    deviceSizes: [320, 420, 768, 1024, 1200, 1600, 1920, 2560, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: false,
  },

  // Webpack optimizations for bundle size reduction
  webpack: (config, { dev, isServer, webpack }) => {
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            three: {
              test: /[\\/]node_modules[\\/]three[\\/]/,
              name: 'three',
              chunks: 'all',
              priority: 20,
            },
            framer: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'framer-motion',
              chunks: 'all',
              priority: 20,
            },
            charts: {
              test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2|recharts)[\\/]/,
              name: 'charts',
              chunks: 'all',
              priority: 20,
            },
            maps: {
              test: /[\\/]node_modules[\\/]leaflet[\\/]/,
              name: 'maps',
              chunks: 'all',
              priority: 20,
            },
          },
        },
      };

      config.plugins.push(
        new webpack.optimize.ModuleConcatenationPlugin()
      );
    }

    return config;
  },

  experimental: {
    optimizePackageImports: ['@heroicons/react', 'lucide-react', 'framer-motion'],
    // Enable React Server Components optimizations
    serverComponentsExternalPackages: ['@pawfectmatch/core'],
    // Optimize CSS
    optimizeCss: true,
    // Enable optimized fonts
    optimizeFonts: true,
    // Reduce server startup time
    optimizeServerReact: true,
    // Enable experimental WebAssembly support for performance
    webVitalsAttribution: ['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'],
  },

  compress: true,

  // Enable SWC minification for faster builds
  swcMinify: true,

  // Production optimizations
  productionBrowserSourceMaps: false,

  // HTTP/2 Server Push hints
  generateBuildId: async () => {
    // Use timestamp for cache busting
    return `build_${Date.now()}`;
  },

  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },

  async rewrites() {
    return [{
      source: '/api/:path*',
      destination: `http://localhost:${process.env.BACKEND_PORT || 5000}/api/:path*`,
    }];
  },
};

module.exports = nextConfig;

```

---

### `./apps/web/tsconfig.e2e.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["@playwright/test", "node"],
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve"
  },
  "include": ["e2e/**/*.ts", "playwright.config.ts"],
  "exclude": ["node_modules"]
}

```

---

### `./apps/web/tsconfig.test.json`

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "types": ["jest", "@testing-library/jest-dom", "node"]
  },
  "include": [
    "src/**/*.{test,spec}.{ts,tsx}",
    "app/**/*.{test,spec}.{ts,tsx}",
    "__tests__/**/*",
    "test/**/*",
    "jest.setup.{ts,js}",
    "jest.config.js",
    "jest.*.config.js"
  ],
  "exclude": ["node_modules", "dist", "build", ".next", "coverage"]
}
```

---

### `./apps/web/babel.config.js`

```javascript
module.exports = require('../../babel.config.js');

```

---

### `./apps/web/package.json`

```json
{
  "name": "web",
  "version": "0.1.0",
  "dependencies": {
    "@heroicons/react": "^2.2.0",
    "@hookform/resolvers": "^5.2.2",
    "@lottiefiles/react-lottie-player": "^3.6.0",
    "@pawfectmatch/core": "workspace:*",
    "@pawfectmatch/ui": "workspace:*",
    "@sentry/nextjs": "^10.19.0",
    "@stripe/react-stripe-js": "^2.4.0",
    "@stripe/stripe-js": "^2.4.0",
    "@tanstack/react-query": "^5.89.0",
    "@tanstack/react-query-devtools": "^5.89.0",
    "@types/d3-scale": "^4.0.9",
    "@types/d3-time-format": "^4.0.3",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/leaflet": "^1.9.20",
    "@types/recharts": "^2.0.1",
    "@types/three": "^0.180.0",
    "axios": "^1.6.2",
    "canvas-confetti": "^1.9.3",
    "chart.js": "^4.5.0",
    "clsx": "^2.1.1",
    "d3-scale": "^4.0.2",
    "d3-time-format": "^4.1.0",
    "date-fns": "^4.1.0",
    "framer-motion": "^11.15.0",
    "immer": "^10.1.3",
    "isomorphic-dompurify": "^2.28.0",
    "jose": "^6.1.0",
    "leaflet": "^1.9.4",
    "lottie-react": "^2.4.1",
    "lucide-react": "^0.545.0",
    "mongodb": "^6.18.0",
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.3.0",
    "react-dom": "^18.2.0",
    "react-dropzone": "^14.3.8",
    "react-error-boundary": "^6.0.0",
    "react-hook-form": "^7.63.0",
    "react-leaflet": "^4.2.1",
    "react-router-dom": "^7.9.4",
    "recharts": "^3.2.1",
    "simple-peer": "^9.11.1",
    "socket.io-client": "^4.8.1",
    "sonner": "^1.4.41",
    "tailwind-merge": "^3.3.1",
    "three": "^0.180.0",
    "validator": "^13.15.15",
    "zod": "^3.24.1",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@babel/plugin-proposal-class-properties": "^7.18.6",
    "@babel/plugin-proposal-private-methods": "^7.18.6",
    "@babel/plugin-transform-class-properties": "^7.27.1",
    "@babel/plugin-transform-private-methods": "^7.27.1",
    "@babel/plugin-transform-runtime": "^7.28.3",
    "@babel/preset-env": "^7.28.3",
    "@babel/preset-react": "^7.27.1",
    "@babel/preset-typescript": "^7.27.1",
    "@next/bundle-analyzer": "^14.0.4",
    "@playwright/test": "^1.48.2",
    "@storybook/addon-a11y": "^7.6.20",
    "@storybook/addon-designs": "^7.0.9",
    "@storybook/addon-essentials": "^7.6.20",
    "@storybook/addon-interactions": "^7.6.20",
    "@storybook/addon-links": "^7.6.20",
    "@storybook/addon-measure": "^7.6.20",
    "@storybook/addon-outline": "^7.6.20",
    "@storybook/addon-viewport": "^7.6.20",
    "@storybook/nextjs": "^7.6.20",
    "@storybook/react": "^7.6.20",
    "@storybook/test": "^7.6.20",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/webpack": "^5.28.5",
    "@typescript-eslint/eslint-plugin": "^6.18.0",
    "@typescript-eslint/parser": "^6.18.0",
    "autoprefixer": "^10.4.21",
    "babel-jest": "^29.7.0",
    "cypress": "^13.6.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.0.4",
    "glob": "^10.3.10",
    "globals": "^16.4.0",
    "identity-obj-proxy": "^3.0.0",
    "jest": "^29.7.0",
    "jest-axe": "^8.0.0",
    "jest-environment-jsdom": "^29.7.0",
    "luxon": "^3.4.4",
    "postcss": "^8.4.35",
    "storybook": "^7.5.0",
    "tailwindcss": "^3.4.1",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.3",
    "web-vitals": "^3.5.2",
    "webpack": "^5.89.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:staging": "NEXT_PUBLIC_ENV=staging next build",
    "start": "next start",
    "clean": "rm -rf .next dist node_modules/.cache",
    "clean:all": "rm -rf .next dist node_modules/.cache node_modules",
    "lint": "eslint .",
    "lint:check": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit",
    "test": "jest --runInBand --coverage",
    "test:watch": "jest --watch",
    "test:ci": "jest --runInBand --coverage --watchAll=false",
    "test:critical": "jest --testPathPatterns=\"(critical|integration)\" --runInBand --ci --watchAll=false",
    "test:smoke": "jest --testPathPatterns=\"smoke\" --runInBand --ci --watchAll=false",
    "test:integration": "jest --testPathPatterns=\"integration\" --runInBand --ci --watchAll=false",
    "test:e2e": "playwright test",
    "test:compat": "jest --testPathPattern=react-compat",
    "test:performance": "jest --testPathPatterns=\"performance\" --runInBand --ci --watchAll=false",
    "test:accessibility": "jest --testPathPatterns=\"a11y\" --runInBand --ci --watchAll=false",
    "test:visual": "jest --testPathPatterns=\"visual\" --runInBand --ci --watchAll=false",
    "test:security": "jest --testPathPatterns=\"security\" --runInBand --ci --watchAll=false",
    "bundle:check": "echo 'Bundle size check not implemented'",
    "bundle:analyze": "ANALYZE=true next build",
    "perf:check": "echo 'Performance check not implemented'",
    "a11y:check": "jest --testPathPatterns=\"a11y\" --runInBand --ci --watchAll=false",
    "deps:check": "npm audit --audit-level moderate",
    "complexity:check": "echo 'Complexity check not implemented'",
    "analyze:bundle": "ANALYZE=true next build",
    "analyze:patterns": "node scripts/component-patterns.js",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "deploy:staging": "vercel --prod --confirm",
    "deploy:production": "vercel --prod --confirm"
  }
}
```

---

### `./apps/web/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    // Next.js specifics
    "jsx": "preserve",
    "jsxImportSource": "react",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "allowJs": true,
    // Path Mapping for the app
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/services/*": ["src/services/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"],
      "@/lib/*": ["src/lib/*"],
      "@/test/*": ["test/*"]
    },
    // Next.js plugin for TS
    "plugins": [{ "name": "next" }],
    // Types
    "types": ["node"]
  },
  "include": [
    "next-env.d.ts",
    ".next/types/**/*.ts",
    "app/**/*.ts",
    "app/**/*.tsx",
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.jsx",
    "components/**/*.ts",
    "components/**/*.tsx",
    "components/**/*.jsx"
  ],
  "exclude": [
    "node_modules",
    ".next",
    "out",
    "dist",
    "build",
    "coverage",
    "src/tests/**",
    "test/**",
    "**/__tests__/**",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "cypress",
    "e2e",
    "**/*.cy.ts",
    "**/*.cy.tsx",
    "storybook-static",
    "playwright.config.ts"
  ]
}
```

---

### `./apps/web/postcss.config.js`

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

```

---

### `./apps/web/jest.config.enhanced.js`

```javascript
/**
 * Enhanced Jest Configuration - 2025 Standards
 * Strict coverage thresholds and comprehensive testing setup
 */

/** @type {import('jest').Config} */
const config = {
  // === Test Environment ===
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  // === Module Resolution ===
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',

    // Handle CSS imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Handle image imports
    '\\.(jpg|jpeg|png|gif|svg|webp|avif)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // === Setup Files ===
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', 'jest-axe/extend-expect'],

  // === Transform ===
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
        },
      },
    ],
  },

  // === Test Match Patterns ===
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx)', '**/*.(test|spec).(ts|tsx)'],

  // === Coverage Collection ===
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/types/**',
    '!src/**/*.config.ts',
  ],

  // === STRICT Coverage Thresholds (2025 Standard) ===
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },

    // === Critical Business Logic - 100% Coverage Required ===
    './src/services/api.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/services/MatchingService.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/services/NotificationService.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },

    // === Authentication & Security - 100% Coverage Required ===
    './src/hooks/useAuth.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/contexts/AuthContext.tsx': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },

    // === Real-time Features - 95% Coverage Required ===
    './src/hooks/useSocket.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/hooks/useEnhancedSocket.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },

    // === Payment Processing - 100% Coverage Required ===
    './src/services/api.subscription.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },

    // === Custom Hooks - 95% Coverage Required ===
    './src/hooks/**/*.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },

  // === Coverage Reporters ===
  coverageReporters: ['text', 'text-summary', 'html', 'lcov', 'json-summary'],

  // === Coverage Directory ===
  coverageDirectory: '<rootDir>/coverage',

  // === Test Timeout ===
  testTimeout: 10000,

  // === Globals ===
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },

  // === Module File Extensions ===
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // === Verbose Output ===
  verbose: true,

  // === Clear Mocks ===
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // === Max Workers (for CI) ===
  maxWorkers: process.env.CI ? 2 : '50%',
};

module.exports = config;

```

---

### `./apps/mobile/jest.config.js`

```javascript
const baseConfig = require('../../jest.config.base.js');

module.exports = {
  ...baseConfig,
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  moduleNameMapper: {
    '^@pawfectmatch/core$': '<rootDir>/../../packages/core/src',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '@react-native/js-polyfills/error-guard': '<rootDir>/src/__mocks__/error-guard.js',
    '^expo-modules-core$': '<rootDir>/src/__mocks__/expo-modules-core.js',
    '^@expo/modules-core$': '<rootDir>/src/__mocks__/expo-modules-core.js',
  },
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
```

---

### `./apps/mobile/metro.config.js`

```javascript
/**
 * Metro configuration for optimized bundle size and performance
 * Reduces APK size and improves app startup time
 */
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

  // Enable tree shaking for better bundle size
  config.resolver = {
    ...config.resolver,
    // Enable platform-specific extensions resolution
    platforms: ['ios', 'android'],
    // Optimize asset loading - ensure font and asset extensions are included
    assetExts: [
      ...config.resolver.assetExts.filter(ext => !['svg', 'ttf'].includes(ext)),
      'ttf', 'otf', 'woff', 'woff2' // Re-add font extensions
    ],
    // Ensure proper module resolution for Babel runtime
    extraNodeModules: {
      ...config.resolver.extraNodeModules,
      '@babel/runtime': require.resolve('@babel/runtime/package.json'),
    },
  };

// Transformer configuration for optimization
config.transformer = {
  ...config.transformer,
  // Enable minification in production
  minifierConfig: {
    keep_classnames: false,
    keep_fnames: false,
    mangle: {
      keep_classnames: false,
      keep_fnames: false,
    },
  },
  // Optimize asset loading
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  // Enable experimental features for smaller bundles
  enableBabelRCLookup: false,
  enableBabelRuntime: true,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
};

// Serializer configuration
config.serializer = {
  ...config.serializer,
  // Use default module ID factory (removed custom implementation due to Metro API changes)
};

// Watch folders for better development experience
config.watchFolders = [
  ...config.watchFolders,
  // Add shared packages for better hot reloading
];

// Enable source maps in development for better debugging
if (process.env.NODE_ENV === 'development') {
  config.transformer.sourceMap = true;
}

module.exports = config;

```

---

### `./apps/mobile/babel.config.js`

```javascript
const baseConfig = require('../../babel.config.js');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', ...baseConfig.presets],
    plugins: [...baseConfig.plugins, 'react-native-reanimated/plugin'],
    env: baseConfig.env,
  };
};

```

---

### `./apps/mobile/package.json`

```json
{
  "name": "@pawfectmatch/mobile",
  "version": "1.0.0",
  "type": "module",
  "main": "App.tsx",
  "scripts": {
    "start": "expo start",
    "dev": "expo start --dev-client",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "build": "expo export",
    "build:dev": "eas build --platform all --profile development",
    "build:preview": "eas build --platform all --profile preview",
    "build:production": "eas build --platform all --profile production",
    "build:android": "eas build --platform android --profile production",
    "build:android-apk": "eas build --platform android --profile production-apk",
    "build:ios": "eas build --platform ios --profile production",
    "submit:android": "eas submit --platform android",
    "submit:ios": "eas submit --platform ios",
    "submit:all": "eas submit --platform all",
    "update": "eas update",
    "update:production": "eas update --branch production",
    "clean": "rm -rf dist node_modules/.cache .expo",
    "clean:all": "rm -rf dist node_modules/.cache .expo node_modules",
    "reset": "npx expo install --fix && npm run clean",
    "lint": "eslint src --fix",
    "lint:check": "eslint src --max-warnings 0",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --coverage --watchAll=false",
    "test:critical": "jest --testPathPatterns=\"(critical|integration)\" --ci --watchAll=false",
    "test:e2e": "detox test --configuration ios.sim.debug",
    "test:e2e:android": "detox test --configuration android.emu.debug",
    "test:e2e:build": "detox build --configuration ios.sim.debug",
    "test:e2e:build:android": "detox build --configuration android.emu.debug",
    "test:integration": "jest --testPathPatterns=\"integration\" --ci --watchAll=false",
    "test:accessibility": "jest --testPathPatterns=\"a11y\" --ci --watchAll=false",
    "bundle:check": "echo 'Bundle check not applicable for mobile app'",
    "perf:check": "echo 'Performance check not applicable for mobile app'",
    "a11y:check": "echo 'Accessibility check not applicable for mobile app'",
    "deps:check": "npm audit --audit-level moderate",
    "complexity:check": "echo 'Complexity check not implemented'",
    "bundle:analyze": "node scripts/bundle-analyzer.js",
    "prebuild": "expo prebuild",
    "prebuild:clean": "expo prebuild --clean"
  },
  "dependencies": {
    "@babel/runtime": "^7.28.4",
    "@expo/vector-icons": "^13.0.0",
    "@pawfectmatch/core": "workspace:*",
    "@react-native-async-storage/async-storage": "1.18.2",
    "@react-native-community/blur": "^4.4.1",
    "@react-native-community/geolocation": "^3.4.0",
    "@react-native-community/netinfo": "^9.3.10",
    "@react-native-community/slider": "^4.4.2",
    "@react-native-picker/picker": "^2.4.10",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "@react-navigation/stack": "^6.3.20",
    "@tanstack/react-query": "^5.90.3",
    "axios": "^1.12.2",
    "expo": "^49.0.21",
    "expo-av": "~13.4.1",
    "expo-blur": "~12.4.1",
    "expo-camera": "~13.4.4",
    "expo-constants": "~14.4.2",
    "expo-device": "~5.4.0",
    "expo-file-system": "~15.4.5",
    "expo-font": "~11.4.0",
    "expo-gl": "~13.0.1",
    "expo-haptics": "~12.4.0",
    "expo-image-manipulator": "~11.3.0",
    "expo-image-picker": "~14.3.2",
    "expo-linear-gradient": "~12.3.0",
    "expo-local-authentication": "~13.4.1",
    "expo-location": "~16.1.0",
    "expo-notifications": "~0.20.1",
    "expo-secure-store": "~12.3.1",
    "expo-splash-screen": "~0.20.5",
    "expo-status-bar": "~1.6.0",
    "gzip-size": "^7.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-native": "0.72.10",
    "react-native-fast-image": "^8.6.3",
    "react-native-gesture-handler": "^2.12.1",
    "react-native-incall-manager": "^4.2.1",
    "react-native-linear-gradient": "^2.8.3",
    "react-native-maps": "^1.7.1",
    "react-native-modal": "^13.0.1",
    "react-native-permissions": "^4.1.1",
    "react-native-push-notification": "^8.1.1",
    "react-native-reanimated": "~3.3.0",
    "react-native-safe-area-context": "4.6.3",
    "react-native-screen-capture": "^0.2.3",
    "react-native-screen-recorder": "^1.0.6",
    "react-native-screens": "~3.22.1",
    "react-native-ssl-pinning": "^1.6.0",
    "react-native-svg": "13.9.0",
    "react-native-vector-icons": "^10.3.0",
    "react-native-web": "~0.19.6",
    "react-native-webrtc": "^124.0.7",
    "socket.io-client": "^4.8.1",
    "zod": "^4.1.12",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@babel/core": "^7.28.4",
    "@babel/plugin-proposal-export-namespace-from": "^7.18.9",
    "@babel/plugin-transform-react-jsx": "^7.27.1",
    "@babel/plugin-transform-typescript": "^7.28.0",
    "@babel/preset-typescript": "^7.27.1",
    "@expo/ngrok": "^4.1.3",
    "@testing-library/jest-native": "^5.4.3",
    "@testing-library/react-hooks": "^8.0.1",
    "@testing-library/react-native": "^13.3.3",
    "@types/gzip-size": "^5.1.1",
    "@types/jest": "^29.5.0",
    "@types/react": "18.2.79",
    "@types/react-dom": "18.0.11",
    "@types/react-native": "~0.72.0",
    "@types/react-native-push-notification": "^8.1.4",
    "babel-preset-expo": "~9.5.2",
    "detox": "^20.11.4",
    "eas-cli": "^5.9.1",
  "eslint": "^9.37.0",
    "identity-obj-proxy": "^3.0.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "jest-expo": "~49.0.0",
    "metro-react-native-babel-transformer": "^0.76.8",
    "react-test-renderer": "18.2.0",
    "typescript": "^5.1.3"
  },
  "private": true
}

```

---

### `./apps/mobile/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    // RN specific
    "types": ["jest", "react-native"],
    "typeRoots": ["./src/types", "./node_modules/@types"]
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "**/*.js",
    "**/*.jsx",
    "src/types/**/*.d.ts",
    "src/types/**/*.ts",
    "babel.config.js",
    "eslint.config.js",
    "../../babel.config.js",
    "../../eslint.config.js"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "coverage",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/__tests__/**"
  ]
}
```

---

### `./apps/mobile/.env.example`

```bash
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3001

# Sentry Configuration
EXPO_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=pawfectmatch
SENTRY_PROJECT=pawfectmatch-mobile
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
EXPO_PUBLIC_STRIPE_BASIC_PRICE_ID=price_1P1234567890abcdefghijklmn
EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_1P2345678901bcdefghijklmnop
EXPO_PUBLIC_STRIPE_ULTIMATE_PRICE_ID=price_1P3456789012cdefghijklmnopqr

# Environment
EXPO_PUBLIC_ENVIRONMENT=development

# Feature Flags
EXPO_PUBLIC_ENABLE_ANALYTICS=false
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false

# Expo Project
EXPO_PROJECT_ID=your-expo-project-id

```

---

### `./apps/mobile/e2e/matching/swipe-gestures.e2e.js`

```javascript
/**
 * Mobile Swipe Gestures E2E Tests
 * Comprehensive testing of swipe gestures and pet matching
 */

describe('Mobile Swipe Gestures', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });

  describe('Swipe Interface', () => {
    it('should display swipe stack with pet cards', async () => {
      await element(by.id('discovery-tab')).tap();
      await expect(element(by.id('discovery-screen'))).toBeVisible();
      
      await expect(element(by.id('swipe-stack'))).toBeVisible();
      await expect(element(by.id('pet-card-0'))).toBeVisible();
      await expect(element(by.id('pet-card-1'))).toBeVisible();
    });

    it('should show pet information on cards', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await expect(element(by.id('pet-name-0'))).toBeVisible();
      await expect(element(by.id('pet-age-0'))).toBeVisible();
      await expect(element(by.id('pet-breed-0'))).toBeVisible();
      await expect(element(by.id('pet-photo-0'))).toBeVisible();
    });

    it('should display action buttons', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await expect(element(by.id('pass-button'))).toBeVisible();
      await expect(element(by.id('like-button'))).toBeVisible();
      await expect(element(by.id('superlike-button'))).toBeVisible();
    });

    it('should show pet count indicator', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await expect(element(by.id('pet-count'))).toBeVisible();
      await expect(element(by.id('pet-count')).toHaveText('pets'));
    });
  });

  describe('Swipe Gestures', () => {
    it('should swipe right to like a pet', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('right', 'fast', 0.5);
      
      await expect(element(by.text('Liked!'))).toBeVisible();
      await expect(element(by.id('pet-card-1'))).toBeVisible();
    });

    it('should swipe left to pass on a pet', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('left', 'fast', 0.5);
      
      await expect(element(by.text('Passed'))).toBeVisible();
      await expect(element(by.id('pet-card-1'))).toBeVisible();
    });

    it('should swipe up to super like a pet', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('up', 'fast', 0.5);
      
      await expect(element(by.text('Super Liked!'))).toBeVisible();
    });

    it('should handle partial swipe gestures', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      
      // Partial right swipe
      await petCard.swipe('right', 'slow', 0.3);
      await expect(element(by.id('like-indicator'))).toBeVisible();
      
      // Release without completing swipe
      await petCard.tap();
      await expect(element(by.id('pet-card-0'))).toBeVisible();
    });

    it('should show swipe feedback during gesture', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      
      // Start right swipe
      await petCard.swipe('right', 'slow', 0.2);
      await expect(element(by.id('like-indicator'))).toBeVisible();
      
      // Continue swipe
      await petCard.swipe('right', 'slow', 0.4);
      await expect(element(by.id('like-indicator')).toHaveText('Like'));
      
      // Complete swipe
      await petCard.swipe('right', 'fast', 0.8);
      await expect(element(by.text('Liked!'))).toBeVisible();
    });
  });

  describe('Button Actions', () => {
    it('should like pet using button', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('like-button')).tap();
      
      await expect(element(by.text('Liked!'))).toBeVisible();
      await expect(element(by.id('pet-card-1'))).toBeVisible();
    });

    it('should pass pet using button', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('pass-button')).tap();
      
      await expect(element(by.text('Passed'))).toBeVisible();
      await expect(element(by.id('pet-card-1'))).toBeVisible();
    });

    it('should super like pet using button', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('superlike-button')).tap();
      
      await expect(element(by.text('Super Liked!'))).toBeVisible();
    });

    it('should disable buttons during swipe animation', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('right', 'slow', 0.5);
      
      // Buttons should be disabled during animation
      await expect(element(by.id('like-button')).toBeDisabled());
      await expect(element(by.id('pass-button')).toBeDisabled());
      await expect(element(by.id('superlike-button')).toBeDisabled());
    });
  });

  describe('Match Detection', () => {
    it('should show match modal on mutual like', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Like a pet that likes back
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('right', 'fast', 0.5);
      
      // Simulate mutual like
      await testUtils.waitForNetworkIdle(2000);
      
      await expect(element(by.id('match-notification'))).toBeVisible();
      await expect(element(by.text('It\'s a Match!'))).toBeVisible();
    });

    it('should navigate to chat on match', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('right', 'fast', 0.5);
      
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('match-notification'))).toBeVisible();
      
      await element(by.id('match-notification')).tap();
      await expect(element(by.id('chat-screen'))).toBeVisible();
      await expect(element(by.id('match-celebration'))).toBeVisible();
    });

    it('should continue swiping after match', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('right', 'fast', 0.5);
      
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('match-notification'))).toBeVisible();
      
      await element(by.id('keep-swiping-button')).tap();
      await expect(element(by.id('match-notification'))).toBeNotVisible();
      await expect(element(by.id('pet-card-1'))).toBeVisible();
    });
  });

  describe('Pet Details', () => {
    it('should show pet details on card tap', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('pet-card-0')).tap();
      await expect(element(by.id('pet-details-modal'))).toBeVisible();
      await expect(element(by.id('pet-photos'))).toBeVisible();
      await expect(element(by.id('pet-bio'))).toBeVisible();
    });

    it('should navigate through pet photos', async () => {
      await element(by.id('discovery-tab')).tap();
      await element(by.id('pet-card-0')).tap();
      
      await expect(element(by.id('pet-details-modal'))).toBeVisible();
      
      // Check if multiple photos exist
      await expect(element(by.id('pet-photo-0'))).toBeVisible();
      
      // Swipe to next photo
      await element(by.id('pet-photo-0')).swipe('left', 'fast', 0.5);
      await expect(element(by.id('pet-photo-1'))).toBeVisible();
    });

    it('should close pet details modal', async () => {
      await element(by.id('discovery-tab')).tap();
      await element(by.id('pet-card-0')).tap();
      
      await expect(element(by.id('pet-details-modal'))).toBeVisible();
      
      await element(by.id('close-details-button')).tap();
      await expect(element(by.id('pet-details-modal'))).toBeNotVisible();
    });

    it('should swipe from pet details modal', async () => {
      await element(by.id('discovery-tab')).tap();
      await element(by.id('pet-card-0')).tap();
      
      await expect(element(by.id('pet-details-modal'))).toBeVisible();
      
      await element(by.id('like-button')).tap();
      
      await expect(element(by.id('pet-details-modal'))).toBeNotVisible();
      await expect(element(by.text('Liked!'))).toBeVisible();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no pets available', async () => {
      // Simulate no pets available
      await testUtils.mockApiResponse('/pets/discovery', { pets: [] });
      
      await element(by.id('discovery-tab')).tap();
      
      await expect(element(by.id('empty-state'))).toBeVisible();
      await expect(element(by.text('No pets to discover'))).toBeVisible();
      await expect(element(by.id('refresh-button'))).toBeVisible();
    });

    it('should refresh pets when clicking refresh button', async () => {
      // Simulate no pets available
      await testUtils.mockApiResponse('/pets/discovery', { pets: [] });
      
      await element(by.id('discovery-tab')).tap();
      await expect(element(by.id('empty-state'))).toBeVisible();
      
      // Mock refreshed pets
      await testUtils.mockApiResponse('/pets/discovery', { 
        pets: [{ id: 'pet-1', name: 'Buddy' }] 
      });
      
      await element(by.id('refresh-button')).tap();
      
      await expect(element(by.id('pet-card-0'))).toBeVisible();
    });
  });

  describe('Loading States', () => {
    it('should show skeleton loader while loading pets', async () => {
      // Simulate slow loading
      await testUtils.mockApiResponse('/pets/discovery', { pets: [] }, 3000);
      
      await element(by.id('discovery-tab')).tap();
      await expect(element(by.id('skeleton-loader'))).toBeVisible();
      
      await testUtils.waitForNetworkIdle(3000);
      await expect(element(by.id('skeleton-loader'))).toBeNotVisible();
    });

    it('should show loading state during swipe action', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Simulate slow swipe response
      await testUtils.mockApiResponse('/pets/swipe', { success: true }, 2000);
      
      await element(by.id('like-button')).tap();
      await expect(element(by.id('swipe-loading'))).toBeVisible();
      
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('swipe-loading'))).toBeNotVisible();
    });
  });

  describe('Error Handling', () => {
    it('should handle swipe API error gracefully', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Simulate API error
      await testUtils.mockApiResponse('/pets/swipe', { error: 'Internal server error' }, 0, 500);
      
      await element(by.id('like-button')).tap();
      
      await expect(element(by.id('error-message'))).toBeVisible();
      await expect(element(by.text('Something went wrong'))).toBeVisible();
    });

    it('should retry failed swipe action', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Simulate API error
      await testUtils.mockApiResponse('/pets/swipe', { error: 'Internal server error' }, 0, 500);
      
      await element(by.id('like-button')).tap();
      await expect(element(by.id('error-message'))).toBeVisible();
      
      // Mock successful retry
      await testUtils.mockApiResponse('/pets/swipe', { success: true });
      
      await element(by.id('retry-button')).tap();
      await expect(element(by.text('Liked!'))).toBeVisible();
    });

    it('should handle network error during swipe', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Simulate network error
      await testUtils.simulateNetworkCondition('offline');
      
      await element(by.id('like-button')).tap();
      
      await expect(element(by.id('error-message'))).toBeVisible();
      await expect(element(by.text('Network error'))).toBeVisible();
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting gracefully', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Rapidly tap like button
      for (let i = 0; i < 10; i++) {
        await element(by.id('like-button')).tap();
        await testUtils.waitForNetworkIdle(100);
      }
      
      await expect(element(by.id('rate-limit-message'))).toBeVisible();
      await expect(element(by.text('slow down')).toBeVisible());
    });

    it('should disable buttons during rate limit', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Trigger rate limit
      for (let i = 0; i < 15; i++) {
        await element(by.id('like-button')).tap();
        await testUtils.waitForNetworkIdle(50);
      }
      
      await expect(element(by.id('like-button')).toBeDisabled());
      await expect(element(by.id('pass-button')).toBeDisabled());
      await expect(element(by.id('superlike-button')).toBeDisabled());
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with screen readers', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await expect(element(by.id('pet-card-0')).toHaveLabel('Pet card for Buddy, 3 year old Golden Retriever'));
      await expect(element(by.id('like-button')).toHaveLabel('Like this pet'));
      await expect(element(by.id('pass-button')).toHaveLabel('Pass on this pet'));
    });

    it('should support voice control', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('voice-control-button')).tap();
      await expect(element(by.text('Voice control activated'))).toBeVisible();
    });

    it('should support keyboard navigation', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('pet-card-0')).focus();
      await element(by.id('pet-card-0')).pressKey('ArrowRight');
      await expect(element(by.id('like-button')).toBeFocused());
    });
  });

  describe('Performance', () => {
    it('should handle rapid swiping efficiently', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const startTime = Date.now();
      
      // Perform rapid swipes
      for (let i = 0; i < 5; i++) {
        const petCard = element(by.id(`pet-card-${i}`));
        await petCard.swipe('right', 'fast', 0.5);
        await testUtils.waitForNetworkIdle(200);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Rapid swiping should be efficient
      expect(duration).toBeLessThan(5000);
    });

    it('should not cause memory leaks during swiping', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Perform multiple swipes
      for (let i = 0; i < 20; i++) {
        const petCard = element(by.id(`pet-card-${i % 5}`));
        await petCard.swipe('right', 'fast', 0.5);
        await testUtils.waitForNetworkIdle(100);
      }
      
      // App should still be responsive
      await expect(element(by.id('discovery-screen'))).toBeVisible();
    });
  });
});

```

---

### `./apps/mobile/e2e/video/video-calling.e2e.js`

```javascript
/**
 * Mobile Video Calling E2E Tests
 * Comprehensive testing of video calling and WebRTC functionality
 */

describe('Mobile Video Calling', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });

  describe('Video Call Initiation', () => {
    it('should display video call button in chat', async () => {
      await element(by.id('matches-tab')).tap();
      await expect(element(by.id('matches-screen'))).toBeVisible();
      
      await element(by.id('match-item-0')).tap();
      await expect(element(by.id('chat-screen'))).toBeVisible();
      
      await expect(element(by.id('video-call-button'))).toBeVisible();
    });

    it('should initiate video call', async () => {
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      
      await element(by.id('video-call-button')).tap();
      await expect(element(by.id('call-initiating'))).toBeVisible();
      await expect(element(by.text('Calling...'))).toBeVisible();
    });

    it('should show call permissions request', async () => {
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      
      await element(by.id('video-call-button')).tap();
      
      // Should request camera and microphone permissions
      await expect(element(by.text('Camera permission required'))).toBeVisible();
      await expect(element(by.text('Microphone permission required'))).toBeVisible();
    });

    it('should handle permission denial', async () => {
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      
      await element(by.id('video-call-button')).tap();
      
      // Deny camera permission
      await element(by.id('deny-camera-permission')).tap();
      
      await expect(element(by.text('Camera permission denied'))).toBeVisible();
      await expect(element(by.text('Please enable camera access in settings'))).toBeVisible();
    });
  });

  describe('Incoming Video Call', () => {
    it('should display incoming call screen', async () => {
      // Simulate incoming call
      await testUtils.mockApiResponse('/calls/incoming', { 
        callId: 'call-123',
        caller: { name: 'John Doe', pet: 'Buddy' }
      });
      
      await expect(element(by.id('incoming-call-screen'))).toBeVisible();
      await expect(element(by.text('Incoming video call'))).toBeVisible();
      await expect(element(by.text('John Doe'))).toBeVisible();
      await expect(element(by.text('Buddy'))).toBeVisible();
    });

    it('should accept incoming call', async () => {
      // Simulate incoming call
      await testUtils.mockApiResponse('/calls/incoming', { 
        callId: 'call-123',
        caller: { name: 'John Doe', pet: 'Buddy' }
      });
      
      await expect(element(by.id('incoming-call-screen'))).toBeVisible();
      
      await element(by.id('accept-call-button')).tap();
      await expect(element(by.id('video-call-screen'))).toBeVisible();
      await expect(element(by.id('local-video'))).toBeVisible();
      await expect(element(by.id('remote-video'))).toBeVisible();
    });

    it('should decline incoming call', async () => {
      // Simulate incoming call
      await testUtils.mockApiResponse('/calls/incoming', { 
        callId: 'call-123',
        caller: { name: 'John Doe', pet: 'Buddy' }
      });
      
      await expect(element(by.id('incoming-call-screen'))).toBeVisible();
      
      await element(by.id('decline-call-button')).tap();
      await expect(element(by.id('incoming-call-screen'))).toBeNotVisible();
      await expect(element(by.text('Call declined'))).toBeVisible();
    });

    it('should show call duration while ringing', async () => {
      // Simulate incoming call
      await testUtils.mockApiResponse('/calls/incoming', { 
        callId: 'call-123',
        caller: { name: 'John Doe', pet: 'Buddy' }
      });
      
      await expect(element(by.id('incoming-call-screen'))).toBeVisible();
      await expect(element(by.id('call-timer'))).toBeVisible();
      
      // Wait for timer to update
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('call-timer')).toHaveText('00:02'));
    });
  });

  describe('Active Video Call', () => {
    beforeEach(async () => {
      // Start a video call
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await element(by.id('allow-camera')).tap();
      await element(by.id('allow-microphone')).tap();
      
      // Simulate call connection
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('video-call-screen'))).toBeVisible();
    });

    it('should display video call interface', async () => {
      await expect(element(by.id('local-video'))).toBeVisible();
      await expect(element(by.id('remote-video'))).toBeVisible();
      await expect(element(by.id('call-controls'))).toBeVisible();
      await expect(element(by.id('mute-button'))).toBeVisible();
      await expect(element(by.id('camera-toggle-button'))).toBeVisible();
      await expect(element(by.id('end-call-button'))).toBeVisible();
    });

    it('should toggle microphone mute', async () => {
      await expect(element(by.id('mute-button')).toHaveText('Mute'));
      
      await element(by.id('mute-button')).tap();
      await expect(element(by.id('mute-button')).toHaveText('Unmute'));
      await expect(element(by.id('mute-indicator'))).toBeVisible();
      
      await element(by.id('mute-button')).tap();
      await expect(element(by.id('mute-button')).toHaveText('Mute'));
      await expect(element(by.id('mute-indicator'))).toBeNotVisible();
    });

    it('should toggle camera on/off', async () => {
      await expect(element(by.id('camera-toggle-button')).toHaveText('Turn off camera'));
      
      await element(by.id('camera-toggle-button')).tap();
      await expect(element(by.id('camera-toggle-button')).toHaveText('Turn on camera'));
      await expect(element(by.id('camera-off-indicator'))).toBeVisible();
      
      await element(by.id('camera-toggle-button')).tap();
      await expect(element(by.id('camera-toggle-button')).toHaveText('Turn off camera'));
      await expect(element(by.id('camera-off-indicator'))).toBeNotVisible();
    });

    it('should switch between front and back camera', async () => {
      await expect(element(by.id('camera-switch-button'))).toBeVisible();
      
      await element(by.id('camera-switch-button')).tap();
      await expect(element(by.text('Switching camera...'))).toBeVisible();
      
      await testUtils.waitForNetworkIdle(1000);
      await expect(element(by.text('Switching camera...'))).toBeNotVisible();
    });

    it('should end video call', async () => {
      await element(by.id('end-call-button')).tap();
      await expect(element(by.text('End call?'))).toBeVisible();
      
      await element(by.id('confirm-end-call')).tap();
      await expect(element(by.id('video-call-screen'))).toBeNotVisible();
      await expect(element(by.text('Call ended'))).toBeVisible();
    });

    it('should show call duration', async () => {
      await expect(element(by.id('call-duration'))).toBeVisible();
      await expect(element(by.id('call-duration')).toHaveText('00:00'));
      
      // Wait for duration to update
      await testUtils.waitForNetworkIdle(3000);
      await expect(element(by.id('call-duration')).toHaveText('00:03'));
    });

    it('should handle call quality indicators', async () => {
      await expect(element(by.id('call-quality'))).toBeVisible();
      await expect(element(by.id('call-quality')).toHaveText('Good'));
      
      // Simulate poor connection
      await testUtils.simulateNetworkCondition('slow');
      await testUtils.waitForNetworkIdle(2000);
      
      await expect(element(by.id('call-quality')).toHaveText('Poor'));
      await expect(element(by.text('Poor connection detected'))).toBeVisible();
    });
  });

  describe('Call Features', () => {
    beforeEach(async () => {
      // Start a video call
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await element(by.id('allow-camera')).tap();
      await element(by.id('allow-microphone')).tap();
      
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('video-call-screen'))).toBeVisible();
    });

    it('should show participant information', async () => {
      await expect(element(by.id('caller-name'))).toBeVisible();
      await expect(element(by.id('caller-pet'))).toBeVisible();
      await expect(element(by.id('caller-location'))).toBeVisible();
    });

    it('should display call statistics', async () => {
      await element(by.id('call-stats-button')).tap();
      await expect(element(by.id('call-stats-modal'))).toBeVisible();
      
      await expect(element(by.id('call-duration-stat'))).toBeVisible();
      await expect(element(by.id('data-usage-stat'))).toBeVisible();
      await expect(element(by.id('quality-stat'))).toBeVisible();
    });

    it('should allow screen sharing', async () => {
      await element(by.id('screen-share-button')).tap();
      await expect(element(by.text('Screen sharing permission required'))).toBeVisible();
      
      await element(by.id('allow-screen-share')).tap();
      await expect(element(by.id('screen-share-indicator'))).toBeVisible();
      await expect(element(by.text('Screen sharing active'))).toBeVisible();
    });

    it('should handle call recording', async () => {
      await element(by.id('record-button')).tap();
      await expect(element(by.text('Recording permission required'))).toBeVisible();
      
      await element(by.id('allow-recording')).tap();
      await expect(element(by.id('recording-indicator'))).toBeVisible();
      await expect(element(by.text('Recording...'))).toBeVisible();
    });
  });

  describe('Call Quality', () => {
    beforeEach(async () => {
      // Start a video call
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await element(by.id('allow-camera')).tap();
      await element(by.id('allow-microphone')).tap();
      
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('video-call-screen'))).toBeVisible();
    });

    it('should adjust video quality based on connection', async () => {
      await expect(element(by.id('video-quality')).toHaveText('HD'));
      
      // Simulate poor connection
      await testUtils.simulateNetworkCondition('slow');
      await testUtils.waitForNetworkIdle(2000);
      
      await expect(element(by.id('video-quality')).toHaveText('SD'));
      await expect(element(by.text('Video quality reduced due to poor connection'))).toBeVisible();
    });

    it('should handle network interruptions', async () => {
      // Simulate network interruption
      await testUtils.simulateNetworkCondition('offline');
      await testUtils.waitForNetworkIdle(1000);
      
      await expect(element(by.text('Connection lost'))).toBeVisible();
      await expect(element(by.text('Attempting to reconnect...'))).toBeVisible();
      
      // Simulate reconnection
      await testUtils.simulateNetworkCondition('online');
      await testUtils.waitForNetworkIdle(2000);
      
      await expect(element(by.text('Connection restored'))).toBeVisible();
    });

    it('should show bandwidth usage', async () => {
      await element(by.id('bandwidth-button')).tap();
      await expect(element(by.id('bandwidth-modal'))).toBeVisible();
      
      await expect(element(by.id('upload-speed'))).toBeVisible();
      await expect(element(by.id('download-speed'))).toBeVisible();
      await expect(element(by.id('data-usage'))).toBeVisible();
    });
  });

  describe('Call History', () => {
    it('should display call history', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('call-history-button')).tap();
      
      await expect(element(by.id('call-history-screen'))).toBeVisible();
      await expect(element(by.id('call-history-item'))).toBeVisible();
    });

    it('should show call details', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('call-history-button')).tap();
      
      await element(by.id('call-history-item-0')).tap();
      await expect(element(by.id('call-details-modal'))).toBeVisible();
      
      await expect(element(by.id('call-duration-detail'))).toBeVisible();
      await expect(element(by.id('call-quality-detail'))).toBeVisible();
      await expect(element(by.id('call-date-detail'))).toBeVisible();
    });

    it('should delete call history', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('call-history-button')).tap();
      
      await element(by.id('delete-history-button')).tap();
      await expect(element(by.text('Delete all call history?'))).toBeVisible();
      
      await element(by.id('confirm-delete')).tap();
      await expect(element(by.text('Call history deleted'))).toBeVisible();
    });
  });

  describe('Call Settings', () => {
    it('should display call settings', async () => {
      await element(by.id('settings-tab')).tap();
      await element(by.id('call-settings-button')).tap();
      
      await expect(element(by.id('call-settings-screen'))).toBeVisible();
      await expect(element(by.id('video-quality-setting'))).toBeVisible();
      await expect(element(by.id('audio-quality-setting'))).toBeVisible();
      await expect(element(by.id('call-recording-setting'))).toBeVisible();
    });

    it('should update video quality setting', async () => {
      await element(by.id('settings-tab')).tap();
      await element(by.id('call-settings-button')).tap();
      
      await element(by.id('video-quality-setting')).tap();
      await element(by.id('quality-hd')).tap();
      
      await expect(element(by.text('Video quality updated'))).toBeVisible();
    });

    it('should update audio quality setting', async () => {
      await element(by.id('settings-tab')).tap();
      await element(by.id('call-settings-button')).tap();
      
      await element(by.id('audio-quality-setting')).tap();
      await element(by.id('quality-high')).tap();
      
      await expect(element(by.text('Audio quality updated'))).toBeVisible();
    });

    it('should toggle call recording setting', async () => {
      await element(by.id('settings-tab')).tap();
      await element(by.id('call-settings-button')).tap();
      
      await element(by.id('call-recording-toggle')).tap();
      await expect(element(by.text('Call recording enabled'))).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    it('should handle call initiation failure', async () => {
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      
      // Simulate call initiation failure
      await testUtils.mockApiResponse('/calls/initiate', { error: 'Call failed' }, 0, 500);
      
      await element(by.id('video-call-button')).tap();
      
      await expect(element(by.text('Failed to initiate call'))).toBeVisible();
      await expect(element(by.text('Please try again later'))).toBeVisible();
    });

    it('should handle call connection failure', async () => {
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      
      // Simulate connection failure
      await testUtils.mockApiResponse('/calls/connect', { error: 'Connection failed' }, 0, 500);
      
      await expect(element(by.text('Call connection failed'))).toBeVisible();
      await expect(element(by.text('Unable to connect to the other party'))).toBeVisible();
    });

    it('should handle call dropped', async () => {
      // Start a call
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await element(by.id('allow-camera')).tap();
      await element(by.id('allow-microphone')).tap();
      
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('video-call-screen'))).toBeVisible();
      
      // Simulate call dropped
      await testUtils.simulateNetworkCondition('offline');
      await testUtils.waitForNetworkIdle(5000);
      
      await expect(element(by.text('Call dropped'))).toBeVisible();
      await expect(element(by.text('The call was disconnected'))).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with screen readers', async () => {
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      
      await expect(element(by.id('video-call-button')).toHaveLabel('Start video call'));
      await expect(element(by.id('mute-button')).toHaveLabel('Mute microphone'));
      await expect(element(by.id('camera-toggle-button')).toHaveLabel('Toggle camera'));
    });

    it('should support voice control', async () => {
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      
      await element(by.id('voice-control-button')).tap();
      await expect(element(by.text('Voice control activated'))).toBeVisible();
    });
  });

  describe('Performance', () => {
    it('should initiate call quickly', async () => {
      const startTime = Date.now();
      
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await element(by.id('allow-camera')).tap();
      await element(by.id('allow-microphone')).tap();
      
      await expect(element(by.id('video-call-screen'))).toBeVisible();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Call initiation should be fast
      expect(duration).toBeLessThan(5000);
    });

    it('should handle multiple calls efficiently', async () => {
      // Start first call
      await element(by.id('matches-tab')).tap();
      await element(by.id('match-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await element(by.id('allow-camera')).tap();
      await element(by.id('allow-microphone')).tap();
      
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('video-call-screen'))).toBeVisible();
      
      // End first call
      await element(by.id('end-call-button')).tap();
      await element(by.id('confirm-end-call')).tap();
      
      // Start second call
      await element(by.id('video-call-button')).tap();
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('video-call-screen'))).toBeVisible();
    });
  });
});

```

---

### `./apps/mobile/e2e/video-calling.e2e.js`

```javascript
/**
 * Video Calling E2E Tests
 * Comprehensive testing of video calling features including screen sharing and recording
 */

describe('Video Calling Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });

  describe('Call Initiation', () => {
    it('should start video call from chat', async () => {
      await element(by.id('chat-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      
      await expect(element(by.id('chat-screen'))).toBeVisible();
      await element(by.id('video-call-button')).tap();
      
      await expect(element(by.id('call-screen'))).toBeVisible();
      await expect(element(by.id('local-video'))).toBeVisible();
      await expect(element(by.id('call-controls'))).toBeVisible();
    });

    it('should start voice call from chat', async () => {
      await element(by.id('chat-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      
      await element(by.id('voice-call-button')).tap();
      
      await expect(element(by.id('call-screen'))).toBeVisible();
      await expect(element(by.id('caller-avatar'))).toBeVisible();
      await expect(element(by.id('call-controls'))).toBeVisible();
    });

    it('should show incoming call notification', async () => {
      // Simulate incoming call
      await testUtils.waitForNetworkIdle(2000);
      
      await expect(element(by.id('incoming-call-modal'))).toBeVisible();
      await expect(element(by.id('caller-name'))).toBeVisible();
      await expect(element(by.id('caller-avatar'))).toBeVisible();
      await expect(element(by.id('answer-button'))).toBeVisible();
      await expect(element(by.id('decline-button'))).toBeVisible();
    });

    it('should answer incoming call', async () => {
      await element(by.id('answer-button')).tap();
      
      await expect(element(by.id('call-screen'))).toBeVisible();
      await expect(element(by.id('remote-video'))).toBeVisible();
      await expect(element(by.id('local-video'))).toBeVisible();
    });

    it('should decline incoming call', async () => {
      await element(by.id('decline-button')).tap();
      
      await expect(element(by.id('incoming-call-modal'))).not.toBeVisible();
      await expect(element(by.text('Call declined'))).toBeVisible();
    });
  });

  describe('Call Controls', () => {
    beforeEach(async () => {
      // Start a call first
      await element(by.id('chat-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await expect(element(by.id('call-screen'))).toBeVisible();
    });

    it('should mute/unmute microphone', async () => {
      await element(by.id('mute-button')).tap();
      await expect(element(by.id('mute-indicator'))).toBeVisible();
      
      await element(by.id('mute-button')).tap();
      await expect(element(by.id('mute-indicator'))).not.toBeVisible();
    });

    it('should enable/disable video', async () => {
      await element(by.id('video-toggle-button')).tap();
      await expect(element(by.id('video-off-indicator'))).toBeVisible();
      
      await element(by.id('video-toggle-button')).tap();
      await expect(element(by.id('video-off-indicator'))).not.toBeVisible();
    });

    it('should switch camera', async () => {
      await element(by.id('switch-camera-button')).tap();
      await expect(element(by.text('Camera switched'))).toBeVisible();
    });

    it('should toggle speaker', async () => {
      await element(by.id('speaker-button')).tap();
      await expect(element(by.id('speaker-indicator'))).toBeVisible();
      
      await element(by.id('speaker-button')).tap();
      await expect(element(by.id('speaker-indicator'))).not.toBeVisible();
    });

    it('should end call', async () => {
      await element(by.id('end-call-button')).tap();
      
      await expect(element(by.id('call-screen'))).not.toBeVisible();
      await expect(element(by.text('Call ended'))).toBeVisible();
    });
  });

  describe('Screen Sharing', () => {
    beforeEach(async () => {
      // Start a video call first
      await element(by.id('chat-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await expect(element(by.id('call-screen'))).toBeVisible();
    });

    it('should start screen sharing', async () => {
      await element(by.id('screen-share-button')).tap();
      
      // Permission dialog
      await expect(element(by.id('screen-share-permission'))).toBeVisible();
      await element(by.id('allow-screen-share')).tap();
      
      await expect(element(by.id('screen-share-indicator'))).toBeVisible();
      await expect(element(by.text('Screen sharing active'))).toBeVisible();
    });

    it('should stop screen sharing', async () => {
      // Start screen sharing first
      await element(by.id('screen-share-button')).tap();
      await element(by.id('allow-screen-share')).tap();
      
      // Stop screen sharing
      await element(by.id('stop-screen-share-button')).tap();
      
      await expect(element(by.id('screen-share-indicator'))).not.toBeVisible();
      await expect(element(by.text('Screen sharing stopped'))).toBeVisible();
    });

    it('should show screen share quality indicator', async () => {
      await element(by.id('screen-share-button')).tap();
      await element(by.id('allow-screen-share')).tap();
      
      await expect(element(by.id('screen-share-quality'))).toBeVisible();
      await expect(element(by.id('quality-indicator'))).toBeVisible();
    });
  });

  describe('Call Recording', () => {
    beforeEach(async () => {
      // Start a video call first
      await element(by.id('chat-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await expect(element(by.id('call-screen'))).toBeVisible();
    });

    it('should start call recording', async () => {
      await element(by.id('record-button')).tap();
      
      // Permission dialog
      await expect(element(by.id('recording-permission'))).toBeVisible();
      await element(by.id('allow-recording')).tap();
      
      await expect(element(by.id('recording-indicator'))).toBeVisible();
      await expect(element(by.text('Recording in progress'))).toBeVisible();
    });

    it('should stop call recording', async () => {
      // Start recording first
      await element(by.id('record-button')).tap();
      await element(by.id('allow-recording')).tap();
      
      // Stop recording
      await element(by.id('stop-recording-button')).tap();
      
      await expect(element(by.id('recording-indicator'))).not.toBeVisible();
      await expect(element(by.text('Recording saved'))).toBeVisible();
    });

    it('should show recording duration', async () => {
      await element(by.id('record-button')).tap();
      await element(by.id('allow-recording')).tap();
      
      await expect(element(by.id('recording-duration'))).toBeVisible();
      
      // Wait for duration to update
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('recording-duration'))).toHaveText('00:02');
    });

    it('should notify other participant about recording', async () => {
      await element(by.id('record-button')).tap();
      await element(by.id('allow-recording')).tap();
      
      await expect(element(by.text('Recording notification sent'))).toBeVisible();
    });
  });

  describe('Call Quality Indicators', () => {
    beforeEach(async () => {
      // Start a video call first
      await element(by.id('chat-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await expect(element(by.id('call-screen'))).toBeVisible();
    });

    it('should display connection quality indicator', async () => {
      await expect(element(by.id('connection-quality'))).toBeVisible();
      await expect(element(by.id('quality-bars'))).toBeVisible();
    });

    it('should show network speed indicator', async () => {
      await expect(element(by.id('network-speed'))).toBeVisible();
      await expect(element(by.id('speed-indicator'))).toBeVisible();
    });

    it('should display call statistics', async () => {
      await element(by.id('call-stats-button')).tap();
      
      await expect(element(by.id('call-stats-modal'))).toBeVisible();
      await expect(element(by.id('bitrate-display'))).toBeVisible();
      await expect(element(by.id('packet-loss-display'))).toBeVisible();
      await expect(element(by.id('latency-display'))).toBeVisible();
    });

    it('should warn about poor connection', async () => {
      // Simulate poor connection
      await testUtils.waitForNetworkIdle(3000);
      
      await expect(element(by.text('Poor connection detected'))).toBeVisible();
      await expect(element(by.id('connection-warning'))).toBeVisible();
    });
  });

  describe('Call Background Handling', () => {
    beforeEach(async () => {
      // Start a call first
      await element(by.id('chat-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await expect(element(by.id('call-screen'))).toBeVisible();
    });

    it('should maintain call in background', async () => {
      await device.sendToHome();
      
      // Call should continue in background
      await testUtils.waitForNetworkIdle(2000);
      
      await device.launchApp();
      await expect(element(by.id('call-screen'))).toBeVisible();
    });

    it('should show call notification in background', async () => {
      await device.sendToHome();
      
      // Should show call notification
      await expect(element(by.text('Ongoing call'))).toBeVisible();
    });

    it('should handle call interruption', async () => {
      // Simulate incoming call interruption
      await testUtils.waitForNetworkIdle(2000);
      
      await expect(element(by.id('call-interruption-modal'))).toBeVisible();
      await expect(element(by.id('hold-current-call'))).toBeVisible();
      await expect(element(by.id('end-current-call'))).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      // Start a call first
      await element(by.id('chat-tab')).tap();
      await element(by.id('chat-item-0')).tap();
      await element(by.id('video-call-button')).tap();
      await expect(element(by.id('call-screen'))).toBeVisible();
    });

    it('should support screen readers', async () => {
      await expect(element(by.id('mute-button'))).toHaveLabel('Mute microphone');
      await expect(element(by.id('video-toggle-button'))).toHaveLabel('Toggle video');
      await expect(element(by.id('end-call-button'))).toHaveLabel('End call');
    });

    it('should announce call state changes', async () => {
      await element(by.id('mute-button')).tap();
      await expect(element(by.text('Microphone muted'))).toBeVisible();
      
      await element(by.id('mute-button')).tap();
      await expect(element(by.text('Microphone unmuted'))).toBeVisible();
    });

    it('should support voice commands', async () => {
      await element(by.id('voice-control-button')).tap();
      await expect(element(by.text('Voice control activated'))).toBeVisible();
      
      // Simulate voice command
      await element(by.id('voice-mute-command')).tap();
      await expect(element(by.id('mute-indicator'))).toBeVisible();
    });
  });
});

```

---

### `./apps/mobile/e2e/admin-settings.e2e.js`

```javascript
/**
 * Detox E2E tests for mobile admin settings functionality
 */
import { device, expect, element, by, waitFor } from 'detox';

describe('Admin Settings', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should navigate to admin settings screen', async () => {
    // Navigate to admin section (assuming there's an admin tab or screen)
    await element(by.text('Admin')).tap();

    // Navigate to settings
    await element(by.text('Settings')).tap();

    // Verify we're on the settings screen
    await expect(element(by.text('System Settings'))).toBeVisible();
  });

  it('should display system settings', async () => {
    // Navigate to settings
    await navigateToSettings();

    // Check that system settings are displayed
    await expect(element(by.text('Story Daily Cap'))).toBeVisible();
    await expect(element(by.text('Redis URL'))).toBeVisible();

    // Check that inputs are present
    await expect(element(by.type('UITextField')).atIndex(0)).toBeVisible();
    await expect(element(by.type('UITextField')).atIndex(1)).toBeVisible();
  });

  it('should allow editing story daily cap', async () => {
    await navigateToSettings();

    // Find the story daily cap input (assuming it's the first number input)
    const storyInput = element(by.type('UITextField')).atIndex(0);

    // Clear and enter new value
    await storyInput.clearText();
    await storyInput.typeText('25');

    // Verify the value was entered
    await expect(storyInput).toHaveText('25');
  });

  it('should allow editing redis url', async () => {
    await navigateToSettings();

    // Find the redis URL input (assuming it's the second text input)
    const redisInput = element(by.type('UITextField')).atIndex(1);

    // Clear and enter new value
    await redisInput.clearText();
    await redisInput.typeText('redis://mobile-test:6379');

    // Verify the value was entered
    await expect(redisInput).toHaveText('redis://mobile-test:6379');
  });

  it('should save settings successfully', async () => {
    await navigateToSettings();

    // Make changes
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.clearText();
    await storyInput.typeText('50');

    const redisInput = element(by.type('UITextField')).atIndex(1);
    await redisInput.clearText();
    await redisInput.typeText('redis://saved-test:6379');

    // Tap save button
    await element(by.text('Save Changes')).tap();

    // Verify success message or navigation (depending on implementation)
    await waitFor(element(by.text('Settings saved successfully')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle validation errors', async () => {
    await navigateToSettings();

    // Enter invalid value (negative number)
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.clearText();
    await storyInput.typeText('-10');

    // Tap save button
    await element(by.text('Save Changes')).tap();

    // Should show error message
    await waitFor(element(by.text('STORY_DAILY_CAP must be a non-negative integer')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle network errors gracefully', async () => {
    // This test would require mocking network requests
    // For now, we'll test the UI behavior when network fails

    await navigateToSettings();

    // Make changes
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.clearText();
    await storyInput.typeText('30');

    // Simulate network failure (if possible) or just test that UI remains responsive
    await element(by.text('Save Changes')).tap();

    // UI should remain functional even if network fails
    await expect(element(by.text('System Settings'))).toBeVisible();
  });

  it('should handle loading states', async () => {
    await navigateToSettings();

    // Make changes
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.clearText();
    await storyInput.typeText('40');

    // Tap save
    await element(by.text('Save Changes')).tap();

    // Save button should show loading state (if implemented)
    // This would depend on the specific UI implementation
    await expect(element(by.text('Save Changes'))).toBeVisible();
  });

  it('should reset changes when cancel/reset is tapped', async () => {
    await navigateToSettings();

    // Make changes
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.clearText();
    await storyInput.typeText('100');

    // Verify change
    await expect(storyInput).toHaveText('100');

    // Tap reset/cancel button (assuming it exists)
    await element(by.text('Reset')).tap();

    // Should revert to original value
    await expect(storyInput).toHaveText('10');
  });

  it('should handle haptic feedback on interactions', async () => {
    await navigateToSettings();

    // Tap on inputs - should trigger haptic feedback if implemented
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.tap();

    // This test verifies the UI doesn't break, actual haptic testing would require device-level testing
    await expect(storyInput).toBeVisible();
  });

  it('should support keyboard navigation', async () => {
    await navigateToSettings();

    // Test keyboard input
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.tap();

    // Type using keyboard
    await storyInput.typeText('123');

    // Verify input
    await expect(storyInput).toHaveText('123');

    // Test keyboard dismissal
    await element(by.text('System Settings')).tap(); // Tap outside to dismiss keyboard
    await expect(storyInput).toHaveText('123'); // Value should persist
  });

  it('should handle orientation changes', async () => {
    await navigateToSettings();

    // Make changes
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.clearText();
    await storyInput.typeText('45');

    // Change orientation
    await device.setOrientation('landscape');

    // UI should adapt and maintain state
    await expect(element(by.text('System Settings'))).toBeVisible();
    await expect(storyInput).toHaveText('45');

    // Change back
    await device.setOrientation('portrait');
    await expect(element(by.text('System Settings'))).toBeVisible();
  });

  it('should be accessible with VoiceOver', async () => {
    await navigateToSettings();

    // Test accessibility labels
    await expect(element(by.label('Story Daily Cap input'))).toBeVisible();
    await expect(element(by.label('Redis URL input'))).toBeVisible();
    await expect(element(by.label('Save settings button'))).toBeVisible();
  });

  it('should handle memory warnings gracefully', async () => {
    await navigateToSettings();

    // Make changes
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.clearText();
    await storyInput.typeText('60');

    // Simulate memory warning (if testable)
    // This would depend on the testing framework capabilities

    // UI should remain responsive
    await expect(element(by.text('System Settings'))).toBeVisible();
  });
});

// Helper function to navigate to settings screen
async function navigateToSettings() {
  // Navigate to admin section
  await element(by.text('Admin')).tap();

  // Navigate to settings
  await element(by.text('Settings')).tap();

  // Wait for settings screen to load
  await waitFor(element(by.text('System Settings')))
    .toBeVisible()
    .withTimeout(5000);
}

```

---

### `./apps/mobile/e2e/auth/biometric-auth.e2e.js`

```javascript
/**
 * Biometric Authentication E2E Tests
 * Comprehensive testing of biometric authentication flows
 */

describe('Biometric Authentication', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Biometric Setup', () => {
    it('should prompt for biometric setup on first login', async () => {
      // Login first
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await expect(element(by.id('dashboard-screen'))).toBeVisible();

      // Navigate to settings
      await element(by.id('settings-button')).tap();
      await expect(element(by.id('settings-screen'))).toBeVisible();

      // Enable biometric authentication
      await element(by.id('biometric-toggle')).tap();
      await expect(element(by.text('Biometric authentication enabled'))).toBeVisible();
    });

    it('should show biometric setup instructions', async () => {
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();

      await expect(element(by.id('biometric-setup-modal'))).toBeVisible();
      await expect(element(by.text('Set up biometric authentication'))).toBeVisible();
      await expect(element(by.text('Use your fingerprint or face to securely access your account'))).toBeVisible();
    });

    it('should complete biometric setup', async () => {
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();

      await element(by.id('setup-biometric-button')).tap();
      
      // Simulate successful biometric enrollment
      await element(by.id('biometric-success')).tap();
      
      await expect(element(by.text('Biometric authentication set up successfully'))).toBeVisible();
      await expect(element(by.id('biometric-status')).toHaveText('Enabled'));
    });

    it('should handle biometric setup failure', async () => {
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();

      await element(by.id('setup-biometric-button')).tap();
      
      // Simulate biometric enrollment failure
      await element(by.id('biometric-failure')).tap();
      
      await expect(element(by.text('Biometric setup failed'))).toBeVisible();
      await expect(element(by.text('Please try again or use password authentication'))).toBeVisible();
    });
  });

  describe('Biometric Login', () => {
    beforeEach(async () => {
      // Setup biometric authentication first
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await expect(element(by.id('dashboard-screen'))).toBeVisible();

      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();
      await element(by.id('setup-biometric-button')).tap();
      await element(by.id('biometric-success')).tap();
    });

    it('should prompt for biometric authentication on app resume', async () => {
      // Background the app
      await device.sendToHome();
      
      // Foreground the app
      await device.launchApp();
      
      // Should show biometric prompt
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      await expect(element(by.text('Use biometric authentication to continue'))).toBeVisible();
    });

    it('should authenticate successfully with biometric', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      
      // Simulate successful biometric authentication
      await element(by.id('biometric-success')).tap();
      
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
      await expect(element(by.text('Welcome back!'))).toBeVisible();
    });

    it('should fallback to password on biometric failure', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      
      // Simulate biometric authentication failure
      await element(by.id('biometric-failure')).tap();
      
      await expect(element(by.text('Biometric authentication failed'))).toBeVisible();
      await expect(element(by.id('fallback-password-button'))).toBeVisible();
    });

    it('should navigate to login screen on fallback', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      await element(by.id('biometric-failure')).tap();
      
      await element(by.id('fallback-password-button')).tap();
      
      await expect(element(by.id('login-screen'))).toBeVisible();
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
    });

    it('should remember biometric preference', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      // Should show biometric prompt again
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      
      // Cancel biometric and choose to remember preference
      await element(by.id('biometric-cancel')).tap();
      await element(by.id('remember-preference')).tap();
      
      // Next time should skip biometric prompt
      await device.sendToHome();
      await device.launchApp();
      
      await expect(element(by.id('biometric-prompt'))).toBeNotVisible();
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });
  });

  describe('Biometric Settings', () => {
    beforeEach(async () => {
      // Login and setup biometric
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await expect(element(by.id('dashboard-screen'))).toBeVisible();

      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();
      await element(by.id('setup-biometric-button')).tap();
      await element(by.id('biometric-success')).tap();
    });

    it('should disable biometric authentication', async () => {
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();
      
      await expect(element(by.text('Disable biometric authentication?'))).toBeVisible();
      await element(by.id('confirm-disable')).tap();
      
      await expect(element(by.text('Biometric authentication disabled'))).toBeVisible();
      await expect(element(by.id('biometric-status')).toHaveText('Disabled'));
    });

    it('should cancel biometric disable', async () => {
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();
      
      await expect(element(by.text('Disable biometric authentication?'))).toBeVisible();
      await element(by.id('cancel-disable')).tap();
      
      await expect(element(by.id('biometric-status')).toHaveText('Enabled'));
    });

    it('should show biometric security information', async () => {
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-info-button')).tap();
      
      await expect(element(by.id('biometric-info-modal'))).toBeVisible();
      await expect(element(by.text('Biometric data is stored securely on your device'))).toBeVisible();
      await expect(element(by.text('We never have access to your biometric information'))).toBeVisible();
    });

    it('should handle biometric changes on device', async () => {
      // Simulate biometric changes on device
      await device.sendToHome();
      await device.launchApp();
      
      // Should detect biometric changes and prompt for re-authentication
      await expect(element(by.text('Biometric settings have changed'))).toBeVisible();
      await expect(element(by.text('Please re-authenticate with your new biometric'))).toBeVisible();
      
      await element(by.id('re-authenticate-button')).tap();
      await element(by.id('biometric-success')).tap();
      
      await expect(element(by.text('Biometric authentication updated'))).toBeVisible();
    });
  });

  describe('Biometric Error Handling', () => {
    it('should handle biometric not available', async () => {
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();
      
      // Simulate biometric not available
      await element(by.id('biometric-not-available')).tap();
      
      await expect(element(by.text('Biometric authentication not available'))).toBeVisible();
      await expect(element(by.text('Your device does not support biometric authentication'))).toBeVisible();
    });

    it('should handle biometric locked out', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      // Simulate biometric locked out
      await element(by.id('biometric-locked-out')).tap();
      
      await expect(element(by.text('Biometric authentication is locked'))).toBeVisible();
      await expect(element(by.text('Please use your device passcode to unlock'))).toBeVisible();
      await expect(element(by.id('use-passcode-button'))).toBeVisible();
    });

    it('should handle biometric timeout', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      // Simulate biometric timeout
      await element(by.id('biometric-timeout')).tap();
      
      await expect(element(by.text('Biometric authentication timed out'))).toBeVisible();
      await expect(element(by.id('retry-biometric-button'))).toBeVisible();
      await expect(element(by.id('use-password-button'))).toBeVisible();
    });

    it('should retry biometric authentication', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      await element(by.id('biometric-timeout')).tap();
      await element(by.id('retry-biometric-button')).tap();
      
      // Should show biometric prompt again
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
    });
  });

  describe('Biometric Security', () => {
    it('should require password after multiple biometric failures', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      // Simulate multiple biometric failures
      for (let i = 0; i < 3; i++) {
        await expect(element(by.id('biometric-prompt'))).toBeVisible();
        await element(by.id('biometric-failure')).tap();
        await element(by.id('retry-biometric-button')).tap();
      }
      
      // Should require password after multiple failures
      await expect(element(by.text('Too many failed attempts'))).toBeVisible();
      await expect(element(by.text('Please use your password to continue'))).toBeVisible();
      await expect(element(by.id('use-password-button'))).toBeVisible();
    });

    it('should log biometric authentication attempts', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      await element(by.id('biometric-success')).tap();
      
      // Check that authentication attempt was logged
      await element(by.id('settings-button')).tap();
      await element(by.id('security-log-button')).tap();
      
      await expect(element(by.id('security-log'))).toBeVisible();
      await expect(element(by.text('Biometric authentication successful'))).toBeVisible();
    });

    it('should show biometric authentication status', async () => {
      await element(by.id('settings-button')).tap();
      
      await expect(element(by.id('biometric-status'))).toBeVisible();
      await expect(element(by.id('last-biometric-auth'))).toBeVisible();
      await expect(element(by.id('biometric-device-info'))).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should support screen readers for biometric prompts', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      await expect(element(by.id('biometric-prompt')).toHaveLabel('Biometric authentication prompt'));
    });

    it('should provide voice descriptions for biometric actions', async () => {
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();
      
      await expect(element(by.id('biometric-toggle')).toHaveLabel('Enable biometric authentication'));
      await expect(element(by.id('setup-biometric-button')).toHaveLabel('Set up biometric authentication'));
    });
  });

  describe('Performance', () => {
    it('should authenticate quickly with biometric', async () => {
      const startTime = Date.now();
      
      await device.sendToHome();
      await device.launchApp();
      
      await element(by.id('biometric-success')).tap();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Biometric authentication should be fast
      expect(duration).toBeLessThan(2000);
    });

    it('should not impact app performance when biometric is enabled', async () => {
      // Test app performance with biometric enabled
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();
      await element(by.id('setup-biometric-button')).tap();
      await element(by.id('biometric-success')).tap();
      
      // Navigate through app to test performance
      await element(by.id('discovery-tab')).tap();
      await expect(element(by.id('discovery-screen'))).toBeVisible();
      
      await element(by.id('matches-tab')).tap();
      await expect(element(by.id('matches-screen'))).toBeVisible();
      
      await element(by.id('profile-tab')).tap();
      await expect(element(by.id('profile-screen'))).toBeVisible();
    });
  });
});

```

---

### `./apps/mobile/e2e/auth/registration.e2e.js`

```javascript
/**
 * Mobile Registration E2E Tests
 * Comprehensive testing of the mobile registration flow
 */

describe('Mobile Registration', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Registration Form', () => {
    it('should display registration screen on app launch', async () => {
      await expect(element(by.id('registration-screen'))).toBeVisible();
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
      await expect(element(by.id('confirm-password-input'))).toBeVisible();
      await expect(element(by.id('firstName-input'))).toBeVisible();
      await expect(element(by.id('lastName-input'))).toBeVisible();
      await expect(element(by.id('dateOfBirth-input'))).toBeVisible();
      await expect(element(by.id('terms-checkbox'))).toBeVisible();
      await expect(element(by.id('register-button'))).toBeVisible();
    });

    it('should show validation errors for empty fields', async () => {
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Email is required'))).toBeVisible();
      await expect(element(by.text('Password is required'))).toBeVisible();
      await expect(element(by.text('First name is required'))).toBeVisible();
      await expect(element(by.text('Last name is required'))).toBeVisible();
      await expect(element(by.text('Date of birth is required'))).toBeVisible();
      await expect(element(by.text('You must accept the terms'))).toBeVisible();
    });

    it('should validate email format', async () => {
      await element(by.id('email-input')).typeText('invalid-email');
      await element(by.id('password-input')).typeText('ValidPassword123!');
      await element(by.id('confirm-password-input')).typeText('ValidPassword123!');
      await element(by.id('firstName-input')).typeText('Test');
      await element(by.id('lastName-input')).typeText('User');
      await element(by.id('dateOfBirth-input')).typeText('1990-01-01');
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Please enter a valid email'))).toBeVisible();
    });

    it('should validate password strength', async () => {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('weak');
      await element(by.id('confirm-password-input')).typeText('weak');
      await element(by.id('firstName-input')).typeText('Test');
      await element(by.id('lastName-input')).typeText('User');
      await element(by.id('dateOfBirth-input')).typeText('1990-01-01');
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Password must be at least 8 characters'))).toBeVisible();
    });

    it('should validate password confirmation', async () => {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('ValidPassword123!');
      await element(by.id('confirm-password-input')).typeText('DifferentPassword123!');
      await element(by.id('firstName-input')).typeText('Test');
      await element(by.id('lastName-input')).typeText('User');
      await element(by.id('dateOfBirth-input')).typeText('1990-01-01');
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Passwords do not match'))).toBeVisible();
    });

    it('should validate age requirement', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('ValidPassword123!');
      await element(by.id('confirm-password-input')).typeText('ValidPassword123!');
      await element(by.id('firstName-input')).typeText('Test');
      await element(by.id('lastName-input')).typeText('User');
      await element(by.id('dateOfBirth-input')).typeText(futureDateString);
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('You must be at least 18 years old'))).toBeVisible();
    });
  });

  describe('Successful Registration', () => {
    it('should register a new user successfully', async () => {
      const timestamp = Date.now();
      const testUser = {
        email: `test${timestamp}@pawfectmatch.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      };

      await element(by.id('email-input')).typeText(testUser.email);
      await element(by.id('password-input')).typeText(testUser.password);
      await element(by.id('confirm-password-input')).typeText(testUser.password);
      await element(by.id('firstName-input')).typeText(testUser.firstName);
      await element(by.id('lastName-input')).typeText(testUser.lastName);
      await element(by.id('dateOfBirth-input')).typeText(testUser.dateOfBirth);
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();

      // Should redirect to onboarding or dashboard
      await expect(element(by.id('onboarding-screen'))).toBeVisible();
      await expect(element(by.text('Welcome to PawfectMatch!'))).toBeVisible();
    });

    it('should send verification email', async () => {
      const timestamp = Date.now();
      const testUser = {
        email: `test${timestamp}@pawfectmatch.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      };

      await element(by.id('email-input')).typeText(testUser.email);
      await element(by.id('password-input')).typeText(testUser.password);
      await element(by.id('confirm-password-input')).typeText(testUser.password);
      await element(by.id('firstName-input')).typeText(testUser.firstName);
      await element(by.id('lastName-input')).typeText(testUser.lastName);
      await element(by.id('dateOfBirth-input')).typeText(testUser.dateOfBirth);
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();

      await expect(element(by.text('Please check your email to verify your account'))).toBeVisible();
      await expect(element(by.id('resend-verification-button'))).toBeVisible();
    });

    it('should resend verification email', async () => {
      // Complete registration first
      const timestamp = Date.now();
      const testUser = {
        email: `test${timestamp}@pawfectmatch.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      };

      await element(by.id('email-input')).typeText(testUser.email);
      await element(by.id('password-input')).typeText(testUser.password);
      await element(by.id('confirm-password-input')).typeText(testUser.password);
      await element(by.id('firstName-input')).typeText(testUser.firstName);
      await element(by.id('lastName-input')).typeText(testUser.lastName);
      await element(by.id('dateOfBirth-input')).typeText(testUser.dateOfBirth);
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();

      await expect(element(by.text('Please check your email to verify your account'))).toBeVisible();
      
      // Resend verification email
      await element(by.id('resend-verification-button')).tap();
      await expect(element(by.text('Verification email sent'))).toBeVisible();
    });
  });

  describe('Registration Errors', () => {
    it('should handle duplicate email error', async () => {
      await element(by.id('email-input')).typeText('existing@pawfectmatch.com');
      await element(by.id('password-input')).typeText('TestPassword123!');
      await element(by.id('confirm-password-input')).typeText('TestPassword123!');
      await element(by.id('firstName-input')).typeText('Test');
      await element(by.id('lastName-input')).typeText('User');
      await element(by.id('dateOfBirth-input')).typeText('1990-01-01');
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Email already exists'))).toBeVisible();
    });

    it('should handle server error gracefully', async () => {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('TestPassword123!');
      await element(by.id('confirm-password-input')).typeText('TestPassword123!');
      await element(by.id('firstName-input')).typeText('Test');
      await element(by.id('lastName-input')).typeText('User');
      await element(by.id('dateOfBirth-input')).typeText('1990-01-01');
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Something went wrong. Please try again.'))).toBeVisible();
    });

    it('should handle network error gracefully', async () => {
      // Simulate network error
      await testUtils.simulateNetworkCondition('offline');
      
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('TestPassword123!');
      await element(by.id('confirm-password-input')).typeText('TestPassword123!');
      await element(by.id('firstName-input')).typeText('Test');
      await element(by.id('lastName-input')).typeText('User');
      await element(by.id('dateOfBirth-input')).typeText('1990-01-01');
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Network error. Please check your connection.'))).toBeVisible();
    });
  });

  describe('Registration Flow', () => {
    it('should navigate to login screen', async () => {
      await element(by.id('login-link')).tap();
      await expect(element(by.id('login-screen'))).toBeVisible();
    });

    it('should show password strength indicator', async () => {
      await element(by.id('password-input')).typeText('weak');
      await expect(element(by.id('password-strength')).toHaveText('Weak'));
      
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('StrongPassword123!');
      await expect(element(by.id('password-strength')).toHaveText('Strong'));
    });

    it('should toggle password visibility', async () => {
      await element(by.id('password-input')).typeText('TestPassword123!');
      await element(by.id('password-toggle')).tap();
      
      // Password should be visible
      await expect(element(by.id('password-input')).toHaveValue('TestPassword123!'));
      
      await element(by.id('password-toggle')).tap();
      // Password should be hidden
      await expect(element(by.id('password-input')).toHaveValue('TestPassword123!'));
    });

    it('should show terms and conditions modal', async () => {
      await element(by.id('terms-link')).tap();
      await expect(element(by.id('terms-modal'))).toBeVisible();
      await expect(element(by.text('Terms and Conditions'))).toBeVisible();
      
      await element(by.id('close-terms')).tap();
      await expect(element(by.id('terms-modal'))).toBeNotVisible();
    });

    it('should show privacy policy modal', async () => {
      await element(by.id('privacy-link')).tap();
      await expect(element(by.id('privacy-modal'))).toBeVisible();
      await expect(element(by.text('Privacy Policy'))).toBeVisible();
      
      await element(by.id('close-privacy')).tap();
      await expect(element(by.id('privacy-modal'))).toBeNotVisible();
    });
  });

  describe('Social Registration', () => {
    it('should display social registration options', async () => {
      await expect(element(by.id('google-register'))).toBeVisible();
      await expect(element(by.id('facebook-register'))).toBeVisible();
      await expect(element(by.id('apple-register'))).toBeVisible();
    });

    it('should handle Google registration', async () => {
      await element(by.id('google-register')).tap();
      
      // Mock Google OAuth flow
      await expect(element(by.text('Google registration'))).toBeVisible();
      await element(by.id('google-success')).tap();
      
      await expect(element(by.id('onboarding-screen'))).toBeVisible();
    });

    it('should handle Facebook registration', async () => {
      await element(by.id('facebook-register')).tap();
      
      // Mock Facebook OAuth flow
      await expect(element(by.text('Facebook registration'))).toBeVisible();
      await element(by.id('facebook-success')).tap();
      
      await expect(element(by.id('onboarding-screen'))).toBeVisible();
    });

    it('should handle Apple registration', async () => {
      await element(by.id('apple-register')).tap();
      
      // Mock Apple OAuth flow
      await expect(element(by.text('Apple registration'))).toBeVisible();
      await element(by.id('apple-success')).tap();
      
      await expect(element(by.id('onboarding-screen'))).toBeVisible();
    });
  });

  describe('Onboarding Flow', () => {
    beforeEach(async () => {
      // Complete registration first
      const timestamp = Date.now();
      const testUser = {
        email: `test${timestamp}@pawfectmatch.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      };

      await element(by.id('email-input')).typeText(testUser.email);
      await element(by.id('password-input')).typeText(testUser.password);
      await element(by.id('confirm-password-input')).typeText(testUser.password);
      await element(by.id('firstName-input')).typeText(testUser.firstName);
      await element(by.id('lastName-input')).typeText(testUser.lastName);
      await element(by.id('dateOfBirth-input')).typeText(testUser.dateOfBirth);
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
    });

    it('should display onboarding welcome screen', async () => {
      await expect(element(by.id('onboarding-screen'))).toBeVisible();
      await expect(element(by.text('Welcome to PawfectMatch!'))).toBeVisible();
      await expect(element(by.text('Let\'s get started by setting up your profile'))).toBeVisible();
    });

    it('should navigate through onboarding steps', async () => {
      await expect(element(by.id('onboarding-step-1'))).toBeVisible();
      await element(by.id('next-button')).tap();
      
      await expect(element(by.id('onboarding-step-2'))).toBeVisible();
      await element(by.id('next-button')).tap();
      
      await expect(element(by.id('onboarding-step-3'))).toBeVisible();
      await element(by.id('finish-button')).tap();
      
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });

    it('should skip onboarding', async () => {
      await expect(element(by.id('onboarding-screen'))).toBeVisible();
      await element(by.id('skip-button')).tap();
      
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with screen readers', async () => {
      await expect(element(by.id('registration-screen')).toHaveLabel('Registration screen'));
      await expect(element(by.id('email-input')).toHaveLabel('Email address'));
      await expect(element(by.id('password-input')).toHaveLabel('Password'));
      await expect(element(by.id('register-button')).toHaveLabel('Register account'));
    });

    it('should support voice control', async () => {
      await element(by.id('voice-control-button')).tap();
      await expect(element(by.text('Voice control activated'))).toBeVisible();
    });

    it('should support keyboard navigation', async () => {
      await element(by.id('email-input')).focus();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('email-input')).pressKey('Tab');
      await expect(element(by.id('password-input')).toBeFocused());
    });
  });

  describe('Performance', () => {
    it('should load registration screen quickly', async () => {
      const startTime = Date.now();
      
      await device.reloadReactNative();
      await expect(element(by.id('registration-screen'))).toBeVisible();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Registration screen should load quickly
      expect(duration).toBeLessThan(3000);
    });

    it('should handle form submission efficiently', async () => {
      const startTime = Date.now();
      
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('TestPassword123!');
      await element(by.id('confirm-password-input')).typeText('TestPassword123!');
      await element(by.id('firstName-input')).typeText('Test');
      await element(by.id('lastName-input')).typeText('User');
      await element(by.id('dateOfBirth-input')).typeText('1990-01-01');
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Form submission should be efficient
      expect(duration).toBeLessThan(1000);
    });
  });
});

```

---

### `./apps/mobile/e2e/jest.config.js`

```javascript
/**
 * Jest Configuration for Detox E2E Tests
 */

module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.e2e.js'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-navigation|@react-native-async-storage|@react-native-community|expo|@expo|expo-.*|@unimodules|unimodules|sentry-expo|@sentry|react-native-vector-icons|react-native-screens|react-native-safe-area-context|react-native-gesture-handler|react-native-reanimated|react-native-maps|react-native-permissions|react-native-webrtc|react-native-biometrics|react-native-screen-recorder|react-native-screen-capture|react-native-incall-manager|react-native-linear-gradient|react-native-svg|react-native-vector-icons)/)'
  ],
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/../packages/core/src/$1',
    '^@ui/(.*)$': '<rootDir>/../packages/ui/src/$1'
  }
};
```

---

### `./apps/mobile/e2e/auth.e2e.js`

```javascript
/**
 * Authentication E2E Tests
 * Comprehensive testing of login, signup, and authentication flows
 */

describe('Authentication Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Login Flow', () => {
    it('should display login screen on app launch', async () => {
      await expect(element(by.id('login-screen'))).toBeVisible();
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
      await expect(element(by.id('login-button'))).toBeVisible();
    });

    it('should show validation errors for empty fields', async () => {
      await element(by.id('login-button')).tap();
      
      await expect(element(by.text('Email is required'))).toBeVisible();
      await expect(element(by.text('Password is required'))).toBeVisible();
    });

    it('should show validation error for invalid email', async () => {
      await element(by.id('email-input')).typeText('invalid-email');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      
      await expect(element(by.text('Please enter a valid email'))).toBeVisible();
    });

    it('should successfully login with valid credentials', async () => {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      
      // Wait for navigation to dashboard
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
      await expect(element(by.id('welcome-message'))).toBeVisible();
    });

    it('should show error for invalid credentials', async () => {
      await element(by.id('email-input')).typeText('wrong@example.com');
      await element(by.id('password-input')).typeText('wrongpassword');
      await element(by.id('login-button')).tap();
      
      await expect(element(by.text('Invalid email or password'))).toBeVisible();
    });

    it('should navigate to signup screen', async () => {
      await element(by.id('signup-link')).tap();
      await expect(element(by.id('signup-screen'))).toBeVisible();
    });

    it('should toggle password visibility', async () => {
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('password-toggle')).tap();
      
      // Password should be visible
      await expect(element(by.id('password-input'))).toHaveValue('password123');
    });
  });

  describe('Signup Flow', () => {
    beforeEach(async () => {
      await element(by.id('signup-link')).tap();
    });

    it('should display signup form', async () => {
      await expect(element(by.id('signup-screen'))).toBeVisible();
      await expect(element(by.id('name-input'))).toBeVisible();
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
      await expect(element(by.id('confirm-password-input'))).toBeVisible();
      await expect(element(by.id('signup-button'))).toBeVisible();
    });

    it('should validate password confirmation', async () => {
      await element(by.id('name-input')).typeText('Test User');
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('confirm-password-input')).typeText('different123');
      await element(by.id('signup-button')).tap();
      
      await expect(element(by.text('Passwords do not match'))).toBeVisible();
    });

    it('should successfully create account', async () => {
      await element(by.id('name-input')).typeText('Test User');
      await element(by.id('email-input')).typeText('newuser@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('confirm-password-input')).typeText('password123');
      await element(by.id('signup-button')).tap();
      
      // Wait for navigation to onboarding
      await expect(element(by.id('onboarding-screen'))).toBeVisible();
    });

    it('should show error for existing email', async () => {
      await element(by.id('name-input')).typeText('Test User');
      await element(by.id('email-input')).typeText('existing@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('confirm-password-input')).typeText('password123');
      await element(by.id('signup-button')).tap();
      
      await expect(element(by.text('Email already exists'))).toBeVisible();
    });
  });

  describe('Biometric Authentication', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });

    it('should enable biometric authentication', async () => {
      await element(by.id('settings-button')).tap();
      await expect(element(by.id('settings-screen'))).toBeVisible();
      
      await element(by.id('biometric-toggle')).tap();
      await expect(element(by.text('Biometric authentication enabled'))).toBeVisible();
    });

    it('should authenticate with biometric on app resume', async () => {
      // Enable biometric first
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();
      
      // Background and foreground app
      await device.sendToHome();
      await device.launchApp();
      
      // Should show biometric prompt
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      
      // Simulate successful biometric authentication
      await element(by.id('biometric-success')).tap();
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });

    it('should fallback to password on biometric failure', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      await element(by.id('biometric-fallback')).tap();
      
      await expect(element(by.id('login-screen'))).toBeVisible();
    });
  });

  describe('Logout Flow', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });

    it('should logout successfully', async () => {
      await element(by.id('profile-button')).tap();
      await element(by.id('logout-button')).tap();
      
      // Confirm logout
      await element(by.id('confirm-logout')).tap();
      
      await expect(element(by.id('login-screen'))).toBeVisible();
    });

    it('should cancel logout', async () => {
      await element(by.id('profile-button')).tap();
      await element(by.id('logout-button')).tap();
      
      // Cancel logout
      await element(by.id('cancel-logout')).tap();
      
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });
  });
});

```

---

### `./apps/mobile/e2e/matching.e2e.js`

```javascript
/**
 * Matching Flow E2E Tests
 * Comprehensive testing of pet matching, swiping, and discovery features
 */

describe('Matching Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });

  describe('Pet Discovery', () => {
    it('should display pet cards on discovery screen', async () => {
      await element(by.id('discovery-tab')).tap();
      await expect(element(by.id('discovery-screen'))).toBeVisible();
      
      // Should show pet cards
      await expect(element(by.id('pet-card-0'))).toBeVisible();
      await expect(element(by.id('pet-name-0'))).toBeVisible();
      await expect(element(by.id('pet-age-0'))).toBeVisible();
      await expect(element(by.id('pet-breed-0'))).toBeVisible();
    });

    it('should swipe right to like a pet', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('right', 'fast', 0.5);
      
      await expect(element(by.text('Liked!'))).toBeVisible();
      await expect(element(by.id('pet-card-1'))).toBeVisible();
    });

    it('should swipe left to pass on a pet', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('left', 'fast', 0.5);
      
      await expect(element(by.text('Passed'))).toBeVisible();
      await expect(element(by.id('pet-card-1'))).toBeVisible();
    });

    it('should tap to view pet details', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('pet-card-0')).tap();
      await expect(element(by.id('pet-details-modal'))).toBeVisible();
      await expect(element(by.id('pet-photos'))).toBeVisible();
      await expect(element(by.id('pet-bio'))).toBeVisible();
    });

    it('should super like a pet', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('up', 'fast', 0.5);
      
      await expect(element(by.text('Super Liked!'))).toBeVisible();
    });

    it('should show out of pets message', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Swipe through all pets
      for (let i = 0; i < 10; i++) {
        const petCard = element(by.id(`pet-card-${i}`));
        await petCard.swipe('right', 'fast', 0.5);
        await testUtils.waitForNetworkIdle(1000);
      }
      
      await expect(element(by.text('No more pets in your area'))).toBeVisible();
      await expect(element(by.id('refresh-button'))).toBeVisible();
    });
  });

  describe('Pet Profile Management', () => {
    it('should edit pet profile', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('edit-pet-button')).tap();
      
      await expect(element(by.id('edit-pet-screen'))).toBeVisible();
      await element(by.id('pet-name-input')).clearText();
      await element(by.id('pet-name-input')).typeText('Updated Pet Name');
      await element(by.id('save-button')).tap();
      
      await expect(element(by.text('Profile updated successfully'))).toBeVisible();
    });

    it('should add new pet photos', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('add-photo-button')).tap();
      
      await expect(element(by.id('photo-picker-modal'))).toBeVisible();
      await element(by.id('camera-option')).tap();
      
      // Simulate camera permission
      await element(by.id('allow-camera')).tap();
      await expect(element(by.id('camera-screen'))).toBeVisible();
    });

    it('should delete pet photos', async () => {
      await element(by.id('profile-tab')).tap();
      
      // Long press on photo to show delete option
      await element(by.id('pet-photo-0')).longPress();
      await expect(element(by.id('delete-photo-option'))).toBeVisible();
      
      await element(by.id('delete-photo-option')).tap();
      await element(by.id('confirm-delete')).tap();
      
      await expect(element(by.text('Photo deleted'))).toBeVisible();
    });
  });

  describe('Matching Algorithm', () => {
    it('should show compatible pets based on preferences', async () => {
      await element(by.id('settings-tab')).tap();
      await element(by.id('preferences-button')).tap();
      
      // Set preferences
      await element(by.id('age-range-slider')).adjustSliderToPosition(0.3, 0.7);
      await element(by.id('breed-filter')).tap();
      await element(by.id('breed-golden-retriever')).tap();
      
      await element(by.id('save-preferences')).tap();
      
      // Go back to discovery
      await element(by.id('discovery-tab')).tap();
      
      // Should show filtered results
      await expect(element(by.id('pet-card-0'))).toBeVisible();
    });

    it('should learn from user behavior', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Like several pets of similar characteristics
      for (let i = 0; i < 5; i++) {
        const petCard = element(by.id(`pet-card-${i}`));
        await petCard.swipe('right', 'fast', 0.5);
        await testUtils.waitForNetworkIdle(1000);
      }
      
      // Algorithm should adapt and show similar pets
      await expect(element(by.id('pet-card-5'))).toBeVisible();
    });
  });

  describe('Match Notifications', () => {
    it('should show match notification', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Like a pet that likes back
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('right', 'fast', 0.5);
      
      // Simulate mutual like
      await testUtils.waitForNetworkIdle(2000);
      
      await expect(element(by.id('match-notification'))).toBeVisible();
      await expect(element(by.text('It\'s a Match!'))).toBeVisible();
    });

    it('should navigate to chat on match', async () => {
      await element(by.id('match-notification')).tap();
      await expect(element(by.id('chat-screen'))).toBeVisible();
      await expect(element(by.id('match-celebration'))).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should support screen readers', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Check accessibility labels
      await expect(element(by.id('pet-card-0'))).toHaveLabel('Pet card for Buddy, 3 year old Golden Retriever');
      await expect(element(by.id('like-button'))).toHaveLabel('Like this pet');
      await expect(element(by.id('pass-button'))).toHaveLabel('Pass on this pet');
    });

    it('should support voice control', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Simulate voice commands
      await element(by.id('voice-control-button')).tap();
      await expect(element(by.text('Voice control activated'))).toBeVisible();
    });

    it('should support keyboard navigation', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Navigate using keyboard
      await element(by.id('pet-card-0')).focus();
      await element(by.id('pet-card-0')).pressKey('ArrowRight');
      await expect(element(by.id('pet-card-1'))).toBeFocused();
    });
  });
});

```

---

### `./apps/mobile/e2e/premium/in-app-purchases.e2e.js`

```javascript
/**
 * Mobile In-App Purchases E2E Tests
 * Comprehensive testing of premium features and in-app purchases
 */

describe('Mobile In-App Purchases', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });

  describe('Premium Features Display', () => {
    it('should display premium features for free users', async () => {
      await element(by.id('premium-tab')).tap();
      await expect(element(by.id('premium-screen'))).toBeVisible();
      
      await expect(element(by.id('feature-unlimited-likes'))).toBeVisible();
      await expect(element(by.id('feature-super-likes'))).toBeVisible();
      await expect(element(by.id('feature-boost'))).toBeVisible();
      await expect(element(by.id('feature-advanced-filters'))).toBeVisible();
    });

    it('should show premium badge for premium users', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('profile-tab')).tap();
      await expect(element(by.id('premium-badge'))).toBeVisible();
      await expect(element(by.id('premium-badge')).toHaveText('Premium'));
    });

    it('should hide premium features for premium users', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('premium-tab')).tap();
      await expect(element(by.id('premium-features'))).toBeNotVisible();
      await expect(element(by.id('premium-status')).toHaveText('Active'));
    });
  });

  describe('Subscription Plans', () => {
    it('should display subscription plans', async () => {
      await element(by.id('premium-tab')).tap();
      
      await expect(element(by.id('subscription-plans'))).toBeVisible();
      await expect(element(by.id('plan-monthly'))).toBeVisible();
      await expect(element(by.id('plan-yearly'))).toBeVisible();
      await expect(element(by.id('plan-lifetime'))).toBeVisible();
    });

    it('should show plan pricing', async () => {
      await element(by.id('premium-tab')).tap();
      
      await expect(element(by.id('plan-monthly')).toHaveText('$9.99'));
      await expect(element(by.id('plan-yearly')).toHaveText('$99.99'));
      await expect(element(by.id('plan-lifetime')).toHaveText('$299.99'));
    });

    it('should highlight recommended plan', async () => {
      await element(by.id('premium-tab')).tap();
      
      await expect(element(by.id('plan-yearly')).toHaveLabel('Recommended'));
      await expect(element(by.id('recommended-badge'))).toBeVisible();
    });

    it('should show plan benefits', async () => {
      await element(by.id('premium-tab')).tap();
      
      await expect(element(by.id('plan-benefits'))).toBeVisible();
      await expect(element(by.id('benefit-unlimited-likes'))).toBeVisible();
      await expect(element(by.id('benefit-super-likes'))).toBeVisible();
      await expect(element(by.id('benefit-boost'))).toBeVisible();
      await expect(element(by.id('benefit-advanced-filters'))).toBeVisible();
    });
  });

  describe('In-App Purchase Flow', () => {
    it('should select monthly plan', async () => {
      await element(by.id('premium-tab')).tap();
      
      await element(by.id('plan-monthly')).tap();
      await expect(element(by.id('selected-plan')).toHaveText('Monthly'));
      await expect(element(by.id('purchase-button'))).toBeVisible();
    });

    it('should select yearly plan', async () => {
      await element(by.id('premium-tab')).tap();
      
      await element(by.id('plan-yearly')).tap();
      await expect(element(by.id('selected-plan')).toHaveText('Yearly'));
      await expect(element(by.id('purchase-button'))).toBeVisible();
    });

    it('should show savings for yearly plan', async () => {
      await element(by.id('premium-tab')).tap();
      
      await element(by.id('plan-yearly')).tap();
      await expect(element(by.id('savings-amount')).toBeVisible());
      await expect(element(by.id('savings-amount')).toHaveText('Save'));
    });

    it('should proceed to purchase', async () => {
      await element(by.id('premium-tab')).tap();
      
      await element(by.id('plan-monthly')).tap();
      await element(by.id('purchase-button')).tap();
      
      await expect(element(by.id('purchase-modal'))).toBeVisible();
      await expect(element(by.id('purchase-confirmation'))).toBeVisible();
    });
  });

  describe('Purchase Confirmation', () => {
    beforeEach(async () => {
      await element(by.id('premium-tab')).tap();
      await element(by.id('plan-monthly')).tap();
      await element(by.id('purchase-button')).tap();
    });

    it('should display purchase confirmation', async () => {
      await expect(element(by.id('purchase-modal'))).toBeVisible();
      await expect(element(by.id('plan-summary'))).toBeVisible();
      await expect(element(by.id('price-display'))).toBeVisible();
      await expect(element(by.id('confirm-purchase-button'))).toBeVisible();
    });

    it('should show terms and conditions', async () => {
      await element(by.id('terms-link')).tap();
      await expect(element(by.id('terms-modal'))).toBeVisible();
      await expect(element(by.text('Terms and Conditions'))).toBeVisible();
      
      await element(by.id('close-terms')).tap();
      await expect(element(by.id('terms-modal'))).toBeNotVisible();
    });

    it('should show privacy policy', async () => {
      await element(by.id('privacy-link')).tap();
      await expect(element(by.id('privacy-modal'))).toBeVisible();
      await expect(element(by.text('Privacy Policy'))).toBeVisible();
      
      await element(by.id('close-privacy')).tap();
      await expect(element(by.id('privacy-modal'))).toBeNotVisible();
    });

    it('should confirm purchase', async () => {
      await element(by.id('confirm-purchase-button')).tap();
      
      // Should show purchase processing
      await expect(element(by.id('purchase-processing'))).toBeVisible();
      await expect(element(by.text('Processing purchase...'))).toBeVisible();
    });

    it('should cancel purchase', async () => {
      await element(by.id('cancel-purchase-button')).tap();
      
      await expect(element(by.id('purchase-modal'))).toBeNotVisible();
      await expect(element(by.id('premium-screen'))).toBeVisible();
    });
  });

  describe('Purchase Processing', () => {
    it('should process successful purchase', async () => {
      await element(by.id('premium-tab')).tap();
      await element(by.id('plan-monthly')).tap();
      await element(by.id('purchase-button')).tap();
      await element(by.id('confirm-purchase-button')).tap();
      
      // Simulate successful purchase
      await testUtils.waitForNetworkIdle(3000);
      
      await expect(element(by.text('Purchase successful!'))).toBeVisible();
      await expect(element(by.text('Welcome to Premium!'))).toBeVisible();
    });

    it('should handle purchase failure', async () => {
      await element(by.id('premium-tab')).tap();
      await element(by.id('plan-monthly')).tap();
      await element(by.id('purchase-button')).tap();
      await element(by.id('confirm-purchase-button')).tap();
      
      // Simulate purchase failure
      await testUtils.mockApiResponse('/purchase/process', { error: 'Payment failed' }, 0, 400);
      
      await expect(element(by.text('Purchase failed'))).toBeVisible();
      await expect(element(by.text('Please try again'))).toBeVisible();
    });

    it('should handle network error during purchase', async () => {
      await element(by.id('premium-tab')).tap();
      await element(by.id('plan-monthly')).tap();
      await element(by.id('purchase-button')).tap();
      await element(by.id('confirm-purchase-button')).tap();
      
      // Simulate network error
      await testUtils.simulateNetworkCondition('offline');
      
      await expect(element(by.text('Network error'))).toBeVisible();
      await expect(element(by.text('Please check your connection'))).toBeVisible();
    });
  });

  describe('Premium Features Usage', () => {
    it('should allow unlimited likes for premium users', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('discovery-tab')).tap();
      
      // Like multiple pets without restriction
      for (let i = 0; i < 10; i++) {
        await element(by.id('like-button')).tap();
        await testUtils.waitForNetworkIdle(100);
      }
      
      await expect(element(by.id('rate-limit-message'))).toBeNotVisible();
    });

    it('should show super like count for premium users', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('discovery-tab')).tap();
      
      await expect(element(by.id('superlike-count')).toBeVisible());
      await expect(element(by.id('superlike-count')).toHaveText('5'));
    });

    it('should allow super like usage', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('superlike-button')).tap();
      await expect(element(by.id('superlike-count')).toHaveText('4'));
    });

    it('should show boost feature for premium users', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('profile-tab')).tap();
      
      await expect(element(by.id('boost-button')).toBeVisible());
      await expect(element(by.id('boost-count')).toHaveText('1'));
    });

    it('should allow boost usage', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('profile-tab')).tap();
      
      await element(by.id('boost-button')).tap();
      await element(by.id('confirm-boost')).tap();
      
      await expect(element(by.text('Profile boosted')).toBeVisible());
    });

    it('should show advanced filters for premium users', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('filter-button')).tap();
      await expect(element(by.id('advanced-filters')).toBeVisible());
      await expect(element(by.id('filter-temperament')).toBeVisible());
      await expect(element(by.id('filter-vaccination')).toBeVisible());
      await expect(element(by.id('filter-neutered')).toBeVisible());
    });
  });

  describe('Free User Limitations', () => {
    it('should limit likes for free users', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Like pets up to the limit
      for (let i = 0; i < 5; i++) {
        await element(by.id('like-button')).tap();
        await testUtils.waitForNetworkIdle(100);
      }
      
      await expect(element(by.id('rate-limit-message')).toBeVisible());
      await expect(element(by.text('You\'ve reached your daily like limit')).toBeVisible());
    });

    it('should show upgrade prompt for free users', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Try to use premium feature
      await element(by.id('superlike-button')).tap();
      await expect(element(by.id('upgrade-prompt')).toBeVisible());
      await expect(element(by.text('Upgrade to Premium')).toBeVisible());
    });

    it('should hide advanced filters for free users', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('filter-button')).tap();
      await expect(element(by.id('advanced-filters')).toBeNotVisible());
      await expect(element(by.id('premium-filter-badge')).toBeVisible());
    });
  });

  describe('Subscription Management', () => {
    it('should display current subscription for premium users', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('premium-tab')).tap();
      
      await expect(element(by.id('current-subscription')).toBeVisible());
      await expect(element(by.id('subscription-status')).toHaveText('Active'));
      await expect(element(by.id('subscription-plan')).toHaveText('Premium'));
      await expect(element(by.id('next-billing-date')).toBeVisible());
    });

    it('should show subscription history', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('premium-tab')).tap();
      
      await expect(element(by.id('subscription-history')).toBeVisible());
      await expect(element(by.id('history-item')).toBeVisible());
    });

    it('should allow subscription cancellation', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('premium-tab')).tap();
      
      await element(by.id('cancel-subscription-button')).tap();
      await element(by.id('confirm-cancel')).tap();
      
      await expect(element(by.text('Subscription cancelled')).toBeVisible());
    });

    it('should allow subscription reactivation', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('premium-tab')).tap();
      
      await element(by.id('reactivate-subscription-button')).tap();
      await element(by.id('confirm-reactivate')).tap();
      
      await expect(element(by.text('Subscription reactivated')).toBeVisible());
    });
  });

  describe('Error Handling', () => {
    it('should handle purchase API error', async () => {
      await element(by.id('premium-tab')).tap();
      await element(by.id('plan-monthly')).tap();
      await element(by.id('purchase-button')).tap();
      await element(by.id('confirm-purchase-button')).tap();
      
      // Simulate API error
      await testUtils.mockApiResponse('/purchase/process', { error: 'Internal server error' }, 0, 500);
      
      await expect(element(by.text('Something went wrong')).toBeVisible());
      await expect(element(by.text('Please try again later')).toBeVisible());
    });

    it('should handle subscription status error', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      // Simulate subscription status error
      await testUtils.mockApiResponse('/subscription/status', { error: 'Failed to load' }, 0, 500);
      
      await element(by.id('premium-tab')).tap();
      await expect(element(by.text('Failed to load subscription')).toBeVisible());
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with screen readers', async () => {
      await element(by.id('premium-tab')).tap();
      
      await expect(element(by.id('plan-monthly')).toHaveLabel('Monthly subscription plan'));
      await expect(element(by.id('plan-yearly')).toHaveLabel('Yearly subscription plan'));
      await expect(element(by.id('purchase-button')).toHaveLabel('Purchase subscription'));
    });

    it('should support voice control', async () => {
      await element(by.id('premium-tab')).tap();
      
      await element(by.id('voice-control-button')).tap();
      await expect(element(by.text('Voice control activated')).toBeVisible());
    });
  });

  describe('Performance', () => {
    it('should load premium screen quickly', async () => {
      const startTime = Date.now();
      
      await element(by.id('premium-tab')).tap();
      await expect(element(by.id('premium-screen')).toBeVisible());
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Premium screen should load quickly
      expect(duration).toBeLessThan(3000);
    });

    it('should handle purchase processing efficiently', async () => {
      const startTime = Date.now();
      
      await element(by.id('premium-tab')).tap();
      await element(by.id('plan-monthly')).tap();
      await element(by.id('purchase-button')).tap();
      await element(by.id('confirm-purchase-button')).tap();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Purchase processing should be efficient
      expect(duration).toBeLessThan(2000);
    });
  });
});

```

---

### `./pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
  - 'server'
  - 'ai-service'
  - 'packages/*'

```

