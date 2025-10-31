/**
 * ESLint rule to prevent hardcoded hex colors in React Native code
 * Enforces use of theme tokens instead
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded hex colors in favor of theme tokens',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      hardcoded: 'Hardcoded color "{{val}}" forbidden; use theme tokens instead',
    },
    schema: [],
  },
  
  create(context) {
    const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3,8})$/;
    
    return {
      Literal(node) {
        if (typeof node.value === 'string' && HEX_COLOR_REGEX.test(node.value)) {
          // Allow hex colors in specific contexts (tests, constants, brand assets)
          const filename = context.getFilename();
          
          // Exempt test files
          if (filename.includes('.test.') || filename.includes('__tests__')) {
            return;
          }
          
          // Exempt design token files
          if (filename.includes('design-tokens') || filename.includes('theme/')) {
            return;
          }
          
          // Exempt brand asset metadata
          if (filename.includes('assets/') || filename.includes('constants/brand')) {
            return;
          }
          
          context.report({
            node,
            messageId: 'hardcoded',
            data: {
              val: node.value,
            },
          });
        }
      },
    };
  },
};
