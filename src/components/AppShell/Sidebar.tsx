import * as React from 'react';
import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import { findActiveIndex, navItemKey, type IsNavItemActive, type NavItem, type ShellBreakpoint } from './navItems';
import { kit } from '../../internal/kitTokens';

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
  /** Off until the first values are painted, so a stored state doesn't animate in. */
  animate: boolean;
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
  animate,
}: SidebarProps) {
  // One winner across both lists, so only one item is ever the current page.
  const activeIndex = findActiveIndex([...items, ...(footerItems ?? [])], currentPath, isActive);
  const active = activeIndex < items.length ? activeIndex : -1;
  const footerActive = activeIndex >= items.length ? activeIndex - items.length : -1;
  const desktopWidth = collapsed ? miniWidth : width;

  const renderItem = (item: NavItem, isCurrent: boolean, mini: boolean) => (
    <ListItem key={navItemKey(item)} disablePadding sx={{ mb: '2px' }}>
      {/* An empty title keeps the tooltip off without remounting the button. */}
      <Tooltip title={mini ? item.label : ''} placement="right" arrow>
        <ListItemButton
          {...(item.href ? { component: LinkComponent ?? 'a', href: item.href } : {})}
          onClick={() => {
            item.onClick?.();
            if (mobileOpen) onMobileClose();
          }}
          aria-current={isCurrent ? 'page' : undefined}
          aria-label={mini ? item.label : undefined}
          sx={(theme: Theme) => ({
            borderRadius: '10px',
            px: mini ? 1 : 1.5,
            py: 1,
            border: '1px solid transparent',
            justifyContent: mini ? 'center' : 'flex-start',
            color: isCurrent ? (theme.palette.mode === 'light' ? 'primary.main' : 'primary.light') : 'text.primary',
            bgcolor: isCurrent ? alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.1 : 0.2) : 'transparent',
            borderColor: 'transparent',
            '& .MuiListItemIcon-root': {
              color: isCurrent ? 'inherit' : 'text.secondary',
              minWidth: mini ? 0 : 32,
              justifyContent: mini ? 'center' : 'flex-start',
              '& svg': { fontSize: '1.25rem' },
            },
            '& .MuiListItemText-primary': { fontSize: '0.875rem', fontWeight: isCurrent ? 600 : 400 },
            '&:hover': {
              bgcolor: isCurrent
                ? alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.14 : 0.26)
                : alpha(theme.palette.text.primary, 0.05),
            },
            '&.Mui-focusVisible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: -2 },
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
        transition: animate ? widthTransition : 'none',
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        // The overlay is a modal, so its paper is a named dialog. MUI 9 sets
        // the role itself; MUI 6 and 7 take `slotProps.paper` without one.
        // MUI 5 types `slotProps` without `paper` and passes the key on to
        // the Modal, which ignores it.
        {...({ slotProps: { paper: { role: 'dialog', 'aria-modal': true, 'aria-label': label } } } as object)}
        sx={(theme: Theme) => ({
          display: { xs: 'block', [breakpoint]: 'none' },
          '& .MuiDrawer-paper': { width, boxSizing: 'border-box', bgcolor: kit(theme).surface.card },
        })}
      >
        {renderContent(false)}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={(theme: Theme) => ({
          display: { xs: 'none', [breakpoint]: 'block' },
          '& .MuiDrawer-paper': {
            width: desktopWidth,
            boxSizing: 'border-box',
            // A card-coloured rail with a firm edge, so it stands apart from
            // the page instead of blending into it.
            bgcolor: kit(theme).surface.card,
            borderRight: `1px solid ${kit(theme).line.strong}`,
            // Keeps labels from peeking out while the width animates.
            overflowX: 'hidden',
            transition: animate ? widthTransition : 'none',
          },
        })}
      >
        {renderContent(collapsed)}
      </Drawer>
    </Box>
  );
}
