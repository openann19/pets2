# Module System Documentation

## Overview
PawfectMatch uses a consistent module system across the monorepo to ensure compatibility and maintainability.

## Module Types

### Frontend Apps (Web & Mobile)
- **Module System**: ES Modules (`"type": "module"` in package.json)
- **Import Style**: ES6 imports/exports
- **File Extensions**: `.ts`, `.tsx`, `.js`, `.jsx`

### Backend Services (Server & AI Service)
- **Module System**: CommonJS (`"type": "commonjs"` in package.json)
- **Import Style**: `require()` / `module.exports`
- **File Extensions**: `.js`

### Core Package
- **Module System**: ES Modules (for tree-shaking and modern tooling)
- **Import Style**: ES6 imports/exports
- **File Extensions**: `.ts`

## Import Patterns

### Preferred Import Style
```typescript
// ✅ Good - named imports
import { useQuery, useMutation } from '@tanstack/react-query';

// ✅ Good - type imports
import type { User, Pet } from '@pawfectmatch/core';

// ✅ Good - default imports
import React from 'react';
```

### Avoided Patterns
```typescript
// ❌ Avoid - wildcard imports
import * as React from 'react';

// ❌ Avoid - mixed default and named
import React, { useState } from 'react';
```

## Path Aliases

Both web and mobile apps use consistent path aliases:
- `@/*` - points to `src/` directory
- `@pawfectmatch/core` - shared types and utilities

## TypeScript Configuration

All packages extend the base `tsconfig.base.json` with:
- Strict type checking enabled
- ES2022 target with ES2023 libraries
- Consistent module resolution
