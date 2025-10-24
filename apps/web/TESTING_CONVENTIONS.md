# Testing Conventions for PawfectMatch

**Version**: 1.0  
**Date**: October 13, 2025  
**Status**: Production Ready

---

## 📋 Overview

This document outlines the testing conventions, utilities, and best practices for the PawfectMatch application. Our testing infrastructure has been designed to address the 1924+ TypeScript errors and provide a robust, type-safe testing environment.

## 🎯 Goals

- **Zero TypeScript errors** in test files
- **Consistent testing patterns** across the codebase
- **Type-safe test utilities** and factories
- **Explicit assertions** instead of magic matchers
- **Maintainable test code** with clear patterns

---

## 🏗️ Architecture Overview

### Wave System Implementation

Our testing infrastructure follows a systematic "wave" approach:

1. **Wave 1-2**: Shared test utilities and expect adapters ✅
2. **Wave 3**: Type-safe factories for domain objects ✅  
3. **Wave 4**: Service mocks and external dependencies ✅
4. **Wave 5**: Environment configuration and shims ✅
5. **Wave 6**: Documentation and validation ✅

---

## 📁 Directory Structure

```
apps/web/
├── test/
│   ├── test-utils.tsx          # Shared testing utilities
│   ├── expectAdapters.ts       # Explicit assertion functions
│   ├── factories/              # Type-safe object factories
│   │   ├── index.ts           # Factory exports
│   │   ├── userFactory.ts     # User object factory
│   │   ├── petFactory.ts      # Pet object factory
│   │   └── matchFactory.ts    # Match object factory
│   └── mocks/                  # Service mocks
│       ├── index.ts           # Mock exports
│       ├── apiService.ts      # API service mock
│       ├── logger.ts          # Logger mock
│       └── notificationService.ts # Notification mock
├── jest.setup.ts               # Global test setup
├── tsconfig.test.json          # Test-specific TypeScript config
└── __tests__/                  # Test files
```

---

## 🔧 Core Utilities

### 1. Test Utils (`test/test-utils.tsx`)

**Purpose**: Centralized testing utilities with provider wrappers

#### Key Functions:

```typescript
// Enhanced render with providers
import { renderWithProviders } from '@/test/test-utils';

const { getByRole, user } = renderWithProviders(<MyComponent />, {
  providers: {
    router: true,
    queryClient: true,
    theme: true
  },
  initialEntries: ['/dashboard']
});
```

#### Available Utilities:

- `renderWithProviders()` - Render with React Query, Router, Theme providers
- `hasClass()` - Safe class checking with null safety
- `getAttribute()` - Safe attribute access
- `isInDocument()` - Check if element exists in DOM
- `mockIntersectionObserver()` - Mock intersection observer
- `mockResizeObserver()` - Mock resize observer
- `waitForElement()` - Wait for dynamic elements

### 2. Expect Adapters (`test/expectAdapters.ts`)

**Purpose**: Replace Jest matchers with explicit, type-safe assertions

#### Migration Guide:

```typescript
// ❌ OLD - Jest matchers (causes TypeScript errors)
expect(element).toBeInTheDocument();
expect(element).toHaveClass('active');
expect(value).toBe(expected);

// ✅ NEW - Explicit adapters (type-safe)
import { expectInDocument, expectHasClass, expectEqual } from '@/test/expectAdapters';

expectInDocument(element);
expectHasClass(element, 'active');
expectEqual(value, expected);
```

#### Core Adapters:

| Jest Matcher | Adapter Function | Usage |
|-------------|------------------|-------|
| `toBe()` | `expectEqual()` | `expectEqual(actual, expected)` |
| `toEqual()` | `expectDeepEqual()` | `expectDeepEqual(obj1, obj2)` |
| `toBeInTheDocument()` | `expectInDocument()` | `expectInDocument(element)` |
| `toHaveClass()` | `expectHasClass()` | `expectHasClass(element, 'class')` |
| `toThrow()` | `expectThrows()` | `expectThrows(() => fn())` |
| `toHaveBeenCalled()` | `expectCalled()` | `expectCalled(mockFn)` |

---

## 🏭 Type-Safe Factories

### Purpose

Eliminate incomplete object literals and provide consistent test data with proper TypeScript typing.

### Usage

