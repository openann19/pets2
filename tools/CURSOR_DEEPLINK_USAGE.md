# Cursor Deeplink Generator - Usage Guide

Professional utility for generating Cursor IDE prompt deeplinks in the PawfectMatch project.

## Quick Start

### Option 1: Using npm Scripts (Recommended)

```bash
# Generate app format deeplink (cursor://)
pnpm cursor:deeplink "Your prompt text here"

# Generate web format deeplink (https://cursor.com)
pnpm cursor:deeplink:web "Your prompt text here"

# With quotes for multi-word prompts
pnpm cursor:deeplink "Create a React component for user authentication"
```

### Option 2: Direct Command

```bash
# App format (default)
npx tsx tools/cursor-deeplink-generator.ts "Create a React component"

# Web format
npx tsx tools/cursor-deeplink-generator.ts "Fix TypeScript errors" --web

# Help
npx tsx tools/cursor-deeplink-generator.ts --help
```

### Option 3: Import as Module

```typescript
// In any TypeScript file
import {
  generatePromptDeeplink,
  generateMultipleDeeplinks,
  parseDeeplink,
  type DeeplinkOptions,
} from '../tools/cursor-deeplink-generator';

// Basic usage - app format
const appLink = generatePromptDeeplink(
  "Create a React component for user authentication"
);
console.log(appLink);
// Output: cursor://anysphere.cursor-deeplink/prompt?text=Create%20a%20React%20component%20for%20user%20authentication

// Web format
const webLink = generatePromptDeeplink("Fix TypeScript errors", {
  isWeb: true,
});
console.log(webLink);
// Output: https://cursor.com/link/prompt?text=Fix%20TypeScript%20errors

// With additional parameters
const linkWithParams = generatePromptDeeplink("Add feature", {
  additionalParams: {
    context: "mobile",
    priority: "high",
  },
});

// Batch generation
const prompts = [
  "Create user authentication",
  "Add error handling",
  "Implement dark mode",
];
const deeplinks = generateMultipleDeeplinks(prompts, { isWeb: true });

// Parse existing deeplink
const parsed = parseDeeplink(appLink);
if (parsed) {
  console.log("Format:", parsed.format); // 'app' or 'web'
  console.log("Prompt:", parsed.promptText);
  console.log("Params:", parsed.additionalParams);
}
```

## Use Cases

### 1. Development Workflow Integration

Create a helper script in your project:

```typescript
// scripts/generate-cursor-prompt.ts
import { generatePromptDeeplink } from '../tools/cursor-deeplink-generator';

const prompt = process.argv.slice(2).join(' ');
if (!prompt) {
  console.error('Please provide a prompt');
  process.exit(1);
}

const deeplink = generatePromptDeeplink(prompt, { isWeb: false });
console.log(deeplink);

// Copy to clipboard (cross-platform)
// You can use packages like 'clipboardy' for this
```

### 2. AI/Development Agent Integration

Use in automated development workflows:

```typescript
import { generatePromptDeeplink } from './tools/cursor-deeplink-generator';

// Generate deeplinks for common development tasks
const commonTasks = {
  fixTypes: generatePromptDeeplink("Fix TypeScript errors in this file"),
  addTests: generatePromptDeeplink("Add comprehensive unit tests"),
  refactor: generatePromptDeeplink("Refactor this code for better maintainability"),
};

// Use in automated workflows
function suggestCursorPrompt(task: keyof typeof commonTasks) {
  return commonTasks[task];
}
```

### 3. Documentation & Code Comments

Generate deeplinks for TODOs and improvement suggestions:

```typescript
// In your code
/**
 * TODO: Improve error handling
 * Cursor prompt: cursor://anysphere.cursor-deeplink/prompt?text=Improve%20error%20handling%20in%20this%20function
 */

// Or programmatically
const todoPrompt = generatePromptDeeplink(
  "Improve error handling in this function",
  { isWeb: false }
);
```

### 4. Team Collaboration

Share Cursor prompts with team members:

```typescript
// Generate shareable links for code review
function generateCodeReviewPrompt(filePath: string, issue: string) {
  return generatePromptDeeplink(
    `Review ${filePath} and fix: ${issue}`,
    { isWeb: true } // Web format is easier to share
  );
}

// Usage
const reviewLink = generateCodeReviewPrompt(
  'apps/mobile/src/services/AuthService.ts',
  'Add proper error handling'
);
// Share this link in Slack, GitHub comments, etc.
```

