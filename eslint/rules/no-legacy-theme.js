"use strict";

const LEGACY_PATTERNS = [
  /theme\.colors\.status\./, // status.*
  /theme\.colors\.(primary|secondary)\s*\[/, // primary[500], secondary[...]
  /theme\.colors\.neutral\s*\[/, // neutral[...]
  /\bcolors\.(card|surfaceElevated)\b/, // colors.card/surfaceElevated
  /theme\.colors\.(background|textSecondary|text)\b/, // deprecated names
  /theme\.theme\.colors\./, // theme.theme.colors.*
];

module.exports = {
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
      'MemberExpression[computed=true]'(node) {
        const text = ctx.getSourceCode().getText(node.object);
        if (/theme\.colors\.(primary|secondary|neutral)$/.test(text)) {
          ctx.report({ node, messageId: 'legacyTheme' });
        }
      },
    };
  },
};
