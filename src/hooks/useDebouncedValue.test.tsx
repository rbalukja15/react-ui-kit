import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello', 100));
    expect(result.current).toBe('hello');
  });

  it('debounces subsequent updates by the given delay', () => {
    vi.useFakeTimers();
    try {
      const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 100), {
        initialProps: { v: 'a' },
      });
      expect(result.current).toBe('a');

      rerender({ v: 'b' });
      expect(result.current).toBe('a');
      act(() => { vi.advanceTimersByTime(99); });
      expect(result.current).toBe('a');
      act(() => { vi.advanceTimersByTime(1); });
      expect(result.current).toBe('b');
    } finally {
      vi.useRealTimers();
    }
  });

  it('resets the timer on each value change (true debounce semantics)', () => {
    vi.useFakeTimers();
    try {
      const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 100), {
        initialProps: { v: 'a' },
      });
      rerender({ v: 'b' });
      act(() => { vi.advanceTimersByTime(50); });
      rerender({ v: 'c' });
      act(() => { vi.advanceTimersByTime(50); });
      // 100 ms since first change, but only 50 ms since the last change to 'c'.
      // Debounced value should NOT have updated yet.
      expect(result.current).toBe('a');
      act(() => { vi.advanceTimersByTime(50); });
      expect(result.current).toBe('c');
    } finally {
      vi.useRealTimers();
    }
  });
});
