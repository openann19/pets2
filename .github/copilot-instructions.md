# GitHub Copilot Instructions for PawfectMatch Premium

## Project Overview

PawfectMatch Premium is a world-class, AI-powered pet matching platform built as a TypeScript monorepo. The project emphasizes premium studio UX, type safety, comprehensive testing, and production-ready code quality.

**Repository Structure:**
- `apps/web/` - Next.js 14 web application
- `apps/mobile/` - React Native (Expo) mobile application
- `server/` - Node.js/Express backend API
- `packages/core/` - Shared business logic and types
- `packages/ui/` - Shared React component library
- `packages/design-tokens/` - Design system tokens
- `packages/ai/` - AI integration utilities
- `packages/security/` - Security utilities
- `packages/core-errors/` - Error handling

## Core Principles

1. **Type Safety First**: Strict TypeScript everywhere, no implicit `any`, no `@ts-ignore` outside test files
2. **Quality Gates**: All code must pass TypeScript, ESLint, Prettier, and tests before merge
3. **Small Changes**: Minimal, surgical modifications - change as few lines as possible
4. **Test Coverage**: Unit tests required for new functionality, aim for 80%+ coverage
5. **Production Ready**: Follow professional standards from `CODE_REVIEW_GUIDELINES.md`

## Technology Stack

### Frontend (Web & Mobile)
- **React**: 18.2.0 (stable production version - NO React 19 migration planned)
- **Next.js**: 14.2.33 (web only)
- **React Native**: 0.72.10 with Expo SDK ~49.0.23 (mobile)
- **TypeScript**: 5.9.2 (strict mode)
- **State Management**: React Query for server state
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion (web), React Native Reanimated (mobile)
- **Styling**: Tailwind CSS (web), styled components from design tokens (mobile)

### Backend
- **Node.js**: 20+
- **Express.js**: REST API
- **MongoDB**: 6.18.0 with Mongoose
- **Socket.io**: 4.8.1 for real-time features
- **Authentication**: JWT-based

### Package Manager & Build
- **pnpm**: 9.15.0 (workspaces)
- **Turborepo**: Build orchestration
- **Node**: >=20.0.0

## Code Quality Standards

### TypeScript Rules
- **Always** specify explicit return types for functions
- **Never** use `any` - use `unknown` and narrow with type guards
- **Never** use `@ts-ignore` or `@ts-expect-error` outside test files
- Use strict mode: `"strict": true` in tsconfig
- Prefer interfaces over types for object shapes
- Use generics with proper constraints

### React Rules
- **Hooks**: Only use hooks at top level, follow React hooks rules
- **Components**: Keep components under 200 lines, single responsibility
- **Props**: Define explicit prop types with TypeScript interfaces
- **State**: Use React Query for server state, local state for UI only
- **Forms**: Always use React Hook Form + Zod for validation
- **Animations**: Use spring physics (stiffness: 300, damping: 30) from Framer Motion

### Naming Conventions
- **Files**: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- **Components**: `PascalCase` (e.g., `UserProfile.tsx`)
- **Functions**: `camelCase` (e.g., `fetchUserData`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)
- **Types/Interfaces**: `PascalCase` with descriptive names (e.g., `UserProfile`, `ApiResponse`)

### Code Organization
- Group related functionality together
- Keep functions small and focused (single responsibility)
- Extract reusable logic into custom hooks or utility functions
- Co-locate tests with source files using `__tests__` directories

## Testing Requirements

### Unit Tests
- Use Jest for all packages
- Place tests in `__tests__` directories or alongside source with `.test.ts` suffix
- Mock external dependencies
- Test edge cases and error conditions
- Use `@testing-library/react` for component tests
- Use `@testing-library/react-native` for mobile component tests

### Integration Tests
- Test component interactions
- Test API integrations with mocked responses
- Verify state management flows

### E2E Tests
- Playwright for web (in `apps/web/cypress/`)
- Detox for mobile (in `apps/mobile/e2e/`)
- Test critical user journeys

### Test Commands
```bash
pnpm test                    # Run all tests
pnpm test:coverage          # Run with coverage
pnpm --filter web test      # Run web tests
pnpm --filter mobile test   # Run mobile tests
pnpm --filter server test   # Run server tests
```

## Security Standards

### Authentication & Authorization
- Use JWT tokens stored in httpOnly cookies
- Implement proper session management
- Never expose secrets in code or logs
- Use environment variables for sensitive data

### Input Validation
- Validate all user inputs with Zod schemas
- Sanitize data before database operations
- Use parameterized queries (Mongoose handles this)
- Implement rate limiting on API endpoints

### Dependencies
- Run `pnpm audit` before adding new dependencies
- Keep dependencies updated
- Review security advisories regularly
- No dependencies with known critical vulnerabilities

## Performance Guidelines

