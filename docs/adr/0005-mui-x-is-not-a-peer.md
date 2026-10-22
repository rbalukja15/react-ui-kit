# 0005. `@mui/x-date-pickers` is not declared as a peer

- Status: Accepted
- Date: 2026-10-06

## Context

Declaring `@mui/x-date-pickers` as an optional peer looks correct, but it broke installs. When an optional peer is missing, npm still checks it against the newest version in its range. MUI X 9 requires `@mui/system` 7.3 or later, so a plain `npm install` of the kit failed with `ERESOLVE` in MUI 5 and 6 apps that never used the date picker. No single range installs cleanly on both MUI 5 and MUI 9.

## Decision

Leave `@mui/x-date-pickers` out of `peerDependencies` entirely. Document the supported majors (6.2 or later, 7, 8 and 9, matching the app's MUI) in the README, and keep it external in the build. The `compat` job covers each supported MUI X major against a MUI major it works with.

## Consequences

npm no longer warns when an app installs an unsupported MUI X major, so the README and the compat matrix carry that job. `DatePickerField` detects an app-level `LocalizationProvider` through a private MUI X hook, so the matrix is also what catches that hook moving. Do not add MUI X back as a peer, even as an optional one: the install job will fail on MUI 5 and 6.
