module.exports = {
  meta: {
    type: 'problem',
    messages: {
      noRawColor: "Raw color value detected: '{{value}}'. Use theme tokens instead.",
      noRawSpacing: "Raw spacing value detected: '{{value}}'. Use theme.spacing instead.",
    }
  },
  create(ctx) {
    return {
      Literal(node) {
        // Detect hex colors (#ffffff, #fff, #FFFFFF)
        if (typeof node.value === 'string' && /^#([0-9a-fA-F]{3,8})$/.test(node.value)) {
          // Allow in theme files, design-tokens, and test files
          const filename = ctx.getFilename();
          if (!filename.includes('theme') && 
              !filename.includes('design-tokens') && 
              !filename.includes('__tests__') &&
              !filename.includes('__mocks__')) {
            ctx.report({ 
              node, 
              messageId: 'noRawColor',
              data: { value: node.value }
            });
          }
        }
        
        // Detect rgba/hsla functions (basic pattern check)
        if (typeof node.value === 'string' && /^(rgba?|hsla?)\(/.test(node.value)) {
          const filename = ctx.getFilename();
          if (!filename.includes('theme') && 
              !filename.includes('design-tokens') && 
              !filename.includes('__tests__') &&
              !filename.includes('__mocks__')) {
            ctx.report({ 
              node, 
              messageId: 'noRawColor',
              data: { value: node.value }
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
