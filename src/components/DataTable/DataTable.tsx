import * as React from 'react';
import {
  Box,
  Button,
  Checkbox,
  type CheckboxProps,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { EmptyState } from '../EmptyState';
import { RowActions } from '../RowActions';
import { sortRows, type DataTableSort, type SortValue } from './sortRows';
import { useControllable } from './useControllable';

export type DataTableRowId = string | number;

export interface DataTableColumn<Row> {
  /** Unique key. Also the row property shown and sorted by when `cell` and `sortValue` are left out. */
  id: string;
  /** Header content. A string also names the column in the columns menu. */
  header: React.ReactNode;
  /** Cell content. Defaults to `row[id]`. */
  cell?: (row: Row) => React.ReactNode;
  /** Shows a sort control in the header. */
  sortable?: boolean;
  /** The value client-side sorting compares. Defaults to `row[id]`. */
  sortValue?: (row: Row) => SortValue;
  align?: 'left' | 'center' | 'right';
  /** Fixed column width, e.g. `120` or `'20%'`. */
  width?: number | string;
  /** Whether the columns menu can hide it. Defaults to `true`. */
  hideable?: boolean;
  /** Name for the columns menu when `header` is not a string. */
  menuLabel?: string;
}

export interface DataTableLabels {
  /** Defaults to `'Rows per page:'`. */
  rowsPerPage: string;
  /** Defaults to `'1–10 of 42'`, or `'1–10 of more than 10'` when the total is unknown. */
  displayedRows: (info: { from: number; to: number; count: number }) => string;
  /** Defaults to `'Select all rows on this page'`. */
  selectAll: string;
  /** Defaults to `` `Select ${rowLabel}` ``. */
  selectRow: (rowLabel: string) => string;
  /** Defaults to `` `${count} selected` ``. */
  selected: (count: number) => string;
  /** Defaults to `'Columns'`. */
  columns: string;
  /** Defaults to `'Actions'`. */
  actions: string;
  /** Title of the default empty state. Defaults to `'No results'`. */
  noRows: string;
  /** Defaults to `'sorted ascending'` and `'sorted descending'`; read after the column name. */
  sortedAscending: string;
  sortedDescending: string;
  /** Pagination button names. Defaults to `'Go to next page'` and so on. */
  page: (type: 'first' | 'last' | 'next' | 'previous') => string;
}

const defaultLabels: DataTableLabels = {
  rowsPerPage: 'Rows per page:',
  displayedRows: ({ from, to, count }) => `${from}–${to} of ${count === -1 ? `more than ${to}` : count}`,
  selectAll: 'Select all rows on this page',
  selectRow: (rowLabel) => `Select ${rowLabel}`,
  selected: (count) => `${count} selected`,
  columns: 'Columns',
  actions: 'Actions',
  noRows: 'No results',
  sortedAscending: 'sorted ascending',
  sortedDescending: 'sorted descending',
  page: (type) => `Go to ${type} page`,
};

export interface DataTableProps<Row> {
  /** All rows (client mode) or the current page of rows (server mode). */
  rows: readonly Row[];
  columns: readonly DataTableColumn<Row>[];
  /** A stable id per row, used for React keys and selection. */
  getRowId: (row: Row) => DataTableRowId;
  /** Accessible name of the table. */
  label: string;
  /**
   * `'client'` (default) sorts and pages `rows` itself. `'server'` shows
   * `rows` as they come and only reports sort and page changes, so you
   * fetch the right page; pass `rowCount` (or `-1` if unknown).
   */
  mode?: 'client' | 'server';
  /** Total rows across all pages in server mode. `-1` means unknown. */
  rowCount?: number;
  /** Shows placeholder rows and marks the table busy. */
  loading?: boolean;

  /** Controlled sort; `null` means unsorted. */
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;

  /** Zero-based page. Controlled when set. */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Controlled page size. */
  pageSize?: number;
  defaultPageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  /** Choices in the rows-per-page menu. Defaults to `[10, 25, 50]`; an empty array hides the menu. */
  pageSizeOptions?: number[];
  /** Hides the pagination bar and shows every row. Client mode only. */
  disablePagination?: boolean;

  /** Adds a checkbox column. Selection is kept across pages and sorts. */
  selectable?: boolean;
  /** Controlled selection. */
  selectedIds?: readonly DataTableRowId[];
  defaultSelectedIds?: readonly DataTableRowId[];
  onSelectionChange?: (ids: DataTableRowId[]) => void;
  /** Names a row in its checkbox label. Defaults to its id. */
  getRowLabel?: (row: Row) => string;

  /** Shows a "Columns" menu to hide and show columns. */
  columnsMenu?: boolean;
  /** Controlled hidden column ids. */
  hiddenColumns?: readonly string[];
  defaultHiddenColumns?: readonly string[];
  onHiddenColumnsChange?: (ids: string[]) => void;

  /** Buttons for each row, shown in a right-aligned last column. */
  rowActions?: (row: Row) => React.ReactNode;
  /** Replaces the default "No results" empty state. */
  emptyState?: React.ReactNode;
  /** Content at the start of the toolbar, such as a search field or bulk actions. */
  toolbar?: React.ReactNode;
  /** Keeps the header visible while the body scrolls; set `maxHeight` too. */
  stickyHeader?: boolean;
  /** Height at which the table scrolls, e.g. `480` or `'60vh'`. */
  maxHeight?: number | string;
  size?: 'small' | 'medium';
  labels?: Partial<DataTableLabels>;
}

const EMPTY: readonly never[] = [];

// Read by screen readers, not drawn. (`@mui/utils` has the same, but it is
// not a peer of this package.)
const visuallyHidden = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
} as const;

