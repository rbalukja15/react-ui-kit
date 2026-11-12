# @rbalukja15/ui-components

## 0.6.0

### Minor Changes

- 765dba5: DataTable: rows can open a record on click (`onRowClick`), skipping clicks on the row's actions, checkbox and links, and a click that ends a text selection. Columns can sort descending first (`sortFirst`), take a responsive `width` and style their header and cells with `cellSx`. New `actionsWidth`, `tableSx` and `containerSx` props. A new page now scrolls the rows back to the top, and a pinned header keeps a focused row from scrolling under it.

## 0.5.3

### Patch Changes

- 5f22e3e: `AppShell`'s sidebar no longer draws a scrollbar down the rail when the nav list is taller than the window. The list still scrolls by wheel, trackpad, touch and keyboard. With classic scrollbars (Windows, or macOS set to "always show") a 15px bar took up the rail's right edge.

## 0.5.2

### Patch Changes

- 221bdc6: `IdAutocomplete`'s pinned group headers now sit flush with the top of the listbox. They stuck 8px below it, below MUI's listbox padding, so scrolled rows showed through the strip above them. Apps that set `.MuiAutocomplete-listbox .MuiListSubheader-sticky { top: -8px }` as a workaround can drop it.

## 0.5.1

### Patch Changes

- d3a3373: Opening a `Menu`, `Popover` or `Dialog` no longer shifts the page by the scrollbar width. The theme reserves the scrollbar gutter on `html`, so `MuiCssBaseline` now cancels the extra `padding-right` MUI's scroll lock adds to `body` and to `.mui-fixed` elements such as a fixed `AppBar`. Apps that carried their own `body { padding-right: 0 !important }` workaround can drop it.

## 0.5.0

### Minor Changes

- 8d1509d: `ConfirmDialog` now focuses Cancel when `destructive` is set, so a reflexive Enter no longer confirms a delete. Non-destructive prompts still focus Confirm, and the new `focus: 'confirm' | 'cancel'` option picks the button explicitly. The dialog is also `maxWidth="xs" fullWidth`, compact on desktop and full width on phones.

### Patch Changes

- 56f127a: Pinned table headers (`stickyHeader`, including `DataTable`) now take the colour of the card they sit on instead of the page colour, which showed as a dark band in dark mode. Panel publishes its surface as `--ui-surface`; elsewhere the header falls back to `background.paper`.

## 0.4.0

### Minor Changes

- ef61b8a: Add dashboard building blocks: `Panel`, `StatTile`, `Pill`, `FilterChips`, `BarChart`, `StackedBarChart`, `ChartLegend`, `Sparkline`, `Meter`, `ListRow`, `SummaryList`, `TwoLineCell`, `DropdownButton`, `SearchField` and `PageHeader`.

  The theme gains `palette.surface`, `palette.line`, `palette.chart` and `palette.nav` tokens (override them per app like any palette key), a flatter look (no button elevation, 36/40/44px button heights, 12px control radius, quiet table headers, bordered pager buttons) and an amber `warning` colour. The `AppShell` sidebar is a dark rail in both modes, coloured from `palette.nav`, and the shell paints the page colour itself. The theme sets `color-scheme` and `scrollbar-color` from the mode, so scrollbars follow the app rather than the OS. `DataTable` takes a `footer` note beside the pager, and columns take `hideBelow` to step aside on small screens. `TwoLineCell` drops its icon tile on phones.

  Storybook has a new "Screens/VetApp" section with a statistics page and a dashboard built only from kit components, on desktop and on a phone.

  **Upgrading from 0.3.** The look changes even if you don't use the new components:

  - **Font.** Headings and body use one family, Mona Sans, instead of Newsreader headings over Inter. Load it with `https://fonts.googleapis.com/css2?family=Mona+Sans:wght@400..700&display=swap` and drop the Inter and Newsreader links. To keep another font, pass `{ typography: { fontFamily: '…' } }` to `createAppTheme`; headings follow it too.
  - **Sidebar.** The `AppShell` sidebar is now dark in both modes. To get a light rail back, override `palette.nav` (the README has a ready-made override).
  - **App bar.** The `AppShell` header now follows `palette.surface.card` and `palette.line.strong`, not `palette.background.paper`. Override those tokens to recolour it.
  - **Buttons and inputs.** No shadow, 12px corners and fixed heights of 36, 40 and 44px. Restore the old values through `components.MuiButton` or `components.MuiOutlinedInput` overrides if needed.

## 0.3.0

### Minor Changes

- 40c9796: Add `DataTable`, a table with sorting, pagination, row selection, a columns menu, per-row actions, a sticky header and loading and empty states. In client mode it sorts and pages the rows itself; with `mode="server"` it shows the rows it is given and reports sort and page changes for your API to handle. Sort, page, page size, selection and hidden columns each work uncontrolled or controlled, so they can live in the URL with `useUrlState`. Headers carry `aria-sort`, row checkboxes are named with `getRowLabel`, and every string can be translated through `labels`. The sort rule is exported as `sortRows`.

