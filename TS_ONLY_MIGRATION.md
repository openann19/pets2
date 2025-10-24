# TypeScript-Only Migration Plan

## Overview

Enforce TS/TSX-only across the entire monorepo. No `.js` or `.jsx` files in source code.

---

## Package Classification

### Web-Only Packages (Next.js will transpile)
- `@pawfectmatch/ui` - React components
- `@pawfectmatch/design-tokens` - Design system

### Universal Packages (Used by web + mobile)
- `@pawfectmatch/core` - Shared logic, needs build

### Node-Only Packages (Server-side)
- Server code (needs build or tsx)

---

## 1. Base TypeScript Configuration

### `/tsconfig.base.json` (Updated)

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    
    // === NO JAVASCRIPT ===
    "allowJs": false,
    "checkJs": false,
    
    "esModuleInterop": true,
    "verbatimModuleSyntax": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "incremental": true,
    
    // Strictest settings
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true
  },
  "exclude": ["node_modules", "dist", "build", "coverage"]
}
```

---

## 2. Web-Only Packages

### `packages/ui/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "allowJs": false,
    "checkJs": false,
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "noEmit": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
```

### `packages/ui/package.json` (Updated)

```json
{
  "name": "@pawfectmatch/ui",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "browser": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "files": ["src"],
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

**Key Changes:**
- Exports point directly to `.ts` source
- No build step needed (Next.js transpiles)
- `allowJs: false` enforced

---

## 3. Universal Packages (Core)

### `packages/core/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "allowJs": false,
    "checkJs": false,
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
```

### `packages/core/package.json` (Build with tsup)

```json
{
  "name": "@pawfectmatch/core",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "default": "./dist/index.mjs"
    },
    "./schemas": {
      "types": "./dist/schemas/index.d.ts",
      "import": "./dist/schemas/index.mjs"
    },
    "./types": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/types/index.mjs"
    },
    "./api": {
      "types": "./dist/api/index.d.ts",
      "import": "./dist/api/index.mjs"
    },
    "./services": {
      "types": "./dist/services/index.d.ts",
      "import": "./dist/services/index.mjs"
    },
    "./utils": {
      "types": "./dist/utils/index.d.ts",
      "import": "./dist/utils/index.mjs"
    },
    "./stores": {
      "types": "./dist/stores/index.d.ts",
      "import": "./dist/stores/index.mjs"
    },
    "./hooks": {
      "types": "./dist/hooks/index.d.ts",
      "import": "./dist/hooks/index.mjs"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.9.2"
  }
}
```

### `packages/core/tsup.config.ts`

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'schemas/index': 'src/schemas/index.ts',
    'types/index': 'src/types/index.ts',
    'api/index': 'src/api/index.ts',
    'services/index': 'src/services/index.ts',
    'utils/index': 'src/utils/index.ts',
    'stores/index': 'src/stores/index.ts',
    'hooks/index': 'src/hooks/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ['react', 'react-dom', 'zod', 'zustand', 'axios'],
});
```

---

## 4. Next.js App Configuration

### `apps/web/next.config.ts`

```typescript
import type { NextConfig } from 'next';

const config: NextConfig = {
  // Transpile TS source from workspace packages
  transpilePackages: [
    '@pawfectmatch/ui',
    '@pawfectmatch/design-tokens',
  ],
  
  typescript: {
    // Enforce type checking during build
    ignoreBuildErrors: false,
  },
  
  eslint: {
    // Enforce ESLint during build
    ignoreDuringBuilds: false,
  },
};

export default config;
```

### `apps/web/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "allowJs": false,
    "checkJs": false,
    "jsx": "preserve",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "plugins": [{ "name": "next" }],
    "noEmit": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@pawfectmatch/ui": ["../../packages/ui/src/index.ts"],
      "@pawfectmatch/ui/*": ["../../packages/ui/src/*"],
      "@pawfectmatch/core": ["../../packages/core/src/index.ts"],
      "@pawfectmatch/core/*": ["../../packages/core/src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

---

## 5. Node Packages (Server)

### Option A: Build to JS (Recommended for Production)

#### `server/tsconfig.json`

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "allowJs": false,
    "checkJs": false,
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "noEmit": false
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

#### `server/package.json`

```json
{
  "name": "server",
  "type": "module",
  "main": "./dist/index.mjs",
  "scripts": {
    "build": "tsup",
    "dev": "tsx watch src/server.ts",
    "start": "node dist/server.mjs"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "tsx": "^4.7.0",
    "typescript": "^5.9.2"
  }
}
```

#### `server/tsup.config.ts`

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  external: [
    'express',
    'mongoose',
    'socket.io',
    // ... other Node deps
  ],
});
```

### Option B: Runtime TS (Development Only)

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "node --loader tsx src/server.ts"
  }
}
```

---

## 6. ESLint Rule to Block JS Files

### `.eslintrc.json` (Root)

```json
{
  "overrides": [
    {
      "files": ["**/*.js", "**/*.jsx"],
      "excludedFiles": [
        "*.config.js",
        ".eslintrc.js",
        "jest.config.js"
      ],
      "rules": {
        "no-restricted-syntax": [
          "error",
          {
            "selector": "Program",
            "message": "Use .ts/.tsx only. JavaScript files are not allowed in source code."
          }
        ]
      }
    }
  ]
}
```

---

## 7. Migration Checklist

### Phase 1: Update Configurations
- [ ] Update `tsconfig.base.json` - set `allowJs: false`
- [ ] Update each package's `tsconfig.json`
- [ ] Update `next.config.ts` with `transpilePackages`
- [ ] Add ESLint rule to block `.js` files

### Phase 2: Convert Existing JS Files
- [ ] Find all `.js` files: `find . -name "*.js" -not -path "*/node_modules/*" -not -path "*/dist/*"`
- [ ] Rename to `.ts`: `mv file.js file.ts`
- [ ] Fix type errors
- [ ] Update imports

### Phase 3: Update Package Exports
- [ ] `@pawfectmatch/ui` - point to `.ts` source
- [ ] `@pawfectmatch/core` - build with tsup
- [ ] Update path aliases in apps

### Phase 4: Verify Build
- [ ] `pnpm -w type-check` - 0 errors
- [ ] `pnpm --filter @pawfectmatch/core build` - success
- [ ] `pnpm --filter @app/web build` - success
- [ ] `pnpm --filter server build` - success

---

## 8. Benefits

### Immediate
- ✅ No more `allowJs` confusion
- ✅ Stricter type checking
- ✅ Faster builds (no JS transpilation)
- ✅ Better IDE support

### Long-term
- ✅ Easier refactoring
- ✅ Better tree-shaking
- ✅ Smaller bundle sizes
- ✅ Fewer runtime errors

---

## 9. Commands

### Install tsup
```bash
pnpm add -D tsup -w
```

### Convert JS to TS
```bash
# Find all JS files
find apps packages -name "*.js" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -name "*.config.js"

# Rename (example)
for file in $(find src -name "*.js"); do
  mv "$file" "${file%.js}.ts"
done
```

### Build packages
```bash
pnpm --filter @pawfectmatch/core build
pnpm --filter server build
```

### Type check all
```bash
pnpm -w type-check
```

---

## 10. Next Steps

1. ✅ Update base tsconfig
2. ✅ Add tsup to core package
3. ✅ Update Next.js config
4. ✅ Convert validation script to TS (already done!)
5. ⏳ Convert remaining JS files
6. ⏳ Update ESLint rules
7. ⏳ Verify builds

**Ready to execute?** Let me know and I'll start converting files!
