"use strict";

const HEX_COLOR_RE =
  /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/;

module.exports = {
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
    },
  },

  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== "string") return;
        const v = node.value.trim();
        if (HEX_COLOR_RE.test(v)) {
          context.report({
            node,
            messageId: "noHex",
            data: { value: v },
          });
        }
      },

      MemberExpression(node) {
        // Block old-style calls like colors.white / colors.bg.secondary / palette.brand[500]
        const src = context.getSourceCode().getText(node);

        if (
          /\bcolors\.white\b/.test(src) ||
          /\bcolors\.bg\.secondary\b/.test(src) ||
          /\bpalette\.[A-Za-z]+/.test(src)
        ) {
          context.report({
            node,
            messageId: "noLegacy",
            data: { value: src },
          });
        }
      },
    };
  },
};
