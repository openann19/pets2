/**
 * Codemod: Migrate from old animation imports to unified animation/index.ts
 * Run: npx jscodeshift -t apps/mobile/codemods/animation-unify.js apps/mobile/src --extensions=ts,tsx --parser=tsx
 */
const MAP = [
  { from: /hooks\/animations\/constants(\.ts)?/g, to: "animation" },
  { from: /styles\/GlobalStyles(\.ts)?/g, to: "animation" },
  { from: /hooks\/useAnimations(\.ts)?/g, to: "animation" },
];

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let s = fileInfo.source;

  // Apply simple replacements
  MAP.forEach(({ from, to }) => {
    s = s.replace(from, to);
  });

  return s;
};

module.exports.parser = "tsx";

