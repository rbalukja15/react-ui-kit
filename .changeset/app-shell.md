---
"@rbalukja15/ui-components": minor
---

Add `AppShell` and `BottomNav`. `AppShell` is a responsive layout with a sidebar, a sticky header and an optional mobile bottom bar: from a breakpoint up the sidebar is permanent and collapses to an icon rail (controlled, or uncontrolled with opt-in `localStorage` persistence), below it it is an overlay drawer. It is router-agnostic: items link through an injectable `LinkComponent`, the active item comes from `currentPath` (or a custom `isActive`), and auth, permissions and menus stay in the app. `isPathActive` exports the default active-item rule.
