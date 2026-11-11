---
'@rbalukja15/ui-components': patch
---

Pinned table headers (`stickyHeader`, including `DataTable`) now take the colour of the card they sit on instead of the page colour, which showed as a dark band in dark mode. Panel publishes its surface as `--ui-surface`; elsewhere the header falls back to `background.paper`.
