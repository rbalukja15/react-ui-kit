# @rbalukja15/ui-components

[![npm](https://img.shields.io/npm/v/@rbalukja15/ui-components)](https://www.npmjs.com/package/@rbalukja15/ui-components)
[![CI](https://github.com/rbalukja15/react-ui-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/rbalukja15/react-ui-kit/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@rbalukja15/ui-components)](./LICENSE)

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

The form subpaths also need `react-hook-form`, `@mui/x-date-pickers` or `dayjs`, which you install only if you use them. See [Forms](#forms).

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

Every entry ships with a top-level `'use client'` directive, so components and providers can be imported straight into server components such as `app/layout.tsx`. The directive also makes the plain functions it exports (`titleCase`, `withPinnedOption`, `createAppTheme`) client functions: call them from client code, not from a server component, route handler or server action, where they fail at runtime.

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
| `Breadcrumbs` | Breadcrumb trail for detail-page headers | Link is injectable; last crumb gets `aria-current="page"` |
| `ConfirmDialog` | Promise-based `confirm()` replacement via context + `useConfirm()` hook | Labels are props (no i18n dependency) |
| `DatePickerField` | Date input with a popover calendar; the value is an ISO `YYYY-MM-DD` string | From `/date-picker` (needs `@mui/x-date-pickers` and `dayjs`); RHF adapter from `/date-picker/rhf`. See [Forms](#forms) |
| `EmptyState` | Empty-list placeholder with tinted icon tile + optional CTA | Link is injectable — works with Next, react-router, or `<a>` |
| `FloatingCreateButton` | Mobile-only "create" FAB | Hides at the configured breakpoint; link is injectable |
| `IdAutocomplete` | Single-select picker over `{ id, label }` options whose value is the chosen id | Optional server search, group headers and an "Add …" row; RHF adapter from `/rhf` |
| `PageSkeleton` | Whole-page loading placeholder (`list`, `profile` or `document` layout) | Announces one "Loading" status; label is a prop |
| `RowActions` | Keeps a table row's action buttons on one line | Wrap the buttons in the action cell |
| `TableSkeleton` | Loading placeholder for tables | Zero coupling, pure MUI |
| `TitleCaseField` | Text field that title-cases a name-like value on blur | The rule is exported as `titleCase`; RHF adapter from `/rhf` |
| `TruncatedText` | One-line text with an ellipsis | Tooltip with the full text only when it is cut off |
| `ThemeModeProvider` | MUI theme + light/dark/system mode | Controlled or uncontrolled; opt-in `localStorage` persistence |
| `useDebouncedValue` | Debounce any value | — |
| `useUrlState` | Typed state kept in the URL query string | Router is injectable; see [URL state](#url-state) |
| `useUrlSearch` | Search box synced to the URL without lost keystrokes | Debounced query for fetching; see [URL state](#url-state) |

## Forms

`TitleCaseField`, `IdAutocomplete` and `DatePickerField` are controlled first: each works on its own with `value` and `onChange`, and `onChange` receives the new value (a string, an id, an ISO date), not an event. They share `label`, `required`, `disabled`, `helperText`, `errorMessage`, `error`, `size` and `fullWidth`. A non-empty `errorMessage` puts the field in its error state and replaces `helperText`; `error` puts it in the error state without a message, keeping `helperText`. `required` is MUI's own prop: it adds the asterisk and the input's native `required` attribute, so give the `<form>` `noValidate` if you show your own messages instead of the browser's. From `@mui/x-date-pickers` 8 on, `DatePickerField`'s input is a hidden one behind the day, month and year parts, and MUI X marks none of the parts as required, so screen readers are not told the date is required; say so in the label or `helperText` where it matters.

The React Hook Form adapters are thin wrappers. Each takes `name`, `control` and optional `rules`, plus the field's other props, and shows the field's validation message unless you pass `errorMessage`. A failed rule turns the field invalid even when it has no message (`required: true`).

The optional dependencies sit behind subpaths, so an app that does not use them never installs them:

| Import from | Exports | Needs |
| --- | --- | --- |
| `@rbalukja15/ui-components` | `TitleCaseField`, `titleCase`, `IdAutocomplete`, `withPinnedOption` | Nothing extra |
| `@rbalukja15/ui-components/rhf` | `RhfTitleCaseField`, `RhfIdAutocomplete` | `react-hook-form` 7.31.3 or later |
| `@rbalukja15/ui-components/date-picker` | `DatePickerField` | `@mui/x-date-pickers` 6.2 or later (v6 to v9), `dayjs` |
| `@rbalukja15/ui-components/date-picker/rhf` | `RhfDatePickerField` | All three |

```bash
npm install react-hook-form                  # for /rhf
npm install @mui/x-date-pickers@9 dayjs      # for /date-picker, on MUI 7.3+ or 9
npm install @mui/x-date-pickers@8 dayjs      # for /date-picker, on MUI 5.15+, 6 or 7
```

`@mui/x-date-pickers` v6 to v9 all work; pick the one your MUI supports (v6: MUI 5 on React 18; v7 and v8: MUI 5.15 or later, 6 and 7; v9: MUI 7.3 or later and 9). `react-hook-form` and `dayjs` are optional peer dependencies, but `@mui/x-date-pickers` is not declared as a peer at all: npm checks a missing optional peer against the newest version in its range, and MUI X 9's own peers would then block `npm install` in every MUI 5 or 6 app. So npm does not warn about a missing or mismatched MUI X; install one of the majors above yourself.

`DatePickerField` needs no `LocalizationProvider`; when the app has one with the dayjs adapter, the field follows its locale and texts. For month names in another language, import the dayjs locale and pass it: `import 'dayjs/locale/de'` and `adapterLocale="de"`.

Each subpath also has a folder with a `package.json` pointing into `dist/`, so tools that ignore the `exports` map (Jest 27, webpack 4) resolve it too.

Controlled:

```tsx
import { useState } from 'react';
import { IdAutocomplete, TitleCaseField } from '@rbalukja15/ui-components';
import { DatePickerField } from '@rbalukja15/ui-components/date-picker';

const people = [
  { id: 1, label: 'Ada Lovelace' },
  { id: 2, label: 'Alan Turing' },
];

function ProjectFields() {
  const [name, setName] = useState('');
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');

  return (
    <>
      <TitleCaseField label="Project name" value={name} onChange={setName} required />
      <IdAutocomplete label="Owner" options={people} value={ownerId} onChange={setOwnerId} />
      <DatePickerField label="Start date" value={startDate} onChange={setStartDate} />
    </>
  );
}
```

With React Hook Form:

```tsx
import { useForm } from 'react-hook-form';
import { RhfIdAutocomplete, RhfTitleCaseField } from '@rbalukja15/ui-components/rhf';
import { RhfDatePickerField } from '@rbalukja15/ui-components/date-picker/rhf';

// `people` as in the controlled example.

interface ProjectValues {
  name: string;
  ownerId: number | null;
  startDate: string;
}

function ProjectForm({ onSave }: { onSave: (values: ProjectValues) => void }) {
  const { control, handleSubmit } = useForm<ProjectValues>({
    defaultValues: { name: '', ownerId: null, startDate: '' },
  });

  return (
    <form noValidate onSubmit={handleSubmit(onSave)}>
      <RhfTitleCaseField name="name" control={control} label="Project name" required rules={{ required: 'Enter a name' }} />
      <RhfIdAutocomplete name="ownerId" control={control} label="Owner" options={people} />
      <RhfDatePickerField name="startDate" control={control} label="Start date" />
      <button type="submit">Save</button>
    </form>
  );
}
```

The `required` prop only marks the field; the `required` rule is what checks it.

## URL state

`useUrlState` keeps a bag of filters in the query string, typed by its defaults. A number default reads its param as a number, a boolean default reads `1` or `true`, anything else stays a string. `setState` takes a partial patch and replaces the URL rather than pushing, so filtering never fills the history. Params equal to their default are left out of the URL, and params the defaults do not name are kept. Define the defaults outside the component, so they keep one identity.

`useUrlSearch` pairs a search box with one of those params. The box keeps its own state, so no keystroke is lost while the router catches up, and the third value is the box's text once typing pauses (300 ms by default), which is what the list should fetch with. When the URL changes from outside (a link back to the bare list, Back), the box follows it.

```tsx
import { TextField } from '@mui/material';
import { useUrlSearch, useUrlState } from '@rbalukja15/ui-components';

const FILTERS = { q: '', page: 0, archived: false };

function ProjectsPage() {
  const [{ q, page, archived }, setFilters] = useUrlState(FILTERS);
  const [search, setSearch, query] = useUrlSearch(q, (value) => setFilters({ q: value, page: 0 }));
  const projects = useProjects({ query, page, archived }); // your data hook

  return <TextField label="Search" value={search} onChange={(event) => setSearch(event.target.value)} />;
}
```

Without a provider the hooks read and write `window.location` through the history API, which suits apps without a router. Server HTML then renders the defaults, and the real query string is applied straight after hydration. With a router, pass its search params to `UrlStateProvider`, so the hooks and the router share one URL and server HTML matches it. The adapter is `{ search, replace }`: the current query string, and a function that replaces it without adding a history entry. Memoize it.

Next.js App Router (wrap the provider in `<Suspense>`, as `useSearchParams` needs one on statically rendered routes):

```tsx
'use client';
import { useMemo, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UrlStateProvider, type UrlAdapter } from '@rbalukja15/ui-components';

export function NextUrlStateProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const adapter = useMemo<UrlAdapter>(
    () => ({
      search: searchParams.toString(),
      replace: (search) => router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false }),
    }),
    [searchParams, router, pathname],
  );
  return <UrlStateProvider adapter={adapter}>{children}</UrlStateProvider>;
}
```

React Router 6.4 or later:

```tsx
import { useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UrlStateProvider, type UrlAdapter } from '@rbalukja15/ui-components';

export function RouterUrlStateProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const adapter = useMemo<UrlAdapter>(
    () => ({
      search: searchParams.toString(),
      replace: (search) => setSearchParams(search, { replace: true, preventScrollReset: true }),
    }),
    [searchParams, setSearchParams],
  );
  return <UrlStateProvider adapter={adapter}>{children}</UrlStateProvider>;
}
```

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

CI (lint, typecheck, test, build) runs on every push, plus a compatibility matrix that typechecks and tests against each supported MUI major and each supported `@mui/x-date-pickers` major, and an install check that packs the library and runs a plain `npm install` of it in a fresh app on each MUI major; Storybook deploys to GitHub Pages from `main`.

### Releasing

Versions and the [changelog](./CHANGELOG.md) are managed with [Changesets](https://github.com/changesets/changesets).

1. In a PR with a user-facing change, run `npx changeset`, pick the bump (patch / minor / major) and describe the change. Commit the generated file in `.changeset/`.
2. When that PR lands on `main`, the Release workflow opens a "chore: release" PR that bumps the version and updates `CHANGELOG.md`.
3. Merging the release PR publishes the new version to npm with provenance. Publishing uses npm [trusted publishing](https://docs.npmjs.com/trusted-publishers), so no npm token is stored in the repo.

## Porting guide

A form control follows the pattern in [Forms](#forms): the controlled component goes in its folder's `index.ts` and the main entry, and its `*.rhf.tsx` adapter is exported only from a subpath entry, so the main entry never imports an optional peer.

## License

MIT © Romarjo Balukja
