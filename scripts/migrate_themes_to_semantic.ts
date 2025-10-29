#!/usr/bin/env ts-node

/**
 * 🎨 COMPREHENSIVE SEMANTIC THEME MIGRATION
 * 
 * Migrates all theme usage from nested structure to semantic naming across 700+ files.
 * 
 * Migration mappings:
 * 
 * Colors:
 * - theme.colors.background.primary → theme.colors.bg
 * - theme.colors.background.secondary → theme.colors.bg (or palette if specific shade needed)
 * - theme.colors.background.tertiary → theme.colors.surface
 * - theme.colors.text.primary → theme.colors.onSurface
 * - theme.colors.text.secondary → theme.colors.onMuted
 * - theme.colors.text.tertiary → theme.colors.onMuted (with opacity if needed)
 * - theme.colors.text.inverse → theme.colors.onBg
 * - theme.colors.primary[500] → theme.colors.primary
 * - theme.colors.primary[600] → theme.palette.brand[600]
 * - theme.colors.primary[N] → theme.palette.brand[N]
 * - theme.colors.secondary[500] → theme.colors.secondary (if exists) or theme.colors.primary
 * - theme.colors.secondary[N] → theme.colors.secondary (if exists) or theme.palette.brand[N]
 * - theme.colors.status.success → theme.colors.success
 * - theme.colors.status.error → theme.colors.danger
 * - theme.colors.status.warning → theme.colors.warning
 * - theme.colors.status.info → theme.colors.info
 * - theme.colors.border.light → theme.colors.border (or palette.neutral[200])
 * - theme.colors.border.medium → theme.colors.border
 * - theme.colors.border.dark → theme.colors.border (or palette.neutral[400])
 * - theme.colors.neutral[N] → theme.palette.neutral[N]
 * 
 * Spacing:
 * - theme.spacing.xs → theme.spacing.xs (same)
 * - theme.spacing.sm → theme.spacing.sm (same)
 * - theme.spacing.md → theme.spacing.md (same)
 * - theme.spacing.lg → theme.spacing.lg (same)
 * - theme.spacing.xl → theme.spacing.xl (same)
 * 
 * Radius:
 * - theme.borderRadius.none → theme.radii.none
 * - theme.borderRadius.xs → theme.radii.xs
 * - theme.borderRadius.sm → theme.radii.sm
 * - theme.borderRadius.md → theme.radii.md
 * - theme.borderRadius.lg → theme.radii.lg
 * - theme.borderRadius.xl → theme.radii.xl
 * - theme.borderRadius.pill → theme.radii.pill
 * - theme.borderRadius.full → theme.radii.full
 * 
 * Typography:
 * - theme.typography.body → theme.typography.body (same)
 * - theme.typography.heading → theme.typography.h1 or h2
 * 
 * Shadows:
 * - theme.shadows.depth.sm → theme.shadows.elevation1
 * - theme.shadows.depth.md → theme.shadows.elevation2
 * - theme.shadows.depth.lg → theme.shadows.elevation2
 * 
 * Safety:
 * - AST-based transformation using ts-morph
 * - Only modifies known patterns
 * - Preserves comments and formatting
 * - Adds useTheme import if missing
 * - Ensures theme hook is called in components
 */

import { Project, SyntaxKind, Node, ts } from 'ts-morph';
import { join } from 'path';
import { existsSync } from 'fs';

const ROOT = process.cwd();
const TSCONFIG = join(ROOT, 'apps/mobile/tsconfig.json');

if (!existsSync(TSCONFIG)) {
  console.error(`tsconfig not found at ${TSCONFIG}`);
  process.exit(1);
}

// Target directories for migration
const TARGET_GLOBS = [
  'apps/mobile/src/**/*.{ts,tsx}',
  'packages/ui/src/**/*.{ts,tsx}',
];

// Initialize ts-morph project
const project = new Project({
  tsConfigFilePath: TSCONFIG,
  skipAddingFilesFromTsConfig: false,
});

