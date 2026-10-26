# Architecture decision records

Each record explains one decision that shapes the library: the problem, the choice, and what it costs. Records are not edited once accepted. If a decision changes, a new record supersedes the old one and both stay here.

| # | Decision | Status |
| --- | --- | --- |
| [0001](./0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](./0002-support-several-mui-majors.md) | Support several MUI and React majors from one release | Accepted |
| [0003](./0003-no-app-coupling.md) | Components never import a router, store or API client | Accepted |
| [0004](./0004-optional-peers-behind-subpath-entries.md) | Optional peers live behind subpath entries | Accepted |
| [0005](./0005-mui-x-is-not-a-peer.md) | `@mui/x-date-pickers` is not declared as a peer | Accepted |
| [0006](./0006-use-client-banner.md) | Every output file starts with `'use client'` | Accepted |
| [0007](./0007-release-with-changesets-and-trusted-publishing.md) | Release with Changesets and npm trusted publishing | Accepted |

To add one, copy [the template](./template.md), give it the next number, and link it in the table above.
