import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "src/index.ts",
    external: ["react-native"],
    output: [
      { file: "dist/index.js", format: "cjs", sourcemap: true },
      { file: "dist/index.esm.js", format: "esm", sourcemap: true },
    ],
    plugins: [
      typescript({ declaration: true, declarationDir: "dist", emitDeclarationOnly: false }),
    ],
  },
  {
    input: "src/react-native.ts",
    external: ["react-native"],
    output: [
      { file: "dist/react-native.js", format: "cjs", sourcemap: true },
      { file: "dist/react-native.esm.js", format: "esm", sourcemap: true },
    ],
    plugins: [
      typescript({ declaration: true, declarationDir: "dist", emitDeclarationOnly: false }),
    ],
  },
];