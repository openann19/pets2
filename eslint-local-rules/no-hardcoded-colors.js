"use strict";

const HEX_COLOR_RE =
  /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/;

const LEGACY_SECONDARY_PATTERN = /Theme\.colors\.secondary\[\d+\]/;
const COLORS_WHITE_PATTERN = /\bcolors\.white\b/;
const LEGACY_PRIMARY_PATTERN = /Theme\.colors\.primary\[\d+\]/;
const LEGACY_NEUTRAL_PATTERN = /Theme\.colors\.neutral\[\d+\]/;

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow hardcoded hex colors and legacy palette refs in mobile runtime code. Use theme.colors.* instead.",
    },
    schema: [],
    messages: {
      noHex:
        "Hardcoded color '{{value}}' is banned. Use theme.colors.* (background.primary, text.primary, status.success, etc.).",
      noLegacy:
        "Legacy color reference '{{value}}' is banned. Use semantic theme tokens.",
      noLegacySecondary:
        "Legacy Theme.colors.secondary[\\d+] pattern detected: '{{value}}'. Use theme.colors.info or theme.colors.primary instead.",
      noColorsWhite:
        "Legacy colors.white pattern detected: '{{value}}'. Use theme.colors.surface or theme.colors.onSurface instead.",
    },
  },

  create(context) {
    const filename = context.getFilename();
    const isExcluded =
      filename.includes("theme") ||
      filename.includes("design-tokens") ||
      filename.includes("__tests__") ||
      filename.includes("__mocks__") ||
      filename.includes("constants") ||
      filename.includes("styles") ||
      filename.includes("types");

    return {
      Literal(node) {
        if (typeof node.value !== "string") return;
        const v = node.value.trim();

        // Check for hex colors
        if (HEX_COLOR_RE.test(v)) {
          context.report({
            node,
            messageId: "noHex",
            data: { value: v },
          });
        }

        // Check for stringified Theme.colors.secondary[\d+] patterns
        if (LEGACY_SECONDARY_PATTERN.test(v)) {
          if (!isExcluded) {
            context.report({
              node,
              messageId: "noLegacySecondary",
              data: { value: v },
            });
          }
        }

        // Check for stringified colors.white patterns
        if (COLORS_WHITE_PATTERN.test(v)) {
          if (!isExcluded) {
            context.report({
              node,
              messageId: "noColorsWhite",
              data: { value: v },
            });
          }
        }

        // Check for stringified Theme.colors.primary[\d+] patterns (should use theme.colors.primary)
        if (LEGACY_PRIMARY_PATTERN.test(v)) {
          if (!isExcluded) {
            context.report({
              node,
              messageId: "noLegacy",
              data: { value: v },
            });
          }
        }

        // Check for stringified Theme.colors.neutral[\d+] patterns
        if (LEGACY_NEUTRAL_PATTERN.test(v)) {
          if (!isExcluded) {
            context.report({
              node,
              messageId: "noLegacy",
              data: { value: v },
            });
          }
        }
      },

      MemberExpression(node) {
        const src = context.getSourceCode().getText(node);

        // Block old-style calls like colors.white / colors.bg.secondary / palette.brand[500]
        // BUT allow theme.palette.gradients.* as it's the semantic way to access gradients
        if (
          COLORS_WHITE_PATTERN.test(src) ||
          /\bcolors\.bg\.secondary\b/.test(src) ||
          (/\bpalette\.[A-Za-z]+/.test(src) && !/theme\.palette\.gradients/.test(src))
        ) {
          if (!isExcluded) {
            context.report({
              node,
              messageId: "noLegacy",
              data: { value: src },
            });
          }
        }

        // Detect Theme.colors.secondary[500] member access patterns
        if (
          node.object &&
          node.object.type === "MemberExpression" &&
          node.object.object &&
          node.object.object.type === "Identifier" &&
          node.object.object.name === "Theme" &&
          node.object.property &&
          node.object.property.type === "Identifier" &&
          node.object.property.name === "colors" &&
          node.property &&
          node.property.type === "Identifier" &&
          node.property.name === "secondary"
        ) {
          if (!isExcluded) {
            context.report({
              node,
              messageId: "noLegacySecondary",
              data: { value: "Theme.colors.secondary[...]" },
            });
          }
        }

        // Detect Theme.colors.primary[\d+] member access patterns
        if (
          node.object &&
          node.object.type === "MemberExpression" &&
          node.object.object &&
          node.object.object.type === "Identifier" &&
          node.object.object.name === "Theme" &&
          node.object.property &&
          node.object.property.type === "Identifier" &&
          node.object.property.name === "colors" &&
          node.property &&
          node.property.type === "Identifier" &&
          node.property.name === "primary"
        ) {
          // Check if it's using bracket notation with a number
          const parent = context.getSourceCode().getNodeByRangeIndex(node.property.range[1]);
          if (parent && parent.type === "MemberExpression" && parent.computed) {
            if (!isExcluded) {
              context.report({
                node,
                messageId: "noLegacy",
                data: { value: "Theme.colors.primary[...]" },
              });
            }
          }
        }
      },
    };
  },
};
