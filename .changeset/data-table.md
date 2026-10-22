---
'@rbalukja15/ui-components': minor
---

Add `DataTable`, a table with sorting, pagination, row selection, a columns menu, per-row actions, a sticky header and loading and empty states. In client mode it sorts and pages the rows itself; with `mode="server"` it shows the rows it is given and reports sort and page changes for your API to handle. Sort, page, page size, selection and hidden columns each work uncontrolled or controlled, so they can live in the URL with `useUrlState`. Headers carry `aria-sort`, row checkboxes are named with `getRowLabel`, and every string can be translated through `labels`. The sort rule is exported as `sortRows`.
