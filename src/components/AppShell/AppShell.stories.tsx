import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, IconButton, Paper, Stack, Typography } from '@mui/material';
import { AppShell } from './AppShell';
import type { NavItem } from './navItems';

const Icon = ({ d }: { d: string }) => (
  <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d={d} /></svg>
);
const HOME = 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z';
const FOLDER = 'M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8z';
const PEOPLE = 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3m-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5m8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5';
const CALENDAR = 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 16H5V10h14z';
const GEAR = 'M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6';
const LOGOUT = 'm17 7-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z';
const LOGO = 'M12 2 4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5z';

const pages: (NavItem & { href: string })[] = [
  { label: 'Dashboard', href: '/', icon: <Icon d={HOME} /> },
  { label: 'Projects', href: '/projects', icon: <Icon d={FOLDER} /> },
  { label: 'People', href: '/people', icon: <Icon d={PEOPLE} /> },
  { label: 'Calendar', href: '/calendar', icon: <Icon d={CALENDAR} /> },
];

const Brand = ({ collapsed = false }: { collapsed?: boolean }) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    <Typography component="span" color="primary.main" sx={{ display: 'inline-flex' }}><Icon d={LOGO} /></Typography>
    {!collapsed && (
      <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>Acme</Typography>
    )}
  </Stack>
);

/** Stands in for a router: the story keeps the path in state. */
function Demo(props: Partial<React.ComponentProps<typeof AppShell>>) {
  const [path, setPath] = React.useState('/projects');
  const StoryLink = React.useMemo(
    () =>
      React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(function StoryLink(
        { href = '/', onClick, ...rest },
        ref,
      ) {
        return (
          <a
            ref={ref}
            href={`#${href}`}
            onClick={(event) => {
              onClick?.(event);
              event.preventDefault();
              setPath(href);
            }}
            {...rest}
          />
        );
      }),
    [],
  );
  const page = [...pages, { label: 'Settings', href: '/settings' }].find((p) => p.href === path);

  return (
    <AppShell
      navItems={pages}
      footerItems={[
        { label: 'Settings', href: '/settings', icon: <Icon d={GEAR} /> },
        { label: 'Log out', icon: <Icon d={LOGOUT} />, onClick: () => setPath('/') },
      ]}
      bottomNavItems={pages}
      currentPath={path}
      LinkComponent={StoryLink}
      brand={<Brand />}
      collapsedBrand={<Brand collapsed />}
      title={page?.label}
      headerActions={
        <IconButton size="small" aria-label="Account">
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>M</Avatar>
        </IconButton>
      }
      {...props}
    >
      <Stack spacing={2}>
        {Array.from({ length: 12 }, (_, i) => (
          <Paper key={i} variant="outlined" sx={{ p: 2 }}>
            <Typography>{page?.label} content block {i + 1}</Typography>
          </Paper>
        ))}
      </Stack>
    </AppShell>
  );
}

const meta: Meta<typeof AppShell> = {
  title: 'Layout/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const Default: StoryObj<typeof AppShell> = { render: () => <Demo /> };

/** Starts as the icon rail; hover an icon for its label. */
export const Collapsed: StoryObj<typeof AppShell> = { render: () => <Demo defaultCollapsed /> };

/** Resize the canvas below 900px (or use the mobile viewport) to see the overlay drawer and the bottom bar. */
export const Mobile: StoryObj<typeof AppShell> = {
  render: () => <Demo />,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