### Web Performance
- Use Next.js Image component for images
- Implement code splitting and lazy loading
- Optimize bundle size (target: <2MB)
- Use React Query for caching and deduplication
- Lighthouse score target: 90+

### Mobile Performance
- Use FlatList for long lists
- Optimize images before bundling
- Use React Native Reanimated for 60fps animations
- Profile with React DevTools and Expo performance monitor

### Backend Performance
- Implement database indexing on frequently queried fields
- Use connection pooling for MongoDB
- Cache responses where appropriate
- Monitor query performance

## Accessibility (a11y)

### Web
- Semantic HTML elements
- ARIA labels and roles where needed
- Keyboard navigation support
- Color contrast: WCAG AA minimum (4.5:1)
- Focus management
- Screen reader compatibility

### Mobile
- `accessibilityLabel` on all interactive elements
- `accessibilityRole` appropriate to component type
- `accessibilityHint` for complex interactions
- Support for device accessibility settings
- Touch target size: minimum 44x44pt

## Animation Standards

### Web (Framer Motion)
- Use spring physics: `{ type: "spring", stiffness: 300, damping: 30 }`
- Implement shared layout animations for seamless transitions
- Stagger animations with 0.07s delay
- Use `AnimatePresence` for exit animations
- 3D perspective effects: `rotateY` transforms

### Mobile (Reanimated)
- Target 60fps for all animations
- Use worklets for performance-critical animations
- Spring configs should match web: `{ stiffness: 300, damping: 30 }`
- Respect `reduce-motion` accessibility setting

## Design System

### Theme Structure
- Colors defined in `packages/design-tokens/`
- Typography scale with consistent sizes and weights
- Spacing scale: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)
- Border radii: 4px, 8px, 12px, 16px

### Component Library
- Use components from `packages/ui/` for shared components
- All components must have proper TypeScript interfaces
- Components should be themeable and accessible
- Document components with JSDoc comments

## Build & Development

### Development Commands
```bash
pnpm dev                    # Start all services
pnpm --filter web dev       # Start web app only
pnpm --filter mobile start  # Start mobile app
pnpm --filter server dev    # Start backend

pnpm build                  # Build all packages
pnpm lint                   # Lint all code
pnpm lint:fix              # Auto-fix lint issues
pnpm type-check            # Check TypeScript
pnpm format                # Format with Prettier
```

### Pre-Commit Checks
Husky runs these automatically via lint-staged:
- ESLint with `--max-warnings 0`
- Prettier formatting
- TypeScript type checking (not on commit but should run before push)

### Quality Gates
Must pass before merge:
1. TypeScript compilation (`pnpm type-check`)
2. ESLint with zero warnings (`pnpm lint`)
3. Prettier formatting (`pnpm format:check`)
4. Unit tests passing (`pnpm test`)
5. Coverage thresholds met (80%+)

## Common Patterns

### API Calls (Web)
```typescript
// Use React Query for all API calls
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@pawfectmatch/core';

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.users.getProfile(userId),
  });
};
```

### Form Handling
```typescript
// Always use React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

### Error Handling
```typescript
// Use custom error types from core-errors package
import { AppError, ErrorCode } from '@pawfectmatch/core-errors';

throw new AppError({
  code: ErrorCode.VALIDATION_ERROR,
  message: 'Invalid input',
  details: { field: 'email' },
});
```

## Multi-Agent System (Mobile Development)

When working on the mobile app (`apps/mobile/`), follow the multi-agent system defined in `AGENTS.md`:
- Product reasoning first - understand user journeys
- Contract-first development for APIs
- TypeScript strict mode with zero unapproved ignores
- Evidence-based changes with tests
- Small, reversible increments

## Common Issues & Solutions

### "Cannot find module '@pawfectmatch/xxx'"
Run `pnpm build` at repo root to build all workspace packages.

### Port conflicts
```bash
npx kill-port 3000  # or 5001, 8000
```

### React version mismatches
```bash
pnpm dedupe
# If issues persist:
rm -rf node_modules && pnpm install
```

## Documentation

- Update README.md for user-facing changes
- Update ARCHITECTURE.md for architectural decisions
- Add JSDoc comments for public APIs
- Update CHANGELOG.md for releases
- Document breaking changes prominently

## Environment Variables

### Required Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT signing
- `NODE_ENV` - production | development | test
- `PORT` - Server port (default: 5001)

### Optional Variables
- `CLOUDINARY_*` - Image upload service
- `STRIPE_*` - Payment processing
- `SENTRY_DSN` - Error monitoring

See `.env.example` files in each workspace for complete lists.

## When in Doubt

1. Check existing code for patterns
2. Refer to `CODE_REVIEW_GUIDELINES.md`
3. Follow TypeScript strict mode
4. Write tests first (TDD)
5. Keep changes minimal and focused
6. Ask for clarification in PR comments

---

**Remember**: Quality over speed. Production-ready code is better than fast code that breaks.
