# Required Dependencies for Production-Ready Implementation

## Core Dependencies to Add

Run the following commands to install all required dependencies:

```bash
# Navigate to web app
cd apps/web

# Add production dependencies
pnpm add @sentry/nextjs@^7.99.0
pnpm add web-vitals@^5.0.0

# Add development dependencies
pnpm add -D @testing-library/react@^14.0.0
pnpm add -D @testing-library/react-hooks@^8.0.1
pnpm add -D @types/jest@^29.5.0
pnpm add -D cypress@^13.6.0
pnpm add -D @cypress/react18@^2.0.0

# Already installed (verify)
pnpm add socket.io-client@^4.6.0
pnpm add zustand@^4.5.0
pnpm add framer-motion@^11.0.0
```

## Package.json Scripts to Add

Add these scripts to `apps/web/package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "cypress": "cypress open",
    "cypress:headless": "cypress run",
    "e2e": "start-server-and-test dev http://localhost:3000 cypress:headless",
    "type-check": "tsc --noEmit",
    "validate": "pnpm run type-check && pnpm run lint && pnpm run test"
  }
}
```

## Jest Configuration

Create `apps/web/jest.config.js`:

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 75,
      lines: 80,
    },
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

Create `apps/web/jest.setup.js`:

```javascript
import '@testing-library/jest-dom';
```

## Cypress Configuration

Create `apps/web/cypress.config.ts`:

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
  },
  video: false,
  screenshotOnRunFailure: true,
  viewportWidth: 1280,
  viewportHeight: 720,
});
```

Create `apps/web/cypress/support/e2e.ts`:

```typescript
// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')
```

Create `apps/web/cypress/support/commands.ts`:

```typescript
/// <reference types="cypress" />

// Custom commands
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

export {};
```

## Cypress TypeScript Configuration

Create `apps/web/cypress/tsconfig.json`:

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "isolatedModules": false,
    "types": ["cypress", "node"]
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

## Environment Variables

Create `apps/web/.env.example`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_ENVIRONMENT=development

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_URL=https://analytics.example.com/api/events

# Stripe (from memory - already configured)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Feature Flags
NEXT_PUBLIC_ENABLE_WEB_VITALS=true
NEXT_PUBLIC_ENABLE_SENTRY=true
```

## Sentry Configuration

Create `apps/web/sentry.client.config.ts`:

```typescript
import { initSentry } from './src/lib/sentry';

initSentry();
```

Create `apps/web/sentry.server.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
    debug: false,
  });
}
```

## TypeScript Configuration Updates

The tsconfig excludes Cypress and test files to prevent type conflicts. Cypress
has its own tsconfig.json in the cypress directory.

## Installation Verification

After installing dependencies, verify with:

```bash
# Check installed packages
pnpm list @sentry/nextjs web-vitals socket.io-client

# Verify TypeScript compilation
pnpm exec tsc --noEmit

# Run tests
pnpm test

# Run linting
pnpm lint
```

## Build Verification

```bash
# Clean build
rm -rf .next
pnpm build

# Verify no build errors
echo $?  # Should output 0
```

## Notes

1. **Sentry**: The @sentry/nextjs package includes both client and server
   instrumentation
2. **Web Vitals**: Version 5.x includes the new INP metric (replaces FID)
3. **Cypress**: Test files are excluded from main tsconfig to prevent type
   conflicts
4. **Coverage**: Jest is configured with 80% coverage thresholds
5. **Environment**: All sensitive config uses environment variables