function readProperty(row: unknown, id: string): unknown {
  return row !== null && typeof row === 'object' ? (row as Record<string, unknown>)[id] : undefined;
}

function columnName<Row>(column: DataTableColumn<Row>): string {
  return column.menuLabel ?? (typeof column.header === 'string' ? column.header : column.id);
}

/**
 * A checkbox named by a visually hidden `<label>`. `id` reaches the input on
 * every supported MUI major, while the input's own props moved from
 * `inputProps` (MUI 5 and 6) to `slotProps.input` (MUI 9).
 */
function LabelledCheckbox({ id, label, ...props }: { id: string; label: string } & Omit<CheckboxProps, 'id'>) {
  return (
    <>
      <Checkbox id={id} {...props} />
      <Box component="label" htmlFor={id} sx={visuallyHidden}>
        {label}
      </Box>
    </>
  );
}

function CheckIcon({ checked }: { checked: boolean }) {
  return (
    <svg aria-hidden="true" focusable="false" width="1.25em" height="1.25em" viewBox="0 0 24 24" fill="currentColor">
      {checked ? (
        <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-9 14-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      ) : (
        <path d="M19 5v14H5V5h14m0-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
      )}
    </svg>
  );
}

/**
 * A data table with sorting, pagination, row selection, a columns menu and
 * per-row actions, on plain MUI table parts.
 *
 * Every piece of state (sort, page, page size, selection, hidden columns)
 * works uncontrolled out of the box, or controlled with the matching prop
 * and `on…Change` callback, for example to keep it in the URL with
 * `useUrlState`. In server mode the table only reports changes and shows the
 * rows you pass, so sorting and paging happen in your API.
 *
 * Headers are real `<th>` cells with `aria-sort`, sort controls are buttons,
 * and the loading state keeps the header and marks the table busy.
 */
