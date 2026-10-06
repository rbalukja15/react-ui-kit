import * as React from 'react';
import { useUrlAdapter } from './UrlStateProvider';

/** A value `useUrlState` can keep in the query string. */
export type UrlStateValue = string | number | boolean;

/**
 * Parse a query string into a typed state bag, using `defaults` for absent
 * keys. Each default's type drives parsing: a number default reads the param
 * as a number (falling back to the default when it is not one), a boolean
 * default reads `1` or `true` as true, and anything else stays a string.
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
      const parsed = raw.trim() === '' ? NaN : Number(raw);
      if (Number.isFinite(parsed)) out[key] = parsed as T[typeof key];
    } else if (typeof fallback === 'boolean') {
      out[key] = (raw === '1' || raw === 'true') as T[typeof key];
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

  // The query string the next write builds on. A router can take a render
  // or more to report a write back, so two patches in a row (or a patch
  // straight after typing) would otherwise both start from the old URL and
  // the second would undo the first. It follows the adapter again whenever
  // the URL really changes.
  const latest = React.useRef({ seen: search, search });
  if (latest.current.seen !== search) latest.current = { seen: search, search };

  const state = React.useMemo(() => readUrlState(defaults, new URLSearchParams(search)), [defaults, search]);

  const setState = React.useCallback(
    (patch: Partial<T>) => {
      const next = applyUrlPatch(defaults, new URLSearchParams(latest.current.search), patch).toString();
      latest.current.search = next;
      replace(next);
    },
    [defaults, replace],
  );

  return [state, setState];
}
