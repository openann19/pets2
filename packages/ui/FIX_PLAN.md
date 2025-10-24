# UI Package Fix Script
# Fixes the most critical TypeScript errors in @pawfectmatch/ui

## Issues to Fix:

### 1. Move setupTests.ts out of src/ (causing jest namespace errors)
```bash
cd /Users/elvira/Downloads/pets-pr-1/packages/ui
mv src/setupTests.ts setupTests.ts
# Update tsconfig.json exclude if needed
```

### 2. Add 'transitions' export alias to design-system.ts
```typescript
// At end of packages/ui/src/theme/design-system.ts
export const transitions = MOTION_CONFIG;
```

### 3. Fix PremiumButton imports
```typescript
// Line 1 of packages/ui/src/components/Premium/PremiumButton.tsx
import React from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { COLORS, GRADIENTS, SHADOWS, RADIUS, transitions } from '../../theme/design-system';
```

### 4. Fix PremiumInput imports
Already has transitions import, just needs to be available

### 5. Fix motion component className issues
Two options:
A) Use 'as' prop: `<motion.div as="div" className="...">`
B) Use style prop instead: `style={{ ...styles }}`
C) Cast to any (temporary): `<motion.div className="..." {...(props as any)}>`

### 6. Remove invalid cross-package imports
```typescript
// packages/ui/src/hooks/useHapticFeedback.ts
// REMOVE: import logger from '../../../web/src/services/logger';
// ADD: console.error (or remove logging)

// packages/ui/src/hooks/useMobileOptimization.ts
// REMOVE: import logger from '../../../web/src/services/logger';

// packages/ui/src/components/PetCard/PetCard.tsx
// REMOVE: import UsageTrackingService from '@pawfectmatch/web/src/services/usageTracking';

// packages/ui/src/components/PetMatching/PetMatching.tsx
// REMOVE: import UsageTrackingService from '@pawfectmatch/web/src/services/usageTracking';
```

### 7. Fix @pawfectmatch/core featureFlags import
```typescript
// Check packages/core/src/featureFlags.ts exports featureFlags
// If not, export it or change import
```

### 8. Fix exactOptionalPropertyTypes issues
```typescript
// packages/ui/src/hooks/useMobileOptimization.ts line 119
// CHANGE: batteryLevel: undefined
// TO: batteryLevel: 0

// packages/ui/src/components/PetMatching/PetMatching.tsx line 174
// CHANGE: matchScore: number | undefined
// TO: matchScore?: number
```

---

## Quick Automated Fixes

### Run these commands:
```bash
cd /Users/elvira/Downloads/pets-pr-1/packages/ui

# 1. Move setupTests
mv src/setupTests.ts setupTests.ts

# 2. Update package.json jest config
# Add: "setupFilesAfterEnv": ["<rootDir>/setupTests.ts"]

# 3. Rebuild
pnpm build
```

---

## Priority Order:
1. ✅ Move setupTests.ts (14 errors)
2. ✅ Add transitions export (10+ errors)  
3. ✅ Fix invalid imports (4 files)
4. ⏸️ Fix motion className (40+ errors) - May need broader refactor
5. ⏸️ Fix exactOptionalPropertyTypes (case-by-case)

---

## Testing After Fixes:
```bash
# Build ui package
pnpm --filter @pawfectmatch/ui build

# If successful, build core
pnpm --filter @pawfectmatch/core build

# Then test web
cd apps/web && pnpm test
```
