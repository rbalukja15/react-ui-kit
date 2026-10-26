---
'@rbalukja15/ui-components': patch
---

Raise light-mode contrast to WCAG AA where a browser check found it short. The label of an empty outlined field now uses `text.secondary` (it was 3.3:1 on the page background). Tonal chips now pass on the page background as well as on paper, and in their hover and focus state: light `warning.dark` is now `#7A521A`, `success.dark` `#4E5E34` and `error.dark` `#98302A`, and dark `primary.light` is `#88BBB2`.