## Examples

### Common Development Tasks

```bash
# Fix TypeScript errors
pnpm cursor:deeplink "Fix all TypeScript errors in this file"

# Add tests
pnpm cursor:deeplink "Add comprehensive unit tests for this component"

# Refactor code
pnpm cursor:deeplink "Refactor this code to follow best practices"

# Add documentation
pnpm cursor:deeplink "Add JSDoc comments and TypeScript types"

# Optimize performance
pnpm cursor:deeplink "Optimize this function for better performance"

# Implement feature
pnpm cursor:deeplink "Implement user authentication with JWT tokens"

# Fix bugs
pnpm cursor:deeplink "Fix the bug where users can't log in on mobile"
```

### Web Format (Shareable Links)

```bash
# Generate shareable web links
pnpm cursor:deeplink:web "Review this PR and冲刺 provide feedback"

# Can be shared in:
# - GitHub comments
# - Slack messages
# - Email
# - Documentation
```

## Integration with Project Workflows

### In GitHub Actions

```yaml
# .github/workflows/cursor-suggestions.yml
name: Generate Cursor Prompts

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  suggest-prompts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: pnpm install
      - run: |
          pnpm cursor:deeplink:web "Review this PR and provide feedback" > cursor-prompt.txt
          # Post cursor-prompt.txt content as PR comment
```

### In VS Code/Cursor Tasks

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Generate Cursor Deeplink",
      "type": "shell",
      "command": "pnpm cursor:dee{cursorPosition}plink",
      "args": ["${input:prompt}"],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "prompt",
      "type": "promptString",
      "description": "Enter your Cursor prompt"
    }
  ]
}
```

## API Reference

### `generatePromptDeeplink(promptText, options?)`

Generates a Cursor prompt deeplink.

**Parameters:**
- `promptText` (string): The prompt text (required, max 10000 chars)
- `options` (DeeplinkOptions, optional):
  - `isWeb` (boolean): Use web format instead of app format
  - `additionalParams` (Record<string, string>): Extra query parameters

**Returns:** `string` - Complete deeplink URL

**Throws:** Error if prompt is invalid

### `generateMultipleDeeplinks(prompts, options?)`

Generates multiple deeplinks for batch processing.

**Parameters:**
- `prompts` (string[]): Array of prompt texts
- `options` (DeeplinkOptions, optional): Same as above

**Returns:** `string[]` - Array of deeplink URLs

### `parseDeeplink(deeplink)`

Parses a Cursor deeplink back into its components.

**Parameters:**
- `deeplink` (string): The deeplink URL to parse

**Returns:** `{ format: 'web' | 'app', promptText: string, additionalParams: Record<string, string> } | null`

## Testing

Run the test suite:

```bash
# Run tests (if configured in your project)
pnpm test tools/__tests__/cursor-deeplink-generator.test.ts
```

## Tips

1. **Use web format for sharing**: Web format (`--web`) creates shareable links that work in browsers
2. **Keep prompts concise**: While there's a 10000 char limit, shorter prompts are more effective
3. **Include context**: Add relevant file paths or context in your prompts
4. **Use npm scripts**: The `pnpm cursor:deeplink` script is the easiest way to use it
5. **Pipe to clipboard**: On Linux/Mac, pipe output to `xclip` or `pbcopy`:
   ```bash
   pnpm cursor:deeplink "Your prompt" | xclip -selection clipboard  # Linux
   pnpm cursor:deeplink "Your prompt" | pbcopy                       # Mac
   ```

## Troubleshooting

**Issue**: "Prompt text cannot be empty"
- **Solution**: Make sure to provide the prompt text in quotes

**Issue**: "Prompt text exceeds maximum length"
- **Solution**: Reduce prompt text to under 10000 characters

**Issue**: Module not found when importing
- **Solution**: Make sure you're using the correct relative path from your file

## Contributing

If you want to enhance this utility:
1. Edit `tools/cursor-deeplink-generator.ts`
2. Update tests in `tools/__tests__/cursor-deeplink-generator.test.ts`
3. Run `pnpm test` to verify
4. Update this documentation if needed

