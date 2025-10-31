#!/bin/bash
# Script to fix relative import paths to use aliases in test files
# This helps standardize imports and fix module resolution issues

echo "Fixing import paths in test files..."

# Find test files with relative imports
find apps/mobile/src -name "*.test.ts" -o -name "*.test.tsx" | while read file; do
  # Fix imports that go back to hooks directory
  sed -i "s|from '../../hooks/|from '@/hooks/|g" "$file"
  sed -i "s|from '../../../hooks/|from '@/hooks/|g" "$file"
  sed -i "s|from '../../../../hooks/|from '@/hooks/|g" "$file"
  
  # Fix imports that go back to services directory
  sed -i "s|from '../../services/|from '@/services/|g" "$file"
  sed -i "s|from '../../../services/|from '@/services/|g" "$file"
  sed -i "s|from '../../../../services/|from '@/services/|g" "$file"
  
  # Fix imports that go back to components directory
  sed -i "s|from '../../components/|from '@/components/|g" "$file"
  sed -i "s|from '../../../components/|from '@/components/|g" "$file"
  
  # Fix imports that go back to utils directory
  sed -i "s|from '../../utils/|from '@/utils/|g" "$file"
  sed -i "s|from '../../../utils/|from '@/utils/|g" "$file"
  
  # Fix imports that go back to stores directory
  sed -i "s|from '../../stores/|from '@/stores/|g" "$file"
  sed -i "s|from '../../../stores/|from '@/stores/|g" "$file"
  
  # Fix imports that go back to screens directory
  sed -i "s|from '../../screens/|from '@/screens/|g" "$file"
  sed -i "s|from '../../../screens/|from '@/screens/|g" "$file"
done

echo "Import paths fixed. Please review changes before committing."

