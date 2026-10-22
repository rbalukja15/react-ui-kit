# 0004. Optional peers live behind subpath entries

- Status: Accepted
- Date: 2026-10-06

## Context

The form fields have React Hook Form adapters, and `DatePickerField` needs `@mui/x-date-pickers` and `dayjs`. Most consumers use neither. If the main entry imported them, every app would have to install them or fail at import time.

## Decision

The main entry imports only React, MUI and Emotion. Code that needs an optional dependency is exported from its own subpath:

| Entry | Needs |
| --- | --- |
| `@rbalukja15/ui-components` | Nothing optional |
| `/rhf` | `react-hook-form` |
| `/date-picker` | `@mui/x-date-pickers`, `dayjs` |
| `/date-picker/rhf` | All three |

`react-hook-form` and `dayjs` are optional peers. Each subpath also ships a `package.json` stub folder for resolvers that ignore `exports` (Jest 27, webpack 4).

## Consequences

CI enforces the boundary: one step follows every relative import from the main entry, declaration files included, and fails if it reaches an optional peer. Another checks that each stub matches the `exports` map. A new component that needs an optional dependency gets a subpath, not a conditional import.
