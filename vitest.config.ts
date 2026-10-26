import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // Stories, tests and the entry files that only re-export are not library code.
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.{ts,tsx}', 'src/**/*.test-d.tsx', 'src/**/index.ts', 'src/*.ts', 'src/hooks/testing/**'],
      reporter: ['text-summary', 'html', 'json-summary'],
      // A floor, not a target: CI fails if coverage drops below it.
      thresholds: { statements: 95, branches: 90, functions: 95, lines: 95 },
    },
    server: {
      deps: {
        // MUI X 8's ESM files import `@mui/material/styles` and other
        // directories, which Node's resolver rejects on MUI 5 and 6 (they
        // have no exports map). Inlining lets Vite resolve them instead.
        // Harmless on the other supported majors.
        inline: ['@mui/x-date-pickers'],
      },
    },
  },
});
