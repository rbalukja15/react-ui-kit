import * as React from 'react';
import { useUrlAdapter } from './UrlStateProvider';

/** A value `useUrlState` can keep in the query string. */
export type UrlStateValue = string | number | boolean;

const DECIMAL = /^-?\d+(\.\d+)?$/;

// useLayoutEffect warns when rendered on the server, where it never runs.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

/**
 * Parse a query string into a typed state bag, using `defaults` for absent
 * keys. Each default's type drives parsing: a number default reads a plain
 * decimal such as `2` or `-1.5` (anything else, like `1e3` or `0x10`, keeps
 * the default), a boolean default reads `1` or `true` in any case as true,
 * and anything else stays a string.
 */
export function readUrlState<T extends Record<string, UrlStateValue>>(
  defaults: T,
  params: URLSearchParams,
): T {
  const out = { ...defaults };
  (Object.keys(defaults) as (keyof T & string)[]).forEach((key) => {
    const raw = params.get(key);
    if (raw === null) return;
    const fallback = defaults[key];
    if (typeof fallback === 'number') {
      if (DECIMAL.test(raw)) out[key] = Number(raw) as T[typeof key];
    } else if (typeof fallback === 'boolean') {
      out[key] = (raw === '1' || raw.toLowerCase() === 'true') as T[typeof key];
    } else {
      out[key] = raw as T[typeof key];
    }
  });
  return out;
}

/**
 * Merge `patch` onto the state read from `current` and return the new
 * params. A key equal to its default (or patched to `undefined`) is removed,
 * booleans are written as `1` and `0`, and params `defaults` does not name
 * are kept as they are.
 */
export function applyUrlPatch<T extends Record<string, UrlStateValue>>(
  defaults: T,
  current: URLSearchParams,
  patch: Partial<T>,
): URLSearchParams {
  const next: Partial<T> = { ...readUrlState(defaults, current), ...patch };
  const params = new URLSearchParams(current);
  (Object.keys(defaults) as (keyof T & string)[]).forEach((key) => {
    const value = next[key];
    if (value === undefined || value === defaults[key]) params.delete(key);
    else params.set(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
  });
  return params;
}

interface PendingWrites {
  /** The last query string the router reported. */
  base: string;
  /** Our writes since then, oldest first. */
  writes: string[];
}

function normalize(search: string): string {
  return new URLSearchParams(search).toString();
}

/**
 * Fold the query string the router reports now into the writes still in
 * flight. One of our writes coming back settles it and every write before
 * it, keeping the later ones; anything else is an outside navigation, which
 * replaces them all.
 */
export function settleWrites(pending: PendingWrites, reported: string): PendingWrites {
  if (reported === pending.base) return pending;
  const index = pending.writes.indexOf(reported);
  if (index === -1) return { base: reported, writes: [] };
  return { base: reported, writes: pending.writes.slice(index + 1) };
}

/**
 * Keep a bag of state in the URL query string, typed by its defaults.
 *
 * Returns `[state, setState]`. `setState` takes a partial patch and replaces
 * the URL rather than pushing, so filtering never fills the history and Back
 * returns to the previous page. Params equal to their default are left out,
 * so a URL without params is the default view.
 *
 * `defaults` must be a stable reference (a module-level constant).
 *
 *   const DEFAULTS = { q: '', page: 0, archived: false };
 *   const [{ q, page, archived }, setFilters] = useUrlState(DEFAULTS);
 *   setFilters({ archived: true, page: 0 });
 */
export function useUrlState<T extends Record<string, UrlStateValue>>(
  defaults: T,
): [T, (patch: Partial<T>) => void] {
  const { search, replace } = useUrlAdapter();

  // Writes the router has not reported back yet. A router can take a render
  // or more to report a write, so two patches in a row (or a patch straight
  // after typing) would otherwise both start from the old URL and the second
  // would undo the first. Only touched from setState, never during render.
  const pending = React.useRef<PendingWrites>({ base: normalize(search), writes: [] });
  // The committed URL, so a setState kept from an earlier render does not
  // take the URL it saw for an outside navigation.
  const reported = React.useRef(search);
  useIsomorphicLayoutEffect(() => {
    reported.current = search;
  }, [search]);

  const state = React.useMemo(() => readUrlState(defaults, new URLSearchParams(search)), [defaults, search]);

  const setState = React.useCallback(
    (patch: Partial<T>) => {
      const settled = settleWrites(pending.current, normalize(reported.current));
      const from = settled.writes[settled.writes.length - 1] ?? settled.base;
      const next = applyUrlPatch(defaults, new URLSearchParams(from), patch).toString();
      pending.current = { base: settled.base, writes: [...settled.writes, next] };
      replace(next);
    },
    [defaults, replace],
  );

  return [state, setState];
}