project.addSourceFilesAtPaths(TARGET_GLOBS);

// Migration mappings
const COLOR_MIGRATIONS: Record<string, string> = {
  // Background colors
  'colors.background.primary': 'colors.bg',
  'colors.background.secondary': 'colors.bg', // Or use palette.neutral[50] if specific shade needed
  'colors.background.tertiary': 'colors.surface',
  'colors.background.inverse': 'colors.bg', // Usually same as bg in dark mode
  
  // Text colors
  'colors.text.primary': 'colors.onSurface',
  'colors.text.secondary': 'colors.onMuted',
  'colors.text.tertiary': 'colors.onMuted',
  'colors.text.inverse': 'colors.onBg',
  
  // Status colors
  'colors.status.success': 'colors.success',
  'colors.status.error': 'colors.danger',
  'colors.status.warning': 'colors.warning',
  'colors.status.info': 'colors.info',
  
  // Border colors
  'colors.border.light': 'colors.border',
  'colors.border.medium': 'colors.border',
  'colors.border.dark': 'colors.border',
  
  // Primary colors (direct access becomes semantic)
  'colors.primary': 'colors.primary', // Direct access, but may need palette for specific shades
  
  // Legacy color aliases (from adapters elevation)
  'colors.text': 'colors.onSurface',
  'colors.textSecondary': 'colors.onMuted',
  'colors.textMuted': 'colors.onMuted',
  'colors.error': 'colors.danger',
};

// Radius migrations
const RADIUS_MIGRATIONS: Record<string, string> = {
  'borderRadius.none': 'radii.none',
  'borderRadius.xs': 'radii.xs',
  'borderRadius.sm': 'radii.sm',
  'borderRadius.md': 'radii.md',
  'borderRadius.lg': 'radii.lg',
  'borderRadius.xl': 'radii.xl',
  'borderRadius.2xl': 'radii.2xl',
  'borderRadius.pill': 'radii.pill',
  'borderRadius.full': 'radii.full',
};

// Shadow migrations
const SHADOW_MIGRATIONS: Record<string, string> = {
  'shadows.depth.sm': 'shadows.elevation1',
  'shadows.depth.md': 'shadows.elevation2',
  'shadows.depth.lg': 'shadows.elevation2',
  'shadows.depth.xl': 'shadows.elevation2',
};

let totalFilesModified = 0;
let totalReplacements = 0;

// Parse command line arguments for dry-run mode
const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('-d');

/**
 * Ensure useTheme is imported
 */
function ensureUseThemeImport(sourceFile: any): boolean {
  if (DRY_RUN) {
    // In dry-run, just check if it would be added, don't actually add
    const imports = sourceFile.getImportDeclarations();
    for (const imp of imports) {
      try {
        const moduleSpec = imp.getModuleSpecifierValue();
        if (moduleSpec === '@/theme' || moduleSpec === '@mobile/src/theme' || 
            moduleSpec === '../../../theme' || moduleSpec === '../../theme') {
          const namedImports = imp.getNamedImports();
          const hasUseTheme = namedImports.some((ni: any) => ni.getName() === 'useTheme');
          if (hasUseTheme) {
            return false;
          }
          return true; // Would add useTheme
        }
      } catch (e) {
        continue;
      }
    }
    return true; // Would add new import
  }
  const imports = sourceFile.getImportDeclarations();
  let found = false;
  
  for (const imp of imports) {
    try {
      const moduleSpec = imp.getModuleSpecifierValue();
      if (moduleSpec === '@/theme' || moduleSpec === '@mobile/src/theme' || moduleSpec === '../../../theme' || moduleSpec === '../../theme') {
        const namedImports = imp.getNamedImports();
        const hasUseTheme = namedImports.some((ni: any) => ni.getName() === 'useTheme');
        if (hasUseTheme) {
          found = true;
          break;
        }
        // Add useTheme if not present
        imp.addNamedImport('useTheme');
        found = true;
        break;
      }
    } catch (e) {
      // Skip dynamic imports
      continue;
    }
  }
  
  if (!found) {
    // Try to determine correct import path
    const filePath = sourceFile.getFilePath();
    let importPath = '@/theme';
    
    if (filePath.includes('packages/ui')) {
      importPath = '../../../theme';
    } else if (filePath.includes('apps/mobile/src')) {
      importPath = '@/theme';
    }
    
    sourceFile.addImportDeclaration({
      moduleSpecifier: importPath,
      namedImports: ['useTheme'],
    });
    return true;
  }
  
  return false;
}

