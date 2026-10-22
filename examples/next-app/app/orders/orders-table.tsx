'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, IconButton, MenuItem, TextField, Tooltip } from '@mui/material';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';
import {
  DataTable,
  EmptyState,
  FloatingCreateButton,
  StatusChip,
  TruncatedText,
  useConfirm,
  useUrlSearch,
  useUrlState,
  type DataTableColumn,
  type DataTableRowId,
} from '@rbalukja15/ui-components';
import {
  customerName,
  day,
  money,
  nextStatuses,
  statusColors,
  statusLabels,
  type Order,
  type OrderStatus,
} from '@/lib/data';
import { useOrders } from '@/lib/orders-store';

// Everything that describes the view lives in the query string, so a
// filtered, sorted page can be bookmarked or shared.
const DEFAULTS = { q: '', status: '', sort: 'placed', dir: 'desc', page: 0, size: 10 };

export function OrdersTable() {
  const { orders, update, remove } = useOrders();
  const confirm = useConfirm();
  const [view, setView] = useUrlState(DEFAULTS);
  const [search, setSearch, query] = useUrlSearch(view.q, (q) => setView({ q, page: 0 }));
  const [selected, setSelected] = React.useState<DataTableRowId[]>([]);

  const columns = React.useMemo<DataTableColumn<Order>[]>(
    () => [
      { id: 'id', header: 'Order', sortable: true, hideable: false },
      {
        id: 'customer',
        header: 'Customer',
        sortable: true,
        sortValue: (o) => customerName(o.customerId),
        cell: (o) => <TruncatedText text={customerName(o.customerId)} variant="body2" sx={{ maxWidth: 180 }} />,
      },
      {
        id: 'status',
        header: 'Status',
        sortable: true,
        cell: (o) => (
          <StatusChip<OrderStatus>
            status={o.status}
            options={nextStatuses[o.status]}
            getLabel={(s) => statusLabels[s]}
            colors={statusColors}
            onChange={(status) => update(o.id, { status })}
          />
        ),
      },
      { id: 'items', header: 'Items', sortable: true, align: 'right' },
      { id: 'total', header: 'Total', sortable: true, align: 'right', cell: (o) => money.format(o.total) },
      { id: 'placed', header: 'Placed', sortable: true, align: 'right', cell: (o) => day.format(new Date(o.placed)) },
      {
        id: 'deliverBy',
        header: 'Deliver by',
        sortable: true,
        align: 'right',
        cell: (o) => (o.deliverBy ? day.format(new Date(o.deliverBy)) : '—'),
      },
    ],
    [update],
  );

  const needle = query.trim().toLowerCase();
  const rows = orders.filter(
    (o) =>
      (!view.status || o.status === view.status) &&
      (!needle || `${o.id} ${customerName(o.customerId)}`.toLowerCase().includes(needle)),
  );

  const deleteOrders = async (ids: readonly DataTableRowId[]) => {
    const ok = await confirm({
      title: ids.length === 1 ? `Delete ${ids[0]}?` : `Delete ${ids.length} orders?`,
      message: 'Deleted orders cannot be restored.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    remove(ids.map(String));
    setSelected((current) => current.filter((id) => !ids.includes(id)));
  };

  return (
    <>
      <DataTable
        label="Orders"
        rows={rows}
        columns={columns}
        getRowId={(o) => o.id}
        getRowLabel={(o) => `order ${o.id}`}
        sort={view.sort ? { columnId: view.sort, direction: view.dir === 'asc' ? 'asc' : 'desc' } : null}
        onSortChange={(sort) => setView({ sort: sort?.columnId ?? '', dir: sort?.direction ?? 'desc' })}
        page={view.page}
        onPageChange={(page) => setView({ page })}
        pageSize={view.size}
        onPageSizeChange={(size) => setView({ size, page: 0 })}
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        columnsMenu
        defaultHiddenColumns={['items']}
        rowActions={(o) => (
          <Tooltip title="Delete">
            <IconButton size="small" aria-label={`Delete order ${o.id}`} onClick={() => deleteOrders([o.id])}>
              <DeleteOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        toolbar={
          <>
            <TextField size="small" label="Search orders" value={search} onChange={(e) => setSearch(e.target.value)} />
            <TextField
              select
              size="small"
              label="Status"
              value={view.status}
              onChange={(e) => setView({ status: e.target.value, page: 0 })}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All</MenuItem>
              {(Object.keys(statusLabels) as OrderStatus[]).map((s) => (
                <MenuItem key={s} value={s}>
                  {statusLabels[s]}
                </MenuItem>
              ))}
            </TextField>
            {selected.length > 0 && (
              <Button color="error" onClick={() => deleteOrders(selected)}>
                Delete selected
              </Button>
            )}
          </>
        }
        emptyState={
          <EmptyState
            title="No orders match"
            description="Try another search or status."
            actionLabel="Clear filters"
            onAction={() => {
              setSearch('');
              setView({ q: '', status: '', page: 0 });
            }}
          />
        }
      />
      <FloatingCreateButton href="/orders/new" LinkComponent={Link} label="New order" icon={<AddIcon />} />
    </>
  );
}
