---
'@rbalukja15/ui-components': minor
---

Add dashboard building blocks: `Panel`, `StatTile`, `Pill`, `FilterChips`, `BarChart`, `StackedBarChart`, `ChartLegend`, `Sparkline`, `Meter`, `ListRow`, `SummaryList`, `TwoLineCell`, `DropdownButton`, `SearchField` and `PageHeader`.

The theme gains `palette.surface`, `palette.line`, `palette.chart` and `palette.nav` tokens (override them per app like any palette key), a flatter look (no button elevation, 36/40/44px button heights, 12px control radius, quiet table headers, bordered pager buttons) and an amber `warning` colour. The `AppShell` sidebar is a dark rail in both modes, coloured from `palette.nav`, and the shell paints the page colour itself. The theme sets `color-scheme` and `scrollbar-color` from the mode, so scrollbars follow the app rather than the OS. `DataTable` takes a `footer` note beside the pager, and columns take `hideBelow` to step aside on small screens. `TwoLineCell` drops its icon tile on phones.

Storybook has a new "Screens/VetApp" section with a statistics page and a dashboard built only from kit components, on desktop and on a phone.
