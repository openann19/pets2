# PawfectMatch Developer Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Environment](#development-environment)
4. [Architecture Overview](#architecture-overview)
5. [API Documentation](#api-documentation)
6. [Frontend Development](#frontend-development)
7. [Backend Development](#backend-development)
8. [Mobile Development](#mobile-development)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Contributing](#contributing)
12. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Docker and Docker Compose
- Git
- VS Code (recommended)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/pawfectmatch/pawfectmatch.git
   cd pawfectmatch
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**

   ```bash
   npm run dev
   ```

5. **Open the application**
   - Web: http://localhost:3000
   - API: http://localhost:3000/api
   - Mobile: Follow React Native setup guide

## Project Structure

```
pawfectmatch/
├── apps/
│   ├── web/                 # Next.js web application
│   └── mobile/              # React Native mobile app
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── ai/                  # AI services and algorithms
│   ├── analytics/           # Performance monitoring
│   └── testing/             # Testing utilities
├── server/                  # Node.js backend API
├── docs/                    # Documentation
├── scripts/                 # Build and deployment scripts
└── tools/                   # Development tools
```

### Monorepo Structure

This project uses a monorepo structure with the following packages:

- **@pawfectmatch/ui**: Shared React components and design system
- **@pawfectmatch/ai**: AI-powered pet matching and photo analysis
- **@pawfectmatch/analytics**: Performance monitoring and bundle optimization
- **@pawfectmatch/testing**: Testing utilities and configurations

## Development Environment

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pawfectmatch
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# DeepSeek AI
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-west-2
AWS_S3_BUCKET=pawfectmatch-uploads

# Monitoring
SENTRY_DSN=your-sentry-dsn
ANALYTICS_API_KEY=your-analytics-key
```

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database
npm run db:reset
```

## Architecture Overview

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Mobile Client  │    │   Admin Panel   │
│   (Next.js)     │    │ (React Native)  │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (Express.js)  │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Auth Service   │    │  Pet Service    │    │  AI Service     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │    Database     │
                    │   (PostgreSQL)  │
                    └─────────────────┘
```

### Key Components

1. **Frontend Applications**
   - Web app (Next.js with TypeScript)
   - Mobile app (React Native with TypeScript)
   - Admin panel (Next.js with TypeScript)

2. **Backend Services**
   - API server (Express.js with TypeScript)
   - Authentication service
   - Pet management service
   - AI matching service
   - Payment processing service

3. **External Services**
   - Stripe (payments)
   - DeepSeek AI (pet analysis)
   - AWS S3 (file storage)
   - SendGrid (email)

## API Documentation

### Base URL

- Production: `https://api.pawfectmatch.com/v1`
- Staging: `https://staging-api.pawfectmatch.com/v1`
- Development: `http://localhost:3000/api/v1`

### Authentication

Most API endpoints require authentication using JWT tokens:

```bash
curl -H "Authorization: Bearer <your-jwt-token>" \
     https://api.pawfectmatch.com/v1/pets
```

### Rate Limiting

- 1000 requests per hour per user
- 100 requests per minute per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Frontend Development

### Web Application (Next.js)

#### Project Structure

```
apps/web/
├── app/                    # App Router pages
│   ├── (auth)/            # Auth pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── (admin)/           # Admin pages
│   └── api/               # API routes
├── components/            # React components
├── hooks/                 # Custom hooks
├── lib/                   # Utilities
├── styles/                # Global styles
└── types/                 # TypeScript types
```

#### Key Features

- Server-side rendering (SSR)
- Static site generation (SSG)
- API routes
- Middleware for authentication
- Image optimization
- SEO optimization

#### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run tests
npm run test

# Run linting
npm run lint
```

### Mobile Application (React Native)

#### Project Structure

```
apps/mobile/
├── src/
│   ├── components/        # React Native components
│   ├── screens/           # Screen components
│   ├── navigation/        # Navigation setup
│   ├── services/          # API services
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utilities
│   └── types/             # TypeScript types
├── android/               # Android-specific code
├── ios/                   # iOS-specific code
└── __tests__/            # Tests
```

#### Key Features

- Cross-platform compatibility
- Offline support
- Push notifications
- Deep linking
- Haptic feedback
- Camera integration

#### Development Commands

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Build for production
npm run build:android
npm run build:ios
```

### Shared UI Components

#### Usage

```tsx
import { Button, Card, Input } from '@pawfectmatch/ui';

function MyComponent() {
  return (
    <Card>
      <Input placeholder='Enter text...' />
      <Button variant='primary'>Submit</Button>
    </Card>
  );
}
```

#### Available Components

- **Layout**: Container, Grid, Stack, Flex
- **Navigation**: Header, Footer, Sidebar, Breadcrumb
- **Forms**: Input, Select, Checkbox, Radio, Switch
- **Feedback**: Alert, Toast, Modal, Drawer
- **Data Display**: Table, List, Card, Badge
- **Media**: Image, Video, Audio
- **Animation**: Fade, Slide, Scale, Rotate

## Backend Development

### API Server (Express.js)

#### Project Structure

```
server/
├── src/
│   ├── controllers/       # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utilities
│   └── types/             # TypeScript types
├── tests/                 # Tests
└── docs/                  # API documentation
```

#### Key Features

- RESTful API design
- JWT authentication
- Request validation
- Error handling
- Logging
- Rate limiting
- CORS support

#### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run tests
npm run test

# Run linting
npm run lint
```

### Database Models

#### User Model

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  premium: PremiumInfo;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Pet Model

```typescript
interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  photos: string[];
  description: string;
  temperament: string[];
  health: PetHealth;
  location: Location;
  shelter: Shelter;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Routes

#### Authentication Routes

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

#### Pet Routes

- `GET /pets` - Get pets with filtering
- `GET /pets/:id` - Get pet by ID
- `POST /pets` - Create pet (admin only)
- `PUT /pets/:id` - Update pet (admin only)
- `DELETE /pets/:id` - Delete pet (admin only)

#### Match Routes

- `GET /matches` - Get user matches
- `GET /matches/:id` - Get match by ID
- `POST /swipes` - Record swipe action
- `DELETE /matches/:id` - Archive match

#### Message Routes

- `GET /matches/:id/messages` - Get match messages
- `POST /matches/:id/messages` - Send message
- `PUT /messages/:id` - Update message
- `DELETE /messages/:id` - Delete message

## Mobile Development

### React Native Setup

#### Prerequisites

- Node.js 18+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS)
- Java Development Kit (JDK)

#### Installation

```bash
# Install React Native CLI
npm install -g @react-native-community/cli

# Install dependencies
npm install

# iOS setup (macOS only)
cd ios && pod install && cd ..
```

#### Key Features

1. **Offline Support**
   - Data synchronization
   - Offline-first architecture
   - Conflict resolution
   - Background sync

2. **Push Notifications**
   - Firebase Cloud Messaging
   - Local notifications
   - Deep linking
   - Notification scheduling

3. **Performance Optimization**
   - Image optimization
   - Lazy loading
   - Memory management
   - Bundle optimization

#### Development Workflow

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run tests
npm run test

# Build for production
npm run build:android
npm run build:ios
```

## Testing

### Testing Strategy

1. **Unit Tests** - Test individual functions and components
2. **Integration Tests** - Test API endpoints and database interactions
3. **E2E Tests** - Test complete user workflows
4. **Visual Regression Tests** - Test UI consistency
5. **Performance Tests** - Test application performance

### Testing Tools

- **Jest** - Unit testing framework
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **MSW** - API mocking
- **Storybook** - Component development and testing

### Running Tests

```bash
# Run all tests
npm run test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run visual regression tests
npm run test:visual

# Run tests with coverage
npm run test:coverage
```

### Test Configuration

#### Jest Configuration

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### Playwright Configuration

```javascript
module.exports = {
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    browserName: 'chromium',
    headless: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
};
```

## Deployment

### Production Deployment

#### Web Application

```bash
# Build for production
npm run build

# Start production server
npm run start
```

#### Mobile Application

```bash
# Build Android APK
npm run build:android

# Build iOS IPA
npm run build:ios
```

#### Backend API

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Docker Deployment

#### Dockerfile (Web)

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

#### Docker Compose

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
    depends_on:
      - api
      - database

  api:
    build: ./server
    ports:
      - '3001:3001'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@database:5432/pawfectmatch
    depends_on:
      - database

  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=pawfectmatch
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### CI/CD Pipeline

#### GitHub Actions

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Deployment steps
```

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Write tests for your changes**
5. **Run tests and linting**
   ```bash
   npm run test
   npm run lint
   ```
6. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature"
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a pull request**

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add JSDoc comments for public APIs
- Write tests for new features

### Pull Request Guidelines

- Provide a clear description of changes
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed
- Request reviews from relevant team members

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check database status
docker-compose ps

# View database logs
docker-compose logs database

# Reset database
npm run db:reset
```

#### 2. Build Issues

```bash
# Clear cache
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### 3. Mobile Development Issues

```bash
# Clear Metro cache
npm start -- --reset-cache

# Clear React Native cache
npx react-native start --reset-cache

# Reinstall iOS pods
cd ios && pod install && cd ..
```

#### 4. API Issues

```bash
# Check API server status
curl http://localhost:3000/api/health

# View API logs
npm run logs:api

# Restart API server
npm run restart:api
```

### Performance Issues

#### 1. Slow Page Loads

- Check bundle size with `npm run analyze`
- Optimize images
- Enable gzip compression
- Use CDN for static assets

#### 2. Database Performance

- Add database indexes
- Optimize queries
- Use connection pooling
- Monitor slow queries

#### 3. API Performance

- Enable caching
- Optimize database queries
- Use pagination
- Implement rate limiting

### Getting Help

1. **Check the documentation**
2. **Search existing issues**
3. **Create a new issue** with:
   - Description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Error messages and logs

### Support Channels

- **GitHub Issues** - Bug reports and feature requests
- **Discord** - Community support and discussions
- **Email** - developer-support@pawfectmatch.com
- **Documentation** - https://docs.pawfectmatch.com

---

## Additional Resources

- [API Documentation](https://api.pawfectmatch.com/docs)
- [Component Library](https://ui.pawfectmatch.com)
- [Design System](https://design.pawfectmatch.com)
- [Deployment Guide](https://deploy.pawfectmatch.com)
- [Security Guidelines](https://security.pawfectmatch.com)

For more information, visit our [official documentation](https://docs.pawfectmatch.com).