export function DataTable<Row>({
  rows,
  columns,
  getRowId,
  label,
  mode = 'client',
  rowCount,
  loading = false,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  page: pageProp,
  defaultPage = 0,
  onPageChange,
  pageSize: pageSizeProp,
  defaultPageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  disablePagination = false,
  selectable = false,
  selectedIds: selectedProp,
  defaultSelectedIds = EMPTY,
  onSelectionChange,
  getRowLabel,
  columnsMenu = false,
  hiddenColumns: hiddenProp,
  defaultHiddenColumns = EMPTY,
  onHiddenColumnsChange,
  rowActions,
  emptyState,
  toolbar,
  stickyHeader = false,
  maxHeight,
  size = 'medium',
  labels: labelOverrides,
}: DataTableProps<Row>) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const isServer = mode === 'server';
  const paginated = isServer || !disablePagination;

  const [sort, setSort] = useControllable<DataTableSort | null>(sortProp, defaultSort, onSortChange);
  const [page, setPage] = useControllable(pageProp, defaultPage, onPageChange);
  const [pageSize, setPageSize] = useControllable(
    pageSizeProp,
    defaultPageSize ?? pageSizeOptions[0] ?? 10,
    onPageSizeChange,
  );
  const [selected, setSelected] = useControllable<readonly DataTableRowId[]>(
    selectedProp,
    defaultSelectedIds,
    onSelectionChange as ((ids: readonly DataTableRowId[]) => void) | undefined,
  );
  const [hidden, setHidden] = useControllable<readonly string[]>(
    hiddenProp,
    defaultHiddenColumns,
    onHiddenColumnsChange as ((ids: readonly string[]) => void) | undefined,
  );

  const visibleColumns = columns.filter((column) => !hidden.includes(column.id));

  const sortedRows = React.useMemo(() => {
    if (isServer || !sort) return rows;
    const column = columns.find((c) => c.id === sort.columnId);
    if (!column) return rows;
    const getValue = column.sortValue ?? ((row: Row) => readProperty(row, column.id) as SortValue);
    return sortRows(rows, getValue, sort.direction);
  }, [isServer, sort, rows, columns]);

  const total = isServer ? (rowCount ?? -1) : rows.length;
  // A page past the end (rows were removed, or the URL said so) shows the last page.
  const lastPage = total > 0 ? Math.max(0, Math.ceil(total / pageSize) - 1) : 0;
  const currentPage = total === -1 ? page : Math.min(page, lastPage);
  const pageRows =
    isServer || !paginated ? sortedRows : sortedRows.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const selectedSet = new Set(selected);
  const pageIds = pageRows.map(getRowId);
  const selectedOnPage = pageIds.filter((id) => selectedSet.has(id)).length;

  const toggleRow = (id: DataTableRowId) => {
    setSelected(selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };
  const togglePage = () => {
    if (selectedOnPage === pageIds.length) {
      const onPage = new Set(pageIds);
      setSelected(selected.filter((id) => !onPage.has(id)));
    } else {
      setSelected([...selected, ...pageIds.filter((id) => !selectedSet.has(id))]);
    }
  };

  const changeSort = (columnId: string) => {
    // Unsorted, then ascending, then descending, then back to unsorted.
    if (sort?.columnId !== columnId) setSort({ columnId, direction: 'asc' });
    else if (sort.direction === 'asc') setSort({ columnId, direction: 'desc' });
    else setSort(null);
    if (currentPage !== 0) setPage(0);
  };

  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);
  const menuId = React.useId();
  const idPrefix = React.useId();
  const toggleColumn = (id: string) => {
    setHidden(hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id]);
  };
  const visibleHideable = columns.filter((c) => c.hideable !== false && !hidden.includes(c.id)).length;

  const columnCount = visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);
  const showToolbar = Boolean(toolbar) || columnsMenu || (selectable && selected.length > 0);
  const placeholderRows = Math.min(pageSize, 10);

  return (
    <Box>
      {showToolbar && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', pb: 1 }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>{toolbar}</Box>
          {selectable && (
            <Typography role="status" variant="body2" color="text.secondary">
              {selected.length > 0 ? labels.selected(selected.length) : ''}
            </Typography>
          )}
          {columnsMenu && (
            <>
              <Button
                size="small"
                aria-haspopup="menu"
                aria-expanded={menuAnchor ? true : undefined}
                aria-controls={menuAnchor ? menuId : undefined}
                onClick={(event) => setMenuAnchor(event.currentTarget)}
              >
                {labels.columns}
              </Button>
              <Menu id={menuId} anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                {columns
                  .filter((column) => column.hideable !== false)
                  .map((column) => {
                    const shown = !hidden.includes(column.id);
                    return (
                      <MenuItem
                        key={column.id}
                        role="menuitemcheckbox"
                        aria-checked={shown}
                        // The last visible column stays, so the table never ends up empty.
                        disabled={shown && visibleHideable === 1}
                        onClick={() => toggleColumn(column.id)}
                      >
                        <ListItemIcon sx={{ color: shown ? 'primary.main' : 'text.secondary' }}>
                          <CheckIcon checked={shown} />
                        </ListItemIcon>
                        <ListItemText>{columnName(column)}</ListItemText>
                      </MenuItem>
                    );
                  })}
              </Menu>
            </>
          )}
        </Box>
      )}
      <TableContainer
        sx={{ maxHeight }}
        // A scrolling region must be reachable by keyboard to be scrolled.
        {...(maxHeight !== undefined ? { tabIndex: 0, role: 'region', 'aria-label': label } : {})}
      >
        <Table aria-label={label} aria-busy={loading || undefined} stickyHeader={stickyHeader} size={size}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <LabelledCheckbox
                    id={`${idPrefix}-all`}
                    label={labels.selectAll}
                    checked={pageIds.length > 0 && selectedOnPage === pageIds.length}
                    indeterminate={selectedOnPage > 0 && selectedOnPage < pageIds.length}
                    disabled={loading || pageIds.length === 0}
                    onChange={togglePage}
                  />
                </TableCell>
              )}
              {visibleColumns.map((column) => {
                const active = sort?.columnId === column.id;
                const direction = active ? sort.direction : 'asc';
                return (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    sx={{ width: column.width }}
                    aria-sort={column.sortable ? (active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                  >
                    {column.sortable ? (
                      <TableSortLabel active={active} direction={direction} onClick={() => changeSort(column.id)}>
                        {column.header}
                        {active && (
                          <Box component="span" sx={visuallyHidden}>
                            {direction === 'asc' ? labels.sortedAscending : labels.sortedDescending}
                          </Box>
                        )}
                      </TableSortLabel>
                    ) : (
                      column.header
                    )}
                  </TableCell>
                );
              })}
              {rowActions && (
                <TableCell align="right">
                  <Box component="span" sx={visuallyHidden}>
                    {labels.actions}
                  </Box>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: placeholderRows }, (_, r) => (
                <TableRow key={`placeholder-${r}`} aria-hidden="true">
                  {Array.from({ length: columnCount }, (__, c) => (
                    <TableCell key={c}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} sx={{ borderBottom: 'none' }}>
                  {emptyState ?? <EmptyState title={labels.noRows} />}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row, index) => {
                const id = getRowId(row);
                const isSelected = selectedSet.has(id);
                return (
                  <TableRow key={id} hover selected={isSelected}>
                    {selectable && (
                      <TableCell padding="checkbox">
                        <LabelledCheckbox
                          id={`${idPrefix}-row-${index}`}
                          label={labels.selectRow(getRowLabel ? getRowLabel(row) : String(id))}
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map((column) => (
                      <TableCell key={column.id} align={column.align}>
                        {column.cell ? column.cell(row) : (readProperty(row, column.id) as React.ReactNode)}
                      </TableCell>
                    ))}
                    {rowActions && (
                      <TableCell align="right" padding="none" sx={{ pr: 1 }}>
                        <RowActions>{rowActions(row)}</RowActions>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {paginated && (
        <TablePagination
          component="div"
          count={total}
          page={currentPage}
          rowsPerPage={pageSize}
          rowsPerPageOptions={pageSizeOptions}
          onPageChange={(_, next) => setPage(next)}
          onRowsPerPageChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(0);
          }}
          labelRowsPerPage={labels.rowsPerPage}
          labelDisplayedRows={labels.displayedRows}
          getItemAriaLabel={labels.page}
        />
      )}
    </Box>
  );
}
