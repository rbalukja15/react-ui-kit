export type SortDirection = 'asc' | 'desc';

export interface DataTableSort {
  /** The `id` of the column the rows are sorted by. */
  columnId: string;
  direction: SortDirection;
}

/** A value a column can be sorted by. `null` and `undefined` sort last. */
export type SortValue = string | number | boolean | Date | null | undefined;

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function compareValues(a: SortValue, b: SortValue): number {
  if (a instanceof Date) a = a.getTime();
  if (b instanceof Date) b = b.getTime();
  if (typeof a === 'string' && typeof b === 'string') return collator.compare(a, b);
  if (typeof a === 'boolean') a = Number(a);
  if (typeof b === 'boolean') b = Number(b);
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return collator.compare(String(a), String(b));
}

/**
 * Returns a sorted copy. Strings compare by locale with numbers in them
 * read as numbers ("Item 2" before "Item 10"), dates by time. Empty values
 * stay at the end in both directions, and ties keep their original order.
 */
export function sortRows<Row>(rows: readonly Row[], getValue: (row: Row) => SortValue, direction: SortDirection): Row[] {
  const sign = direction === 'asc' ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index, value: getValue(row) }))
    .sort((a, b) => {
      const aEmpty = a.value === null || a.value === undefined || a.value === '';
      const bEmpty = b.value === null || b.value === undefined || b.value === '';
      if (aEmpty || bEmpty) return aEmpty === bEmpty ? a.index - b.index : aEmpty ? 1 : -1;
      return sign * compareValues(a.value, b.value) || a.index - b.index;
    })
    .map(({ row }) => row);
}
