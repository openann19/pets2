module.exports = {
  meta: {
    type: 'problem',
    messages: {
      noThemeNamespace: "Use 'theme.colors.bg' instead of 'Theme.colors.*'",
    }
  },
  create(ctx) {
    return {
      MemberExpression(node) {
        // Detect Theme.colors usage instead of theme.colors
        if (node.object && node.object.name === 'Theme') {
          const filename = ctx.getFilename();
          if (!filename.includes('unified-theme') && 
              !filename.includes('__tests__')) {
            ctx.report({ 
              node, 
              messageId: 'noThemeNamespace' 
            });
          }
        }
      }
    };
  }
};