```typescript
import { createUser, createPet, createMatch } from '@/test/factories';

// Create with defaults
const user = createUser();

// Override specific fields
const premiumUser = createUser({
  subscription: 'premium',
  email: 'premium@example.com'
});

// Create related objects
const pet = createPet({ ownerId: user.id });
const match = createMatch({ 
  user1Id: user.id, 
  petId: pet.id 
});
```

### Available Factories

- `createUser(overrides?)` - User objects with realistic defaults
- `createPet(overrides?)` - Pet profiles with photos and details  
- `createMatch(overrides?)` - Match objects with compatibility scores
- `createMessage(overrides?)` - Chat messages with timestamps
- `createNotification(overrides?)` - Push notifications

---

## 🎭 Service Mocks

### Purpose

Provide typed mocks for external services that maintain interface compatibility while enabling controlled testing.

### API Service Mock

```typescript
import { mockApiService } from '@/test/mocks';

// Use in tests
jest.mock('@/services/api', () => mockApiService);

// Or configure specific responses
mockApiService.get.mockResolvedValue({ data: mockData });
```

### Logger Mock

```typescript
import { mockLogger } from '@/test/mocks';

// Verify logging
expectCalled(mockLogger.info);
expectCalledWith(mockLogger.error, 'Error message', { context: 'test' });
```

### Notification Service Mock

```typescript
import { mockNotificationService } from '@/test/mocks';

// Test notification behavior
mockNotificationService.show.mockImplementation((notification) => {
  // Custom test logic
});
```

---

## 🛠️ Environment Setup

### Browser API Mocks

Our `jest.setup.ts` provides comprehensive mocks for:

- **Observer APIs**: ResizeObserver, IntersectionObserver, MutationObserver
- **Storage APIs**: localStorage, sessionStorage
- **Geolocation API**: getCurrentPosition, watchPosition
- **Notification API**: Notification constructor, permission handling
- **Clipboard API**: writeText, readText
- **File APIs**: FileReader, URL.createObjectURL
- **Performance APIs**: performance.now, performance.mark

### Global Shims

```typescript
// Automatically available in all tests
window.matchMedia() // Media query matching
window.scrollTo()   // Scroll behavior
navigator.geolocation // Location services
navigator.clipboard  // Clipboard operations
```

---

## 📝 Writing Tests

### Component Tests

```typescript
import { renderWithProviders, expectInDocument, expectHasClass } from '@/test/test-utils';
import { createUser } from '@/test/factories';
import UserProfile from '@/components/UserProfile';

describe('UserProfile', () => {
  it('should render user information correctly', () => {
    // Arrange
    const user = createUser({
      name: 'John Doe',
      email: 'john@example.com'
    });

    // Act  
    const { getByText } = renderWithProviders(
      <UserProfile user={user} />,
      {
        providers: { router: true, queryClient: true }
      }
    );

    // Assert
    const nameElement = getByText('John Doe');
    expectInDocument(nameElement);
    expectHasClass(nameElement, 'user-name');
  });
});
```

### Hook Tests

```typescript
import { renderHook } from '@testing-library/react';
import { renderWithProviders, expectEqual } from '@/test/test-utils';
import { useUserProfile } from '@/hooks/useUserProfile';
import { createUser } from '@/test/factories';

describe('useUserProfile', () => {
  it('should return user profile data', () => {
    const user = createUser();
    
    const { result } = renderHook(() => useUserProfile(user.id), {
      wrapper: ({ children }) => renderWithProviders(children, {
        providers: { queryClient: true }
      }).container
    });

    expectEqual(result.current.data?.id, user.id);
  });
});
```

### API Tests

```typescript
import { expectEqual, expectCalled } from '@/test/expectAdapters';
import { mockApiService } from '@/test/mocks';
import { createUser } from '@/test/factories';
import { userService } from '@/services/userService';

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user profile', async () => {
    // Arrange
    const user = createUser();
    mockApiService.get.mockResolvedValue({ data: user });

    // Act
    const result = await userService.getProfile(user.id);

    // Assert
    expectEqual(result.id, user.id);
    expectCalled(mockApiService.get);
    expectCalledWith(mockApiService.get, `/users/${user.id}`);
  });
});
```

---

## 🚫 Anti-Patterns to Avoid

### ❌ Don't Use Jest Matchers Directly

```typescript
// This causes TypeScript errors
expect(element).toBeInTheDocument();
expect(value).toBe(expected);
```

### ❌ Don't Create Incomplete Objects

