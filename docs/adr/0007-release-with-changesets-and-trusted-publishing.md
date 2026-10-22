# 0007. Release with Changesets and npm trusted publishing

- Status: Accepted
- Date: 2026-10-05

## Context

Releases were manual: bump the version, write the changelog and run `npm publish` from a laptop. That is easy to get wrong, and a long-lived npm token in CI is a supply-chain risk.

## Decision

Each pull request with a user-facing change carries a changeset that names the semver bump and describes the change for users. On `main`, the Release workflow collects pending changesets into a "chore: release" pull request that bumps the version and writes `CHANGELOG.md`. Merging it publishes to npm through [trusted publishing](https://docs.npmjs.com/trusted-publishers): GitHub's OIDC token proves the run comes from this repository's `release.yml`, so no npm token is stored anywhere, and every version gets a signed provenance statement.

## Consequences

The changelog is written when the change is made, by whoever made it. Releases need a merge, not a terminal. Publishing depends on the trusted publisher settings on npmjs.com matching the workflow file, so renaming `release.yml` or moving the repository means updating them first.
