import * as React from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * of quiet. Lifted from vetapp's lib/hooks — no app coupling.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
