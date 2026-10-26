import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Box, Button, Chip, IconButton, Stack, TextField, Typography } from '@mui/material';
import { UrlStateProvider, type UrlAdapter } from '../../hooks/UrlStateProvider';
import { useUrlState } from '../../hooks/useUrlState';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { DataTable, type DataTableColumn, type DataTableRowId } from './DataTable';
import type { DataTableSort } from './sortRows';

interface Order {
  id: string;
  customer: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: number;
  total: number;
  placed: Date;
}

const customers = [
  'Ada Lovelace',
  'Grace Hopper',
  'Alan Turing',
  'Katherine Johnson',
  'Edsger Dijkstra',
  'Barbara Liskov',
  'Donald Knuth',
  'Margaret Hamilton',
];
const statuses: Order['status'][] = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

// Deterministic, so visual snapshots stay stable.
const orders: Order[] = Array.from({ length: 57 }, (_, i) => ({
  id: `ORD-${String(1040 + i)}`,
  customer: customers[(i * 5) % customers.length]!,
  status: statuses[(i * 7) % statuses.length]!,
  items: ((i * 13) % 9) + 1,
  total: Math.round((((i * 37) % 400) + 19.5) * 100) / 100,
  placed: new Date(Date.UTC(2026, 8, 1 + ((i * 11) % 50))),
}));

const statusColor = { Pending: 'warning', Shipped: 'info', Delivered: 'success', Cancelled: 'error' } as const;
const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' });
const day = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' });

const columns: DataTableColumn<Order>[] = [
  {
    id: 'id',
    header: 'Order',
    sortable: true,
    hideable: false,
    cell: (o) => (
      <Typography variant="body2" fontWeight={600}>
        {o.id}
      </Typography>
    ),
  },
  { id: 'customer', header: 'Customer', sortable: true },
  {
    id: 'status',
    header: 'Status',
    sortable: true,
    cell: (o) => <Chip size="small" color={statusColor[o.status]} label={o.status} />,
  },
  { id: 'items', header: 'Items', sortable: true, align: 'right' },
  { id: 'total', header: 'Total', sortable: true, align: 'right', cell: (o) => money.format(o.total) },
  { id: 'placed', header: 'Placed', sortable: true, align: 'right', cell: (o) => day.format(o.placed) },
];

