---
"@rbalukja15/ui-components": minor
---

Add `useUrlState` and `useUrlSearch`. `useUrlState` keeps typed filters in the URL query string, leaving out params equal to their default and keeping the ones it does not own. `useUrlSearch` binds a search box to one of those params without losing keystrokes while the router catches up, and returns a debounced query to fetch with. Both use the browser history API by default; `UrlStateProvider` takes an adapter for Next.js, React Router or any other router.
