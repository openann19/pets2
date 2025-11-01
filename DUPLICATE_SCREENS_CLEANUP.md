# Duplicate Screens Cleanup Plan

## Identified Duplicates

### 1. AICompatibilityScreen
- **Location 1:** `src/screens/AICompatibilityScreen.tsx`
- **Location 2:** `src/screens/ai/AICompatibilityScreen.tsx`
- **Recommendation:** Keep the one in `ai/` folder (better organization)
- **Action:** Remove root level, update imports in App.tsx

### 2. AIPhotoAnalyzerScreen
- **Location 1:** `src/screens/AIPhotoAnalyzerScreen.tsx`
- **Location 2:** `src/screens/ai/AIPhotoAnalyzerScreen.tsx`
- **Recommendation:** Keep the one in `ai/` folder (better organization)
- **Action:** Remove root level, update imports in App.tsx

### 3. SwipeScreen vs ModernSwipeScreen
- **Location 1:** `src/screens/SwipeScreen.tsx` (Legacy)
- **Location 2:** `src/screens/ModernSwipeScreen.tsx` (Modern architecture)
- **Recommendation:** Keep ModernSwipeScreen (uses new component architecture)
- **Action:** Remove legacy SwipeScreen, ensure navigation uses Modern version

### 4. CreatePetScreen vs ModernCreatePetScreen  
- **Location 1:** `src/screens/CreatePetScreen.tsx` (Legacy)
- **Location 2:** `src/screens/ModernCreatePetScreen.tsx` (Modern architecture)
- **Recommendation:** Keep ModernCreatePetScreen (better UX, modern patterns)
- **Action:** Remove legacy CreatePetScreen, ensure navigation uses Modern version

### 5. AIBioScreen vs AIBioScreen.refactored
- **Location 1:** `src/screens/AIBioScreen.tsx` (Original)
- **Location 2:** `src/screens/AIBioScreen.refactored.tsx` (Refactored version)
- **Recommendation:** Evaluate both and keep the better one
- **Action:** Compare implementations, remove inferior version

## Implementation Plan

### Phase 1: Safe Removal (Low Risk)
1. Remove root-level AI screens (better organized versions exist in ai/ folder)
2. Update imports in navigation files

### Phase 2: Legacy to Modern Migration (Medium Risk)
1. Verify ModernSwipeScreen has all features from SwipeScreen
2. Update all references to use ModernSwipeScreen
3. Remove SwipeScreen after verification

3. Same process for CreatePetScreen → ModernCreatePetScreen

### Phase 3: Refactored Version Consolidation (Low Risk)
1. Compare AIBioScreen and AIBioScreen.refactored
2. Keep the better implementation
3. Rename if needed (remove .refactored suffix)

## Testing Checklist

After removing each duplicate:
- [ ] Run TypeScript check: `pnpm type-check`
- [ ] Run linter: `pnpm lint`
- [ ] Run tests: `pnpm test`
- [ ] Verify navigation still works
- [ ] Check for broken imports

## Expected Benefits

1. **Reduced Confusion:** Developers know which version to use
2. **Smaller Bundle:** Less duplicate code in production build
3. **Easier Maintenance:** Single source of truth for each feature
4. **Better Organization:** Screens in appropriate directories

## Status: READY TO EXECUTE

All duplicates have been identified and have clear removal recommendations. This cleanup will improve code quality without affecting functionality.
