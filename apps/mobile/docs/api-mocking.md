# API Mocking Guide for PawfectMatch Mobile

This guide explains how API mocking works in the PawfectMatch mobile app, including both development mock server and test mocking with MSW.

## Overview

The app uses **two different mocking systems**:

1. **Mock Server** (`scripts/mock-server.ts`) - Express.js server for development
2. **MSW (Mock Service Worker)** (`apps/mobile/src/test-utils/msw/`) - For unit/integration tests

---

## 1. Development Mock Server

### Purpose
Provides a real HTTP server for development when the backend is unavailable or for isolated frontend testing.

### Location
- Server: `scripts/mock-server.ts`
- Fixtures: `apps/mobile/mocks/fixtures/`

### Running the Mock Server

```bash
# From the project root
cd scripts
npm run dev

# Or using tsx directly
npx tsx mock-server.ts
```

The server runs on **http://localhost:3001** by default.

### Fixtures

Fixture files are located in `apps/mobile/mocks/fixtures/`:

- `users.json` - User profiles
- `pets.json` - Pet profiles  
- `matches.json` - Match data
- `gdpr/*.json` - GDPR operation responses
- `chat/*.json` - Chat operation responses
- `ai/*.json` - AI analysis responses
- `subscription/*.json` - Subscription-related responses

### Fixture Structure

Fixtures use object format with named keys:

```json
{
  "testUser": {
    "id": "user-123",
    "email": "test@example.com",
    ...
  },
  "premiumUser": {
    ...
  }
}
```

The mock server automatically handles object-to-array conversion for API responses.

### Available Endpoints

The mock server provides endpoints for:

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Users**: `/api/users/me`, `/api/users/export-data`, `/api/users/delete-account`
- **Pets**: `/api/pets`, `/api/pets/:id`
- **Matches**: `/api/matches`, `/api/matches/:id`
- **Chat**: `/api/chat/:conversationId/messages`, `/api/chat/:conversationId/reaction`
- **AI**: `/api/ai/generate-bio`, `/api/ai/analyze-photos`, `/api/ai/enhanced-compatibility`
- **Premium**: `/api/premium/status`, `/api/premium/subscribe`

### Configuration

The mock server automatically detects its location and uses the correct fixture path:

```typescript
const isInScripts = __dirname.includes('scripts');
const fixturesBase = isInScripts 
  ? join(__dirname, '../apps/mobile/mocks/fixtures')
  : join(__dirname, 'apps/mobile/mocks/fixtures');
```

### Environment Setup

To use the mock server in development, point your app to `http://localhost:3001`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3001 npm run dev
```

Or configure in `apps/mobile/src/config/environment.ts`:

```typescript
development: {
  API_BASE_URL: "http://localhost:3001",
  // ...
}
```

---

## 2. MSW (Mock Service Worker) for Tests

### Purpose
MSW intercepts HTTP requests during unit/integration tests, providing a consistent mocking layer.

### Location
- Handlers: `apps/mobile/src/test-utils/msw/handlers.ts`
- Server: `apps/mobile/src/test-utils/msw/server.ts`
- Setup: `apps/mobile/jest.setup.ts`

### How It Works

MSW is automatically enabled in Jest tests:

```typescript
// jest.setup.ts
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  const { server } = require('./src/test-utils/msw/server');
  
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}
```

### Adding New Handlers

Edit `apps/mobile/src/test-utils/msw/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '../../config/environment';

export const handlers = [
  // Add your handler
  http.post(`${API_BASE_URL}/your-endpoint`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: body,
    });
  }),
];
```

### Dynamic Handlers

For test-specific mocking:

```typescript
import { server } from './src/test-utils/msw/server';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '../config/environment';