function EditIcon() {
  return (
    <svg aria-hidden="true" focusable="false" width="1.1em" height="1.1em" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

const meta: Meta<typeof DataTable<Order>> = {
  title: 'Data display/DataTable',
  component: DataTable,
  args: {
    rows: orders,
    columns,
    getRowId: (o: Order) => o.id,
    label: 'Orders',
  },
};
export default meta;

type Story = StoryObj<typeof DataTable<Order>>;
type TableArgs = React.ComponentProps<typeof DataTable<Order>>;

/** Sorting and pagination happen in the browser. Click a header to sort: ascending, descending, then off. */
export const Basic: Story = {};

/** Clicking a header sorts by it; the header's `aria-sort` follows. */
export const SortsByHeader: Story = {
  play: async ({ canvasElement }) => {
    const table = within(canvasElement).getByRole('table', { name: 'Orders' });
    const header = within(table).getByRole('columnheader', { name: 'Total' });
    await userEvent.click(within(header).getByRole('button'));
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    const firstRow = within(table).getAllByRole('row')[1]!;
    await expect(firstRow).toHaveTextContent('€19.50');
    await userEvent.click(within(header).getByRole('button'));
    await expect(header).toHaveAttribute('aria-sort', 'descending');
  },
};

/** Checkboxes keep their selection across pages and sorts; the toolbar counts it. */
function SelectionDemo(args: TableArgs) {
  const [selected, setSelected] = React.useState<DataTableRowId[]>([]);
  return (
    <DataTable
      {...args}
      selectable
      selectedIds={selected}
      onSelectionChange={setSelected}
      getRowLabel={(o) => `order ${o.id}`}
      toolbar={
        selected.length > 0 && (
          <Button size="small" color="error" onClick={() => setSelected([])}>
            Cancel orders
          </Button>
        )
      }
    />
  );
}

export const Selection: Story = {
  render: (args) => <SelectionDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select order ORD-1040' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select order ORD-1041' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('2 selected');
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel orders' }));
    await expect(canvas.getByRole('status')).toBeEmptyDOMElement();
  },
};

/** Everything at once: selection, a columns menu, row actions and a sticky header in a scrolling container. */
export const FullFeatured: Story = {
  args: {
    selectable: true,
    columnsMenu: true,
    defaultHiddenColumns: ['items'],
    stickyHeader: true,
    maxHeight: 420,
    size: 'small',
    defaultSort: { columnId: 'placed', direction: 'desc' },
    getRowLabel: (o: Order) => `order ${o.id}`,
    rowActions: (o: Order) => (
      <IconButton size="small" aria-label={`Edit order ${o.id}`}>
        <EditIcon />
      </IconButton>
    ),
  },
};

/** Fake API: sorts, filters and pages on the "server" after a short delay. */
function fetchOrders(params: { q: string; sort: DataTableSort | null; page: number; pageSize: number }) {
  return new Promise<{ rows: Order[]; total: number }>((resolve) => {
    setTimeout(() => {
      let rows = orders.filter((o) => `${o.id} ${o.customer}`.toLowerCase().includes(params.q.toLowerCase()));
      if (params.sort) {
        const { columnId, direction } = params.sort;
        const key = columnId as keyof Order;
        rows = [...rows].sort(
          (a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0) * (direction === 'asc' ? 1 : -1)
        );
      }
      resolve({
        rows: rows.slice(params.page * params.pageSize, (params.page + 1) * params.pageSize),
        total: rows.length,
      });
    }, 400);
  });
}

/**
 * `mode="server"`: the table shows the page it is given and reports sort and
 * page changes, and the app fetches. The search box filters on the server too.
 */
function ServerSideDemo(args: TableArgs) {
  const [q, setQ] = React.useState('');
  const query = useDebouncedValue(q, 300);
  const [sort, setSort] = React.useState<DataTableSort | null>(null);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [data, setData] = React.useState<{ rows: Order[]; total: number }>({ rows: [], total: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let current = true;
    setLoading(true);
    fetchOrders({ q: query, sort, page, pageSize }).then((result) => {
      if (!current) return;
      setData(result);
      setLoading(false);
    });
    return () => {
      current = false;
    };
  }, [query, sort, page, pageSize]);

  return (
    <DataTable
      {...args}
      mode="server"
      rows={data.rows}
      rowCount={data.total}
      loading={loading}
      sort={sort}
      onSortChange={setSort}
      page={page}
      onPageChange={setPage}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
      toolbar={
        <TextField
          size="small"
          label="Search orders"
          value={q}
          onChange={(event) => {
            setQ(event.target.value);
            setPage(0);
          }}
        />
      }
    />
  );
}

export const ServerSide: Story = { render: (args) => <ServerSideDemo {...args} /> };

const URL_DEFAULTS = { sort: '', dir: 'asc', page: 0, size: 10 };

function OrdersWithUrlState(props: TableArgs) {
  const [state, setState] = useUrlState(URL_DEFAULTS);
  const sort = state.sort
    ? ({ columnId: state.sort, direction: state.dir === 'desc' ? 'desc' : 'asc' } as const)
    : null;
  return (
    <DataTable
      {...props}
      sort={sort}
      onSortChange={(next) => setState({ sort: next?.columnId ?? '', dir: next?.direction ?? 'asc' })}
      page={state.page}
      onPageChange={(page) => setState({ page })}
      pageSize={state.size}
      onPageSizeChange={(size) => setState({ size })}
    />
  );
}

/**
 * Sort, page and page size live in the query string through `useUrlState`,
 * so a view can be shared or bookmarked. The line above the table stands in
 * for the address bar.
 */
function UrlStateDemo(args: TableArgs) {
  const [search, setSearch] = React.useState('sort=total&dir=desc');
  const adapter = React.useMemo<UrlAdapter>(() => ({ search, replace: setSearch }), [search]);
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        /orders{search ? `?${search}` : ''}
      </Typography>
      <UrlStateProvider adapter={adapter}>
        <OrdersWithUrlState {...args} />
      </UrlStateProvider>
    </Stack>
  );
}

export const UrlState: Story = {
  render: (args) => <UrlStateDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Go to next page' }));
    await expect(canvas.getByText('/orders?sort=total&dir=desc&page=1')).toBeInTheDocument();
    // Sorting returns to the first page, and the URL keeps both changes.
    await userEvent.click(canvas.getByRole('button', { name: /^Customer/ }));
    await expect(canvas.getByText('/orders?sort=customer')).toBeInTheDocument();
  },
};

export const Loading: Story = { args: { loading: true, selectable: true } };

export const Empty: Story = { args: { rows: [] } };

/** `emptyState` replaces the default, for example with a call to action. */
export const CustomEmptyState: Story = {
  args: {
    rows: [],
    emptyState: (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography gutterBottom>No orders match these filters.</Typography>
        <Button variant="outlined" size="small">
          Clear filters
        </Button>
      </Box>
    ),
  },
};

/** Every string is a prop, so the table can be translated. */
export const Localised: Story = {
  args: {
    label: 'Bestellungen',
    selectable: true,
    columnsMenu: true,
    columns: columns.map((c) => ({
      ...c,
      header: {
        id: 'Bestellung',
        customer: 'Kunde',
        status: 'Status',
        items: 'Artikel',
        total: 'Summe',
        placed: 'Datum',
      }[c.id],
    })),
    labels: {
      rowsPerPage: 'Zeilen pro Seite:',
      displayedRows: ({ from, to, count }) => `${from}–${to} von ${count}`,
      selectAll: 'Alle Zeilen dieser Seite auswählen',
      selectRow: (row) => `${row} auswählen`,
      selected: (n) => `${n} ausgewählt`,
      columns: 'Spalten',
      noRows: 'Keine Ergebnisse',
      sortedAscending: 'aufsteigend sortiert',
      sortedDescending: 'absteigend sortiert',
      page: (type) =>
        ({ first: 'Erste Seite', last: 'Letzte Seite', next: 'Nächste Seite', previous: 'Vorherige Seite' }[type]),
    },
  },
};
