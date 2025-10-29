/**
 * ESLint Rule Tests: no-hardcoded-colors
 * 
 * Tests to ensure the rule correctly catches hardcoded colors
 * and allows legitimate theme usage
 */

const { RuleTester } = require("eslint");
const rule = require("./no-hardcoded-colors.js");

const tester = new RuleTester({
  parserOptions: { 
    ecmaVersion: 2021, 
    sourceType: "module", 
    ecmaFeatures: { jsx: true } 
  },
});

tester.run("no-hardcoded-colors", rule, {
  valid: [
    // Semantic theme usage - should pass
    {
      code: `
        import { useTheme } from "@/theme";
        function Card() {
          const theme = useTheme();
          return <View style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }} />;
        }
      `,
      filename: "apps/mobile/src/components/Card.tsx",
    },
    
    // Theme object usage - should pass
    {
      code: `
        const theme = { colors: { danger: "#FF0000" } };
        const alertStyle = { color: theme.colors.danger };
      `,
      filename: "apps/mobile/src/components/Alert.tsx",
    },
    
    // Test files - should be ignored
    {
      code: `
        const styles = { color: "#fff", backgroundColor: "#000" };
      `,
      filename: "apps/mobile/src/components/__tests__/Card.test.tsx",
    },
    
    // Design token files - should be ignored
    {
      code: `
        export const COLORS = {
          white: "#ffffff",
          black: "#000000",
        };
      `,
      filename: "apps/mobile/src/theme/tokens.ts",
    },
    
    // Non-style context - should pass
    {
      code: `
        const hexValue = "#ffffff";
        console.log("Hex is:", hexValue);
      `,
      filename: "apps/mobile/src/utils/colors.ts",
    },
  ],
  
  invalid: [
    // Hardcoded hex colors in style context
    {
      code: `
        const styles = { 
          color: "#fff", 
          backgroundColor: "#000000",
          borderColor: "#ff0000"
        };
      `,
      errors: [
        { messageId: "noHex", data: { value: "#fff" } },
        { messageId: "noHex", data: { value: "#000000" } },
        { messageId: "noHex", data: { value: "#ff0000" } },
      ],
      filename: "apps/mobile/src/components/Card.tsx",
    },
    
    // Legacy tokens
    {
      code: `
        const styles = { 
          backgroundColor: colors.white,
          color: palette.brand.primary[500]
        };
      `,
      errors: [
        { messageId: "noLegacyToken", data: { token: "colors.white" } },
        { messageId: "noLegacyToken", data: { token: "palette.brand.*" } },
      ],
      filename: "apps/mobile/src/components/Card.tsx",
    },
    
    // Raw rgba usage
    {
      code: `
        const styles = { 
          backgroundColor: "rgba(255,255,255,0.8)",
          shadowColor: "rgba(0,0,0,0.5)"
        };
      `,
      errors: [
        { messageId: "noRgba" },
        { messageId: "noRgba" },
      ],
      filename: "apps/mobile/src/components/Card.tsx",
    },
    
    // JSX inline styles with hardcoded colors
    {
      code: `
        function Card() {
          return <View style={{ backgroundColor: "#fff", color: "#000" }} />;
        }
      `,
      errors: [
        { messageId: "noHex", data: { value: "#fff" } },
        { messageId: "noHex", data: { value: "#000" } },
      ],
      filename: "apps/mobile/src/components/Card.tsx",
    },
  ],
});

console.log("✅ ESLint rule tests completed successfully");
