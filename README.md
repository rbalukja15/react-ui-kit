# @rbalukja15/ui-components

A small, deliberately-scoped React component library built on **MUI 5**. Accessible, fully typed, themeable, and decoupled from any single app — every component takes data and callbacks via props rather than reaching into a router, store, or API client.

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

Or install directly from this repo (no npm publish needed):

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

## Components

| Component | What it does | Notes |
| --- | --- | --- |
| `ConfirmDialog` | Promise-based `confirm()` replacement via context + `useConfirm()` hook | Labels are props (no i18n dependency) |
| `EmptyState` | Empty-list placeholder with tinted icon tile + optional CTA | Link is injectable — works with Next, react-router, or `<a>` |
| `FloatingCreateButton` | Mobile-only "create" FAB | Hides at the configured breakpoint; link is injectable |
| `TableSkeleton` | Loading placeholder for tables | Zero coupling, pure MUI |
| `ThemeModeProvider` | MUI theme + light/dark toggle | Warm editorial teal design language |
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

CI (lint, typecheck, test, build) runs on every push; Storybook deploys to GitHub Pages from `main`.

## Porting guide (remaining components from the source app)

These are queued for future extraction, gated on demand. The pattern for each:

- **`AppDatePicker`, `FkAutocomplete`, `TitleCaseField`** — currently bound to React Hook Form via `Controller`. Ship the presentational/controlled version first, then add a `*.rhf.tsx` adapter that wraps it. Both export from the same folder.
- **`useUrlState`** — generalise the query-string keys so they're passed in rather than hardcoded.

## License

MIT © Romarjo Balukja
