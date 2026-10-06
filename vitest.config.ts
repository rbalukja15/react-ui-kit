import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: { provider: 'v8', include: ['src/**/*.{ts,tsx}'] },
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
