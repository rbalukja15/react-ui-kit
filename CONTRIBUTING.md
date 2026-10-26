# Contributing

Thanks for taking the time to help. This guide covers setup, the conventions the codebase follows, and what a pull request needs before it can merge.

## Setup

Node 22 (see `.nvmrc`). ESLint 10 needs at least 20.19, and CI runs 22.

```bash
npm install
npm run storybook          # workbench at http://localhost:6006
npm run test:watch         # vitest in watch mode
```

| Script | What it does |
| --- | --- |
| `npm run lint` | ESLint over `src/`, stories and tests included. Warnings fail it too (`--max-warnings 0`), so a missing hook dependency blocks CI |
| `npm run typecheck` | `tsc --noEmit` with `strict` and `noUncheckedIndexedAccess` |
| `npm run test` | Unit, interaction and axe tests in jsdom |
| `npm run build` | ESM, CJS and type declarations for every entry, via tsup |
| `npm run build-storybook` | Static Storybook in `storybook-static/` |
| `npm run coverage` | Tests with a coverage report and the minimum thresholds |
| `npm run size` | Checks each built entry against its bundle-size budget (run `npm run build` first) |
| `npm run changeset` | Describe a user-facing change for the changelog |

## Adding a component

Each component has its own folder under `src/components/`:

```
src/components/Thing/
  Thing.tsx              the component; public props exported as ThingProps
  Thing.test.tsx         behaviour, through Testing Library queries by role
  Thing.a11y.test.tsx    axe in each meaningful state (open, error, loading)
  Thing.stories.tsx      one story per state, with args for Controls
  index.ts               re-exports the component and its types
```

Then export it from `src/index.ts`, add a row to the Components table in the README, and add a changeset.

Things reviewers check for:

- **No app coupling.** No router, store, fetch client or i18n import. Links come in as a `LinkComponent` prop, strings as props with English defaults. See [ADR 0003](./docs/adr/0003-no-app-coupling.md).
- **Controlled first.** Form fields take `value` and `onChange`. A React Hook Form adapter goes in `Thing.rhf.tsx` and is exported only from `src/rhf.ts`. See [ADR 0004](./docs/adr/0004-optional-peers-behind-subpath-entries.md).
- **Accessible by default.** A role and an accessible name for every interactive element, keyboard support that follows the matching WAI-ARIA pattern, and visible focus. Colours come from the theme palette, which has contrast tests.
- **Typed strictly.** No `any` in public types, and every public prop has a TSDoc comment, because Storybook's Docs pages are generated from them.
- **Works on every supported MUI major.** Use only the API MUI 5 to 9 share. CI runs the tests against each one.

## Commits and pull requests

- Branch from `main` with a `feat/`, `fix/` or `chore/` prefix.
- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:`, `test:`.
- Run `npm run changeset` for anything a user of the package would notice, and pick patch, minor or major. Internal changes such as CI, tests and docs need none. [`.changeset/README.md`](./.changeset/README.md) explains the format.
- CI must be green: the `verify` job (lint, typecheck, tests, build and the bundle checks), the `compat` matrix, and the `install` check on each MUI major.

## Decisions

Choices that shape the public API, the package layout or the build are recorded in [`docs/adr/`](./docs/adr/README.md). Read the relevant record before changing something that looks odd: several of them prevent real install or runtime failures. If your change reverses or extends a decision, add a new record in the same pull request.

## Releasing

Maintainers merge the "chore: release" pull request that the Release workflow keeps up to date. That publishes to npm with provenance. See [ADR 0007](./docs/adr/0007-release-with-changesets-and-trusted-publishing.md).
