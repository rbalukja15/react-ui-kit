import * as React from 'react';
import { AppBar, Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { BottomNav } from './BottomNav';
import { MenuIcon, MenuOpenIcon } from './icons';
import type { IsNavItemActive, NavItem, ShellBreakpoint } from './navItems';
import { Sidebar } from './Sidebar';

export interface AppShellLabels {
  /** Name of the sidebar's navigation landmark. Defaults to `'Main navigation'`. */
  navigation?: string;
  /** Name of the bottom bar's navigation landmark. Defaults to `'Quick navigation'`. */
  bottomNavigation?: string;
  /** The mobile menu button. Defaults to `'Open navigation'`. */
  openNavigation?: string;
  /** The desktop collapse toggle while expanded. Defaults to `'Collapse sidebar'`. */
  collapseSidebar?: string;
  /** The desktop collapse toggle while collapsed. Defaults to `'Expand sidebar'`. */
  expandSidebar?: string;
}

export interface AppShellProps {
  children: React.ReactNode;
  /** Sidebar destinations, in order. Filter out the ones the user may not open before passing them. */
  navItems: NavItem[];
  /** Pinned to the bottom of the sidebar, below a divider: settings, logout, a theme toggle. */
  footerItems?: NavItem[];
  /** Mobile bottom bar destinations. The bar is only rendered when this is set. */
  bottomNavItems?: NavItem[];
  /** The current path (`usePathname()`, `useLocation().pathname`, …). Marks the active items. */
  currentPath?: string;
  /** Replaces the default active-item rule (see `isPathActive`). The first match wins. */
  isActive?: IsNavItemActive;
  /** Router link component for items with an `href` (Next's `Link`, a react-router `Link`, …). Defaults to `<a>`. */
  LinkComponent?: React.ElementType;
  /** Logo and name at the top of the sidebar. */
  brand?: React.ReactNode;
  /** What the collapsed rail shows instead of `brand`, usually just the logo. */
  collapsedBrand?: React.ReactNode;
  /** Page title in the header. */
  title?: React.ReactNode;
  /** Right side of the header: search, a theme toggle, the account menu. */
  headerActions?: React.ReactNode;
  /** Below this breakpoint the sidebar is an overlay and the bottom bar shows. Defaults to `'md'`. */
  breakpoint?: ShellBreakpoint;
  /** Sidebar width in px. Defaults to `260`. */
  drawerWidth?: number;
  /** Width of the collapsed icon rail in px. Defaults to `64`. */
  miniWidth?: number;
  /** Controlled collapsed state of the desktop sidebar. */
  collapsed?: boolean;
  /** Initial collapsed state when uncontrolled and nothing is stored. Defaults to `false`. */
  defaultCollapsed?: boolean;
  /** Called with the new state when the user toggles the desktop sidebar, controlled or not. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Opt-in: remember the uncontrolled collapsed state in `localStorage` under this key. */
  storageKey?: string;
  labels?: AppShellLabels;
  /** Styles for the `<main>` element. */
  mainSx?: SxProps<Theme>;
}

// Storage can throw (Safari private mode, blocked cookies); treat that as empty.
function readCollapsed(key: string): boolean | null {
  try {
    const value = window.localStorage.getItem(key);
    return value === '1' ? true : value === '0' ? false : null;
  } catch {
    return null;
  }
}

function writeCollapsed(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // The state still applies for this visit.
  }
}

function useCollapsed({
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  storageKey,
}: Pick<AppShellProps, 'collapsed' | 'defaultCollapsed' | 'onCollapsedChange' | 'storageKey'>) {
  const isControlled = collapsed !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultCollapsed);

  // Read after hydration, so server HTML always renders `defaultCollapsed`.
  React.useEffect(() => {
    if (isControlled || !storageKey) return;
    const stored = readCollapsed(storageKey);
    if (stored !== null) setUncontrolled(stored);
  }, [isControlled, storageKey]);

  const value = isControlled ? collapsed : uncontrolled;
  const toggle = () => {
    const next = !value;
    if (!isControlled) {
      setUncontrolled(next);
      if (storageKey) writeCollapsed(storageKey, next);
    }
    onCollapsedChange?.(next);
  };
  return [value, toggle] as const;
}

