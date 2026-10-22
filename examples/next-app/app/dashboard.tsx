'use client';

import Link from 'next/link';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { DataTable, StatusChip, type DataTableColumn } from '@rbalukja15/ui-components';
import { customerName, day, money, statusColors, statusLabels, type Order } from '@/lib/data';
import { useOrders } from '@/lib/orders-store';

const columns: DataTableColumn<Order>[] = [
  { id: 'id', header: 'Order' },
  { id: 'customer', header: 'Customer', cell: (o) => customerName(o.customerId) },
  {
    id: 'status',
    header: 'Status',
    cell: (o) => <StatusChip status={o.status} getLabel={(s) => statusLabels[s]} colors={statusColors} />,
  },
  { id: 'total', header: 'Total', align: 'right', cell: (o) => money.format(o.total) },
  { id: 'placed', header: 'Placed', align: 'right', cell: (o) => day.format(new Date(o.placed)) },
];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 180 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" component="p">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { orders } = useOrders();
  const open = orders.filter((o) => o.status === 'pending' || o.status === 'paid');
  const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
  const recent = [...orders].sort((a, b) => b.placed.localeCompare(a.placed)).slice(0, 6);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <Stat label="Open orders" value={String(open.length)} />
        <Stat label="To ship" value={String(orders.filter((o) => o.status === 'paid').length)} />
        <Stat label="Revenue" value={money.format(revenue)} />
      </Stack>
      <Box>
        <Stack direction="row" sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2">
            Recent orders
          </Typography>
          <Button component={Link} href="/orders">
            All orders
          </Button>
        </Stack>
        <DataTable label="Recent orders" rows={recent} columns={columns} getRowId={(o) => o.id} disablePagination size="small" />
      </Box>
    </Stack>
  );
}
