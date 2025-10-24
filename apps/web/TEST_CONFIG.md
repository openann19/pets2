# Test Configuration Guide

## Overview

The web app uses multiple TypeScript configurations to balance strict type checking in production code with pragmatic testing:

- **`tsconfig.json`** - Main config for production code (strict mode)
- **`tsconfig.test.json`** - Config for Jest unit/integration tests (relaxed)
- **`tsconfig.e2e.json`** - Config for Playwright E2E tests (relaxed)

## Why Separate Configs?

1. **Production code** requires strict type safety to catch bugs early
2. **Test code** benefits from flexibility (mocking, any types for test data)
3. **E2E tests** use Playwright types, not Next.js/React types

## File Associations

### Jest Tests (tsconfig.test.json)
- `**/*.test.ts`
- `**/*.test.tsx`
- `**/*.spec.ts`
- `**/*.spec.tsx`
- `__tests__/**/*`

### Playwright E2E (tsconfig.e2e.json)
- `e2e/**/*.ts`
- `playwright.config.ts`

### Production Code (tsconfig.json)
- Everything else in `src/`, `app/`, etc.

## IDE Setup

The `.vscode/settings.json` file helps VS Code use the correct TypeScript SDK. If you're using a different IDE:

- **WebStorm/IntelliJ**: Set TypeScript language service to use workspace version
- **Vim/Neovim**: Configure LSP to use local `typescript` package

## Running Tests

### Unit/Integration Tests (Jest)
```bash
pnpm test              # Run all tests with coverage
pnpm test:watch        # Watch mode
pnpm test:ci           # CI mode (no watch)
```

### E2E Tests (Playwright)
```bash
pnpm test:e2e          # Run Playwright tests
pnpm exec playwright test --ui  # Interactive UI mode
```

### E2E Tests (Cypress)
```bash
pnpm cypress open      # Interactive mode
pnpm cypress run       # Headless mode
```

## Type Checking

```bash
pnpm type-check        # Check production code only (excludes tests)
```

Note: Tests are excluded from `type-check` to avoid false positives from relaxed test configs.

## Coverage Thresholds

Current thresholds (can be increased as coverage improves):
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

## Troubleshooting

### IDE shows type errors in test files

1. Reload TypeScript server:
   - VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
   - WebStorm: File → Invalidate Caches / Restart

2. Verify `.vscode/settings.json` exists and uses workspace TypeScript

3. Check that test files match patterns in `tsconfig.test.json` or `tsconfig.e2e.json`

### Tests fail with module resolution errors

1. Ensure `moduleNameMapper` in `jest.config.js` matches `paths` in `tsconfig.json`
2. Check that `@/` alias points to correct directory
3. Verify `node_modules` are installed: `pnpm install`

### Playwright type errors

1. Install Playwright types: `pnpm add -D @playwright/test`
2. Ensure `e2e/` directory is excluded from main `tsconfig.json`
3. Check `tsconfig.e2e.json` includes Playwright types

## Best Practices

1. **Don't weaken production types** - Keep `tsconfig.json` strict
2. **Use type assertions sparingly** - Even in tests, prefer proper typing
3. **Mock at boundaries** - Mock external dependencies, not internal logic
4. **Test behavior, not implementation** - Focus on user-facing functionality
5. **Keep E2E tests simple** - Avoid complex TypeScript in E2E; focus on user flows
