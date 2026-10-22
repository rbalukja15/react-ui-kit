'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined';
import AddCircleOutlined from '@mui/icons-material/AddCircleOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { AppShell, useThemeMode, type NavItem } from '@rbalukja15/ui-components';

const nav: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: <DashboardOutlined /> },
  { label: 'Orders', href: '/orders', icon: <ReceiptLongOutlined /> },
  { label: 'New order', href: '/orders/new', icon: <AddCircleOutlined /> },
];

const titles: Record<string, string> = { '/': 'Dashboard', '/orders': 'Orders', '/orders/new': 'New order' };

function Logo({ withName }: { withName?: boolean }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Typography component="span" sx={{ fontFamily: 'Newsreader, serif', fontWeight: 600, fontSize: 22, color: 'primary.main' }}>
        ◆
      </Typography>
      {withName && (
        <Typography component="span" sx={{ fontFamily: 'Newsreader, serif', fontWeight: 600, fontSize: 18 }}>
          Ledger
        </Typography>
      )}
    </Stack>
  );
}

function ModeToggle() {
  const { mode, toggle } = useThemeMode();
  const label = mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  return (
    <Tooltip title={label}>
      <IconButton onClick={toggle} aria-label={label}>
        {mode === 'light' ? <DarkModeOutlined /> : <LightModeOutlined />}
      </IconButton>
    </Tooltip>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  // `usePathname` already leaves out the base path, and `trailingSlash`
  // adds one, which the shell's matching ignores.
  const pathname = usePathname().replace(/(.)\/$/, '$1');
  return (
    <AppShell
      navItems={nav}
      bottomNavItems={nav}
      footerItems={[
        { label: 'Storybook', icon: <MenuBookOutlined />, href: 'https://rbalukja15.github.io/react-ui-kit/' },
      ]}
      currentPath={pathname}
      LinkComponent={Link}
      brand={<Logo withName />}
      collapsedBrand={<Logo />}
      title={titles[pathname] ?? 'Orders'}
      headerActions={<ModeToggle />}
      storageKey="ui-demo:sidebar-collapsed"
    >
      {children}
    </AppShell>
  );
}
