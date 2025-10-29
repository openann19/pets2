/**
 * ESLint rule: ban raw hex color strings and banned legacy tokens
 * 
 * PRODUCTION-SAFE with proper guards:
 * - Skips test files
 * - Skips design token definition files
 * - Only flags actual style usage
 */

"use strict";

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow hardcoded colors and legacy palette tokens in mobile runtime code",
      category: "Best Practices",
      recommended: true,
    },
    fixable: null, // Not auto-fixable (requires semantic understanding)
    messages: {
      noHex:
        "Hardcoded color '{{value}}' not allowed. Use semantic theme token: theme.colors.surface / onSurface / primary / danger / success / warning / info / border / overlay",
      noLegacyToken:
        "'{{token}}' is a legacy token. Use semantic tokens from theme.colors (surface, onSurface, primary, etc.)",
      noRgba:
        "Raw rgba() not allowed. Use theme.colors.<token> + hex opacity (e.g., theme.colors.overlay + '80' for 50% opacity)",
    },
    schema: [
      {
        type: "object",
        properties: {
          allowInTests: {
            type: "boolean",
            default: true,
          },
          allowInTokenFiles: {
            type: "boolean",
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const allowInTests = options.allowInTests !== false;
    const allowInTokenFiles = options.allowInTokenFiles !== false;

    const filename = context.getFilename();

    // Skip test files if configured
    if (allowInTests) {
      if (
        filename.includes("__tests__") ||
        filename.includes("__mocks__") ||
        filename.includes(".test.") ||
        filename.includes(".spec.") ||
        filename.endsWith("setupTests.ts")
      ) {
        return {};
      }
    }

    // Skip token definition files
    if (allowInTokenFiles) {
      if (
        filename.includes("design-tokens") ||
        filename.includes("theme/tokens") ||
        filename.includes("theme/contracts") ||
        filename.includes("GlobalStyles") ||
        filename.includes("DarkTheme") ||
        filename.includes("EnhancedDesignTokens")
      ) {
        return {};
      }
    }

    /**
     * Check if this is in a style-related context
     */
    function isInStyleContext(node) {
      let current = node.parent;
      let depth = 0;
      const MAX_DEPTH = 10;

      while (current && depth < MAX_DEPTH) {
        // Check for ObjectExpression in style property
        if (current.type === "Property") {
          const key = current.key;
          if (key && key.name) {
            const propName = key.name;
            if (
              propName === "style" ||
              propName === "styles" ||
              /color/i.test(propName) ||
              /background/i.test(propName) ||
              /border/i.test(propName) ||
              /shadow/i.test(propName)
            ) {
              return true;
            }
          }
        }

        // Check for StyleSheet.create
        if (
          current.type === "CallExpression" &&
          current.callee &&
          current.callee.object &&
          current.callee.object.name === "StyleSheet" &&
          current.callee.property &&
          current.callee.property.name === "create"
        ) {
          return true;
        }

        current = current.parent;
        depth++;
      }

      return false;
    }

    return {
      Literal(node) {
        // Only check string literals
        if (typeof node.value !== "string") return;

        const value = node.value.trim();

        // Check for hex colors
        if (HEX_COLOR_RE.test(value)) {
          // Only report if in style context
          if (isInStyleContext(node)) {
            context.report({
              node,
              messageId: "noHex",
              data: { value },
            });
          }
        }

        // Check for rgba/rgb
        if (/^rgba?\(/.test(value)) {
          if (isInStyleContext(node)) {
            context.report({
              node,
              messageId: "noRgba",
            });
          }
        }
      },

      MemberExpression(node) {
        const source = context.getSourceCode();
        const text = source.getText(node);

        // Ban legacy tokens
        const legacyPatterns = [
          { pattern: /colors\.white\b/, token: "colors.white" },
          { pattern: /colors\.black\b/, token: "colors.black" },
          { pattern: /colors\.bg\.secondary\b/, token: "colors.bg.secondary" },
          { pattern: /colors\.text\.secondary\b/, token: "colors.text.secondary" },
          { pattern: /palette\.brand/, token: "palette.brand.*" },
          { pattern: /palette\.neutral/, token: "palette.neutral.*" },
          { pattern: /Theme\.colors\.(white|black)\b/, token: "Theme.colors.white/black" },
        ];

        for (const { pattern, token } of legacyPatterns) {
          if (pattern.test(text)) {
            // Only report if in style context
            if (isInStyleContext(node)) {
              context.report({
                node,
                messageId: "noLegacyToken",
                data: { token },
              });
            }
            break;
          }
        }
      },
    };
  },
};
