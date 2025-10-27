# Archived ESLint Configurations

**Date**: 2025-01-26  
**Phase**: Phase 0 - Configuration Unification  
**Reason**: Duplicate configs creating inconsistency and conflicts with root ESLint config

## Why These Configs Were Archived

As part of PawfectMatch's production readiness initiative (Phase 0), we unified all ESLint configurations under a single source of truth: **`/eslint.config.js`** at the repository root.

### Problems with Duplicate Configs

1. **Inconsistent Rules**: Different workspaces had different rule severities
2. **Maintenance Burden**: Rules had to be updated in multiple places
3. **Conflicts**: Type-aware linting couldn't properly coordinate across duplicates
4. **Developer Confusion**: Unclear which config takes precedence

### Root Config Strategy

The root `eslint.config.js` uses ESLint 9 flat config format with:

- **Global baseline**: Recommended JS/TS rules for all files
- **Workspace-specific overrides**: Type-aware linting per workspace (apps/web, apps/mobile, packages/core, etc.)
- **Test file relaxations**: Allow `any` and other pragmatic choices in test files
- **Zero-tolerance production rules**:
  - `@typescript-eslint/no-explicit-any`: error
  - `@typescript-eslint/no-unsafe-*`: error (type-aware)
  - `react-hooks/exhaustive-deps`: error
  - `no-console`: error (except logger files)

### Archived Configs

## `apps-web.eslint.config.js.backup`

**Original Location**: `apps/web/eslint.config.js`  
**Archived**: 2025-01-26  
**Reason**: Complete duplicate of root config with own rule definitions

This config was attempting to:
- Enable strict type-aware linting (already in root)
- Configure Next.js plugin (already in root)
- Define React/hooks rules (already in root)
- Support a `ESLINT_STRICT=1` flag (now always strict in root)

**Migration**: The root config at `/eslint.config.js` already has a dedicated block for `apps/web/**/*.{ts,tsx}` with all the same rules. No functionality lost.

**If you need to restore**: This file is preserved here for reference, but should NOT be re-enabled without updating ADR and plan.

---

## How Workspaces Use Root Config

All workspaces now automatically inherit from root config. If a workspace needs special configuration:

1. **Preferred**: Add a workspace-specific block in root `eslint.config.js`
2. **If unavoidable**: Create workspace config that imports root via `import rootConfig from '../../eslint.config.js'` and extends it (see `packages/ai/eslint.config.js` for example)

### Example: packages/ai/eslint.config.js (GOOD pattern)

```javascript
import rootConfig from '../../eslint.config.js';
export default [
  ...rootConfig,  // Spread root config
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],  // Add package-specific tsconfig
      },
    },
  },
];
```

This pattern:
- ✅ Reuses all root rules
- ✅ Only adds workspace-specific parser options
- ✅ Doesn't duplicate rule definitions

---

## Rollback Instructions

If you absolutely must restore an archived config (requires ADR approval):

1. Review the archived config to understand what was customized
2. Add those customizations to root config as a new workspace block
3. Document in ADR why workspace-specific config is needed
4. Update `/reports/config_baseline.json`

**DO NOT** simply copy the archived file back - it will conflict with root config.

---

## References

- **Root ESLint Config**: `/eslint.config.js`
- **Config Audit**: `/reports/config_baseline.json`
- **Plan**: `/apps/mobile/plan1.md` - Phase 0
- **ADR**: Will be created as `docs/adr/002-immutable-lint-rules.md`
