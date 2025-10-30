"use strict";

// Guardrail: forbid legacy theme APIs/tokens in mobile code
// Mirrors the TS version but implemented in JS for local ESLint runtime

const LEGACY_PATTERNS = [
  /theme\.colors\.status\./, // status.*
  /theme\.colors\.(primary|secondary)\s*\[/, // primary[500], secondary[...]
  /theme\.colors\.neutral\s*\[/, // neutral[...]
  /\bcolors\.(card|surfaceElevated)\b/, // colors.card/surfaceElevated
  /theme\.colors\.(background|textSecondary|text)\b/, // deprecated names
  /theme\.theme\.colors\./, // theme.theme.colors.*
];

export default {
  meta: {
    type: "problem",
    docs: { description: "Forbid legacy theme APIs/tokens" },
    messages: {
      legacyTheme:
        "Legacy theme usage found. Use unified semantic tokens (bg/surface/onSurface/onMuted/primary/success/warning/danger/info, palette.neutral[...]).",
    },
    schema: [],
  },
  create(ctx) {
    const src = ctx.getSourceCode().getText();

    return {
      Program() {
        for (const re of LEGACY_PATTERNS) {
          let m;
          const r = new RegExp(re.source, "g");
          while ((m = r.exec(src))) {
            ctx.report({
              loc: ctx.getSourceCode().getLocFromIndex(m.index),
              messageId: "legacyTheme",
            });
          }
        }
      },
      // Also catch computed members like theme.colors.primary[500]
      MemberExpression(node) {
        if (!node.computed) return;
        const objectText = ctx.getSourceCode().getText(node.object);
        if (/theme\.colors\.(primary|secondary|neutral)$/.test(objectText)) {
          ctx.report({ node, messageId: "legacyTheme" });
        }
      },
    };
  },
};
