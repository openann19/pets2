# package.md

## 1. Configs

### Root package.json (scripts + devDependencies)

```jsonc
{
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "pnpm --filter apps/web dev",
    "dev:mobile": "pnpm --filter apps/mobile start",
    "build": "turbo run build",
    "start": "turbo run start",
    "lint": "turbo run lint -- --max-warnings 0",
    "lint:check": "turbo run lint -- --max-warnings 0",
    "lint:fix": "turbo run lint:fix && turbo run lint -- --max-warnings 0",
    "type-check": "turbo run type-check",
    "test": "turbo run test --",
    "test:coverage": "turbo run test -- --coverage",
    "test:e2e": "turbo run test:e2e",
    "test:a11y": "turbo run test:a11y",
    "format": "turbo run format",
    "format:check": "turbo run format:check",
    "quality:gate": "node scripts/quality-gate.cjs",
    "quality:report": "node scripts/quality-gate.cjs --report",
    "bundle:check": "turbo run bundle:check",
    "perf:check": "turbo run perf:check",
    "test:smoke": "turbo run test:smoke",
    "test:integration": "turbo run test:integration",
    "test:performance": "turbo run test:performance",
    "test:accessibility": "turbo run test:accessibility",
    "test:visual": "turbo run test:visual",
    "test:security": "turbo run test:security",
    "lighthouse": "lhci autorun",
    "bundle:analyze": "turbo run bundle:analyze",
    "bundle:compare": "node scripts/bundle-compare.js",
    "deps:audit": "pnpm audit",
    "deps:update": "pnpm update --latest",
    "code:quality": "pnpm run lint && pnpm run type-check && pnpm run format:check",
    "test:all": "pnpm run test:ci && pnpm run test:integration && pnpm run test:e2e",
    "security:audit": "pnpm audit --audit-level=moderate",
    "ci:full": "pnpm run code:quality && pnpm run test:all && pnpm run security:audit && pnpm run lighthouse",
    "ci:all": "bash scripts/ci-all.sh",
    "deploy:validate": "node scripts/validate-deployment.cjs",
    "deploy:check": "pnpm run deploy:validate",
    "god-phase:complete": "echo '🎉 God-Phase Production Hardening Complete! All quality gates passed.'",
    "ea:mobile": "tsx scripts/ea.ts",
    "ea:mobile:write": "tsx scripts/ea.ts --write",
    "ea:enhanced": "tsx scripts/ea-enhanced.ts",
    "ea:enhanced:write": "tsx scripts/ea-enhanced.ts --write",
    "fix:theme": "tsx scripts/fix-theme-errors.ts",
    "fix:theme:write": "tsx scripts/fix-theme-errors.ts --write",
    "fix:colors": "tsx scripts/fix-color-errors.ts",
    "fix:colors:write": "tsx scripts/fix-color-errors.ts --write",
    "fix:chained": "tsx scripts/fix-chained-properties.ts",
    "fix:chained:write": "tsx scripts/fix-chained-properties.ts --write",
    "mobile:tsc": "cd apps/mobile && pnpm exec tsc --noEmit",
    "mobile:exports": "cd apps/mobile && tsx scripts/analyze-exports.ts",
    "mobile:contract:check": "cd apps/mobile && tsx scripts/validate-contracts.ts",
    "mobile:a11y": "cd apps/mobile && tsx scripts/run-a11y-audit.ts",
    "mobile:perf": "cd apps/mobile && tsx scripts/run-perf-audit.ts",
    "mobile:mock": "cd apps/mobile && tsx scripts/mock-server.ts",
    "mobile:scan:ui": "cd apps/mobile && node scripts/scan-ui-violations.js",
    "mobile:scan:colors": "rg -n \"#([0-9a-fA-F]{3,8})\" apps/mobile/src | rg -v \"theme|tokens\" | cat",
    "mobile:scan:spacing": "rg -n \"(padding|margin|gap)\\s*:\\s*\\d+\\b\" apps/mobile/src | rg -v \"tokens|theme\" | cat",
    "i18n:scan": "i18next-scanner --config i18next-scanner.config.cjs",
    "i18n:check": "node scripts/i18n-check.mjs",
    "next15:scan": "node scripts/check-next15-async.mjs apps/web",
    "next15:scan:rg": "rg -n \"\\bcookies\\(|\\bheaders\\(|\\bdraftMode\\(\" apps/web --glob '!**/node_modules/**' || true"
  },
  "devDependencies": {
    "@babel/parser": "^7.28.5",
    "@babel/runtime": "^7.28.4",
    "@babel/types": "^7.28.5",
    "@eslint/js": "^9.37.0",
    "@heroicons/react": "^2.2.0",
    "@jest/globals": "^29.7.0",
    "@next/eslint-plugin-next": "^14.2.33",
    "@storybook/addon-essentials": "^7.5.0",
    "@storybook/addon-interactions": "^7.5.0",
    "@storybook/react": "^7.5.0",
    "@tailwindcss/line-clamp": "^0.4.4",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/react-hooks": "^8.0.1",
    "@testing-library/react-native": "^12.3.0",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.11.30",
    "@types/react-dom": "^18.2.0",
    "@types/validator": "^13.15.3",
    "@typescript-eslint/eslint-plugin": "^8.46.1",
    "@typescript-eslint/parser": "^8.46.1",
    "babel-plugin-module-resolver": "^5.0.0",
    "debug": "^4.4.3",
    "detox": "^20.0.0",
    "eslint": "^8.57.1",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-eslint-comments": "^3.2.0",
    "eslint-plugin-i18next": "^6.1.3",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^7.0.0",
    "fast-glob": "^3.3.3",
    "gitleaks": "^1.0.0",
    "globals": "^16.4.0",
    "globby": "^15.0.0",
    "husky": "^8.0.3",
    "i18next-scanner": "^4.6.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "jest-expo": "^51.0.0",
    "jest-junit": "^16.0.0",
    "jscodeshift": "^17.3.0",
    "lint-staged": "^16.2.4",
    "msw": "^1.2.0",
    "prettier": "^3.6.2",
    "ts-jest": "^29.2.0",
    "ts-morph": "^27.0.2",
    "tsup": "^8.5.0",
    "tsx": "^4.20.6",
    "turbo": "^2.3.3",
    "typescript-eslint": "^8.46.1",
    "whatwg-fetch": "^3.6.20"
  }
}
```

