import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
// A server component importing the kit's providers directly: the package's
// 'use client' banner is what makes this work.
import { ConfirmDialogProvider, ThemeModeProvider } from '@rbalukja15/ui-components';
import { OrdersProvider } from '@/lib/orders-store';
import { Shell } from './shell';

export const metadata: Metadata = {
  title: 'Orders demo · @rbalukja15/ui-components',
  description: 'An order-management screen built from @rbalukja15/ui-components on the Next.js App Router.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppRouterCacheProvider>
          <ThemeModeProvider defaultMode="system" storageKey="ui-demo:theme-mode">
            <ConfirmDialogProvider>
              <OrdersProvider>
                <Shell>{children}</Shell>
              </OrdersProvider>
            </ConfirmDialogProvider>
          </ThemeModeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
