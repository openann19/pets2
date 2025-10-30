# PR Checklist Template

Use this checklist for each PR in Phase-2/Phase-3.

---

## PR Metadata

**PR Title:** [Brief description]  
**PR Number:** [if applicable]  
**Phase:** [Phase-2 or Phase-3]

---

## Scope & Intent

**1-2 line description:**

---

## Files Touched

[Bullet list of all changed files]

---

## Token/A11y/Motion/Perf Changes

### Tokens
- [ ] Raw colors replaced with semantic tokens
- [ ] Raw spacing replaced with theme.spacing.*
- [ ] RTL hygiene (marginStart/End, paddingStart/End)

### A11y
- [ ] Accessibility labels added where missing
- [ ] Hit targets ≥44dp or hitSlop added
- [ ] Focus order verified
- [ ] Reduced motion respected

### Motion
- [ ] Press feedback consistent (scale 0.98, 180–220ms)
- [ ] Entrance/exit animations defined
- [ ] List reorder animations smooth

### Performance
- [ ] Heavy effects guarded for low-end devices
- [ ] Bundle delta < +200KB (or approved exception)
- [ ] No layout thrash introduced

---

## Manual Verification

### Platforms
- [ ] iOS (light/dark)
- [ ] Android (light/dark)

### Accessibility
- [ ] Dynamic Type 200% (no clipping)
- [ ] RTL layout verified
- [ ] Reduced motion respected
- [ ] VoiceOver/TalkBack tested

### UX
- [ ] Focus trap works in modals
- [ ] Escape key closes modals
- [ ] Press feedback feels responsive
- [ ] Lists scroll smoothly

---

## Snapshot Diff Summary

[If any snapshots changed, list them here with rationale]

---

## Self-Critique

### What Improved
[List improvements]

### Risks
[List any risks or edge cases]

### Next Steps
[What comes next]

---

## CI Status

- [ ] TypeScript passes (`pnpm mobile:typecheck`)
- [ ] ESLint passes (`pnpm -w eslint apps/mobile`)
- [ ] Tests pass (`pnpm --filter @pawfectmatch/mobile test`)
- [ ] Bundle size check (if applicable)

