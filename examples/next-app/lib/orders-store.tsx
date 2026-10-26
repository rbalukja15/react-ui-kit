'use client';

import * as React from 'react';
import { initialOrders, type Order } from './data';

interface OrdersStore {
  orders: Order[];
  add: (order: Omit<Order, 'id'>) => Order;
  update: (id: string, patch: Partial<Order>) => void;
  remove: (ids: readonly string[]) => void;
}

const OrdersContext = React.createContext<OrdersStore | null>(null);

/** In-memory orders for the demo. A real app would fetch and mutate through its API. */
export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = React.useState(initialOrders);
  // Ids keep counting up, so one freed by a delete is never handed out again.
  const lastId = React.useRef(Math.max(...initialOrders.map((o) => Number(o.id.slice('ORD-'.length)))));
  const store = React.useMemo<OrdersStore>(
    () => ({
      orders,
      add: (order) => {
        lastId.current += 1;
        const created = { ...order, id: `ORD-${lastId.current}` };
        setOrders((current) => [created, ...current]);
        return created;
      },
      update: (id, patch) => setOrders((current) => current.map((o) => (o.id === id ? { ...o, ...patch } : o))),
      remove: (ids) => setOrders((current) => current.filter((o) => !ids.includes(o.id))),
    }),
    [orders],
  );
  return <OrdersContext.Provider value={store}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const store = React.useContext(OrdersContext);
  if (!store) throw new Error('useOrders must be used inside OrdersProvider');
  return store;
}
