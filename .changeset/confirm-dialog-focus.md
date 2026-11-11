---
'@rbalukja15/ui-components': minor
---

`ConfirmDialog` now focuses Cancel when `destructive` is set, so a reflexive Enter no longer confirms a delete. Non-destructive prompts still focus Confirm, and the new `focus: 'confirm' | 'cancel'` option picks the button explicitly. The dialog is also `maxWidth="xs" fullWidth`, compact on desktop and full width on phones.
