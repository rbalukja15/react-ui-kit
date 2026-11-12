---
'@rbalukja15/ui-components': patch
---

`IdAutocomplete`'s pinned group headers now sit flush with the top of the listbox. They stuck 8px below it, below MUI's listbox padding, so scrolled rows showed through the strip above them. Apps that set `.MuiAutocomplete-listbox .MuiListSubheader-sticky { top: -8px }` as a workaround can drop it.
