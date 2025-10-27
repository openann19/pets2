module.exports = {
  meta: { 
    type: 'problem', 
    messages: { 
      noBgObj: "Use 'theme.colors.bg' instead of 'theme.colors.background.*'."
    }
  },
  create(ctx) {
    return {
      MemberExpression(node) {
        const obj = node.object && node.object.property && node.object.property.name;
        const root = node.object && node.object.object && node.object.object.name;
        if (root === 'theme' && obj === 'background') {
          ctx.report({ node, messageId: 'noBgObj' });
        }
      }
    };
  }
};

