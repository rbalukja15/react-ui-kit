import { act, renderHook } from '@testing-library/react';
import { UrlStateProvider, type UrlAdapter } from './UrlStateProvider';
import { createLaggingRouter } from './testing/createLaggingRouter';
import { applyUrlPatch, readUrlState, settleWrites, useUrlState } from './useUrlState';

const DEFAULTS = { q: '', page: 0, archived: false };

describe('readUrlState', () => {
  it('falls back to the defaults when params are absent', () => {
    expect(readUrlState(DEFAULTS, new URLSearchParams(''))).toEqual(DEFAULTS);
  });

  it('parses each param by its default type', () => {
    expect(readUrlState(DEFAULTS, new URLSearchParams('q=cat&page=2&archived=1'))).toEqual({
      q: 'cat',
      page: 2,
      archived: true,
    });
    expect(readUrlState(DEFAULTS, new URLSearchParams('archived=true')).archived).toBe(true);
    expect(readUrlState(DEFAULTS, new URLSearchParams('archived=0')).archived).toBe(false);
  });

  it('keeps the default for a number param that is not a number', () => {
    expect(readUrlState(DEFAULTS, new URLSearchParams('page=abc')).page).toBe(0);
    expect(readUrlState(DEFAULTS, new URLSearchParams('page=')).page).toBe(0);
  });

  it('reads only plain decimals into a number param', () => {
    expect(readUrlState(DEFAULTS, new URLSearchParams('page=-1.5')).page).toBe(-1.5);
    for (const raw of ['1e3', '0x10', 'Infinity', ' 2', '2.']) {
      expect(readUrlState(DEFAULTS, new URLSearchParams({ page: raw })).page).toBe(0);
    }
  });

  it('reads true in any case into a boolean param', () => {
    expect(readUrlState(DEFAULTS, new URLSearchParams('archived=TRUE')).archived).toBe(true);
    expect(readUrlState(DEFAULTS, new URLSearchParams('archived=yes')).archived).toBe(false);
  });

  it('ignores params the defaults do not name', () => {
    expect(readUrlState(DEFAULTS, new URLSearchParams('tab=notes'))).toEqual(DEFAULTS);
  });
});

describe('applyUrlPatch', () => {
  it('omits params equal to their default', () => {
    expect(applyUrlPatch(DEFAULTS, new URLSearchParams('q=cat'), { q: '' }).toString()).toBe('');
  });

  it('sets params that differ from their default, booleans as 1 and 0', () => {
    const out = applyUrlPatch(DEFAULTS, new URLSearchParams(''), { archived: true, page: 3 });
    expect(out.get('archived')).toBe('1');
    expect(out.get('page')).toBe('3');
    const flagOn = { archived: true };
    expect(applyUrlPatch(flagOn, new URLSearchParams(''), { archived: false }).get('archived')).toBe('0');
  });

  it('keeps unrelated params', () => {
    const out = applyUrlPatch(DEFAULTS, new URLSearchParams('tab=notes'), { q: 'dog' });
    expect(out.get('tab')).toBe('notes');
    expect(out.get('q')).toBe('dog');
  });

  it('removes a param reset to its default or to undefined', () => {
    const out = applyUrlPatch(DEFAULTS, new URLSearchParams('q=dog&page=2'), { page: 0 });
    expect(out.get('page')).toBeNull();
    expect(out.get('q')).toBe('dog');
    expect(applyUrlPatch(DEFAULTS, new URLSearchParams('q=dog'), { q: undefined }).toString()).toBe('');
  });

  it('writes an empty string when the default is not empty', () => {
    const out = applyUrlPatch({ status: 'open' }, new URLSearchParams(''), { status: '' });
    expect(out.toString()).toBe('status=');
    expect(readUrlState({ status: 'open' }, out).status).toBe('');
  });
});

describe('settleWrites', () => {
  const pending = { base: '', writes: ['q=a', 'q=a&page=2', 'q=b&page=2'] };

  it('changes nothing while the router still reports the old URL', () => {
    expect(settleWrites(pending, '')).toBe(pending);
  });

  it('keeps the writes after the one the router reports', () => {
    expect(settleWrites(pending, 'q=a')).toEqual({ base: 'q=a', writes: ['q=a&page=2', 'q=b&page=2'] });
    expect(settleWrites(pending, 'q=b&page=2')).toEqual({ base: 'q=b&page=2', writes: [] });
  });

  it('drops every write on an outside navigation', () => {
    expect(settleWrites(pending, 'tab=notes')).toEqual({ base: 'tab=notes', writes: [] });
  });
});

