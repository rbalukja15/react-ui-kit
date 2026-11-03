import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { AppShell, type NavItem } from '../index';
import { navIcons } from './icons';

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: navIcons.dashboard },
  { label: 'Clients', href: '/clients', icon: navIcons.clients },
  { label: 'Pets', href: '/pets', icon: navIcons.pets },
  { label: 'Appointments', href: '/appointments', icon: navIcons.appointments },
  { label: 'Invoices', href: '/invoices', icon: navIcons.invoices },
  { label: 'Inventory', href: '/inventory', icon: navIcons.inventory },
  { label: 'Purchases', href: '/purchases', icon: navIcons.purchases },
  { label: 'Expenses', href: '/expenses', icon: navIcons.expenses },
  { label: 'Statistics', href: '/statistics', icon: navIcons.statistics },
  { label: 'Suppliers', href: '/suppliers', icon: navIcons.suppliers },
];

// Links stay on the page in the examples.
const DemoLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(function DemoLink(
  { onClick, ...props },
  ref,
) {
  return (
    <a
      ref={ref}
      {...props}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    />
  );
});

export function VetAppShell({ currentPath, children }: { currentPath: string; children: React.ReactNode }) {
  return (
    <AppShell
      navItems={navItems}
      currentPath={currentPath}
      LinkComponent={DemoLink}
      brand={
        <Typography sx={{ fontWeight: 600, fontSize: '1.25rem' }}>VetApp</Typography>
      }
      collapsedBrand={<Typography sx={{ fontWeight: 600 }}>V</Typography>}
      // Phones hide the sidebar, so the header carries the app name there.
      title={<Box component="span" sx={{ display: { md: 'none' }, fontWeight: 600 }}>VetApp</Box>}
      drawerWidth={248}
    >
      <Box sx={{ maxWidth: 1120, display: 'flex', flexDirection: 'column', gap: 2.5, pb: 7 }}>{children}</Box>
    </AppShell>
  );
}

export { DemoLink };
