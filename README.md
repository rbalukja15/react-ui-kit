# @rbalukja15/ui-components

A small, deliberately-scoped React component library built on **MUI** (v5, v6, v7 and v9, on React 18 or 19). Accessible, fully typed, themeable, and decoupled from any single app — every component takes data and callbacks via props rather than reaching into a router, store, or API client.

> Extracted and generalised from the frontend of a production veterinary-practice app (Next.js 14, MUI 5, React Query, React Hook Form). The goal here is a clean, reusable subset — not a kitchen sink.

**📖 [Live Storybook →](https://rbalukja15.github.io/react-ui-kit)**

## Design language

Warm editorial surfaces (cream paper, soft warm hairlines) on a teal brand axis. Headings render in **Newsreader** serif for an editorial display; body and labels stay **Inter** sans. Both light and a muted dark mode ship out of the box; semantic colours (success / warning / error / info) flip per mode to stay readable without glare.

Tonal chips are the signature behaviour: filled `<Chip color="…">` renders as pale-tinted background + strong-text foreground rather than the bright filled block — quieter on dense pages.

## Install

```bash
npm install @rbalukja15/ui-components
# peer deps (you provide these):
npm install @mui/material @emotion/react @emotion/styled react react-dom
```

To try unreleased changes, install straight from `main` (the `prepare` script builds it on install):

```bash
npm install git+https://github.com/rbalukja15/react-ui-kit.git#main
```

### Fonts

The theme references **Newsreader** for headings and **Inter** for body. Consumers must load them. For Next.js, add to `app/layout.tsx`:

```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap"
  rel="stylesheet"
/>
```

For plain Vite / CRA / static sites, drop the same `<link>` tags in `index.html`.

### Next.js App Router

The bundle ships with a top-level `'use client'` directive, so components and providers can be imported straight into server components such as `app/layout.tsx`.

## Quick start

```tsx
import {
  ThemeModeProvider,
  ConfirmDialogProvider,
  EmptyState,
  useConfirm,
} from '@rbalukja15/ui-components';

function App() {
  return (
    <ThemeModeProvider defaultMode="light">
      <ConfirmDialogProvider>
        <YourApp />
      </ConfirmDialogProvider>
    </ThemeModeProvider>
  );
}
```

## Theming

The default theme is a warm editorial look on a teal axis. Pass `overrides` to rebrand it per project; they are deep-merged over the defaults, so you only list what changes:

```tsx
import { ThemeModeProvider, type ThemeOverrides } from '@rbalukja15/ui-components';

// Define outside the component (or memoize) so the theme isn't rebuilt each render.
const brand: ThemeOverrides = (mode) => ({
  palette: {
    primary: { main: mode === 'light' ? '#1d4ed8' : '#93c5fd' },
    background: mode === 'light' ? { default: '#f8fafc', paper: '#ffffff' } : undefined,
  },
  typography: { h1: { fontFamily: '"Poppins", sans-serif' } },
});

<ThemeModeProvider defaultMode="light" overrides={brand}>
  <YourApp />
</ThemeModeProvider>;
```

`overrides` is either a MUI `ThemeOptions` object or a function of the mode. A palette colour you pass (`primary`, `secondary`, `success`, `warning`, `error`, `info`) replaces the default one, so MUI derives `light`, `dark` and `contrastText` from your `main`. The same argument works without the provider: `createAppTheme('dark', brand)`.

### Light, dark and system mode

`ThemeModeProvider` is uncontrolled by default. `defaultMode` accepts `'light'`, `'dark'` or `'system'`; `'system'` follows the OS `prefers-color-scheme` setting and updates live when it changes. Pass `storageKey` to remember the user's choice in `localStorage`:

```tsx
<ThemeModeProvider defaultMode="system" storageKey="my-app:theme-mode">
  <YourApp />
</ThemeModeProvider>
```

To own the state yourself (a user setting saved on the server, a cookie), make it controlled. The provider then only reports changes through `onModeChange` and ignores `storageKey`:

```tsx
const [mode, setMode] = useState<ThemeModePreference>('system');

<ThemeModeProvider mode={mode} onModeChange={setMode}>
  <YourApp />
</ThemeModeProvider>;
```

Inside, `useThemeMode()` returns `mode` (what is rendered, never `'system'`), `preference` (the choice, possibly `'system'`), `systemMode`, `setMode` and `toggle`. `toggle` flips the rendered mode and leaves `'system'`.

The stored choice and the OS setting are only read in the browser. Server HTML renders `defaultMode` (`'system'` renders light), and the saved or OS mode is applied straight after hydration, so there is no hydration mismatch.

## Components

| Component | What it does | Notes |
| --- | --- | --- |
| `ConfirmDialog` | Promise-based `confirm()` replacement via context + `useConfirm()` hook | Labels are props (no i18n dependency) |
| `EmptyState` | Empty-list placeholder with tinted icon tile + optional CTA | Link is injectable — works with Next, react-router, or `<a>` |
| `FloatingCreateButton` | Mobile-only "create" FAB | Hides at the configured breakpoint; link is injectable |
| `TableSkeleton` | Loading placeholder for tables | Zero coupling, pure MUI |
| `ThemeModeProvider` | MUI theme + light/dark/system mode | Controlled or uncontrolled; opt-in `localStorage` persistence |
| `useDebouncedValue` | Debounce any value | — |

## Design principles

- **No hidden coupling.** A component never imports the router, a store, an API client, or i18n. Anything app-specific comes in through props.
- **Controlled first.** Form controls work standalone; React Hook Form integration is an optional thin wrapper, never a requirement.
- **Accessible by default.** ARIA roles, keyboard handling, and focus management are part of each component, not an afterthought.
- **Typed strictly.** `strict` + `noUncheckedIndexedAccess`; every public prop is exported.

## Development

```bash
npm install
npm run storybook     # component workbench at :6006
npm run test          # vitest
npm run build         # tsup -> ESM + CJS + .d.ts
```

CI (lint, typecheck, test, build) runs on every push, plus a compatibility matrix that typechecks and tests against each supported MUI major; Storybook deploys to GitHub Pages from `main`.

### Releasing

Versions and the [changelog](./CHANGELOG.md) are managed with [Changesets](https://github.com/changesets/changesets).

1. In a PR with a user-facing change, run `npx changeset`, pick the bump (patch / minor / major) and describe the change. Commit the generated file in `.changeset/`.
2. When that PR lands on `main`, the Release workflow opens a "chore: release" PR that bumps the version and updates `CHANGELOG.md`.
3. Merging the release PR publishes the new version to npm (with provenance) using the `NPM_TOKEN` repository secret.

## Porting guide (remaining components from the source app)

These are queued for future extraction, gated on demand. The pattern for each:

- **`AppDatePicker`, `FkAutocomplete`, `TitleCaseField`** — currently bound to React Hook Form via `Controller`. Ship the presentational/controlled version first, then add a `*.rhf.tsx` adapter that wraps it. Both export from the same folder.
- **`useUrlState`** — generalise the query-string keys so they're passed in rather than hardcoded.

## License

MIT © Romarjo Balukja
