'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UrlStateProvider, type UrlAdapter } from '@rbalukja15/ui-components';

/** Routes the kit's URL hooks through the Next.js router, as the README shows. */
export function NextUrlStateProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const adapter = React.useMemo<UrlAdapter>(
    () => ({
      search: searchParams?.toString() ?? '',
      replace: (search) => router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false }),
    }),
    [searchParams, router, pathname],
  );
  return <UrlStateProvider adapter={adapter}>{children}</UrlStateProvider>;
}