/**
 * Ensure const theme = useTheme() exists in component
 */
function ensureThemeHook(sourceFile: any, componentBody: any): boolean {
  const statements = componentBody.getStatements();
  
  // Check if theme hook already exists
  for (const stmt of statements) {
    if (stmt.getKind() === SyntaxKind.VariableStatement) {
      const text = stmt.getText();
      if (text.includes('const theme = useTheme()') || text.includes('const theme = useTheme();')) {
        return false;
      }
      // Also check for other patterns
      if (text.includes('useTheme()') && text.includes('theme')) {
        return false;
      }
    }
  }
  
  // Add theme hook at the beginning of component body (unless dry-run)
  if (DRY_RUN) {
    return true; // Report that it would be added, but don't actually add
  }
  
  // Find first hook call or state declaration to insert after
  let insertIndex = 0;
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const text = stmt.getText();
    // Insert after imports/hooks
    if (text.includes('use') && text.includes('(')) {
      insertIndex = i + 1;
    } else {
      break;
    }
  }
  
  if (statements[insertIndex]) {
    statements[insertIndex].insertBefore('const theme = useTheme();');
  } else {
    componentBody.addStatements('const theme = useTheme();');
  }
  return true;
}

/**
 * Migrate a property access expression
 */
function migratePropertyAccess(node: any): boolean {
  const text = node.getText();
  
  // Check if this is a theme access pattern
  if (!text.includes('theme.')) {
    return false;
  }
  
  // Build the path (e.g., "colors.background.primary")
  let path = '';
  let current: any = node;
  
  // Navigate property access chain
  if (current.getKind() === SyntaxKind.PropertyAccessExpression) {
    const molecules: any[] = [];
    while (current && current.getKind() === SyntaxKind.PropertyAccessExpression) {
      const name = current.getName();
      molecules.unshift(name);
      current = current.getExpression();
    }
    
    if (molecules.length === 0) return false;
    
    // Check if it starts with theme
    if (current && current.getText() === 'theme') {
      path = molecules.join('.');
    } else {
      // Might be nested in object (e.g., theme.colors.background.primary)
      const fullText = node.getText();
      if (fullText.startsWith('theme.')) {
        path = fullText.replace('theme.', '');
      } else {
        return false;
      }
    }
  }
  
  // Check for indexed access (e.g., theme.colors.primary[500])
  let migration = null;
  
  if (path.includes('[')) {
    // Handle indexed access like theme.colors.primary[500]
    const match = path.match(/^(colors\.(primary|secondary|neutral))\[(\d+)\]$/);
    if (match) {
      const [, basePath, colorType, index] = match;
      if (colorType === 'primary') {
        if (index === '500') {
          // Primary[500] is the main primary color
          migration = 'colors.primary';
        } else {
          // Other shades go to palette
          migration = `palette.brand[${index}]`;
        }
      } else if (colorType === 'secondary') {
        // Secondary might not exist in semantic theme, use primary or palette
        migration = index === '500' ? 'colors.primary' : `palette.brand[${index}]`;
      } else if (colorType === 'neutral') {
        migration = `palette.neutral[${index}]`;
      }
    }
  } else {
    // Direct property access migrations
    migration = COLOR_MIGRATIONS[path] || RADIUS_MIGRATIONS[path] || SHADOW_MIGRATIONS[path];
  }
  
  if (!migration) {
    return false;
  }
  
  // Replace the node (unless dry-run)
  const newPath = `theme.${migration}`;
  if (!DRY_RUN) {
    node.replaceWithText(newPath);
  }
  return true;
}

