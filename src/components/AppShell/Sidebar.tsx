import * as React from 'react';
import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import { findActiveIndex, navItemKey, type IsNavItemActive, type NavItem, type ShellBreakpoint } from './navItems';

interface SidebarProps {
  items: NavItem[];
  footerItems?: NavItem[];
  currentPath?: string;
  isActive?: IsNavItemActive;
  LinkComponent?: React.ElementType;
  brand?: React.ReactNode;
  collapsedBrand?: React.ReactNode;
  label: string;
  breakpoint: ShellBreakpoint;
  width: number;
  miniWidth: number;
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
  drawerId: string;
}

const widthTransition = (theme: Theme) =>
  theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  });

/**
 * The navigation drawer: a temporary overlay below `breakpoint`, a permanent
 * drawer from it up. The permanent one narrows to an icon rail when
 * `collapsed`; the overlay always shows labels, since the user opened it.
 */
export function Sidebar({
  items,
  footerItems,
  currentPath,
  isActive,
  LinkComponent,
  brand,
  collapsedBrand,
  label,
  breakpoint,
  width,
  miniWidth,
  collapsed,
  mobileOpen,
  onMobileClose,
  drawerId,
}: SidebarProps) {
  const active = findActiveIndex(items, currentPath, isActive);
  const footerActive = findActiveIndex(footerItems ?? [], currentPath, isActive);
  const desktopWidth = collapsed ? miniWidth : width;

  const renderItem = (item: NavItem, isCurrent: boolean, mini: boolean) => (
    <ListItem key={navItemKey(item)} disablePadding sx={{ mb: 0.5 }}>
      {/* An empty title keeps the tooltip off without remounting the button. */}
      <Tooltip title={mini ? item.label : ''} placement="right" arrow>
        <ListItemButton
          {...(item.href ? { component: LinkComponent ?? 'a', href: item.href } : {})}
          onClick={() => {
            item.onClick?.();
            onMobileClose();
          }}
          aria-current={isCurrent ? 'page' : undefined}
          aria-label={mini ? item.label : undefined}
          sx={(theme: Theme) => ({
            borderRadius: 2,
            px: mini ? 1 : 2,
            py: 1,
            justifyContent: mini ? 'center' : 'flex-start',
            color: isCurrent ? 'primary.contrastText' : 'text.secondary',
            bgcolor: isCurrent ? 'primary.main' : 'transparent',
            '& .MuiListItemIcon-root': { color: 'inherit', minWidth: mini ? 0 : 40, justifyContent: 'center' },
            '& .MuiListItemText-primary': { fontSize: '0.875rem', fontWeight: isCurrent ? 600 : 400 },
            '&:hover': {
              bgcolor: isCurrent ? 'primary.dark' : alpha(theme.palette.primary.main, 0.08),
              color: isCurrent ? 'primary.contrastText' : 'text.primary',
            },
          })}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          {!mini && <ListItemText primary={item.label} />}
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );

  const renderContent = (mini: boolean) => (
    // The whole drawer is the landmark, so the brand and footer sit inside it.
    <Box component="nav" aria-label={label} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {(brand || collapsedBrand) && (
        <>
          {/* A Toolbar, so the divider lines up with the header's bottom border. */}
          <Toolbar sx={{ justifyContent: mini ? 'center' : 'flex-start', px: mini ? 1 : 2.5, gap: 1.5 }}>
            {mini ? collapsedBrand : brand}
          </Toolbar>
          <Divider />
        </>
      )}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <List sx={{ px: 1, py: 2 }}>{items.map((item, i) => renderItem(item, i === active, mini))}</List>
      </Box>
      {footerItems && footerItems.length > 0 && (
        <>
          <Divider />
          <List sx={{ px: 1, py: 1 }}>{footerItems.map((item, i) => renderItem(item, i === footerActive, mini))}</List>
        </>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        // Reserves the permanent drawer's width in the flex row, animated in
        // step with the drawer paper.
        width: { [breakpoint]: desktopWidth },
        flexShrink: { [breakpoint]: 0 },
        transition: widthTransition,
      }}
    >
      <Drawer
        id={drawerId}
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        // Newer MUI gives the overlay's paper role="dialog", which needs a
        // name. Older majors type `slotProps` without `paper` and pass the
        // key on to the Modal, which ignores it; their paper has no role.
        {...({ slotProps: { paper: { 'aria-label': label } } } as object)}
        sx={{
          display: { xs: 'block', [breakpoint]: 'none' },
          '& .MuiDrawer-paper': { width, boxSizing: 'border-box' },
        }}
      >
        {renderContent(false)}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', [breakpoint]: 'block' },
          '& .MuiDrawer-paper': {
            width: desktopWidth,
            boxSizing: 'border-box',
            // Keeps labels from peeking out while the width animates.
            overflowX: 'hidden',
            transition: widthTransition,
          },
        }}
      >
        {renderContent(collapsed)}
      </Drawer>
    </Box>
  );
}
