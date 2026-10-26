import { sortRows } from './sortRows';

describe('sortRows', () => {
  it('compares strings by locale, reading numbers in them as numbers', () => {
    const rows = ['Item 10', 'item 2', 'Item 1'];
    expect(sortRows(rows, (r) => r, 'asc')).toEqual(['Item 1', 'item 2', 'Item 10']);
    expect(sortRows(rows, (r) => r, 'desc')).toEqual(['Item 10', 'item 2', 'Item 1']);
  });

  it('compares numbers, dates and booleans by value', () => {
    expect(sortRows([3, -1, 20], (r) => r, 'asc')).toEqual([-1, 3, 20]);
    const a = new Date('2026-01-02');
    const b = new Date('2025-12-31');
    expect(sortRows([a, b], (r) => r, 'asc')).toEqual([b, a]);
    expect(sortRows([true, false], (r) => r, 'asc')).toEqual([false, true]);
  });

  it('keeps empty values last in both directions', () => {
    const rows = [{ v: 'b' }, { v: null }, { v: 'a' }, { v: undefined }, { v: '' }];
    expect(sortRows(rows, (r) => r.v, 'asc').map((r) => r.v)).toEqual(['a', 'b', null, undefined, '']);
    expect(sortRows(rows, (r) => r.v, 'desc').map((r) => r.v)).toEqual(['b', 'a', null, undefined, '']);
  });

  it('is stable and does not mutate its input', () => {
    const rows = [
      { id: 1, g: 'x' },
      { id: 2, g: 'y' },
      { id: 3, g: 'x' },
    ];
    const copy = [...rows];
    expect(sortRows(rows, (r) => r.g, 'asc').map((r) => r.id)).toEqual([1, 3, 2]);
    expect(sortRows(rows, (r) => r.g, 'desc').map((r) => r.id)).toEqual([2, 1, 3]);
    expect(rows).toEqual(copy);
  });

  it('falls back to string comparison for mixed types', () => {
    expect(sortRows<string | number>(['b', 1, 'a'], (r) => r, 'asc')).toEqual([1, 'a', 'b']);
    // A boolean becomes 0 or 1 first, so it sorts among the digits.
    expect(sortRows<string | boolean>(['yes', true, '0'], (r) => r, 'asc')).toEqual(['0', true, 'yes']);
  });
});