### Patch Changes

- b6bc4d3: Raise light-mode contrast to WCAG AA where a browser check found it short. The label of an empty outlined field now uses `text.secondary` (it was 3.3:1 on the page background). Tonal chips now pass on the page background as well as on paper, and in their hover and focus state: light `warning.dark` is now `#7A521A`, `success.dark` `#4E5E34` and `error.dark` `#98302A`, and dark `primary.light` is `#88BBB2`.

## 0.2.0

### Minor Changes

- ca17205: Add `AppShell` and `BottomNav`. `AppShell` is a responsive layout with a sidebar, a sticky header and an optional mobile bottom bar: from a breakpoint up the sidebar is permanent and collapses to an icon rail (controlled, or uncontrolled with opt-in `localStorage` persistence), below it it is an overlay drawer. It is router-agnostic: items link through an injectable `LinkComponent`, the active item comes from `currentPath` (or a custom `isActive`), and auth, permissions and menus stay in the app. `isPathActive` exports the default active-item rule.
- 3a9bc21: Add the form fields `TitleCaseField`, `IdAutocomplete` and `DatePickerField`. Each is controlled with `value` and `onChange`, and they share `label`, `required`, `disabled`, `helperText`, `errorMessage`, `error`, `size` and `fullWidth`. `TitleCaseField` title-cases a name-like value when focus leaves it, using the rule also exported as `titleCase`; `IdAutocomplete` is a single-select picker whose value is the chosen option's id, with optional server search, group headers and an "Add …" row, plus `withPinnedOption` to keep a just-created or loaded record in its options; `DatePickerField` is a date input with a popover calendar on MUI X `DatePicker`, whose value is an ISO `YYYY-MM-DD` string. React Hook Form adapters and the date picker live behind new entry points, so the main entry needs nothing new: `/rhf` (`RhfTitleCaseField`, `RhfIdAutocomplete`; needs `react-hook-form` 7.31.3 or later), `/date-picker` (`DatePickerField`; needs `@mui/x-date-pickers` v6 (6.2 or later), v7, v8 or v9, matching your MUI, and `dayjs`) and `/date-picker/rhf` (`RhfDatePickerField`; needs all three). `react-hook-form` and `dayjs` are optional peer dependencies. `@mui/x-date-pickers` is not declared as a peer, because no single optional peer range installs cleanly on both MUI 5 and MUI 9, so npm does not check its version: install a supported major yourself. Each subpath also ships a `package.json` stub folder for resolvers that ignore `exports` (Jest 27, webpack 4). CommonJS consumers now get `.d.cts` types for every entry.
- 11dd68f: Add `Breadcrumbs`, `PageSkeleton`, `RowActions` and `TruncatedText`. `Breadcrumbs` takes an injectable `LinkComponent` and marks the current page with `aria-current`; `PageSkeleton` draws a `list`, `profile` or `document` page layout behind a single "Loading" status; `RowActions` keeps a table row's action buttons on one line; `TruncatedText` ellipsises one line of text and shows the full value in a tooltip only when it is cut off.
- d0ba490: Add `StatusChip` and `DatePresets`. `StatusChip` shows a status and opens a menu of the statuses it may move to next, with per-status labels and colors and optional extra actions; without `onChange` it is a plain chip. `DatePresets` renders quick-pick chips like "+1 month / +3 months / +1 year" that add an interval to a base date (or today) and return an ISO `YYYY-MM-DD` string, with no date library needed.
- 87c0c63: Add `useUrlState` and `useUrlSearch`. `useUrlState` keeps typed filters in the URL query string, leaving out params equal to their default and keeping the ones it does not own. `useUrlSearch` binds a search box to one of those params without losing keystrokes while the router catches up, and returns a debounced query to fetch with. Both use the browser history API by default; `UrlStateProvider` takes an adapter for Next.js, React Router or any other router.

### Patch Changes

- c56fde4: Raise palette contrast to WCAG AA for body text. Light `secondary` is now `#0a7c97` (dark `#155e75`), light `warning` is `#9A6824`, and dark `primary` uses a dark `contrastText` (`#06201C`) like the other dark-mode colours.

## 0.1.0

Initial release.

- Editorial MUI theme (Newsreader headings, Inter body) with light and dark modes, tonal chips and brand overrides via `createAppTheme`.
- `ThemeModeProvider` / `useThemeMode` with controlled mode, system preference and opt-in persistence.
- Components: `ConfirmDialogProvider` with a promise-based `useConfirm`, `EmptyState`, `FloatingCreateButton`, `TableSkeleton`, plus a `useDebouncedValue` hook.
- Works with MUI 5, 6, 7 and 9 on React 18 and 19; the bundle keeps its `'use client'` directive for the Next.js App Router.
