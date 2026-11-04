/**
 * The largest value, or 0 when every value is negative or there are none.
 * `reduce` rather than spreading into `Math.max`, which overflows the call
 * stack on very long arrays.
 */
export function maxOf(values: readonly number[]): number {
  return values.reduce((max, value) => (value > max ? value : max), 0);
}
