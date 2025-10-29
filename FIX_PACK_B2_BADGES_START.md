# Fix Pack B2: Badge Consistency — READY TO START

**Date Started:** 2025-01-27  
**Status:** Planned  
**Target:** Badge color tokens and consistency

---

## Goal

Standardize all badge components to use Theme tokens for colors, spacing, and border radius.

---

## Investigation Needed

Search for badge components:
```bash
find apps/mobile/src -name "*Badge*" -type f
```

### Expected Badge Variants
- Status badges (online, offline, premium)
- Category badges (pet type, preferences)
- Notification badges (unread count)
- Achievement badges
- Tag badges (filtering)

---

## Work Plan

1. **Identify Badge Components**
   - List all badge files
   - Document variants
   - Check for hardcoded values

2. **Create Badge Standard**
   - Define canonical token mappings
   - Document size variants
   - Document color semantic tokens

3. **Apply Standard**
   - Replace hardcoded colors
   - Use Theme.spacing for padding
   - Use Theme.borderRadius
   - Use Theme.semantic colors

4. **Test & Document**
   - Visual regression testing
   - Update Badge documentation
   - Mark Fix Pack B2 complete

---

## Success Criteria

- [ ] All badge components use Theme tokens
- [ ] No hardcoded hex colors
- [ ] Consistent spacing across variants
- [ ] Consistent border radius
- [ ] Visual consistency verified

---

## Next Actions

1. Search for badge components
2. Analyze usage patterns
3. Create standardization plan
4. Begin implementation

---

*Ready to start after Fix Pack B1 completion*

