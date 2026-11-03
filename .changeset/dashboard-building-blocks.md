---
'@rbalukja15/ui-components': minor
---

Add dashboard building blocks: `Panel`, `StatTile`, `Pill`, `FilterChips`, `BarChart`, `StackedBarChart`, `ChartLegend`, `Sparkline`, `Meter`, `ListRow`, `SummaryList`, `TwoLineCell`, `DropdownButton`, `SearchField` and `PageHeader`.

The theme gains `palette.surface`, `palette.line` and `palette.chart` tokens (override them per app like any palette key), a flatter look (no button elevation, 36/40/44px button heights, 12px control radius, quiet table headers, bordered pager buttons) and an amber `warning` colour. The sidebar's active item is now a white card with a primary outline. `DataTable` takes a `footer` note beside the pager.

Storybook has a new "Screens/VetApp" section with a statistics page and a dashboard built only from kit components.
