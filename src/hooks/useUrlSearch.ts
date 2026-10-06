import * as React from 'react';
import { useDebouncedValue } from './useDebouncedValue';

/**
 * A search box whose value lives in the URL, without lost keystrokes.
 *
 * Returns `[input, setInput, query]`: bind the text field to the first two
 * and key the list's fetch on the third.
 *
 * A box bound straight to the URL loses keystrokes: the router reports a
 * write a render or more later, and until it does the field re-renders with
 * the old value, so the next key lands on a stale string. So the box keeps
 * its own state and is always exactly what was typed. `commit` still writes
 * the URL on every keystroke, from the event handler: a deferred write could
 * land after the user clicks a link straight after typing and drag them
 * back. `query` is the box's value once it has been still for `delay` ms, so
 * the list fetches the word rather than each prefix.
 *
 * When something else changes the URL value (a link back to the bare list,
 * Back, a deep link), the box follows it. The box's own writes are told
 * apart by remembering the values written and not yet seen back, so a write
 * that lands while the user is still typing does not rewind the box.
 *
 *   const [{ q }, setFilters] = useUrlState(DEFAULTS);
 *   const [search, setSearch, query] = useUrlSearch(q, (value) => setFilters({ q: value, page: 0 }));
 *   <TextField value={search} onChange={(event) => setSearch(event.target.value)} />
 */
export function useUrlSearch(
  urlValue: string,
  commit: (value: string) => void,
  delay = 300,
): [string, (value: string) => void, string] {
  const [input, setInput] = React.useState(urlValue);
  const query = useDebouncedValue(input, delay);
  const unseen = React.useRef<string[]>([]);
  const commitRef = React.useRef(commit);
  commitRef.current = commit;

  React.useEffect(() => {
    const next = settleEcho(unseen.current, urlValue);
    unseen.current = next.unseen;
    if (next.follow) setInput(urlValue);
  }, [urlValue]);

  const set = React.useCallback((value: string) => {
    setInput(value);
    unseen.current.push(value);
    commitRef.current(value);
  }, []);

  return [input, set, query];
}

/**
 * Decide whether a URL value echoes one of our own writes or is an outside
 * change the box should follow, given the values written and not yet seen
 * back.
 */
export function settleEcho(unseen: readonly string[], urlValue: string): { unseen: string[]; follow: boolean } {
  if (!unseen.includes(urlValue)) return { unseen: [], follow: true };
  // Ours. Echoes can arrive late, coalesced, or repeated (typing a, b,
  // Backspace, c writes 'a' twice), so a match says nothing about the writes
  // around it. Only the latest write is the one the router settles on; until
  // it lands, every value written is still a possible echo. The cost: an
  // outside navigation to a value typed moments ago is ignored, which can
  // only happen mid-typing.
  if (urlValue === unseen[unseen.length - 1]) return { unseen: [], follow: false };
  return { unseen: [...unseen], follow: false };
}
