# @rbalukja15/ui-components

## 0.2.0

### Minor Changes

- 3a9bc21: Add the form fields `TitleCaseField`, `IdAutocomplete` and `DatePickerField`. Each is controlled with `value` and `onChange`, and they share `label`, `required`, `disabled`, `helperText`, `errorMessage`, `error`, `size` and `fullWidth`. `TitleCaseField` title-cases a name-like value when focus leaves it, using the rule also exported as `titleCase`; `IdAutocomplete` is a single-select picker whose value is the chosen option's id, with optional server search, group headers and an "Add …" row, plus `withPinnedOption` to keep a just-created or loaded record in its options; `DatePickerField` is a date input with a popover calendar on MUI X `DatePicker`, whose value is an ISO `YYYY-MM-DD` string. React Hook Form adapters and the date picker live behind new entry points, so the main entry needs nothing new: `/rhf` (`RhfTitleCaseField`, `RhfIdAutocomplete`; needs `react-hook-form` 7.31.3 or later), `/date-picker` (`DatePickerField`; needs `@mui/x-date-pickers` v6 (6.2 or later), v7, v8 or v9, matching your MUI, and `dayjs`) and `/date-picker/rhf` (`RhfDatePickerField`; needs all three). `react-hook-form` and `dayjs` are optional peer dependencies. `@mui/x-date-pickers` is not declared as a peer, because no single optional peer range installs cleanly on both MUI 5 and MUI 9, so npm does not check its version: install a supported major yourself. Each subpath also ships a `package.json` stub folder for resolvers that ignore `exports` (Jest 27, webpack 4). CommonJS consumers now get `.d.cts` types for every entry.
- 11dd68f: Add `Breadcrumbs`, `PageSkeleton`, `RowActions` and `TruncatedText`. `Breadcrumbs` takes an injectable `LinkComponent` and marks the current page with `aria-current`; `PageSkeleton` draws a `list`, `profile` or `document` page layout behind a single "Loading" status; `RowActions` keeps a table row's action buttons on one line; `TruncatedText` ellipsises one line of text and shows the full value in a tooltip only when it is cut off.

### Patch Changes

- c56fde4: Raise palette contrast to WCAG AA for body text. Light `secondary` is now `#0a7c97` (dark `#155e75`), light `warning` is `#9A6824`, and dark `primary` uses a dark `contrastText` (`#06201C`) like the other dark-mode colours.

## 0.1.0

Initial release.

- Editorial MUI theme (Newsreader headings, Inter body) with light and dark modes, tonal chips and brand overrides via `createAppTheme`.
- `ThemeModeProvider` / `useThemeMode` with controlled mode, system preference and opt-in persistence.
- Components: `ConfirmDialogProvider` with a promise-based `useConfirm`, `EmptyState`, `FloatingCreateButton`, `TableSkeleton`, plus a `useDebouncedValue` hook.
- Works with MUI 5, 6, 7 and 9 on React 18 and 19; the bundle keeps its `'use client'` directive for the Next.js App Router.
