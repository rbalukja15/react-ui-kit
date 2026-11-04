---
'@rbalukja15/ui-components': minor
---

Add dashboard building blocks: `Panel`, `StatTile`, `Pill`, `FilterChips`, `BarChart`, `StackedBarChart`, `ChartLegend`, `Sparkline`, `Meter`, `ListRow`, `SummaryList`, `TwoLineCell`, `DropdownButton`, `SearchField` and `PageHeader`.

The theme gains `palette.surface`, `palette.line`, `palette.chart` and `palette.nav` tokens (override them per app like any palette key), a flatter look (no button elevation, 36/40/44px button heights, 12px control radius, quiet table headers, bordered pager buttons) and an amber `warning` colour. The `AppShell` sidebar is a dark rail in both modes, coloured from `palette.nav`, and the shell paints the page colour itself. The theme sets `color-scheme` and `scrollbar-color` from the mode, so scrollbars follow the app rather than the OS. `DataTable` takes a `footer` note beside the pager, and columns take `hideBelow` to step aside on small screens. `TwoLineCell` drops its icon tile on phones.

Storybook has a new "Screens/VetApp" section with a statistics page and a dashboard built only from kit components, on desktop and on a phone.

**Upgrading from 0.3.** The look changes even if you don't use the new components:

- **Font.** Headings and body use one family, Mona Sans, instead of Newsreader headings over Inter. Load it with `https://fonts.googleapis.com/css2?family=Mona+Sans:wght@400..700&display=swap` and drop the Inter and Newsreader links. To keep another font, pass `{ typography: { fontFamily: '…' } }` to `createAppTheme`; headings follow it too.
- **Sidebar.** The `AppShell` sidebar is now dark in both modes. To get a light rail back, override `palette.nav` (the README has a ready-made override).
- **App bar.** The `AppShell` header now follows `palette.surface.card` and `palette.line.strong`, not `palette.background.paper`. Override those tokens to recolour it.
- **Buttons and inputs.** No shadow, 12px corners and fixed heights of 36, 40 and 44px. Restore the old values through `components.MuiButton` or `components.MuiOutlinedInput` overrides if needed.
