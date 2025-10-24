# Design Token Scanner

A utility script to scan the codebase for hardcoded colors and design values that should use design tokens instead.

## Purpose

This tool helps maintain design system consistency by identifying:
- Hardcoded hex colors, RGB/RGBA values, and HSL colors
- Tailwind color classes that conflict with design tokens
- Design system violations that could lead to branding inconsistencies

## Usage

```bash
# Run the scanner
node scripts/design-token-scanner.js

# Or make it executable and run directly
chmod +x scripts/design-token-scanner.js
./scripts/design-token-scanner.js
```

## What It Checks

### Color Patterns
- Hex colors: `#FF6B6B`, `#4ECDC4`, etc.
- RGB/RGBA: `rgba(255, 255, 255, 0.08)`
- HSL: `hsl(215, 100%, 97%)`

### Design Token Compliance
- Compares found colors against the official design token values
- Identifies Tailwind colors that should use design tokens
- Suggests appropriate design token replacements

## Output

The scanner provides:
- File-by-file breakdown of violations
- Line numbers for each issue
- Suggested design token replacements
- Summary statistics

## Exit Codes

- `0`: No violations found (success)
- `1`: Violations found (failure - useful for CI/CD)

## Integration

### CI/CD Pipeline

Add to your GitHub Actions, Jenkins, or other CI pipeline:

```yaml
- name: Check Design Token Compliance
  run: node scripts/design-token-scanner.js
```

### Pre-commit Hook

Add to your pre-commit hooks to catch violations before they reach main branch.

### ESLint Integration

Consider creating an ESLint rule that runs this scanner automatically.

## Design Tokens

The scanner references tokens from `packages/design-tokens/tokens.json`:

- **Brand Colors**: primary (#FF6B6B), secondary (#4ECDC4), accent (#FFD700)
- **Neutral Colors**: 50-900 grayscale scale
- **Glass Effects**: light/medium/heavy transparency values
- **Spacing**: xs (4px) through 3xl (64px)

## Maintenance

Update the `DESIGN_TOKENS` and `TAILWIND_COLORS` objects in the script when:
- New design tokens are added
- Tailwind color mappings change
- New color patterns need detection

## Example Output

```
🔍 Design Token Compliance Report
=====================================

📁 apps/web/app/browse/page.tsx
  ❌ Line 205: from-pink-500
     Use design token: primary
     Consider using: primary-500 (#ec4899)

  ❌ Line 322: bg-red-500/20
     Use design token: error
     Consider using: error-500 (#ef4444)

📊 Summary: 2 violations found across 1 files

💡 Recommendations:
  1. Replace hardcoded colors with design tokens from @pawfectmatch/design-tokens
  2. Use CSS custom properties for dynamic theming
  3. Run this scanner regularly in CI/CD pipeline
  4. Consider adding ESLint rules for design token compliance
```
