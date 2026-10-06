import { act, renderHook } from '@testing-library/react';
import { createLaggingRouter } from './testing/createLaggingRouter';
import { settleEcho, useUrlSearch } from './useUrlSearch';
import { useUrlState } from './useUrlState';

/** Feed URL values through settleEcho in order; return what the box followed. */
function replay(written: string[], echoes: string[]) {
  let unseen = [...written];
  const followed: string[] = [];
  for (const url of echoes) {
    const next = settleEcho(unseen, url);
    unseen = next.unseen;
    if (next.follow) followed.push(url);
  }
  return { followed, unseen };
}

describe('settleEcho', () => {
  it('treats our own writes coming back in order as echoes', () => {
    expect(replay(['a', 'ab', 'abc'], ['a', 'ab', 'abc'])).toEqual({ followed: [], unseen: [] });
  });

  it('treats a coalesced final write as settling everything before it', () => {
    expect(replay(['a', 'ab', 'abc'], ['abc'])).toEqual({ followed: [], unseen: [] });
  });

  it('follows a value nobody typed', () => {
    expect(replay(['ab'], ['ab', ''])).toEqual({ followed: [''], unseen: [] });
  });

  it('does not rewind the box when a typo and a Backspace repeat a value', () => {
    // Type a, b, Backspace, c. The first echo, 'a', matches the second 'a'
    // too; the 'ab' write still in flight must not then look like an
    // outside change, or the box jumps from "ac" back to "ab".
    expect(replay(['a', 'ab', 'a', 'ac'], ['a', 'ab', 'a', 'ac'])).toEqual({ followed: [], unseen: [] });
  });

  it('keeps echoes it has not seen yet until the latest write lands', () => {
    expect(replay(['a', 'ab', 'a', 'ac'], ['a', 'ab'])).toEqual({
      followed: [],
      unseen: ['a', 'ab', 'a', 'ac'],
    });
  });
});

const DEFAULTS = { q: '', page: 0 };

function useSearchPage() {
  const [filters, setFilters] = useUrlState(DEFAULTS);
  const [input, setInput, query] = useUrlSearch(filters.q, (value) => setFilters({ q: value, page: 0 }), 100);
  return { filters, input, setInput, query };
}

describe('useUrlSearch', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts from the URL value', () => {
    const { Wrapper } = createLaggingRouter('q=cat');
    const { result } = renderHook(useSearchPage, { wrapper: Wrapper });
    expect(result.current.input).toBe('cat');
    expect(result.current.query).toBe('cat');
  });

  it('keeps every keystroke while the router lags, and writes each one', () => {
    const { router, Wrapper } = createLaggingRouter('page=3');
    const { result } = renderHook(useSearchPage, { wrapper: Wrapper });
    for (const value of ['z', 'zq', 'zqx']) act(() => result.current.setInput(value));
    expect(result.current.input).toBe('zqx');
    expect(router.writes).toEqual(['q=z', 'q=zq', 'q=zqx']);

    // An early write landing late does not rewind the box.
    act(() => router.navigate('q=z'));
    expect(result.current.input).toBe('zqx');
    act(() => router.flush());
    expect(result.current.input).toBe('zqx');
    expect(result.current.filters.q).toBe('zqx');
  });

  it('debounces the query', () => {
    const { Wrapper } = createLaggingRouter();
    const { result } = renderHook(useSearchPage, { wrapper: Wrapper });
    act(() => result.current.setInput('d'));
    act(() => result.current.setInput('do'));
    expect(result.current.query).toBe('');
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.query).toBe('do');
  });

  it('follows an outside change to the URL', () => {
    const { router, Wrapper } = createLaggingRouter();
    const { result } = renderHook(useSearchPage, { wrapper: Wrapper });
    act(() => result.current.setInput('dog'));
    act(() => router.flush());
    act(() => router.navigate(''));
    expect(result.current.input).toBe('');
  });

  it('returns a stable setter that calls the latest commit', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(({ commit }) => useUrlSearch('', commit), {
      initialProps: { commit: first },
    });
    const set = result.current[1];
    rerender({ commit: second });
    expect(result.current[1]).toBe(set);
    act(() => set('x'));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('x');
  });
});
