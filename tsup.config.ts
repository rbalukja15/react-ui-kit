import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
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
