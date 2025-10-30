export default {
  meta: {
    type: 'problem',
    messages: {
      noThemeNamespace: "Use 'useTheme()' hook and 'theme.colors.*' instead of 'Theme.colors.*'",
      noThemeSpacing: "Use 'theme.spacing.*' instead of 'Theme.spacing.*'",
      noThemeRadii: "Use 'theme.radii.*' instead of 'Theme.radii.*' or 'Theme.borderRadius.*'",
      noThemePalette: "Use 'theme.palette.*' instead of 'Theme.palette.*'",
    }
  },
  create(ctx) {
    return {
      MemberExpression(node) {
        // Detect Theme.* usage instead of theme.* from useTheme hook
        if (node.object && node.object.type === 'Identifier' && node.object.name === 'Theme') {
          const filename = ctx.getFilename();
          
          // Allow in test files and theme definitions
          if (filename.includes('unified-theme') || 
              filename.includes('__tests__') ||
              filename.includes('.test.') ||
              filename.includes('.spec.')) {
            return;
          }

          const property = node.property;
          if (property && property.type === 'Identifier') {
            const propName = property.name;
            
            // Check for Theme.colors, Theme.spacing, Theme.radii, Theme.borderRadius, Theme.palette
            if (propName === 'colors') {
              ctx.report({ 
                node, 
                messageId: 'noThemeNamespace' 
              });
            } else if (propName === 'spacing') {
              ctx.report({ 
                node, 
                messageId: 'noThemeSpacing' 
              });
            } else if (propName === 'radii' || propName === 'borderRadius') {
              ctx.report({ 
                node, 
                messageId: 'noThemeRadii' 
              });
            } else if (propName === 'palette') {
              ctx.report({ 
                node, 
                messageId: 'noThemePalette' 
              });
            } else {
              // Catch any other Theme.* usage
              ctx.report({ 
                node, 
                messageId: 'noThemeNamespace' 
              });
            }
          }
        }
      }
    };
  }
};