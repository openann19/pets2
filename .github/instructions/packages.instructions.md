---
applyTo:
  - 'packages/**'
---

# Shared Packages Instructions

## Overview

Shared packages provide reusable code across web, mobile, and server applications. These packages must be framework-agnostic and highly portable.

## Package Structure

```
packages/
├── core/              # Business logic, types, API clients
├── ui/                # Shared React components
├── design-tokens/     # Design system tokens
├── ai/                # AI integration utilities
├── security/          # Security utilities
├── core-errors/       # Error handling
└── (more packages)
```

Each package has:
```
package-name/
├── src/
│   ├── index.ts       # Main entry point
│   ├── types/         # TypeScript types
│   └── (code)
├── package.json
├── tsconfig.json
└── README.md
```

## Core Package (@pawfectmatch/core)

### Purpose
Shared business logic, TypeScript types, API clients, and utilities used across all applications.

### Rules
- **Framework-agnostic**: No React, no DOM, no Node.js-specific APIs
- **Pure functions**: Prefer functional programming
- **Type-safe**: Explicit types for everything
- **Well-tested**: 90%+ coverage

### Example Structure
```typescript
// types/User.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export type UserCreateDTO = Omit<User, 'id' | 'createdAt'>;
export type UserUpdateDTO = Partial<UserCreateDTO>;

// api/users.ts
import { User, UserCreateDTO } from '../types/User';

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await fetch('/api/users');
    return response.json();
  },
  
  getById: async (id: string): Promise<User> => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  },
  
  create: async (data: UserCreateDTO): Promise<User> => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// utils/validation.ts
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isStrongPassword = (password: string): boolean => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};
```

## UI Package (@pawfectmatch/ui)

### Purpose
Shared React components used in both web and mobile apps (with platform-specific adapters).

### Rules
- **Component-driven**: Each component in its own file
- **TypeScript props**: Explicit prop interfaces
- **Accessible**: ARIA labels and semantic HTML
- **Documented**: JSDoc comments
- **Tested**: Snapshot + behavior tests

### Component Template
```typescript
import React from 'react';

export interface ButtonProps {
  /**
   * Button variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline';
  
  /**
   * Button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Click handler
   */
  onPress: () => void;
  
  /**
   * Button text
   */
  children: React.ReactNode;
  
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

/**
 * Reusable button component
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onPress={handleSubmit}>
 *   Submit
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  onPress,
  children,
  disabled = false,
  accessibilityLabel,
}) => {
  // Implementation
  return <button onClick={onPress}>{children}</button>;
};
```

### Testing UI Components
```typescript
import { render, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with children', () => {
    const { getByText } = render(<Button onPress={() => {}}>Click me</Button>);
    expect(getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onPress when clicked', () => {
    const handlePress = jest.fn();
    const { getByRole } = render(<Button onPress={handlePress}>Click</Button>);
    
    fireEvent.click(getByRole('button'));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when disabled prop is true', () => {
    const { getByRole } = render(<Button onPress={() => {}} disabled>Click</Button>);
    expect(getByRole('button')).toBeDisabled();
  });
});
```

## Design Tokens Package (@pawfectmatch/design-tokens)

### Purpose
Single source of truth for colors, typography, spacing, and other design system values.

### Structure
```typescript
// colors.ts
export const colors = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  text: {
    primary: '#2D3748',
    secondary: '#718096',
    inverse: '#FFFFFF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F7FAFC',
  },
  success: '#48BB78',
  error: '#F56565',
  warning: '#ED8936',
} as const;

// typography.ts
export const typography = {
  heading1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
  },
  heading2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
} as const;

// spacing.ts
export const spacing = {
  xs: 4,
  small: 8,
  medium: 16,
  large: 24,
  xl: 32,
  xxl: 48,
} as const;

// borderRadius.ts
export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xl: 16,
} as const;

// index.ts
export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { borderRadius } from './borderRadius';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
} as const;

export type Theme = typeof theme;
```