### Root tsconfig.json
```jsonc
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./tsconfig.base.json",
  "display": "Pawfect Match - Monorepo Root",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@pawfectmatch/ui": ["packages/ui/src/index.ts"],
      "@pawfectmatch/ui/*": ["packages/ui/src/*"],
      "@pawfectmatch/core": [
        "packages/core/src/index.ts",
        "packages/core/dist/index.d.ts"
      ],
      "@pawfectmatch/core/*": [
        "packages/core/src/*",
        "packages/core/dist/*"
      ]
    },
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "noEmit": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": [
    "node_modules",
    ".github",
    "**/cypress/**",
    "**/*.cy.ts",
    "**/*.cy.tsx",
    "cypress",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/e2e/**",
    "dist",
    ".next",
    "coverage",
    "_archive"
  ]
}
```

### apps/mobile/tsconfig.json

```jsonc
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2023"],
    "types": ["react-native"],
    "typeRoots": ["./src/types", "./node_modules/@types"],
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"],
      "@mobile/*": ["./src/*"],
      "@pawfectmatch/core": ["../../packages/core/src/index.ts"],
      "@pawfectmatch/core/*": ["../../packages/core/src/*"],
      "@pawfectmatch/ui": ["../../packages/ui/src/index.ts"],
      "@pawfectmatch/ui/*": ["../../packages/ui/src/*"],
      "@pawfectmatch/design-tokens": ["../../packages/design-tokens/src/index.ts"],
      "@pawfectmatch/design-tokens/*": ["../../packages/design-tokens/src/*"]
    },
    "jsx": "react-jsx",
    "allowJs": true,
    "noEmit": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "module": "esnext",
    "moduleResolution": "bundler"
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "App.tsx",
    "app.config.cjs",
    "babel.config.cjs",
    "metro.config.cjs"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "coverage",
    "**/__mocks__/**",
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.test.tsx",
    "**/image-ultra/**",
    "**/web-only/**",
    "**/*.stories.tsx",
    "**/stories/**"
  ]
}
```

