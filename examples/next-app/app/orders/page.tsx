import { Suspense } from 'react';
import { PageSkeleton } from '@rbalukja15/ui-components';
import { NextUrlStateProvider } from '@/lib/url-state';
import { OrdersTable } from './orders-table';

// `useSearchParams` needs a Suspense boundary in a static export: the
// skeleton is what the prerendered HTML shows until the query string is read.
export default function OrdersPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="list" />}>
      <NextUrlStateProvider>
        <OrdersTable />
      </NextUrlStateProvider>
    </Suspense>
  );
}
