# Archived TypeScript Configurations

**Date**: 2025-01-26  
**Phase**: Phase 0.3 - TypeScript Config Unification  
**Reason**: Duplicate base configs creating inconsistency instead of extending root `tsconfig.base.json`

## Why These Configs Were Archived

As part of PawfectMatch's production readiness initiative (Phase 0.3), we unified all TypeScript configurations to extend a single source of truth: **`/tsconfig.base.json`** at the repository root.

### Problems with Duplicate Base Configs

1. **Inconsistent Strict Settings**: Each workspace potentially had different strictness levels
2. **Maintenance Burden**: When updating strict settings, had to update multiple files
3. **Configuration Drift**: Easy to forget to sync changes across duplicates
4. **Confusion**: Unclear which base config takes precedence

### Root Base Config Strategy

The root `tsconfig.base.json` defines all strict settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "verbatimModuleSyntax": true,
    "forceConsistentCasingInFileNames": true
    // ... and more
  }
}
```

All workspace `tsconfig.json` files extend this base:

```json
{
  "extends": "../../tsconfig.base.json",  // or "../tsconfig.base.json"
  "compilerOptions": {
    // Only workspace-specific overrides here
  }
}
```

### Archived Configs

## `apps-web.tsconfig.base.json.backup`

**Original Location**: `apps/web/tsconfig.base.json`  
**Archived**: 2025-01-26  
**Reason**: Duplicated all strict settings instead of extending root base

The correct `apps/web/tsconfig.json` now extends `../../tsconfig.base.json` and only adds web-specific overrides (lib, paths, etc.).

## `apps-mobile.tsconfig.base.json.backup`

**Original Location**: `apps/mobile/tsconfig.base.json`  
**Archived**: 2025-01-26  
**Reason**: Duplicated all strict settings instead of extending root base

The correct `apps/mobile/tsconfig.json` now extends `../../tsconfig.base.json` and only adds React Native-specific overrides (jsx, types, noEmit, etc.).

## Server Config Fixed (Not Archived)

**File**: `server/tsconfig.json`  
**Action**: Updated in-place to extend `../tsconfig.base.json`  
**Before**: Duplicated all strict settings  
**After**: Extends root base, only overrides server-specific settings (module, lib, paths)

---

## Current TypeScript Config Structure

```
tsconfig.base.json                  ← ROOT (strict settings)
├── tsconfig.json                   ← Extends base + monorepo paths
├── apps/mobile/tsconfig.json       ← Extends ../../tsconfig.base.json + RN overrides
├── apps/web/tsconfig.json          ← Extends ../../tsconfig.base.json + Next.js overrides
├── server/tsconfig.json            ← Extends ../tsconfig.base.json + Node.js overrides
├── packages/core/tsconfig.json     ← Extends ../../tsconfig.base.json + package overrides
├── packages/ai/tsconfig.json       ← Extends ../../tsconfig.base.json
├── packages/ui/tsconfig.json       ← Extends ../../tsconfig.base.json
└── packages/design-tokens/tsconfig.json ← Extends ../../tsconfig.base.json
```

All test-specific configs (`.test.json`) extend their parent workspace config.

---

## Rollback Instructions

If you absolutely must restore an archived base config (requires ADR approval):

1. **DON'T** simply copy the file back
2. Review what settings were in the archived base
3. Update the root `tsconfig.base.json` if those settings should be monorepo-wide
4. Document in ADR why workspace-specific base config is needed
5. Update `/reports/config_baseline.json`

**Preferred**: Keep workspace configs extending root base. Add workspace-specific overrides in the main `tsconfig.json`, not a separate base.

---

## References

- **Root Base Config**: `/tsconfig.base.json`
- **Config Audit**: `/reports/config_baseline.json`
- **Plan**: `/apps/mobile/plan1.md` - Phase 0.3
- **ADR**: Will be created as `docs/adr/001-strict-typescript-config.md`