### tsconfig.base.json (shared)

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
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
    "verbatimModuleSyntax": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["packages/shared/*"],
      "@shared/errors": ["packages/core-errors/src/index.ts"],
      "@shared/errors/*": ["packages/core-errors/src/*"]
    }
  }
}
```

### ESLint & Prettier configs

#### .eslintrc.js

```js
"use strict";

module.exports = {
  plugins: ["local"],
  overrides: [
    {
      files: ["apps/mobile/src/**/*.{ts,tsx,js,jsx}"],
      excludedFiles: [
        "**/theme/**/*.{ts,tsx}",
        "**/constants/**/*.{ts,tsx}",
        "**/styles/**/*.{ts,tsx}",
        "**/types/**/*.{ts,tsx}",
      ],
      rules: {
        "local/no-hardcoded-colors": "error",
      },
    },
  ],
};
```

#### .prettierrc

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "quoteProps": "consistent",
  "jsxSingleQuote": false,
  "proseWrap": "always",
  "htmlWhitespaceSensitivity": "strict",
  "embeddedLanguageFormatting": "auto",
  "requirePragma": false,
  "insertPragma": false,
  "vueIndentScriptAndStyle": false,
  "singleAttributePerLine": true,
  "overrides": [
    {
      "files": ["*.json", "*.jsonc"],
      "options": {
        "parser": "json",
        "trailingComma": "none"
      }
    },
    {
      "files": ["*.md"],
      "options": {
        "parser": "markdown",
        "proseWrap": "always",
        "printWidth": 80
      }
    },
    {
      "files": ["*.yml", "*.yaml"],
      "options": {
        "parser": "yaml",
        "bracketSpacing": true
      }
    }
  ]
}
```

### Module aliasing

- **TypeScript (root)** paths in `tsconfig.json`
- **TypeScript (mobile)** additional `@/*`, `@mobile/*`, `@pawfectmatch/*` aliases via `apps/mobile/tsconfig.json`
- **Babel (mobile)**: `apps/mobile/babel.config.cjs`
```js
const moduleResolverPlugin = [
  'module-resolver',
  {
    root: ['./src'],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@mobile': './src',
      '@': './src',
    },
  },
];
```
- **Metro**: `apps/mobile/metro.config.cjs` resolves workspace packages and aliases `@pawfectmatch/*` to built artifacts.

### Theme source of truth (apps/mobile/src/theme)

- `Provider.tsx`: Theme React context + `useTheme`
- `resolve.ts`: Builds `AppTheme` from `unified-theme`
- `types.ts`: `Theme`, `SemanticColors`, `Spacing`, `Radius`, `Motion` etc.
- `contracts.ts`: Canonical `AppTheme` contract (scheme/colors/spacing/radii/typography/palette)
- `adapters.ts`: Backward compatible color adapters (`getExtendedColors`)
- `index.ts`: Public exports and `createTheme`
- `rnTokens.ts`, `theme.ts`: Legacy token definitions


## 2. Canonical token mapping (EA_CONFIG.ts)

