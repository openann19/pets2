module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow raw spacing values',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noRawSpacing: "Raw spacing value detected: '{{value}}'. Use theme.spacing tokens instead.",
      noRawRadius: "Raw border radius detected: '{{value}}'. Use theme.radii tokens instead.",
    }
  },
  create(ctx) {
    const spacingPattern = /^[0-9]+$/;
    const radiusPattern = /^[0-9]+$/;

    return {
      Property(node) {
        if (node.key.name === 'padding' || node.key.name === 'margin' || 
            node.key.name === 'paddingLeft' || node.key.name === 'paddingRight' ||
            node.key.name === 'paddingTop' || node.key.name === 'paddingBottom' ||
            node.key.name === 'marginLeft' || node.key.name === 'marginRight' ||
            node.key.name === 'marginTop' || node.key.name === 'marginBottom') {
          
          if (node.value && node.value.type === 'Literal' && 
              typeof node.value.value === 'number' && spacingPattern.test(node.value.value.toString())) {
            
            // Allow in theme files, design-tokens, and test files
            const filename = ctx.getFilename();
            if (!filename.includes('theme') && 
                !filename.includes('design-tokens') && 
                !filename.includes('__tests__') &&
                !filename.includes('__mocks__')) {
              ctx.report({ 
                node: node.value,
                messageId: 'noRawSpacing',
                data: {
                  value: node.value.value
                }
              });
            }
          }
        }

        if (node.key.name === 'borderRadius') {
          if (node.value && node.value.type === 'Literal' && 
              typeof node.value.value === 'number' && radiusPattern.test(node.value.value.toString())) {
            
            // Allow in theme files, design-tokens, and test files
            const filename = ctx.getFilename();
            if (!filename.includes('theme') && 
                !filename.includes('design-tokens') && 
                !filename.includes('__tests__') &&
                !filename.includes('__mocks__')) {
              ctx.report({ 
                node: node.value,
                messageId: 'noRawRadius',
                data: {
                  value: node.value.value
                }
              });
            }
          }
        }
      },
      Literal(node) {
        // Detect hardcoded spacing and radius values
        if (typeof node.value === 'number' && spacingPattern.test(node.value.toString())) {
          // Check if this looks like a spacing value (1-50 range)
          if (node.value >= 1 && node.value <= 50) {
            const filename = ctx.getFilename();
            if (!filename.includes('theme') && 
                !filename.includes('design-tokens') && 
                !filename.includes('__tests__') &&
                !filename.includes('__mocks__') &&
                !filename.includes('.eslint-rules')) {
              
              // Check parent context to avoid false positives
              const parent = node.parent;
              if (parent && parent.type === 'Property') {
                ctx.report({ 
                  node,
                  messageId: 'noRawSpacing',
                  data: {
                    value: node.value
                  }
                });
              }
            }
          }
        }
      }
    };
  }
};
