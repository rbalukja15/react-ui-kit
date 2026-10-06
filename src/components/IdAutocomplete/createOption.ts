import type { IdOption } from './IdAutocomplete';

/**
 * Marks the synthetic "create" row. A symbol rather than a reserved id, so no
 * real option can ever be mistaken for it, whatever ids the caller uses.
 */
const CREATE_ROW: unique symbol = Symbol('IdAutocomplete.createRow');

/**
 * The "Add …" row the picker offers at the bottom of its list while text is
 * typed, so an unknown record can be created without leaving a half-filled
 * form. It is synthetic: `IdAutocomplete` intercepts it in its change handler,
 * so it never reaches the caller's value.
 */
export interface CreateOption extends IdOption {
  [CREATE_ROW]: true;
  /** What was typed in the box, trimmed: the new record's name. */
  typed: string;
}

export function isCreateOption(option: IdOption | null | undefined): option is CreateOption {
  return option != null && CREATE_ROW in option;
}

/**
 * `options` with the create row last, while anything is typed, unless an
 * option already carries exactly that label (ignoring case and surrounding
 * spaces): typing someone's full name means picking them, not making a twin.
 * Never mutates `options`.
 */
export function withCreateOption<TOption extends IdOption>(
  options: readonly TOption[],
  typed: string,
  label: (typed: string) => string,
): ReadonlyArray<TOption | CreateOption> {
  const name = typed.trim();
  if (!name) return options;
  const key = name.toLocaleLowerCase();
  if (options.some((o) => o.label.trim().toLocaleLowerCase() === key)) return options;
  const create: CreateOption = { [CREATE_ROW]: true, id: '__create__', label: label(name), typed: name };
  return [...options, create];
}

/**
 * `options` with `pinned` added, unless the list already holds an option with
 * the same id (compared as strings), in which case the list is returned as it
 * is, so a fresh copy from the server is never shadowed by a stale one.
 *
 * `pinned` goes first among the options it would be shown with, keeping the
 * grouped options first and together (see `IdOption.group`): without a
 * `group`, first among the ungrouped options, which is the top of the list
 * unless some options are grouped; with one, first in that group, or at the
 * top when no option has it yet.
 *
 * `IdAutocomplete` resolves its label from `options`, so a value whose option
 * is missing from them renders as an empty input. Pin the record the user just
 * created (after `onCreate`), or one loaded by id, while the options come from
 * a search that may not return it.
 *
 * ```tsx
 * <IdAutocomplete options={withPinnedOption(searchResults, created)} … />
 * ```
 *
 * It ships in a `'use client'` bundle, so in the Next.js App Router call it
 * from client code, not from a server component, route handler or server
 * action.
 */
export function withPinnedOption<TOption extends IdOption>(
  options: readonly TOption[],
  pinned: TOption | null | undefined,
): readonly TOption[] {
  if (!pinned || options.some((o) => String(o.id) === String(pinned.id))) return options;
  const { group } = pinned;
  const at = group ? options.findIndex((o) => o.group === group) : options.findIndex((o) => !o.group);
  const index = at !== -1 ? at : group ? 0 : options.length;
  return [...options.slice(0, index), pinned, ...options.slice(index)];
}
