# Error Annihilator - Quick Start Guide

## 🚀 One-Minute Setup

The EA script is **already installed and ready to use**. No additional setup needed!

## 📋 Quick Commands

### Preview Changes (Safe - No Modifications)
```bash
pnpm ea:mobile
```

### Apply Changes
```bash
pnpm ea:mobile:write
```

### Verify Results
```bash
pnpm --dir apps/mobile tsc --noEmit
```

## 📊 What to Expect

### Dry-Run Output Example
```
🔧 EA Summary (dry-run: true )

Files touched                   9
SafeArea edges removed          0
Theme semantic→tokens           49
Ionicons glyphMap fixed         0
fontWeight normalized           0
Animated import added           0

💡 Tip: run with --write to apply changes.
```

## 🎯 Key Transformations

| Issue | Before | After | Impact |
|-------|--------|-------|--------|
| SafeAreaView | `<SafeAreaView edges={['top']}>` | `<SafeAreaView>` | Removes invalid prop |
| Theme | `Theme.semantic.primary` | `Theme.colors.primary[500]` | ~49 fixes |
| Ionicons | `name={Ionicons.glyphMap[x]}` | `name={x as string}` | Type safety |
| fontWeight | `fontWeight: 600` | `fontWeight: '600'` | Type compliance |

## ⚙️ Configuration

**File:** `scripts/ea.config.ts`

```typescript
export const EAConfig = {
  globs: ["apps/mobile/src/**/*.{ts,tsx}"],
  themeMap: {
    primary: "colors.primary[500]",
    secondary: "colors.secondary[500]",
    // ... more mappings
  },
  skipAnimatedImport: true, // Set to false to enable
} as const;
```

## 🔄 Workflow

```
1. pnpm ea:mobile          # Preview changes
   ↓
2. Review output           # Check what will change
   ↓
3. pnpm ea:mobile:write    # Apply changes
   ↓
4. pnpm --dir apps/mobile tsc --noEmit  # Verify
   ↓
5. git add . && git commit -m "refactor: apply EA codemods"
```

## ⚠️ Safety Notes

✅ **Safe to run:**
- Dry-run mode (just previews)
- Multiple times (idempotent)
- On any branch

❌ **Be careful with:**
- `--write` flag (modifies files)
- Custom config changes (test dry-run first)
- Enabling `skipAnimatedImport: false` (risky)

## 🆘 Troubleshooting

### "Command not found: pnpm ea:mobile"
```bash
# Make sure you're in the root directory
cd /Users/elvira/Desktop/pets2

# Try again
pnpm ea:mobile
```

### "No files matched globs"
Check `scripts/ea.config.ts` - the globs path might be wrong

### "Changes look wrong"
```bash
# Revert
git checkout apps/mobile/src

# Run dry-run to inspect
pnpm ea:mobile
```

## 📈 Expected Error Reduction

After applying all EA fixes:
- **Theme semantic rewrites:** -40 to -60 errors
- **SafeAreaView fixes:** -5 to -10 errors
- **Ionicons cleanup:** -10 to -20 errors
- **fontWeight normalization:** -5 to -10 errors

**Total:** -60 to -100 errors (8-15% reduction from 693)

## 🎓 Learn More

See `EA_IMPLEMENTATION_SUMMARY.md` for detailed documentation.

---

**TL;DR:** Run `pnpm ea:mobile` to see what it would fix, then `pnpm ea:mobile:write` to apply!