describe('useUrlState with the browser history', () => {
  beforeEach(() => window.history.replaceState(null, '', '/list'));

  it('reads the query string', () => {
    window.history.replaceState(null, '', '/list?q=cat&page=2');
    const { result } = renderHook(() => useUrlState(DEFAULTS));
    expect(result.current[0]).toEqual({ q: 'cat', page: 2, archived: false });
  });

  it('replaces the URL on set, keeping the path, hash and other params', () => {
    window.history.replaceState(null, '', '/list?tab=notes#top');
    const length = window.history.length;
    const { result } = renderHook(() => useUrlState(DEFAULTS));
    act(() => result.current[1]({ q: 'dog', archived: true }));
    expect(window.location.pathname).toBe('/list');
    expect(window.location.search).toBe('?tab=notes&q=dog&archived=1');
    expect(window.location.hash).toBe('#top');
    expect(window.history.length).toBe(length);
    expect(result.current[0]).toEqual({ q: 'dog', page: 0, archived: true });
  });

  it('drops the question mark when every param is back to default', () => {
    window.history.replaceState(null, '', '/list?page=4');
    const { result } = renderHook(() => useUrlState(DEFAULTS));
    act(() => result.current[1]({ page: 0 }));
    expect(window.location.href).toBe(`${window.location.origin}/list`);
  });

  it('follows Back and Forward', () => {
    const { result } = renderHook(() => useUrlState(DEFAULTS));
    act(() => {
      window.history.replaceState(null, '', '/list?q=bird');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current[0].q).toBe('bird');
  });
});

describe('useUrlState with a provided adapter', () => {
  it('reads from and writes to the adapter', () => {
    const replace = vi.fn();
    const adapter: UrlAdapter = { search: '?q=cat', replace };
    const { result } = renderHook(() => useUrlState(DEFAULTS), {
      wrapper: ({ children }) => <UrlStateProvider adapter={adapter}>{children}</UrlStateProvider>,
    });
    expect(result.current[0].q).toBe('cat');
    act(() => result.current[1]({ page: 2 }));
    expect(replace).toHaveBeenCalledWith('q=cat&page=2');
  });

  it('builds each write on the last one, before the router reports it back', () => {
    const { router, Wrapper } = createLaggingRouter('tab=notes');
    const { result } = renderHook(() => useUrlState(DEFAULTS), { wrapper: Wrapper });
    act(() => {
      result.current[1]({ q: 'dog' });
      result.current[1]({ page: 2 });
    });
    expect(router.writes).toEqual(['tab=notes&q=dog', 'tab=notes&q=dog&page=2']);
    act(() => router.flush());
    expect(result.current[0]).toEqual({ q: 'dog', page: 2, archived: false });
  });

  it('keeps a later write when the router reports an earlier one first', () => {
    const { router, Wrapper } = createLaggingRouter();
    const { result } = renderHook(() => useUrlState(DEFAULTS), { wrapper: Wrapper });
    act(() => {
      result.current[1]({ q: 'dog' });
      result.current[1]({ page: 2 });
    });
    act(() => router.navigate(router.writes[0] ?? ''));
    act(() => result.current[1]({ archived: true }));
    expect(router.writes[router.writes.length - 1]).toBe('q=dog&page=2&archived=1');
  });

  it('builds on the committed URL even through a setter kept from an earlier render', () => {
    const { router, Wrapper } = createLaggingRouter();
    const { result } = renderHook(() => useUrlState(DEFAULTS), { wrapper: Wrapper });
    const stale = result.current[1];
    act(() => stale({ q: 'dog' }));
    act(() => router.flush());
    act(() => stale({ page: 2 }));
    expect(router.writes[router.writes.length - 1]).toBe('q=dog&page=2');
  });

  it('builds on an outside navigation once the router reports it', () => {
    const { router, Wrapper } = createLaggingRouter('q=dog');
    const { result } = renderHook(() => useUrlState(DEFAULTS), { wrapper: Wrapper });
    act(() => result.current[1]({ page: 2 }));
    act(() => router.navigate('archived=1'));
    act(() => result.current[1]({ page: 3 }));
    expect(router.writes[router.writes.length - 1]).toBe('archived=1&page=3');
  });
});