it('handles custom scenario', () => {
  server.use(
    http.get(`${API_BASE_URL}/pets`, () => {
      return HttpResponse.json({
        pets: [{ id: 'custom-pet', name: 'Test Pet' }],
      });
    })
  );

  // Your test code...
});
```

### Available Test Handlers

- Authentication: login, register, refresh-token
- Users: `/users/me`, `/users/export-data`, `/users/delete-account`
- Pets: CRUD operations
- Matches: `/matches`, `/matches/liked-you`, `/matches/:id`
- AI: `/ai/generate-bio`, `/ai/analyze-photos`, `/ai/enhanced-compatibility`
- Chat: messages, reactions, attachments, voice notes

---

## 3. Fixture Management

### Adding New Fixtures

1. Create JSON file in `apps/mobile/mocks/fixtures/`
2. Add to mock server if needed
3. Update MSW handlers if needed for tests

Example: Adding a new fixture for payments:

```json
// apps/mobile/mocks/fixtures/payments/success.json
{
  "transactionId": "tx_123",
  "status": "completed",
  "amount": 999,
  "currency": "USD"
}
```

### Fixture Best Practices

1. **Use descriptive keys** for object fixtures:
   ```json
   {
     "successCase": {...},
     "errorCase": {...},
     "emptyCase": {...}
   }
   ```

2. **Keep fixtures realistic** - use realistic data structures
3. **Document edge cases** in fixture file comments
4. **Version fixtures** if API contracts change

---

## 4. Troubleshooting

### Mock Server Issues

**Problem**: Fixtures not found
```bash
Error: ENOENT: no such file or directory, open '.../mocks/fixtures/users.json'
```

**Solution**: Check fixture paths in `scripts/mock-server.ts`. The server auto-detects location.

**Problem**: Port already in use
```bash
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution**: Change port in `scripts/mock-server.ts` or kill existing process:
```bash
lsof -ti:3001 | xargs kill -9
```

### MSW Issues

**Problem**: Unhandled requests in tests
```
Warning: Unhandled MSW request: GET http://localhost:5001/unhandled-endpoint
```

**Solution**: Add handler or use `onUnhandledRequest: 'warn'` in jest.setup.ts

**Problem**: MSW not intercepting requests
```
Error: Network request failed
```

**Solution**: Ensure MSW is initialized before tests run. Check `jest.setup.ts`.

---

## 5. Best Practices

### 1. Keep Mocks and Real API in Sync

When backend API changes:
- Update mock server endpoints
- Update MSW handlers
- Update fixture files
- Update TypeScript interfaces

### 2. Use Typed Responses

Always match real API response structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// In handler:
return HttpResponse.json<ApiResponse<User>>({
  success: true,
  data: user,
});
```

### 3. Test Error Scenarios

Include error handlers:

```typescript
http.post(`${API_BASE_URL}/auth/login`, () => {
  return HttpResponse.json(
    { error: 'Invalid credentials' },
    { status: 401 }
  );
}),
```

### 4. Mock Realistic Delay

Add realistic network delay:

```typescript
http.get(`${API_BASE_URL}/pets`, async () => {
  await delay(100); // Simulate network latency
  return HttpResponse.json({ pets: [...] });
}),
```

### 5. Document Mock Behavior

Add comments explaining mock behavior:

```typescript
// Mock returns 401 for invalid credentials
// Use email: "test@example.com", password: "password" for success
http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
  // ... implementation
}),
```

---

## 6. Testing with Mocks

### Unit Tests

Mock APIs at the service level:

```typescript
import { matchesAPI } from '../services/api';

jest.mock('../services/api', () => ({
  matchesAPI: {
    getMatches: jest.fn().mockResolvedValue([...]),
  },
}));
```

### Integration Tests

Use MSW for integration tests:

```typescript
import { render, waitFor } from '@testing-library/react-native';

it('loads matches on mount', async () => {
  const { getByText } = render(<MatchesScreen />);
  
  await waitFor(() => {
    expect(getByText('Buddy')).toBeTruthy();
  });
});
```

### E2E Tests

For E2E tests (Detox), you can either:
1. Run against mock server
2. Use real backend in test environment
3. Use MSW in E2E setup (advanced)

---

## 7. Command Reference

```bash
# Run mock server
npx tsx scripts/mock-server.ts

# Run tests with mocking
pnpm mobile:test

# Run specific test
pnpm mobile:test LoginScreen

# Check MSW in test output
pnpm mobile:test --verbose
```

---

## 8. Architecture Decision

### Why Two Mocking Systems?

1. **Mock Server (Development)**
   - Real HTTP server for development
   - Can test HTTP client behavior
   - Works with mobile device/simulator
   - Good for manual testing

2. **MSW (Tests)**
   - Intercepts requests at runtime
   - No network overhead in tests
   - Fast and reliable
   - Automatic cleanup between tests

### Migration Path

- MSW has precedence in test environment
- Mock server for development/E2E
- Both share fixture structure where possible

---

## 9. Related Documentation

- [Testing Strategy](./testing-strategy.md)
- [API Contracts](../../contracts/)
- [AGENTS.md](../../../AGENTS.md) - Multi-agent system requirements

---

## Support

For issues or questions:
- Check existing handlers in `apps/mobile/mocks/handlers.ts`
- Review fixture files in `apps/mobile/mocks/fixtures/`
- See [MSW Documentation](https://mswjs.io/docs/)