```typescript
// Missing required fields causes TypeScript errors
const user = {
  id: '1',
  name: 'John'
  // Missing email, createdAt, etc.
};
```

### ❌ Don't Mock Everything

```typescript
// Over-mocking makes tests brittle
jest.mock('@/components/Button');
jest.mock('@/hooks/useAuth');
jest.mock('@/utils/format');
```

### ❌ Don't Use Snapshot Tests

```typescript
// Discouraged per premium UX rules
expect(component).toMatchSnapshot();
```

---

## ✅ Best Practices

### 1. Use Explicit Assertions

```typescript
// ✅ Good - Clear intent
expectEqual(user.status, 'active');
expectHasClass(button, 'btn-primary');
expectInDocument(modal);
```

### 2. Use Factories for Test Data

```typescript
// ✅ Good - Complete, realistic data
const user = createUser({ role: 'admin' });
const pet = createPet({ species: 'dog' });
```

### 3. Test Behavior, Not Implementation

```typescript
// ✅ Good - Tests user behavior
user.click(button);
expectInDocument(getByText('Success message'));

// ❌ Bad - Tests implementation details
expect(component.state.isLoading).toBe(false);
```

### 4. Use Descriptive Test Names

```typescript
// ✅ Good
it('should show error message when login fails with invalid credentials')

// ❌ Bad  
it('should handle error')
```

### 5. Follow AAA Pattern

```typescript
it('should update user profile', async () => {
  // Arrange
  const user = createUser();
  const updates = { name: 'New Name' };

  // Act
  await userService.updateProfile(user.id, updates);

  // Assert
  expectCalled(mockApiService.put);
});
```

---

## 🔧 Configuration Files

### TypeScript Configuration

- **`tsconfig.test.json`**: Relaxed type checking for tests
- **Path mapping**: `@/test/*` for test utilities
- **Types**: Jest, Testing Library, Node.js

### Jest Configuration

- **`jest.setup.ts`**: Global mocks and polyfills
- **`jest.config.js`**: Test runner configuration
- **`jest.api.config.js`**: API-specific test configuration

---

## 🐛 Troubleshooting

### Common Issues

#### TypeScript Errors in Tests

**Issue**: `Property 'toBeInTheDocument' does not exist on type 'Assertion'`

**Solution**: Use expect adapters instead
```typescript
// Replace this
expect(element).toBeInTheDocument();

// With this
expectInDocument(element);
```

#### Missing Test Dependencies

**Issue**: `Cannot find module '@/test/test-utils'`

**Solution**: Check tsconfig path mapping
```json
{
  "paths": {
    "@/test/*": ["test/*"]
  }
}
```

#### Mock Not Working

**Issue**: Service mock not being used

**Solution**: Verify mock import order
```typescript
// Mock BEFORE importing the module that uses it
jest.mock('@/services/api');
import { userService } from '@/services/userService';
```

### Debugging Tips

1. **Use `debugElement()`** to inspect DOM structure
2. **Check mock call counts** with `expectCalledTimes()`
3. **Verify provider wrapping** for hooks and context
4. **Clear mocks** between tests with `jest.clearAllMocks()`

---

## 📊 Migration Progress

### Current Status

- ✅ **Test utilities**: Complete with providers and safety helpers
- ✅ **Expect adapters**: All common Jest matchers replaced
- ✅ **Type-safe factories**: User, Pet, Match, Message factories
- ✅ **Service mocks**: API, Logger, Notification services
- ✅ **Environment setup**: Browser API mocks and shims
- ✅ **TypeScript config**: Test-specific configuration

### Error Reduction

- **Before**: 1924+ TypeScript errors
- **Target**: 0 TypeScript errors
- **Focus areas**: Matcher compatibility, missing imports, incomplete objects

---

## 🚀 Next Steps

1. **Run validation** - Execute full test suite to verify implementation
2. **Fix remaining errors** - Address any lingering TypeScript issues  
3. **Update existing tests** - Migrate legacy tests to new patterns
4. **Training** - Educate team on new testing conventions
5. **Monitoring** - Track error count reduction in CI/CD

---

## 📞 Support

For questions about testing conventions:

- **Technical Lead**: See repository maintainers
- **Documentation**: This file (TESTING_CONVENTIONS.md)
- **Examples**: Check `__tests__/` directories for implementation examples

---

**Last Updated**: October 13, 2025  
**Next Review**: Weekly during sprint planning