/**
 * Responsive application layout: a sidebar, a sticky header and the page
 * content, plus an optional bottom bar on phones.
 *
 * From `breakpoint` up the sidebar is permanent and collapses to an icon rail
 * from the header's toggle (labels then show as tooltips). Below it the
 * sidebar is an overlay opened from the header's menu button, and
 * `bottomNavItems` render as a fixed bottom bar.
 *
 * The shell knows nothing about routing, permissions or auth: pass the items
 * the user may see, the current path, a `LinkComponent` for your router, and
 * actions such as logout as items with an `onClick`.
 */
export function AppShell({
  children,
  navItems,
  footerItems,
  bottomNavItems,
  currentPath,
  isActive,
  LinkComponent,
  brand,
  collapsedBrand,
  title,
  headerActions,
  breakpoint = 'md',
  drawerWidth = 260,
  miniWidth = 64,
  collapsed: controlledCollapsed,
  defaultCollapsed,
  onCollapsedChange,
  storageKey,
  labels,
  mainSx,
}: AppShellProps) {
  const [collapsed, toggleCollapsed] = useCollapsed({
    collapsed: controlledCollapsed,
    defaultCollapsed,
    onCollapsedChange,
    storageKey,
  });
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const drawerId = `app-shell-drawer-${React.useId().replace(/:/g, '')}`;
  const {
    navigation = 'Main navigation',
    bottomNavigation = 'Quick navigation',
    openNavigation = 'Open navigation',
    collapseSidebar = 'Collapse sidebar',
    expandSidebar = 'Expand sidebar',
  } = labels ?? {};
  const toggleLabel = collapsed ? expandSidebar : collapseSidebar;
  const hasBottomNav = bottomNavItems !== undefined && bottomNavItems.length > 0;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        items={navItems}
        footerItems={footerItems}
        currentPath={currentPath}
        isActive={isActive}
        LinkComponent={LinkComponent}
        brand={brand}
        collapsedBrand={collapsedBrand}
        label={navigation}
        breakpoint={breakpoint}
        width={drawerWidth}
        miniWidth={miniWidth}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        drawerId={drawerId}
      />
      {/* minWidth: 0 lets wide content (tables) scroll inside the column
          instead of pushing the layout past the viewport. */}
      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
        >
          <Toolbar sx={{ gap: 0.5, px: { xs: 1, sm: 2 } }}>
            <IconButton
              color="inherit"
              edge="start"
              aria-label={openNavigation}
              aria-controls={drawerId}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: 'inline-flex', [breakpoint]: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Tooltip title={toggleLabel}>
              <IconButton
                color="inherit"
                edge="start"
                aria-label={toggleLabel}
                aria-expanded={!collapsed}
                onClick={toggleCollapsed}
                sx={{ display: { xs: 'none', [breakpoint]: 'inline-flex' } }}
              >
                {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
              </IconButton>
            </Tooltip>
            <Typography
              variant="h6"
              component="div"
              noWrap
              sx={{ flexGrow: 1, minWidth: 0, ml: 0.5, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}
            >
              {title}
            </Typography>
            {headerActions && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, sm: 1 } }}>{headerActions}</Box>
            )}
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          sx={[
            {
              flexGrow: 1,
              p: { xs: 2, [breakpoint]: 3 },
              // Keeps the last content clear of the fixed bottom bar.
              pb: hasBottomNav
                ? { xs: 'calc(56px + 16px + env(safe-area-inset-bottom))', [breakpoint]: 3 }
                : { xs: 2, [breakpoint]: 3 },
            },
            ...(Array.isArray(mainSx) ? mainSx : [mainSx]),
          ]}
        >
          {children}
        </Box>
      </Box>
      {hasBottomNav && (
        <BottomNav
          items={bottomNavItems}
          currentPath={currentPath}
          isActive={isActive}
          LinkComponent={LinkComponent}
          label={bottomNavigation}
          hideAtBreakpoint={breakpoint}
        />
      )}
    </Box>
  );
}
