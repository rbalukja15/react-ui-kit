# @rbalukja15/ui-components

## 0.1.0

Initial release.

- Editorial MUI theme (Newsreader headings, Inter body) with light and dark modes, tonal chips and brand overrides via `createAppTheme`.
- `ThemeModeProvider` / `useThemeMode` with controlled mode, system preference and opt-in persistence.
- Components: `ConfirmDialogProvider` with a promise-based `useConfirm`, `EmptyState`, `FloatingCreateButton`, `TableSkeleton`, plus a `useDebouncedValue` hook.
- Works with MUI 5, 6, 7 and 9 on React 18 and 19; the bundle keeps its `'use client'` directive for the Next.js App Router.
