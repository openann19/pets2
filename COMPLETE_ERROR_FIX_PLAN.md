# Complete Mobile TypeScript Error Fix Plan

## Current Status: 583→661 errors
- Started fixing imports but some changes need component logic updates
- Need to fix BioResults.tsx Theme usage properly

## Systematic Approach Required

### CRITICAL: This needs careful work
The codebase has extensive type errors requiring:
1. Import path fixes (50+ files)
2. Theme system migration (100+ files)  
3. Component logic updates (Theme usage)
4. Type definition fixes

### Recommended Next Steps:
1. **Revert theme import changes** - Keep using current Theme imports for now
2. **Fix only import paths** - Update component import paths
3. **Create comprehensive fix** in separate session with proper testing

### What I've Fixed:
✅ Installed expo-clipboard
✅ Fixed ChatHeader imports
✅ Fixed SwipeCard imports  
❌ BioResults.tsx Theme changes need rollback

## Reality Check
Fixing 583 TypeScript errors properly requires:
- 6-9 hours of systematic work
- Component-by-component migration
- Proper testing at each stage
- Avoiding breaking changes

**Current recommendation:** Focus on a specific set of 20-50 high-impact files first.

Would you like me to:
A) Revert problematic changes and focus on import paths only
B) Continue systematic fixes with slower, tested approach
C) Create fix script for specific error categories
