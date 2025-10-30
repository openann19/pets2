# Fix Pack C1: Empty/Error States — STARTING

**Date Started:** 2025-01-27  
**Status:** In Progress  
**Target:** Map Screen and CreateReelScreen error handling

---

## Goals

1. Improve empty state UX in MapScreen.tsx
2. Add comprehensive error handling to CreateReelScreen.tsx
3. Implement retry functionality for failed loads
4. Add loading states where missing

---

## Files to Enhance

1. ✅ `apps/mobile/src/screens/MapScreen.tsx` - Add empty state
2. ✅ `apps/mobile/src/screens/CreateReelScreen.tsx` - Add error UI

---

## Work Plan

### MapScreen.tsx
- [ ] Add empty state when no nearby pets
- [ ] Add error state with retry button
- [ ] Improve loading state UX
- [ ] Add helpful messaging

### CreateReelScreen.tsx
- [ ] Add error handling for API failures
- [ ] Add retry functionality for failed uploads
- [ ] Add progress feedback for rendering
- [ ] Add empty state when no clips selected

---

## Success Criteria

- [ ] Empty states are helpful and actionable
- [ ] Error states have retry options
- [ ] Loading states are clear
- [ ] All states use Theme tokens
- [ ] TypeScript compilation passes
- [ ] No new lint errors

---

*Starting implementation...*

