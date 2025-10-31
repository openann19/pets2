# UI Polish Pull Request

## What Changed

<!-- Describe the UI changes in this PR -->

### Screenshots/GIFs

<!-- Attach before/after screenshots or GIFs showing the changes -->

### Evidence

- [ ] Before/After screenshots or GIFs attached
- [ ] Flipper/Hermes trace attached (if perf related)
- [ ] Visual regression snapshots updated

### Tests

- [ ] Jest snapshots updated
- [ ] Detox flow tests added/updated
- [ ] A11y checks (TalkBack/VoiceOver)
- [ ] Dynamic Type scaling tested (up to 200%)
- [ ] Reduced motion preference tested

### Tokens Touched

<!-- List all theme tokens modified or used -->

- `theme.spacing.*`
- `theme.radii.*`
- `theme.colors.*`
- `theme.motion.*`

### Files Changed

<!-- List key files modified -->

- `apps/mobile/src/components/...`
- `apps/mobile/src/screens/...`

### Performance Impact

<!-- If applicable, describe performance changes -->

- **FPS Impact:** N/A / Improved / Degraded
- **Bundle Size:** N/A / Increased / Decreased
- **Memory:** N/A / Increased / Decreased

### Accessibility Impact

<!-- Describe accessibility improvements -->

- **Touch Targets:** All ≥ 44×44dp
- **Contrast:** Meets WCAG AA (4.5:1)
- **Screen Reader:** Labels and roles added
- **Keyboard Navigation:** Tested and working

### Risk & Rollback

**Risk Level:** Low / Medium / High

**Rollback Plan:**
<!-- Describe how to rollback if needed -->

### Related Enhancement IDs

<!-- Link to enhancement backlog items -->

- UI-XXX
- UI-YYY

### Definition of Done Checklist

- [ ] All static checks pass (types, lint, format, security)
- [ ] A11y checks pass (TalkBack/VoiceOver + contrast)
- [ ] FPS budget met; traces attached (if applicable)
- [ ] Snapshot tests updated
- [ ] Media artifacts committed
- [ ] Changelog entries added
