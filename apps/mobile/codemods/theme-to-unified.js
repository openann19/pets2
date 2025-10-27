/**
 * Codemod: Migrate from old theme contexts to unified theme/Provider
 * Run: npx jscodeshift -t apps/mobile/codemods/theme-to-unified.js apps/mobile/src --extensions=ts,tsx --parser=tsx
 */
const REPLACERS = [
  { from: /contexts\/ThemeContext(\.tsx?)?/g, to: "theme/Provider" },
  { from: /theme\/UnifiedThemeProvider(\.tsx?)?/g, to: "theme/Provider" },
  { from: /theme\/ThemeProvider(\.tsx?)?/g, to: "theme/Provider" },
  { from: /constants\/design-tokens(\.ts)?/g, to: "@pawfectmatch/design-tokens" },
  { from: /styles\/EnhancedDesignTokens(\.tsx?)?/g, to: "theme/Provider" },
];

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let src = fileInfo.source;

  // Apply simple replacements
  REPLACERS.forEach(({ from, to }) => {
    src = src.replace(from, to);
  });

  return src;
};

module.exports.parser = "tsx";

