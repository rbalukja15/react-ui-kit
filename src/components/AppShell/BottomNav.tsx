import * as React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { findActiveIndex, navItemKey, type IsNavItemActive, type NavItem, type ShellBreakpoint } from './navItems';

export interface BottomNavProps {
  /** The few destinations a phone user needs most; four or five fit. */
  items: NavItem[];
  /** The current path (`usePathname()`, `useLocation().pathname`, …). Marks the active item. */
  currentPath?: string;
  /** Replaces the default active-item rule (see `isPathActive`). The first match wins. */
  isActive?: IsNavItemActive;
  /** Router link component for items with an `href`. Defaults to a plain `<a>`. */
  LinkComponent?: React.ElementType;
  /** Accessible name of the navigation landmark. Defaults to `'Quick navigation'`. */
  label?: string;
  /** Hide the bar at this breakpoint and wider; `null` always shows it. Defaults to `'md'`. */
  hideAtBreakpoint?: ShellBreakpoint | null;
  /** Show every item's label, not only the active one's. Defaults to `true`. */
  showLabels?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * Mobile bottom navigation bar, fixed to the bottom of the viewport and
 * hidden from `hideAtBreakpoint` up, where the sidebar takes over. Items are
 * links, so the router handles navigation; the active one gets
 * `aria-current="page"`. Leave room for it at the bottom of the page
 * (`AppShell` does this itself).
 */
export function BottomNav({
  items,
  currentPath,
  isActive,
  LinkComponent,
  label = 'Quick navigation',
  hideAtBreakpoint = 'md',
  showLabels = true,
  sx,
}: BottomNavProps) {
  const active = findActiveIndex(items, currentPath, isActive);

  return (
    <Paper
      component="nav"
      aria-label={label}
      elevation={3}
      square
      sx={[
        {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          display: hideAtBreakpoint ? { xs: 'block', [hideAtBreakpoint]: 'none' } : 'block',
          borderTop: 1,
          borderColor: 'divider',
          // Clear the home indicator on notched phones.
          pb: 'env(safe-area-inset-bottom)',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <BottomNavigation showLabels={showLabels} value={active === -1 ? null : active}>
        {items.map((item, i) => (
          <BottomNavigationAction
            key={navItemKey(item)}
            value={i}
            label={item.label}
            icon={item.icon}
            onClick={item.onClick}
            aria-current={i === active ? 'page' : undefined}
            sx={{ minWidth: 0 }}
            {...(item.href ? { href: item.href, component: LinkComponent ?? 'a' } : {})}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
