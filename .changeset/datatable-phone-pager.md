---
'@rbalukja15/ui-components': patch
---

`DataTable`: on phones (below `sm`) the pager hides its "Rows per page" label, which stays the select's accessible name, and drops most of its gaps, so the page-size select, the range and both arrows fit a list card at 360px. If they still don't fit, the arrows wrap to a second line instead of scrolling the row sideways (#60).
