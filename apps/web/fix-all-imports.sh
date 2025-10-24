#!/bin/bash

echo "🔧 Fixing all imports and dependencies for PawfectMatch Web App..."

# Replace all @pawfectmatch/core imports with local auth store
echo "📝 Updating import paths..."

# Fix useAuth.ts
sed -i "s|import { useAuthStore } from '@pawfectmatch/core';|import { useAuthStore } from '../lib/auth-store';|g" src/hooks/useAuth.ts

# Fix all other files that import from @pawfectmatch/core
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from '@pawfectmatch/core'|from '../../src/lib/auth-store'|g" {} \;

# Specifically fix components that might have different paths
sed -i "s|from '../../src/lib/auth-store'|from '../lib/auth-store'|g" src/components/**/*.tsx 2>/dev/null || true
sed -i "s|from '../../src/lib/auth-store'|from '../../lib/auth-store'|g" src/providers/*.tsx 2>/dev/null || true
sed -i "s|from '../../src/lib/auth-store'|from '../../../src/lib/auth-store'|g" app/**/*.tsx 2>/dev/null || true

echo "✅ Import paths fixed!"
