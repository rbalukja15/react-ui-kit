# 0006. Every output file starts with `'use client'`

- Status: Accepted
- Date: 2026-10-05

## Context

Every export uses React context or MUI, which only run on the client in the Next.js App Router. Bundling strips the per-file `'use client'` directives, and a directive that is not the very first statement is ignored. Several tsup options quietly move it: Rollup tree-shaking drops the banner, and CJS code splitting rewrites chunks with generated code above it.

## Decision

Add `'use client';` as a banner on every emitted JS file, entries and shared chunks alike. Keep tsup's `treeshake` off, relying on esbuild's tree-shaking and `sideEffects: false`. Split chunks for ESM only, and keep CJS entries self-contained.

## Consequences

Components and providers can be imported straight into server components such as `app/layout.tsx`. Plain functions exported alongside them (`titleCase`, `createAppTheme`) become client functions too, which the README calls out. CJS subpath entries repeat the components they import, so a module shared between entries must not hold module-level state. A step in the CI `verify` job ("Check every bundle file keeps its 'use client' directive") fails the build if any output file does not start with the directive.
