import * as React from 'react';
import { UrlStateProvider, type UrlAdapter } from '../UrlStateProvider';

/**
 * A test router that, like Next.js, reports a write only on a later render:
 * `replace` records the write, and `flush` makes the latest one the URL.
 * `navigate` changes the URL from outside, like a link or Back.
 */
export function createLaggingRouter(initial = '') {
  const router = {
    writes: [] as string[],
    flush: () => {},
    navigate: (_search: string) => {},
  };

  function Wrapper({ children }: { children?: React.ReactNode }) {
    const [search, setSearch] = React.useState(initial);
    router.flush = () => {
      const last = router.writes[router.writes.length - 1];
      if (last !== undefined) setSearch(last);
    };
    router.navigate = setSearch;
    const adapter = React.useMemo<UrlAdapter>(
      () => ({ search, replace: (next) => void router.writes.push(next) }),
      [search],
    );
    return <UrlStateProvider adapter={adapter}>{children}</UrlStateProvider>;
  }

  return { router, Wrapper };
}
