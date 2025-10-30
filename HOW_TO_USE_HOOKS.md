# 🪝 How to Use Git Hooks in This Project

## Overview

This project uses **Husky** to manage Git hooks. Git hooks are scripts that run automatically at certain points in the Git workflow.

## Current Setup

✅ **Husky installed**: v8.0.3  
✅ **Pre-commit hook**: `.husky/pre-commit`  
✅ **Lint-staged**: Configured to run linters/formatters on staged files

## Available Hooks

### 1. Pre-commit Hook (`.husky/pre-commit`)

**Runs**: Before every `git commit`  
**Purpose**: Ensures code quality before commits

**Current behavior**:
- Runs linters on staged files
- Auto-fixes formatting issues
- Ensures TypeScript types are valid
- Runs tests on staged files

## How to Use

### Basic Usage

```bash
# Normal commit - hooks run automatically
git add .
git commit -m "Your commit message"

# The pre-commit hook will:
# 1. Run linters (ESLint)
# 2. Format code (Prettier)
# 3. Check TypeScript types
# 4. Run tests
```

### Bypassing Hooks (Not Recommended)

```bash
# Skip hooks (EMERGENCY ONLY)
git commit --no-verify -m "Emergency fix"

# ⚠️ Warning: Only use this in emergencies!
# Bypassing hooks means skipping quality checks
```

### Checking Hook Status

```bash
# Check if husky is installed and working
pnpm husky --version

# List all hooks
ls -la .husky/

# View a specific hook
cat .husky/pre-commit
```

## Available Hook Types

### 1. Pre-commit
- **Trigger**: `git commit`
- **Current**: Runs linting, formatting, type checking
- **Location**: `.husky/pre-commit`

### 2. Pre-push (Not yet configured)
- **Trigger**: `git push`
- **Use case**: Run full test suite before pushing
- **To add**: Create `.husky/pre-push`

### 3. Commit-msg (Not yet configured)
- **Trigger**: `git commit` (validates commit message)
- **Use case**: Enforce commit message conventions
- **To add**: Create `.husky/commit-msg`

### 4. Post-merge
- **Trigger**: `git pull` or `git merge`
- **Use case**: Install dependencies after merging
- **To add**: Create `.husky/post-merge`

## Adding New Hooks

### Example: Add Pre-push Hook

```bash
# 1. Create the hook file
npx husky add .husky/pre-push "pnpm run test"

# 2. Or create it manually
cat > .husky/pre-push << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run tests before pushing
pnpm run test
EOF

# 3. Make it executable
chmod +x .husky/pre-push
```

### Example: Add Commit-msg Hook

```bash
# Enforce conventional commits
npx husky add .husky/commit-msg 'npx commitlint --edit "$1"'
```

## Customizing Hooks

### Edit Existing Hook

```bash
# Edit the pre-commit hook
code .husky/pre-commit

# Or with nano
nano .husky/pre-commit
```

### Example Pre-commit Customization

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run linters (only on staged files)
pnpm run lint-staged

# Run TypeScript check
pnpm run type-check

# Run tests
pnpm run test

# Additional checks
echo "Checking code quality..."
pnpm run lint
pnpm run format:check
```

## Common Tasks

### 1. Skip Pre-commit Checks

```bash
# Skip all hooks for one commit
git commit --no-verify -m "message"

# ⚠️ Only use in emergencies!
```

### 2. Run Hooks Manually

```bash
# Run pre-commit hook manually
bash .husky/pre-commit

# Run all lint-staged rules manually
npx lint-staged
```

### 3. Debug Hooks

```bash
# Run with debug output
DEBUG=* git commit -m "test"

# Or add echo statements to hook
cat .husky/pre-commit
```

### 4. Temporarily Disable Hooks

```bash
# Rename the hook directory
mv .husky .husky.backup

# Make a commit (hooks won't run)
git commit -m "without hooks"

# Restore hooks
mv .husky.backup .husky
```

## Best Practices

### ✅ DO
- Always commit through normal `git commit` to let hooks run
- Fix issues reported by hooks before committing
- Add meaningful commit messages
- Run tests locally before pushing

### ❌ DON'T
- Don't use `--no-verify` unless absolutely necessary
- Don't disable hooks permanently
- Don't commit with errors
- Don't bypass quality checks

## Troubleshooting

### Hook Not Running

```bash
# Reinstall husky
pnpm husky install

# Make sure hooks are executable
chmod +x .husky/*
```

### Hook Errors

```bash
# Check hook output
git commit -m "test"  # Read error messages

# Run hook manually to debug
bash .husky/pre-commit
```

### Performance Issues

```bash
# If hooks are too slow, optimize them
# Example: Run tests only on changed files

# Check what's slow
time git commit -m "test"
```

## Advanced: Multiple Pre-commit Hooks

Create separate hooks for different purposes:

```bash
# Create organization-specific hook
cat > .husky/pre-commit.web << 'EOF'
#!/usr/bin/env sh
pnpm --filter apps/web run lint
EOF

chmod +x .husky/pre-commit.web

# Reference it in main pre-commit
echo ".husky/pre-commit.web" >> .husky/pre-commit
```

## Integration with CI/CD

Hooks ensure code quality **before** it reaches CI:

```
Local Commit → Pre-commit Hooks → CI/CD Pipeline
   ✅ Fast        ✅ Fix locally         ✅ Clean build
   ⚠️ Slow        ❌ Commit blocked      ❌ Never reached
```

## Summary

**To use hooks normally**: Just commit normally, hooks run automatically  
**To bypass**: `git commit --no-verify` (emergency only)  
**To customize**: Edit `.husky/*` files  
**To debug**: Run hooks manually with `bash .husky/pre-commit`

Your hooks are configured and working! 🎉

