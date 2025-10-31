import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    components: 'src/components/index.ts',
    hooks: 'src/hooks/index.ts',
    services: 'src/services/index.ts',
    types: 'src/types/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@pawfectmatch/core', '@pawfectmatch/ui'],
});
