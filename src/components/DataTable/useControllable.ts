import * as React from 'react';

/**
 * State that the caller may own. Pass `value` to control it; leave it
 * `undefined` to let the component keep it, starting from `defaultValue`.
 * `onChange` fires either way.
 */
export function useControllable<T>(
  value: T | undefined,
  defaultValue: T,
  onChange: ((next: T) => void) | undefined,
): [T, (next: T) => void] {
  const [own, setOwn] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : own;
  const set = React.useCallback(
    (next: T) => {
      if (!isControlled) setOwn(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [current, set];
}
