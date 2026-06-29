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
        right: 16,
        bottom: 76,
        display: { xs: 'flex', [hideAtBreakpoint]: 'none' },
        borderRadius: 4,
      }}
      {...linkProps}
    >
      {icon}
    </Fab>
  );
}