/**
 * Process a source file
 */
function processFile(sourceFile: any): boolean {
  let fileModified = false;
  let replacements = 0;
  
  // Find all property access expressions
  const propertyAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);
  
  for (const access of propertyAccesses) {
    const text = access.getText();
    
    // Only process theme-related access
    if (text.includes('theme.') && (
      text.includes('colors.') ||
      text.includes('borderRadius') ||
      text.includes('shadows.')
    )) {
      if (migratePropertyAccess(access)) {
        replacements++;
        fileModified = true;
      }
    }
    
    // Also check for indexed access like theme.colors.primary[500]
    const parent = access.getParent();
    if (parent && parent.getKind() === SyntaxKind.ElementAccessExpression) {
      const elementAccess = parent as any;
      if (elementAccess.getExpression().getText().includes('theme.colors')) {
        if (migratePropertyAccess(elementAccess)) {
          replacements++;
          fileModified = true;
        }
      }
    }
  }
  
  // If we made changes, ensure useTheme import and hook
  if (fileModified) {
    ensureUseThemeImport(sourceFile);
    
    // Find React components and ensure theme hook
    const functions = [
      ...sourceFile.getFunctions(),
      ...sourceFile.getVariableDeclarations()
        .filter((vd: any) => {
          const init = vd.getInitializer();
          return init && (
            init.getKind() === SyntaxKind.ArrowFunction ||
            init.getKind() === SyntaxKind.FunctionExpression
          );
        })
    ];
    
    for (const fn of functions) {
      const name = fn.getName?.() || fn.getSymbol()?.getName();
      // Check if it's likely a React component (starts with capital or returns JSX)
      if (name && /^[A-Z]/.test(name)) {
        const body = fn.getBody?.();
        if (body) {
          ensureThemeHook(sourceFile, body);
        }
      } else {
        // Check if body contains JSX
        const body = fn.getBody?.();
        if (body) {
          const hasJSX = body.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 ||
                        body.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0;
          if (hasJSX) {
            ensureThemeHook(sourceFile, body);
          }
        }
      }
    }
  }
  
  if (fileModified) {
    totalFilesModified++;
    totalReplacements += replacements;
    const status = DRY_RUN ? '🔍 [DRY RUN]' : '✅';
    console.log(`${status} ${sourceFile.getBaseName()}: ${replacements} replacements`);
  }
  
  return fileModified;
}

// Process all files
if (DRY_RUN) {
  console.log('🔍 DRY RUN MODE - No changes will be saved\n');
}
console.log('🚀 Starting semantic theme migration...\n');

project.getSourceFiles().forEach((sourceFile) => {
  try {
    processFile(sourceFile);
  } catch (error) {
    console.error(`❌ Error processing ${sourceFile.getBaseName()}:`, error);
  }
});

// Save all changes (unless dry-run)
if (!DRY_RUN) {
  project.saveSync();
} else {
  // In dry-run, we don't save, so we need to undo all changes
  project.getSourceFiles().forEach(sourceFile => {
    sourceFile.refreshFromFileSystem();
  });
}

const mode = DRY_RUN ? 'DRY RUN' : 'complete';
console.log(`\n✨ Migration ${mode}!`);
console.log(`   Files that ${DRY_RUN ? 'would be' : ''} modified: ${totalFilesModified}`);
console.log(`   Total replacements: ${totalReplacements}`);
if (DRY_RUN) {
  console.log(`\n📝 To apply changes, run without --dry-run flag:`);
  console.log(`   ts-node scripts/migrate_themes_to_semantic.ts`);
} else {
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Run: pnpm mobile:tsc`);
  console.log(`   2. Run: pnpm mobile:lint --fix`);
  console.log(`   3. Review changes and test thoroughly`);
}
