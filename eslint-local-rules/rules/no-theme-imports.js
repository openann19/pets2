"use strict";

/**
 * ESLint rule to prevent Theme.* regression after migration to useTheme() hook
 * 
 * Prevents:
 * - Static Theme imports
 * - Theme.colors.* usage
 * - Hardcoded color values
 * 
 * Allows:
 * - useTheme() hook usage
 * - theme.colors.* (from hook)
 * - getExtendedColors() usage
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Prevent static Theme imports and usage after migration to useTheme() hook",
      category: "Best Practices",
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: "object",
        properties: {
          allowTestFiles: {
            type: "boolean",
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noStaticThemeImport: "Do not import Theme statically. Use useTheme() hook instead.",
      noThemePropertyAccess: "Do not access Theme.{{property}}. Use theme.{{property}} from useTheme() hook instead.",
      noHardcodedColors: "Do not use hardcoded color values. Use semantic tokens from theme instead.",
      useExtendedColors: "Use getExtendedColors(theme) for extended color properties like '{{property}}'.",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const allowTestFiles = options.allowTestFiles !== false;
    
    // Skip test files if allowTestFiles is true
    const filename = context.getFilename();
    if (allowTestFiles && (
      filename.includes('__tests__') ||
      filename.includes('.test.') ||
      filename.includes('.spec.') ||
      filename.includes('.stories.')
    )) {
      return {};
    }

    // Extended color properties that require getExtendedColors()
    const extendedColorProperties = new Set([
      'card', 'background', 'textSecondary', 'white', 'black',
      'gray50', 'gray100', 'gray200', 'gray300', 'gray400', 'gray500',
      'gray600', 'gray700', 'gray800', 'gray900', 'gray950',
      'primaryLight', 'primaryDark', 'secondary', 'secondaryLight', 'secondaryDark',
      'accent', 'accentLight', 'accentDark', 'glass', 'glassLight', 'glassWhite',
      'glassWhiteLight', 'glassWhiteDark', 'glassDark', 'glassDarkMedium', 'glassDarkStrong',
      'error', 'tertiary', 'inverse', 'shadow'
    ]);

    // Hardcoded color patterns
    const colorPatterns = [
      /^#[0-9A-Fa-f]{3,8}$/, // Hex colors
      /^rgb\(/i,             // RGB colors
      /^rgba\(/i,            // RGBA colors
      /^hsl\(/i,             // HSL colors
      /^hsla\(/i,            // HSLA colors
    ];

    return {
      // Check imports
      ImportDeclaration(node) {
        if (node.source.value && typeof node.source.value === 'string') {
          // Block static Theme imports
          if (node.source.value.includes('/theme') && 
              node.specifiers.some(spec => 
                spec.type === 'ImportDefaultSpecifier' || 
                (spec.type === 'ImportSpecifier' && spec.imported.name === 'Theme')
              )) {
            context.report({
              node,
              messageId: "noStaticThemeImport",
            });
          }
        }
      },

      // Check member expressions (Theme.colors.*, Theme.spacing.*, Theme.radii.*, etc.)
      MemberExpression(node) {
        if (node.object && node.property) {
          // Block Theme.* namespace usage (Theme.colors, Theme.spacing, Theme.radii, etc.)
          if (node.object.name === 'Theme') {
            context.report({
              node,
              messageId: "noThemePropertyAccess",
              data: {
                property: node.property.name || 'property',
              },
            });
          }

          // Check for nested Theme property access (Theme.colors.primary, Theme.spacing.lg, etc.)
          if (node.object.type === 'MemberExpression' &&
              node.object.object && node.object.object.name === 'Theme') {
            const propertyPath = node.object.property.name + '.' + (node.property.name || '');
            context.report({
              node,
              messageId: "noThemePropertyAccess",
              data: {
                property: propertyPath,
              },
            });
          }

          // Check for extended color usage without getExtendedColors
          if (node.object.type === 'MemberExpression' &&
              node.object.object && node.object.object.name === 'theme' &&
              node.object.property && node.object.property.name === 'colors' &&
              extendedColorProperties.has(node.property.name)) {
            context.report({
              node,
              messageId: "useExtendedColors",
              data: {
                property: node.property.name,
              },
            });
          }
        }
      },

      // Check for hardcoded color values
      Literal(node) {
        if (typeof node.value === 'string') {
          const value = node.value.trim();
          if (colorPatterns.some(pattern => pattern.test(value))) {
            // Allow transparent and common system colors
            if (!['transparent', 'inherit', 'currentColor'].includes(value.toLowerCase())) {
              context.report({
                node,
                messageId: "noHardcodedColors",
              });
            }
          }
        }
      },
    };
  },
};
