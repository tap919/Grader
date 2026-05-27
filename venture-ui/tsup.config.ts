import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/components/ui/*.tsx',
    'src/components/ai/*.tsx',
    'src/components/governance/*.tsx',
    'src/hooks/*.ts',
  ],
  format: ['esm'],
  dts: true,
  splitting: false,
  clean: true,
  external: ['react', 'react-dom'],
  banner: {
    js: "'use client';",
  },
})
