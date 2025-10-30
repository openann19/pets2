module.exports = {
  meta: {
    type: 'problem',
    messages: {
      noRawColor: "Raw color value detected: '{{value}}'. Use theme tokens instead.",
      noRawSpacing: "Raw spacing value detected: '{{value}}'. Use theme.spacing instead.",
      noLegacyTheme: "Legacy theme pattern detected: '{{value}}'. Use theme.colors.* semantic tokens instead.",
    }
  },
  create(ctx) {
    return {
      Literal(node) {
        const filename = ctx.getFilename();
        const isExcluded = filename.includes('theme') || 
                          filename.includes('design-tokens') || 
                          filename.includes('__tests__') ||
                          filename.includes('__mocks__');
        
        // Detect legacy Theme.colors.secondary[500] or Theme.colors.secondary[600] patterns
        if (typeof node.value === 'string' && /Theme\.colors\.secondary\[\d+\]/.test(node.value)) {
          if (!isExcluded) {
            ctx.report({ 
              node, 
              messageId: 'noLegacyTheme',
              data: { value: node.value }
            });
          }
        }
        
        // Detect colors.white pattern
        if (typeof node.value === 'string' && /colors\.white/.test(node.value)) {
          if (!isExcluded) {
            ctx.report({ 
              node, 
              messageId: 'noLegacyTheme',
              data: { value: node.value }
            });
          }
        }
        
        // Detect hex colors (#ffffff, #fff, #FFFFFF)
        if (typeof node.value === 'string' && /^#([0-9a-fA-F]{3,8})$/.test(node.value)) {
          if (!isExcluded) {
            ctx.report({ 
              node, 
              messageId: 'noRawColor',
              data: { value: node.value }
            });
          }
        }
        
        // Detect rgba/hsla functions (basic pattern check)
        if (typeof node.value === 'string' && /^(rgba?|hsla?)\(/.test(node.value)) {
          if (!isExcluded) {
            ctx.report({ 
              node, 
              messageId: 'noRawColor',
              data: { value: node.value }
            });
          }
        }
      },
      
      MemberExpression(node) {
        // Detect Theme.colors.secondary[500] or Theme.colors.secondary[600] member access
        const filename = ctx.getFilename();
        const isExcluded = filename.includes('theme') || 
                          filename.includes('design-tokens') || 
                          filename.includes('__tests__') ||
                          filename.includes('__mocks__');
        
        if (node.object && 
            node.object.type === 'MemberExpression' &&
            node.object.object &&
            node.object.object.type === 'Identifier' &&
            node.object.object.name === 'Theme' &&
            node.object.property &&
            node.object.property.type === 'Identifier' &&
            node.object.property.name === 'colors' &&
            node.property &&
            node.property.type === 'Identifier' &&
            node.property.name === 'secondary') {
          // Check parent for bracket notation [500]
          const parent = ctx.getSourceCode().getNodeByRangeIndex(node.property.range[1]);
          if (parent && parent.type === 'MemberExpression' && parent.computed) {
            if (!isExcluded) {
              ctx.report({ 
                node, 
                messageId: 'noLegacyTheme',
                data: { value: 'Theme.colors.secondary[...]' }
              });
            }
          }
        }
        
        // Detect colors.white access
        if (node.object &&
            node.object.type === 'Identifier' &&
            node.object.name === 'colors' &&
            node.property &&
            node.property.type === 'Identifier' &&
            node.property.name === 'white') {
          if (!isExcluded) {
            ctx.report({ 
              node, 
              messageId: 'noLegacyTheme',
              data: { value: 'colors.white' }
            });
          }
        }
      },
      
      Property(node) {
        // Detect raw numeric spacing values in style objects
        if (node.value && node.value.type === 'Literal' && typeof node.value.value === 'number') {
          const key = node.key.name || node.key.value;
          if (key && /^(padding|margin|gap|width|height|top|left|right|bottom)$/.test(key) && 
              node.value.value > 0 && 
              node.value.value % 1 === 0) {
            // Allow non-spacing numeric values in specific contexts
            const filename = ctx.getFilename();
            if (!filename.includes('__tests__') && 
                !filename.includes('__mocks__') &&
                !filename.includes('StyleSheet.create')) {
              // Allow small values for border radius common values
              if (node.value.value <= 4) {
                return;
              }
              ctx.report({ 
                node, 
                messageId: 'noRawSpacing',
                data: { value: node.value.value }
              });
            }
          }
        }
      }
    };
  }
};