```ts
export const COLOR_MAP = {
  'theme.colors.text': 'theme.colors.onSurface',
  'theme.colors.textMuted': 'theme.colors.onMuted',
  'theme.colors.background': 'theme.colors.bg',
  'theme.colors.bgAlt': 'theme.colors.surface',
  'theme.colors.bgElevated': 'theme.colors.surface',
  'theme.colors.surfaceAlt': 'theme.colors.overlay',
  'theme.colors.border.light': 'theme.colors.border',
  'theme.colors.borderDark': 'theme.colors.border',
  'theme.colors.neutral': 'theme.palette.neutral',
  'theme.colors.neutral[0]': 'theme.colors.bg',
  'theme.colors.neutral[50]': 'theme.palette.neutral[50]',
  'theme.colors.neutral[100]': 'theme.palette.neutral[100]',
  'theme.colors.neutral[200]': 'theme.palette.neutral[200]',
  'theme.colors.neutral[300]': 'theme.palette.neutral[300]',
  'theme.colors.neutral[400]': 'theme.palette.neutral[400]',
  'theme.colors.neutral[500]': 'theme.palette.neutral[500]',
  'theme.colors.neutral[600]': 'theme.palette.neutral[600]',
  'theme.colors.neutral[700]': 'theme.palette.neutral[700]',
  'theme.colors.neutral[800]': 'theme.palette.neutral[800]',
  'theme.colors.neutral[900]': 'theme.palette.neutral[900]',
  'theme.colors.secondary': 'theme.colors.primary',
  'theme.colors.secondaryText': 'theme.colors.onPrimary',
  'theme.colors.secondary[500]': 'theme.colors.primary',
  'theme.colors.status.success': 'theme.colors.success',
  'theme.colors.status.warning': 'theme.colors.warning',
  'theme.colors.status.error': 'theme.colors.danger',
  'colors.bgAlt': 'theme.colors.surface',
  'colors.surfaceAlt': 'theme.colors.overlay'
};

export const SPACING_MAP = {
  "spacing['4xl']": 'theme.spacing["4xl"]',
  'spacing.none': 'theme.spacing.xs * 0',
  'spacing.xxl': 'theme.spacing["4xl"]',
  'Spacing["5xl"]': 'theme.spacing["4xl"]',
  'Spacing["6xl"]': 'theme.spacing["4xl"]',
  'Spacing["7xl"]': 'theme.spacing["4xl"]',
  'Spacing["8xl"]': 'theme.spacing["4xl"]',
  'spacing.lg * 2': 'theme.spacing["4xl"]',
  'spacing.xl * 1.5': 'theme.spacing["4xl"]'
};

export const RADII_MAP = {
  'theme.radius.none': 'theme.radii.none',
  'theme.radius.xs': 'theme.radii.xs',
  'theme.radius.sm': 'theme.radii.sm',
  'theme.radius.md': 'theme.radii.md',
  'theme.radius.lg': 'theme.radii.lg',
  'theme.radius.xl': 'theme.radii.xl',
  'theme.radius["2xl"]': 'theme.radii["2xl"]',
  'theme.radius.xxxl': 'theme.radii.full',
  'theme.radius.full': 'theme.radii.full',
  'theme.radius.pill': 'theme.radii.pill',
  'theme.radius["4xl"]': 'theme.radii.full'
};

export const IMPORT_ALIAS_MAP = {
  '@/components': '@mobile/src/components',
  '@/theme': '@mobile/src/theme',
  '@mobile/theme': '@mobile/src/theme'
};
```

## 3. Logs
- `_logs/tsc.txt`: TypeScript compile errors (in-place, 2,027 lines; highlights initial parse issues across mobile components)
- `_logs/eslint.txt`: ESLint failure (needs typed config for `@typescript-eslint/no-unsafe-assignment`)
- `_logs/theme_colors.txt`: `rg` results for `theme.colors.*`
- `_logs/spacing_hacks.txt`: `rg` results for spacing arithmetic / bracket access
- `_logs/radii.txt`: `rg` results for radius/radii tokens
- `_logs/ea_dryrun.txt`: `pnpm ea` dry-run output (process exited 254)
- `_logs/env.txt`: Node `v22.21.1`, pnpm `9.15.0`

## 4. Samples
### Screens needing fixes

1. `apps/mobile/src/screens/admin/AdminAnalyticsScreen.tsx`
2. `apps/mobile/src/screens/adoption/AdoptionApplicationScreen.tsx`
3. `apps/mobile/src/screens/ai/AICompatibilityScreen.tsx`
4. `apps/mobile/src/screens/onboarding/WelcomeScreen.tsx`
5. `apps/mobile/src/screens/PremiumScreen.tsx`

### Semantic token “gold” references

- `apps/mobile/src/screens/HomeScreen.tsx`
- `apps/mobile/src/components/i18n/LanguageSwitcher.tsx`

## 5. Boundaries & constraints
- Avoid modifying generated/archived folders: `**/node_modules/**`, `_archive/**`, `**/__generated__/**`, `apps/mobile/src/theme/**` (unless coordinated), Storybook mocks.
- Manual edits only (user preference: no codemod automation).
- CI constraints: Node >= 20, pnpm >= 9. TypeScript 5.9.x via workspace overrides. ESLint flat config requires parser `project` wiring for typed rules.
