---
'@rbalukja15/ui-components': patch
---

`AppShell`'s sidebar no longer draws a scrollbar down the rail when the nav list is taller than the window. The list still scrolls by wheel, trackpad, touch and keyboard. With classic scrollbars (Windows, or macOS set to "always show") a 15px bar took up the rail's right edge.
