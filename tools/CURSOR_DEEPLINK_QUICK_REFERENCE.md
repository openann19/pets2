✨ **Quick Reference: Using Cursor Deeplink Generator**

## 🚀 Fastest Way (npm Scripts)

```bash
# App format (cursor://)
pnpm cursor:deeplink "Your prompt text here"

# Web format (https://cursor.com - shareable)
pnpm cursor:deeplink:web "Your prompt text here"
```

## 📋 Common Examples

```bash
# Fix TypeScript errors
pnpm cursor:deeplink "Fix all TypeScript errors in this file"

# Add tests
pnpm cursor:deeplink "Add comprehensive unit tests for this component"

# Refactor
pnpm cursor:deeplink "Refactor this code following best practices"

# Share with team (web format)
pnpm cursor:deeplink:web "Review this PR and provide feedback"
```

## 💻 Import in Code

```typescript
import { generatePromptDeeplink } from '../tools/cursor-deeplink-generator';

const link = generatePromptDeeplink("Your prompt", { isWeb: true });
```

## 📖 Full Documentation

See `tools/CURSOR_DEEPLINK_USAGE.md` for complete usage guide.

