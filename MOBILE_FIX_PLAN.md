# Mobile TypeScript Error Fixing Plan

## Current Status
- **Total Errors:** 586
- **Target:** < 100 errors
- **Approach:** Systematic fixes by category

## Error Breakdown
1. TS2339 (149 errors) - Property doesn't exist
2. TS2322 (79 errors) - Type not assignable  
3. TS2304 (72 errors) - Cannot find name
4. TS2307 (49 errors) - Cannot find module
5. TS2769 (35 errors) - Overload mismatch
6. Others (202 errors)

## Fix Strategy

### Phase 1: Missing Dependencies
- Install expo-clipboard
- Fix module import paths

### Phase 2: Theme System Imports
- Uncomment imports in InteractiveButton.tsx
- Fix theme property access
- Update to use new unified theme

### Phase 3: Component Exports
- Fix missing EliteButton, EliteHeader exports
- Fix missing component imports

### Phase 4: Type Definitions
- Add missing type definitions
- Fix property access errors

## Estimated Impact
- Phase 1: -20 errors
- Phase 2: -80 errors
- Phase 3: -60 errors
- Phase 4: -150 errors
- Total reduction: ~310 errors

## Implementation Plan
Given the scope (586 errors), a full automated fix would take 4-6 hours of careful work.

**Recommended:** Fix in prioritized batches:
1. Critical blocks (App.tsx navigation - 5 errors)
2. Missing imports (49 errors)
3. Theme system (149 errors)
4. Remaining types (383 errors)

This will take multiple focused sessions to complete properly.
