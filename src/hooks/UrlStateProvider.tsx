import * as React from 'react';

/**
 * How the URL hooks read and write the query string. The default adapter
 * uses the browser's history API; pass your router's to `UrlStateProvider`
 * so its navigation state and the hooks stay in step.
 */
export interface UrlAdapter {
  /** The current query string, with or without the leading `?`. */
  search: string;
  /**
   * Replace the query string without adding a history entry. Receives it
   * without the leading `?`, and as `''` when every param is gone.
   */
  replace: (search: string) => void;
}

export interface UrlStateProviderProps {
  /** Must keep a stable identity between URL changes (memoize it). */
  adapter: UrlAdapter;
  children?: React.ReactNode;
}

const UrlAdapterContext = React.createContext<UrlAdapter | null>(null);

/** Routes `useUrlState` and `useUrlSearch` through your router. */
export function UrlStateProvider({ adapter, children }: UrlStateProviderProps) {
  return <UrlAdapterContext.Provider value={adapter}>{children}</UrlAdapterContext.Provider>;
}

// history.replaceState fires no event, so our own writes announce themselves.
const URL_CHANGE_EVENT = 'rbalukja15:urlchange';

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(URL_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(URL_CHANGE_EVENT, onChange);
  };
}

const subscribeNone = () => () => {};
const getSearch = () => window.location.search;
// Server HTML renders the defaults; the real query string is applied
// straight after hydration, without a mismatch.
const getServerSearch = () => '';

function replaceBrowserSearch(search: string) {
  const { pathname, hash } = window.location;
  window.history.replaceState(window.history.state, '', `${pathname}${search ? `?${search}` : ''}${hash}`);
  window.dispatchEvent(new Event(URL_CHANGE_EVENT));
}

/** The provider's adapter, or the browser history one when there is none. */
export function useUrlAdapter(): UrlAdapter {
  const provided = React.useContext(UrlAdapterContext);
  // Always called, so the hook order never depends on the provider; it only
  // listens to the window when it is the adapter in use.
  const search = React.useSyncExternalStore(provided ? subscribeNone : subscribe, getSearch, getServerSearch);
  const browser = React.useMemo<UrlAdapter>(() => ({ search, replace: replaceBrowserSearch }), [search]);
  return provided ?? browser;
}
