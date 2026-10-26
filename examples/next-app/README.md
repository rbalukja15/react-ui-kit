# Next.js demo

A small order-management app built from `@rbalukja15/ui-components` on the Next.js 16 App Router, MUI 9 and React 19. It is deployed with the Storybook at [rbalukja15.github.io/react-ui-kit/demo](https://rbalukja15.github.io/react-ui-kit/demo/).

| Page | Shows |
| --- | --- |
| Dashboard | `AppShell` with a collapsible rail and a mobile bottom bar, a light and dark toggle through `useThemeMode`, and a compact `DataTable` with `StatusChip`s |
| Orders | `DataTable` with search, a status filter, sort, page and page size all kept in the URL through `useUrlState` and `useUrlSearch` and a Next.js adapter. It also has row selection with a bulk delete, a columns menu, `StatusChip` transitions, `useConfirm` before deleting, `TruncatedText`, an `EmptyState` with a reset, and a `FloatingCreateButton` on mobile |
| New order | A React Hook Form form with `RhfIdAutocomplete`, `RhfTitleCaseField`, `RhfDatePickerField` with `DatePresets`, and `Breadcrumbs` |

`app/layout.tsx` is a server component that imports the kit's providers directly. The package's `'use client'` banner makes that work.

The data is in memory and resets on reload.

## Run it

```bash
npm ci                   # in the repository root
cd examples/next-app
npm run setup            # packs the library into vendor/ and installs
npm run dev
```

`npm run setup` installs the packed tarball rather than linking `src/`. The demo then uses exactly what npm users get: the built entries, the exports map and the `'use client'` banners. Run it again after changing the library.

CI builds this app on every pull request, and the static export prerenders each page on the server.
