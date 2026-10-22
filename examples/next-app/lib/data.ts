export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface Customer {
  id: number;
  label: string;
  city: string;
}

export interface Order {
  id: string;
  customerId: number;
  status: OrderStatus;
  items: number;
  total: number;
  /** ISO `YYYY-MM-DD`. */
  placed: string;
  /** ISO `YYYY-MM-DD`, or empty. */
  deliverBy: string;
}

export const customers: Customer[] = [
  { id: 1, label: 'Ada Lovelace', city: 'London' },
  { id: 2, label: 'Grace Hopper', city: 'New York' },
  { id: 3, label: 'Alan Turing', city: 'Wilmslow' },
  { id: 4, label: 'Katherine Johnson', city: 'Hampton' },
  { id: 5, label: 'Edsger Dijkstra', city: 'Nuenen' },
  { id: 6, label: 'Barbara Liskov', city: 'Boston' },
  { id: 7, label: 'Donald Knuth', city: 'Stanford' },
  { id: 8, label: 'Margaret Hamilton', city: 'Paoli' },
];

export const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const statusColors = {
  pending: 'warning',
  paid: 'info',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'error',
} as const;

/** Which statuses an order may move to next. */
export const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: ['pending'],
};

const statuses: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'delivered', 'cancelled'];

function isoDay(offset: number) {
  return new Date(Date.UTC(2026, 9, 1) + offset * 86_400_000).toISOString().slice(0, 10);
}

// Generated deterministically, so the server and the browser agree.
export const initialOrders: Order[] = Array.from({ length: 64 }, (_, i) => ({
  id: `ORD-${2100 + i}`,
  customerId: ((i * 5) % customers.length) + 1,
  status: statuses[(i * 7) % statuses.length]!,
  items: ((i * 13) % 9) + 1,
  total: Math.round((((i * 37) % 420) + 24.9) * 100) / 100,
  placed: isoDay(-((i * 11) % 45)),
  deliverBy: i % 4 === 0 ? '' : isoDay(10 - ((i * 11) % 45)),
}));

export function customerName(id: number) {
  return customers.find((c) => c.id === id)?.label ?? 'Unknown';
}

export const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' });
export const day = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' });
