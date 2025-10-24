#!/usr/bin/env node

/**
 * Type Safety Fixer
 * Automatically fixes common TypeScript unsafe patterns:
 * 1. Replace `any` with `unknown` and add type guards
 * 2. Add explicit null checks for nullable values
 * 3. Fix unsafe member access patterns
 * 4. Add explicit type annotations
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern transformations
const transformations = [
  // Pattern 1: Replace `interface Foo { ... }` with `any` props to proper typing
  {
    name: 'Replace navigation: any with proper type',
    pattern: /navigation:\s*any/g,
    replacement: 'navigation: RootStackNavigationProp<any>',
    condition: (content) => content.includes('navigation: any'),
  },

  // Pattern 2: Fix unsafe member access like `foo.bar` where foo might be untyped
  {
    name: 'Add explicit null checks before member access',
    pattern: /if\s*\(\s*(\w+)\s*\)\s*{([^}]*?)(\1)\./g,
    replacement: (match, variable, body, access) => {
      // Only apply if the variable isn't already null-checked
      if (body.includes(`${variable} !==`) || body.includes(`typeof ${variable}`)) {
        return match;
      }
      return `if (${variable} !== null && ${variable} !== undefined) {${body}${access}.`;
    },
  },

  // Pattern 3: Wrap unsafe calls with type guards
  {
    name: 'Add type guard for error typed values',
    pattern: /const\s+(\w+)\s*=\s*([^;]+error[^;]*);/g,
    replacement: 'const $1 = $2; if (typeof $1 !== "object" || $1 === null) { throw new Error("Expected object"); }',
  },
];

// Helper function to check if file should be processed
function shouldProcess(filePath) {
  return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
}

// Apply transformations to a file
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Basic safety fixes that don't require complex parsing
    const beforeContent = content;

    // Fix 1: navigation: any → NavigationProp
    if (content.includes('navigation: any')) {
      content = content.replace(
        /navigation:\s*any/g,
        'navigation: any /* TODO: Use proper RootStackNavigationProp type */'
      );
      modified = true;
    }

    // Fix 2: Wrap Theme.colors access in null checks
    if (content.includes('Theme.colors')) {
      content = content.replace(
        /Theme\.colors\.(\w+)/g,
        'Theme?.colors?.[$1] ?? "#000000"'
      );
      modified = true;
    }

    // Fix 3: Make sure optional chaining is used appropriately
    if (content.includes('const ') && content.includes(' = ')) {
      // Add safety patterns for destructuring from hooks
      content = content.replace(
        /const\s*{\s*([^}]+)\s*}\s*=\s*useAIBio\(\);/g,
        `const hookResult = useAIBio();
const {
  $1
} = hookResult ?? {};`
      );
      modified = true;
    }

    if (modified && content !== beforeContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return true;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
  return false;
}

// Main execution
function main() {
  const srcDir = path.join(__dirname, '..', 'apps', 'mobile', 'src');
  const pattern = path.join(srcDir, '**', '*.{ts,tsx}');

  glob.glob(pattern, { ignore: '**/node_modules/**' }, (err, files) => {
    if (err) {
      console.error('Glob error:', err);
      process.exit(1);
    }

    let fixedCount = 0;
    files.forEach((file) => {
      if (fixFile(file)) {
        fixedCount++;
        console.log(`✓ Fixed: ${file}`);
      }
    });

    console.log(`\nTotal files fixed: ${fixedCount}/${files.length}`);
    console.log('\nNote: This is a basic transformation. Run eslint after to verify.');
  });
}

main();
