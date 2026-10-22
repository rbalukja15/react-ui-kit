# 0003. Components never import a router, store or API client

- Status: Accepted
- Date: 2026-10-06

## Context

The components were extracted from a Next.js app where links used `next/link`, filters lived in `useSearchParams`, and labels came from an i18n hook. Copied as they were, they would only work in that app.

## Decision

Anything app-specific comes in through props or a small adapter:

- links go through an injectable `LinkComponent` (`Breadcrumbs`, `AppShell`, `BottomNav`, `EmptyState`, `FloatingCreateButton`), defaulting to a plain `<a>`;
- the active navigation item comes from `currentPath`, or a custom `isActive`;
- `useUrlState` and `useUrlSearch` read and write the query string through a `UrlAdapter`. The default uses the browser history API, and `UrlStateProvider` swaps in a Next.js, React Router or any other router;
- every visible or announced string is a prop with an English default, so apps translate by passing their own.

## Consequences

The library works in any React app, including tests and Storybook, with no providers beyond the theme. Apps write a few lines of glue, which the README shows for Next.js and React Router. Reviewers reject any import of a router, store, fetch client or i18n library in `src/`.
