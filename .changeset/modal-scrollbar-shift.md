---
'@rbalukja15/ui-components': patch
---

Opening a `Menu`, `Popover` or `Dialog` no longer shifts the page by the scrollbar width. The theme reserves the scrollbar gutter on `html`, so `MuiCssBaseline` now cancels the extra `padding-right` MUI's scroll lock adds to `body` and to `.mui-fixed` elements such as a fixed `AppBar`. Apps that carried their own `body { padding-right: 0 !important }` workaround can drop it.