### Usage in Apps
```typescript
// Web (Tailwind config)
import { theme } from '@pawfectmatch/design-tokens';

export default {
  theme: {
    extend: {
      colors: theme.colors,
      spacing: theme.spacing,
    },
  },
};

// Mobile (StyleSheet)
import { theme } from '@pawfectmatch/design-tokens';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.background.primary,
  },
});
```

## Core Errors Package (@pawfectmatch/core-errors)

### Purpose
Centralized error handling with typed error codes.

### Implementation
```typescript
// ErrorCode.ts
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// AppError.ts
export interface AppErrorOptions {
  code: ErrorCode;
  message: string;
  statusCode?: number;
  details?: Record<string, any>;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;
  
  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.statusCode = options.statusCode || 500;
    this.details = options.details;
    
    Error.captureStackTrace(this, this.constructor);
  }
  
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

// Usage
throw new AppError({
  code: ErrorCode.VALIDATION_ERROR,
  message: 'Invalid email address',
  statusCode: 400,
  details: { field: 'email' },
});
```

## Security Package (@pawfectmatch/security)

### Purpose
Security utilities like encryption, hashing, validation.

### Example Functions
```typescript
// encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

export const encrypt = (text: string, key: string): string => {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
};

export const decrypt = (encrypted: string, key: string): string => {
  const buffer = Buffer.from(encrypted, 'base64');
  
  const salt = buffer.slice(0, SALT_LENGTH);
  const iv = buffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encryptedText = buffer.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(tag);
  
  return decipher.update(encryptedText) + decipher.final('utf8');
};

// sanitization.ts
export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

## AI Package (@pawfectmatch/ai)

### Purpose
AI integration utilities, API clients for AI services.

### Example
```typescript
// compatibility.ts
export interface CompatibilityScore {
  overall: number;
  factors: {
    breed: number;
    age: number;
    temperament: number;
    location: number;
  };
}

export const calculateCompatibility = (
  pet1: Pet,
  pet2: Pet
): CompatibilityScore => {
  const breedScore = calculateBreedCompatibility(pet1.breed, pet2.breed);
  const ageScore = calculateAgeCompatibility(pet1.age, pet2.age);
  const temperamentScore = calculateTemperamentScore(pet1, pet2);
  const locationScore = calculateLocationScore(pet1.location, pet2.location);
  
  const overall = (breedScore + ageScore + temperamentScore + locationScore) / 4;
  
  return {
    overall,
    factors: {
      breed: breedScore,
      age: ageScore,
      temperament: temperamentScore,
      location: locationScore,
    },
  };
};
```

## Package Development Guidelines

### TypeScript Configuration
Each package should have a `tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declarationDir": "./dist/types"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Package.json Structure
```json
{
  "name": "@pawfectmatch/package-name",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/types/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.9.2"
  }
}
```

### Building Packages
Packages must be built before use:
```bash
pnpm build              # Build all packages
pnpm --filter core build   # Build specific package
```

### Testing Packages
```bash
pnpm --filter core test           # Run tests
pnpm --filter core test:coverage  # With coverage
```

### Publishing Packages (if needed)
```bash
pnpm --filter core publish
```

## Dependency Rules

### Allowed Dependencies
- Utility libraries: lodash, date-fns, validator
- Type libraries: zod, yup
- Testing libraries: jest, testing-library

### Prohibited Dependencies
- ❌ React Native specific APIs in shared packages
- ❌ Browser-specific APIs (DOM, window) in core
- ❌ Node.js-specific APIs in UI packages
- ❌ Large frameworks (Express, Next.js) in shared packages

## Versioning

- Use semantic versioning: MAJOR.MINOR.PATCH
- Breaking changes: bump MAJOR
- New features: bump MINOR
- Bug fixes: bump PATCH

## Documentation

Each package must have:
- README.md with usage examples
- JSDoc comments on public APIs
- Type definitions exported
- Migration guides for breaking changes

## Quality Standards

- TypeScript strict mode: enabled
- Test coverage: 90%+
- No circular dependencies
- Tree-shakeable exports
- Small bundle size
- Zero external dependencies where possible
