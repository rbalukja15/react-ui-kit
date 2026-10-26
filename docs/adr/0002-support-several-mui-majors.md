# 0002. Support several MUI and React majors from one release

- Status: Accepted
- Date: 2026-10-05

## Context

The library came out of an app on MUI 5 and React 18, but new apps start on MUI 7 or 9 and React 19. A library that pins one MUI major forces every consumer to upgrade in lockstep, or to fork it.

## Decision

Declare peer ranges that cover MUI 5, 6, 7 and 9 and React 18 and 19, and use only the API those majors share. CI backs each range:

- the `compat` job typechecks and runs the full test suite against every supported MUI major, paired with a matching `@mui/x-date-pickers` major;
- the `install` job packs the library and runs a plain `npm install` of the tarball into a fresh app on each MUI major, so peer conflicts show up the way a user would see them.

## Consequences

Newer MUI APIs, such as CSS theme variables, can only be used where all supported majors have them, or behind a feature check. Adding a major means adding matrix rows first and widening the range second. Dropping one is a breaking change.
