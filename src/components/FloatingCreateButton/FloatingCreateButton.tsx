import * as React from 'react';
import { Fab } from '@mui/material';

export interface FloatingCreateButtonProps {
  /** Aria-label for the FAB. Used as the accessible name. */
  label: string;
  /** Icon inside the FAB (e.g. MUI's `<AddIcon />`). */
  icon: React.ReactNode;
  /** Optional href — when set, renders as a link via `LinkComponent`. */
  href?: string;
  /** Optional link component for framework routers (Next / react-router / etc.). */
  LinkComponent?: React.ElementType;
  /** Click handler when no `href` is provided. */
  onClick?: () => void;
  /** Hide the FAB at this breakpoint and wider. Defaults to `'md'`. */
  hideAtBreakpoint?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Distance from the bottom of the viewport. Numbers are theme spacing
   * units, strings are any CSS length. Raise it when the app has a bottom
   * navigation bar, e.g. `bottomOffset={9.5}` or `'calc(56px + 20px)'`.
   * Defaults to `2` (16px with the default spacing).
   */
  bottomOffset?: number | string;
  /** Distance from the right edge of the viewport, same units as `bottomOffset`. Defaults to `2`. */
  rightOffset?: number | string;
}

/**
 * Mobile-only floating "create" action. Renders `position: fixed` in the
 * bottom-right and hides at the given breakpoint and above. Pair with a
 * regular header/toolbar action for desktop users.
 */
export function FloatingCreateButton({
  label,
  icon,
  href,
  LinkComponent,
  onClick,
  hideAtBreakpoint = 'md',
  bottomOffset = 2,
  rightOffset = 2,
}: FloatingCreateButtonProps) {
  const linkProps =
    href && LinkComponent ? { component: LinkComponent, href } : href ? { href } : {};

  return (
    <Fab
      color="primary"
      aria-label={label}
      onClick={onClick}
      sx={{
        position: 'fixed',
        right: (theme) => (typeof rightOffset === 'number' ? theme.spacing(rightOffset) : rightOffset),
        bottom: (theme) => (typeof bottomOffset === 'number' ? theme.spacing(bottomOffset) : bottomOffset),
        display: { xs: 'flex', [hideAtBreakpoint]: 'none' },
        borderRadius: 4,
      }}
      {...linkProps}
    >
      {icon}
    </Fab>
  );
}
