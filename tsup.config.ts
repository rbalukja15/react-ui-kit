import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  // Bundling strips per-file 'use client' directives, so re-add one at the
  // top of the output: every export relies on React context or MUI, which
  // are client-only in the Next.js App Router. (tsup's `treeshake` option
  // post-processes with Rollup, which drops the banner, so it stays off;
  // esbuild still tree-shakes and `sideEffects: false` covers consumers.)
  banner: { js: "'use client';" },
  // Keep peers out of the bundle — consumers provide React + MUI.
  external: [
    'react',
    'react-dom',
    '@mui/material',
    '@mui/icons-material',
    '@mui/x-date-pickers',
    '@emotion/react',
    '@emotion/styled',
    'react-hook-form',
  ],
});
