import { defineConfig } from 'tsup';

export default defineConfig({
  // One entry per public import path; each key is the output path under
  // dist/, matching the "exports" map in package.json. Only the subpath
  // entries may import the optional dependencies (react-hook-form,
  // @mui/x-date-pickers, dayjs), so an app without them can still import
  // the main entry.
  entry: {
    index: 'src/index.ts',
    rhf: 'src/rhf.ts',
    'date-picker': 'src/date-picker.ts',
    'date-picker/rhf': 'src/date-picker-rhf.ts',
  },
  format: ['esm', 'cjs'],
  // `splitting` is left at tsup's default: on for ESM, off for CJS. ESM
  // entries share code through chunk files, so a subpath entry reuses the
  // components the main entry ships instead of carrying a second copy. CJS
  // entries are self-contained: tsup's CJS splitting is experimental and
  // rewrites each chunk with sucrase, which puts generated code above the
  // banner, so 'use client' would no longer be a directive. The cost is that
  // a CJS subpath entry repeats the components it imports, so a module shared
  // between entries must not hold module-level state (a React context, a
  // cache): under CJS each entry would get its own copy.
  dts: true,
  sourcemap: true,
  clean: true,
  // Bundling strips per-file 'use client' directives, so re-add one at the
  // top of every output file, entries and shared chunks alike: every export
  // relies on React context or MUI, which are client-only in the Next.js App
  // Router. (tsup's `treeshake` option post-processes with Rollup, which
  // drops the banner, so it stays off; esbuild still tree-shakes and
  // `sideEffects: false` covers consumers.)
  banner: { js: "'use client';" },
  // Keep peers out of the bundle — consumers provide React + MUI, and the
  // optional dependencies when they use a subpath that needs them. A name
  // also matches its subpaths (react/jsx-runtime, @mui/material/styles,
  // @mui/x-date-pickers/AdapterDayjs). @mui/x-date-pickers is not a declared
  // peer (see the install job in ci.yml), so only this list keeps it out.
  external: [
    'react',
    'react-dom',
    '@mui/material',
    '@emotion/react',
    '@emotion/styled',
    'react-hook-form',
    '@mui/x-date-pickers',
    'dayjs',
  ],
});
