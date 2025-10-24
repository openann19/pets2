# 🐾 PawfectMatch Premium - Complete Developer Instructions

> **Last Updated**: October 14, 2025  
> **Version**: 1.0.1-rc.0  
> **Status**: Production-Ready (with known issues documented below)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Quick Start](#-quick-start)
3. [Architecture](#-architecture)
4. [Development Workflow](#-development-workflow)
5. [Known Issues & Solutions](#-known-issues--solutions)
6. [Testing](#-testing)
7. [Deployment](#-deployment)
8. [Troubleshooting](#-troubleshooting)
9. [Code Quality Standards](#-code-quality-standards)
10. [Contributing](#-contributing)

---

## 🎯 Project Overview

**PawfectMatch Premium** is a world-class, AI-powered pet matching platform with premium studio-quality UX. Built as a TypeScript monorepo, it features advanced animations, real-time chat, intelligent matching algorithms, and comprehensive moderation systems.

### **Key Features**
- 🤖 **AI-Powered Matching** - Multi-factor compatibility scoring with machine learning
- 💬 **Real-Time Chat** - Socket.io with typing indicators, read receipts, media sharing
- 🎨 **Premium UX** - Spring physics animations, shared layout transitions, staggered effects
- 📱 **Cross-Platform** - Next.js web app + React Native (Expo) mobile app
- 🔐 **Security First** - JWT authentication, rate limiting, CSRF protection, content moderation
- 💳 **Stripe Integration** - Premium subscriptions with tiered features
- 👮 **Admin Console** - User management, content moderation, analytics dashboard

### **Technology Stack**

| Layer | Technology |
|-------|-----------|
| **Monorepo** | Turborepo + PNPM Workspaces |
| **Web Frontend** | Next.js 15 + React 19 + TypeScript 5.7 |
| **Mobile Frontend** | React Native + Expo SDK 51 |
| **Backend API** | Node.js + Express 5 + MongoDB |
| **AI Service** | Python 3.8+ + FastAPI |
| **State Management** | Zustand + React Query (TanStack Query v5) |
| **Animations** | Framer Motion (web) + Reanimated (mobile) |
| **Forms** | React Hook Form + Zod |
| **Styling** | Tailwind CSS (web) + StyleSheet (mobile) |
| **Testing** | Jest + Playwright + Detox |
| **Deployment** | Vercel (web) + Render (backend) + EAS (mobile) |

---

## 🚀 Quick Start

### **Prerequisites**

Ensure you have the following installed:

```bash
# Required
node >= 22.0.0
pnpm >= 9.0.0
python >= 3.8
mongodb >= 4.4

# For mobile development
expo-cli
eas-cli
```

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/pawfectmatch-premium.git
   cd pawfectmatch-premium
   ```

2. **Install dependencies**
   ```bash
   # Install all workspace dependencies
   pnpm install
   
   # Python dependencies for AI service
   cd ai-service
   python3 -m pip install -r requirements.txt
   cd ..
   ```

3. **Environment Configuration**

   Create `.env` files in each service directory:

   **Root `.env`:**
   ```bash
   NODE_ENV=development
   ```

   **`server/.env`:**
   ```bash
   # Server
   PORT=3001
   NODE_ENV=development
   API_URL=http://localhost:3001
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/pawfectmatch
   MONGODB_TEST_URI=mongodb://localhost:27017/pawfectmatch_test
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-in-production
   JWT_REFRESH_SECRET=your-refresh-token-secret-key-change-in-production
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Stripe (optional for development)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # Email (optional)
   SENDGRID_API_KEY=SG....
   EMAIL_FROM=noreply@pawfectmatch.com
   
   # Socket.io
   SOCKET_CORS_ORIGIN=http://localhost:3000,http://localhost:19006
   ```

   **`apps/web/.env.local`:**
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

   **`apps/mobile/.env`:**
   ```bash
   EXPO_PUBLIC_API_URL=http://localhost:3001/api
   EXPO_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

   **`ai-service/.env`:**
   ```bash
   PORT=8000
   API_URL=http://localhost:3001
   OPENAI_API_KEY=sk-...  # Optional
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:4.4
   
   # Or using local MongoDB
   mongod --dbpath /path/to/data
   ```

5. **Build Shared Packages**
   ```bash
   # Build core and ui packages first
   pnpm --filter @pawfectmatch/core build
   pnpm --filter @pawfectmatch/ui build
   ```

6. **Start Development Servers**

   **Option A: Start all services (recommended)**
   ```bash
   pnpm dev
   ```

   **Option B: Start individually in separate terminals**
   ```bash
   # Terminal 1: Backend API
   cd server && npm run dev
   
   # Terminal 2: AI Service
   cd ai-service && python3 deepseek_app.py
   
   # Terminal 3: Web App
   pnpm --filter pawfectmatch-web dev
   
   # Terminal 4: Mobile App (optional)
   pnpm --filter @pawfectmatch/mobile start
   ```

7. **Access the Application**
   - **Web App**: http://localhost:3000
   - **Backend API**: http://localhost:3001/api
   - **AI Service**: http://localhost:8000
   - **Mobile**: Expo DevTools will open automatically

---

## 🏗️ Architecture

### **Monorepo Structure**

```
pawfectmatch-premium/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── app/               # App Router pages
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── lib/           # Utilities
│   │   │   └── types/         # TypeScript types
│   │   └── package.json
│   └── mobile/                # React Native mobile app
│       ├── src/
│       │   ├── screens/       # Screen components
│       │   ├── components/    # Reusable components
│       │   ├── navigation/    # Navigation config
│       │   ├── services/      # API & platform services
│       │   └── hooks/         # Custom hooks
│       └── App.tsx
├── packages/
│   ├── core/                  # Shared business logic
│   │   ├── src/
│   │   │   ├── api/          # API clients
│   │   │   ├── stores/       # Zustand stores
│   │   │   ├── schemas/      # Zod validation schemas
│   │   │   └── types/        # Shared TypeScript types
│   │   └── package.json
│   ├── ui/                    # Shared UI components
│   │   └── src/components/   # Headless components
│   ├── design-tokens/         # Design system tokens
│   ├── analytics/             # Analytics utilities
│   ├── ai/                    # AI integration utilities
│   └── testing/               # Shared test utilities
├── server/                    # Node.js/Express backend
│   ├── models/               # MongoDB models
│   ├── routes/               # API routes
│   ├── middleware/           # Express middleware
│   ├── services/             # Business logic
│   └── server.js
├── ai-service/               # Python AI service
│   ├── deepseek_app.py      # FastAPI application
│   └── requirements.txt
├── turbo.json               # Turborepo configuration
├── pnpm-workspace.yaml      # PNPM workspace config
└── package.json             # Root package
```

### **Data Flow**

```
┌─────────────┐     REST API      ┌─────────────┐     HTTP      ┌─────────────┐
│   Web/      │ ◄──────────────► │   Node.js   │ ◄───────────► │   Python    │
│   Mobile    │                   │   Backend   │               │ AI Service  │
│   Client    │     Socket.io     │   (Express) │               │  (FastAPI)  │
│             │ ◄──────────────► │             │               │             │
└─────────────┘                   └─────────────┘               └─────────────┘
                                          │
                                          ▼
                                  ┌─────────────┐
                                  │   MongoDB   │
                                  │   Database  │
                                  └─────────────┘
```

---

## 💻 Development Workflow

### **Package Management**

```bash
# Add dependency to specific workspace
pnpm --filter pawfectmatch-web add package-name

# Add dev dependency to root
pnpm add -Dw package-name

# Add to multiple workspaces
pnpm --filter "@pawfectmatch/{web,mobile}" add package-name

# Remove dependency
pnpm --filter pawfectmatch-web remove package-name

# Update dependencies
pnpm update --latest
```

### **Building**

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @pawfectmatch/core build

# Clean build artifacts
pnpm --filter @pawfectmatch/core clean
```

### **Code Quality**

```bash
# Type checking
pnpm type-check                          # All workspaces
pnpm --filter pawfectmatch-web type-check  # Specific workspace

# Linting
pnpm lint                                # Check all
pnpm lint:fix                            # Fix all
pnpm --filter pawfectmatch-web lint:fix  # Fix specific

# Formatting
pnpm format                              # Format all
pnpm format:check                        # Check formatting
```

### **Running Tasks**

```bash
# Run task in all workspaces
turbo run build
turbo run test

# Run task in specific workspace
turbo run build --filter=pawfectmatch-web

# Run tasks in parallel
turbo run lint type-check test
```

---

## 🐛 Known Issues & Solutions

### **Critical Issues**

#### **1. Mobile App TypeScript Errors (301 errors)**

**Status**: 🔴 **IN PROGRESS**

**Primary Issues**:
- React Navigation ParamList missing index signatures (TS2344, TS2769)
- Animated API type incompatibilities
- Property access errors (User.id vs User._id)
- Missing imports and service types
- Component return type mismatches (TS2322)

**Current Error Count**: 
- `App.tsx`: 28 errors
- Navigation type errors across all stacks
- Screen component type mismatches

**Immediate Workarounds**:
```bash
# Run with skipLibCheck for development
cd apps/mobile
npx tsc --noEmit --skipLibCheck
```

**Fixes Being Implemented**:

1. **Add index signatures to navigation types**:
   ```typescript
   // apps/mobile/src/types/navigation.ts
   export type AuthStackParamList = {
     Login: undefined;
     Register: undefined;
     [key: string]: undefined | object;  // Add this line
   };
   
   export type OnboardingStackParamList = {
     UserIntent: undefined;
     PetProfileSetup: undefined;
     PreferencesSetup: undefined;
     Welcome: undefined;
     [key: string]: undefined | object;  // Add this line
   };
   ```

2. **Fix screen component return types**:
   ```typescript
   // ❌ Current (returns void)
   const LoginScreen = () => {
     // ...
   };
   
   // ✅ Fixed (returns JSX.Element)
   const LoginScreen = (): JSX.Element => {
     return <View>...</View>;
   };
   ```

3. **Use type assertions for Animated API**:
   ```typescript
   <Animated.View style={animatedStyle as any}>
   ```

4. **Standardize on `_id` for MongoDB documents**:
   ```typescript
   interface User {
     _id: string;  // Not 'id'
     email: string;
     // ...
   }
   ```

5. **Fix Navigator component usage**:
   ```typescript
   // Add proper type casting
   <AuthStack.Navigator screenOptions={{ headerShown: false }}>
     <AuthStack.Screen 
       name="Login" 
       component={LoginScreen as any}  // Temporary workaround
     />
   </AuthStack.Navigator>
   ```

**Tracking**: See `MOBILE_TYPESCRIPT_COMPREHENSIVE_ANALYSIS.md` for full details

**Priority Files to Fix**:
- `apps/mobile/App.tsx` (28 errors) - Navigation setup
- `apps/mobile/src/types/navigation.ts` - Add index signatures
- Screen components - Fix return types

---

#### **2. Web App TypeScript Errors (387 errors)**

**Status**: 🟡 **PARTIAL FIXES APPLIED**

**Key Improvements Made**:
- ✅ Fixed React 19 ForwardRef compatibility
- ✅ Updated motion components for strict typing
- ✅ Fixed SwipeCard component (zero errors)

**Remaining Issues**:
- JSX component type errors in admin components
- API response type mismatches
- Optional property type conflicts with `exactOptionalPropertyTypes: true`
- Neural network hook undefined array access (12 errors)

**Quick Fixes**:

1. **Error handling type guards**:
   ```typescript
   // ❌ Error: Property 'message' does not exist on type 'string'
   catch (error) {
     toast.error(error.message);
   }
   
   // ✅ Fixed
   catch (error) {
     const message = error instanceof Error ? error.message : 'An error occurred';
     toast.error(message);
   }
   ```

2. **Undefined array access**:
   ```typescript
   // ❌ In useNeuralNetwork.ts
   const sum = weights.reduce(...);  // weights possibly undefined
   
   // ✅ Fixed
   const sum = weights?.reduce(...) ?? 0;
   ```

3. **Optional property handling**:
   ```typescript
   // ❌ Type 'undefined' not assignable with exactOptionalPropertyTypes
   const props = { style: undefined };
   
   // ✅ Fixed - filter undefined values
   const props = Object.fromEntries(
     Object.entries({ style: undefined }).filter(([_, v]) => v !== undefined)
   );
   ```

**Tracking**: See `ZERO_ERRORS_PROGRESS.md`

---

#### **3. ESLint Configuration Issues**

**Status**: 🟡 **REQUIRES ATTENTION**

**Issues**:
- `setupTests.js` missing Jest globals (186 web + 76 mobile errors)
- React Hooks rules violations in service files
- Unused variables throughout codebase (34 mobile, many web)
- Missing ESLint rule definitions

**Solutions**:

1. **Add Jest globals to ESLint config**:
   ```javascript
   // apps/web/eslint.config.js and apps/mobile/eslint.config.js
   export default [
     {
       files: ['**/*.test.{js,jsx,ts,tsx}', '**/setupTests.js'],
       languageOptions: {
         globals: {
           jest: 'readonly',
           describe: 'readonly',
           test: 'readonly',
           it: 'readonly',
           expect: 'readonly',
           beforeEach: 'readonly',
           afterEach: 'readonly',
           beforeAll: 'readonly',
           afterAll: 'readonly',
         },
       },
     },
   ];
   ```

2. **Fix unused variables**:
   ```typescript
   // Prefix with underscore if intentionally unused
   const [_data, setData] = useState();
   const handleClick = (_event: MouseEvent) => { };
   ```

3. **Move hooks out of service files**:
   ```typescript
   // ❌ Bad: Hooks in service file (notifications.ts)
   export function _useNotifications() {
     const value = useContext(NotificationContext);  // ESLint error
     // ...
   }
   
   // ✅ Good: Move to hooks file (useNotifications.ts)
   export function useNotifications() {
     const value = useContext(NotificationContext);
     // ...
   }
   ```

4. **Fix duplicate method names**:
   ```typescript
   // apps/mobile/src/services/pushNotificationService.ts
   // Remove duplicate getFCMToken method
   ```

---

### **Performance Issues**

#### **Bundle Size**

**Status**: ⚠️ **MONITORING**

Current web bundle size exceeds recommended limits in some routes. Monitor with:

```bash
cd apps/web
pnpm analyze:bundle
```

**Optimization Strategies**:
1. Enable React Server Components where possible
2. Use dynamic imports for heavy components:
   ```typescript
   const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
     loading: () => <Skeleton />,
   });
   ```
3. Optimize images with Next.js Image component
4. Split large dependencies with code splitting

---

### **Database Issues**

#### **Connection Pool Exhaustion**

**Symptoms**: "MongoServerSelectionError: connection pool exceeded"

**Solution**:
```javascript
// server/config/database.js
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

---

### **Development Issues**

#### **Hot Reload Not Working**

**For Next.js (Web)**:
```bash
# Clear cache and restart
rm -rf apps/web/.next
pnpm --filter pawfectmatch-web dev
```

**For Expo (Mobile)**:
```bash
# Clear cache
cd apps/mobile
pnpm clean
pnpm start --clear
```

#### **Port Already in Use**

```bash
# Find process using port
lsof -ti:3000  # or 3001, 8000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use npx
npx kill-port 3000 3001 8000
```

---

## 🧪 Testing

### **Test Structure**

```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
└── performance/      # Performance tests
```

### **Running Tests**

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Specific workspace
pnpm --filter pawfectmatch-web test

# Integration tests only
pnpm test:integration

# E2E tests
pnpm test:e2e

# Critical tests (CI)
pnpm test:critical
```

### **Test Quality Gates**

The project enforces quality gates before commits:

```json
{
  "quality-gate": {
    "checks": [
      "type-check",
      "lint-check",
      "test-check",
      "security-check",
      "bundle-check",
      "performance-check"
    ]
  }
}
```

Run manually:
```bash
pnpm quality:gate
pnpm quality:report  # Generate HTML report
```

### **Current Test Status**

**Web App**:
- ✅ Unit tests: 82.2% pass rate
- ✅ Integration tests: Passing
- ⚠️ E2E tests: Some infrastructure issues

**Mobile App**:
- ⚠️ Test setup requires TypeScript fixes
- Jest configuration complete

**Backend**:
- ✅ All routes tested
- ✅ Authentication middleware tested
- ✅ Moderation system tested

---

## 🚀 Deployment

### **Pre-Deployment Checklist**

- [ ] All critical tests passing (`pnpm test:critical`)
- [ ] No TypeScript errors in production code
- [ ] Security audit passed (`pnpm security:audit`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates valid
- [ ] CDN configured

### **Web Deployment (Vercel)**

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Configure Project**:
   ```bash
   cd apps/web
   vercel link
   ```

3. **Set Environment Variables**:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   vercel env add NEXT_PUBLIC_SOCKET_URL production
   # Add all required variables
   ```

4. **Deploy**:
   ```bash
   # Preview deployment
   vercel

   # Production deployment
   vercel --prod
   ```

### **Backend Deployment (Render)**

1. **Create `render.yaml`**:
   ```yaml
   services:
     - type: web
       name: pawfectmatch-api
       env: node
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: MONGODB_URI
           sync: false
         - key: JWT_SECRET
           generateValue: true
   ```

2. **Deploy**:
   - Connect GitHub repository
   - Select `server` directory
   - Add environment variables
   - Deploy

### **Mobile Deployment (EAS)**

1. **Configure EAS**:
   ```bash
   cd apps/mobile
   eas login
   eas build:configure
   ```

2. **Build**:
   ```bash
   # iOS production build
   eas build --platform ios --profile production

   # Android APK
   eas build --platform android --profile production-apk

   # All platforms
   eas build --platform all --profile production
   ```

3. **Submit to Stores**:
   ```bash
   # iOS App Store
   eas submit --platform ios

   # Google Play Store
   eas submit --platform android
   ```

### **Database Migration**

```bash
# Backup production database
mongodump --uri="mongodb://production-uri" --out=/backup

# Apply migrations
cd server
node scripts/migrate.js

# Verify data integrity
node scripts/verify-migration.js
```

### **Post-Deployment Verification**

```bash
# Health checks
curl https://api.pawfectmatch.com/health
curl https://pawfectmatch.com/api/health

# Monitor logs
vercel logs --follow  # Web
# Check Render dashboard for backend logs

# Performance monitoring
# Check Sentry dashboard
# Review Lighthouse scores
```

---

## 🔧 Troubleshooting

### **Common Errors**

#### **"Cannot find module '@pawfectmatch/core'"**

**Cause**: Core package not built

**Solution**:
```bash
pnpm --filter @pawfectmatch/core build
```

#### **"Port 3000 is already in use"**

**Solution**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or start on different port
PORT=3001 pnpm dev
```

#### **"Invalid hook call"**

**Cause**: Multiple React versions

**Solution**:
```bash
# From root directory
pnpm dedupe
rm -rf node_modules
pnpm install
```

#### **"Module not found: Can't resolve 'react-native'"**

**Cause**: React Native imported in web code

**Solution**: Use conditional imports or platform-specific files:
```typescript
// Use .native.ts and .web.ts extensions
// component.native.ts
// component.web.ts
```

#### **Socket.io Connection Failed**

**Check**:
1. Backend is running (`http://localhost:3001`)
2. CORS configuration allows client origin
3. Socket.io client version matches server

**Debug**:
```typescript
const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
});

socket.on('connect', () => console.log('Connected!'));
socket.on('connect_error', (error) => console.error('Connection error:', error));
```

### **Performance Debugging**

#### **Slow Page Loads**

```bash
# Profile production build
cd apps/web
pnpm build
pnpm analyze:bundle

# Check for:
# - Large dependencies (>500KB)
# - Duplicate code
# - Missing code splitting
```

#### **Memory Leaks**

```typescript
// Add to components with subscriptions
useEffect(() => {
  const subscription = socket.on('message', handler);
  
  return () => {
    subscription.off('message', handler);  // Cleanup!
  };
}, []);
```

### **Database Issues**

#### **Slow Queries**

```bash
# Enable MongoDB profiling
mongo
use pawfectmatch
db.setProfilingLevel(2)

# Check slow queries
db.system.profile.find().sort({ ts: -1 }).limit(5)

# Add indexes
db.users.createIndex({ email: 1 })
db.pets.createIndex({ location: "2dsphere" })
```

---

## 🎨 Code Quality Standards

### **TypeScript Guidelines**

1. **Strict Mode Enabled**: No implicit `any` types
2. **No Type Suppressions**: Avoid `@ts-ignore` and `@ts-expect-error`
3. **Proper Error Handling**:
   ```typescript
   // ✅ Good
   try {
     await api.call();
   } catch (error) {
     if (error instanceof ApiError) {
       console.error(error.message);
     } else {
       console.error('Unknown error', error);
     }
   }
   
   // ❌ Bad
   try {
     await api.call();
   } catch (error: any) {
     console.error(error.message);  // Unsafe
   }
   ```

### **React Best Practices**

1. **Custom Hooks for Logic Reuse**
2. **Error Boundaries for Resilience**
3. **Memoization for Performance**:
   ```typescript
   const expensiveValue = useMemo(() => 
     computeExpensiveValue(a, b), 
     [a, b]
   );
   ```
4. **Proper Cleanup**:
   ```typescript
   useEffect(() => {
     const timer = setTimeout(() => {}, 1000);
     return () => clearTimeout(timer);
   }, []);
   ```

### **Animation Standards**

**Use Spring Physics**:
```typescript
// ✅ Good - Natural motion
<motion.div
  animate={{ scale: 1.2 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
/>

// ❌ Bad - Robotic easing
<motion.div
  animate={{ scale: 1.2 }}
  transition={{ duration: 0.2, ease: 'easeInOut' }}
/>
```

### **Git Commit Messages**

Follow conventional commits:
```
feat: add user profile editing
fix: resolve socket connection timeout
docs: update deployment guide
perf: optimize image loading
refactor: extract authentication logic
test: add integration tests for chat
```

### **Code Review Checklist**

- [ ] TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Accessibility considered
- [ ] Performance impact evaluated

---

## 🤝 Contributing

### **Development Setup**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run quality checks: `pnpm quality:gate`
5. Commit: `git commit -m 'feat: add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### **Pull Request Guidelines**

- **Title**: Use conventional commit format
- **Description**: Explain what, why, and how
- **Tests**: Include tests for new features
- **Screenshots**: For UI changes
- **Breaking Changes**: Clearly documented

### **Review Process**

1. Automated checks must pass
2. Code review by 2+ maintainers
3. QA testing for significant changes
4. Deployment to staging
5. Merge to main

---

## 📚 Additional Resources

### **Documentation**

- [Architecture Overview](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Testing Guide](./TESTING_INSTRUCTIONS.md)
- [User Guide](./USER_GUIDE.md)
- [Admin Guide](./ADMIN_QUICK_START.md)

### **Issue Tracking**

- [Comprehensive Issues Audit](./COMPREHENSIVE_ISSUES_AUDIT.md) - **🔴 Critical**
- [Mobile TypeScript Analysis](./MOBILE_TYPESCRIPT_COMPREHENSIVE_ANALYSIS.md) - 301 errors
- [Zero Errors Implementation Plan](./ZERO_ERRORS_IMPLEMENTATION_PLAN.md) - Web fixes
- [Engineering Excellence Status](./ENGINEERING_EXCELLENCE_STATUS.md)
- [Mobile Build Guide](./MOBILE_BUILD_GUIDE.md)

### **External Links**

- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Turborepo Documentation](https://turbo.build/repo/docs)

---

## 🆘 Getting Help

### **Support Channels**

- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions for questions
- **Slack**: Join the team Slack channel
- **Email**: dev@pawfectmatch.com

### **Reporting Bugs**

Include:
1. Environment details (OS, Node version, package versions)
2. Steps to reproduce
3. Expected vs actual behavior
4. Error messages and stack traces
5. Screenshots (if applicable)

### **Feature Requests**

Use the feature request template and include:
1. Problem statement
2. Proposed solution
3. Alternatives considered
4. Additional context

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with ❤️ by the PawfectMatch team.

Special thanks to:
- React team for React 19
- Vercel for Next.js
- Expo team for React Native tooling
- All open-source contributors

---

## 📊 Current Project Status

### **Error Summary** (as of October 14, 2025)

| Area | Status | Count | Priority |
|------|--------|-------|----------|
| **Mobile TypeScript** | 🔴 Critical | 301 errors | P0 |
| **Web TypeScript** | 🟡 In Progress | 387 errors | P1 |
| **Mobile ESLint** | 🟡 Requires Attention | 76 errors | P2 |
| **Web ESLint** | 🟡 Requires Attention | 186 errors | P2 |
| **Console Statements** | ⚠️ Warning | 664+ | P3 |
| **Type Suppressions** | ⚠️ Warning | 42+ | P3 |

### **What's Working** ✅
- Backend API fully functional
- AI service operational
- Real-time chat working
- Authentication & authorization
- Stripe payment integration
- Admin console features
- Content moderation system
- Mobile app runs with `--skipLibCheck`
- Web app runs with some type errors

### **Next Steps** 🎯
1. Fix mobile navigation type definitions (highest priority)
2. Fix web API response types
3. Configure ESLint for test files
4. Remove console.log statements
5. Eliminate type suppressions

---

**Last Updated**: October 14, 2025  
**Maintainers**: @your-team  
**Status**: ✅ **Functional** | 🔴 **Type Safety Issues** | 📋 **Active Development**
