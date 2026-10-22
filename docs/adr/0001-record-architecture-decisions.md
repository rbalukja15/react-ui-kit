# 0001. Record architecture decisions

- Status: Accepted
- Date: 2026-10-05

## Context

Several choices in this library look odd in isolation: a peer that is deliberately missing, a build option left off, a hook that takes an adapter instead of using a router. Without the reasoning, a well-meant cleanup can undo them and break users.

## Decision

Write each decision that affects the public API, the package layout or the build as a short record in `docs/adr/`, using the context, decision and consequences format from Michael Nygard.

## Consequences

The reasoning lives next to the code and is reviewed in the same pull request. Code comments can stay short and point to a record. Records are cheap to write, so they are expected for any change of this kind.
