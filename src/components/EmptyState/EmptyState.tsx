import * as React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Icon rendered inside a tinted teal tile above the title. */
  icon?: React.ReactNode;
  actionLabel?: string;
  /** Optional leading icon on the action button (e.g. `<AddIcon />`). */
  actionIcon?: React.ReactNode;
  /**
   * Optional primary action. `href` + `LinkComponent` keeps the library
   * framework-agnostic: pass Next's `Link`, a react-router `Link`, or a
   * plain `<a>`.
   */
  href?: string;
  LinkComponent?: React.ElementType;
  onAction?: () => void;
}

/**
 * Empty-state surface for list/table views with no data. A tinted teal
 * icon tile + serif title + optional description and CTA. The CTA is
 * link-or-handler — provide one or the other.
 */
export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  actionIcon,
  href,
  LinkComponent,
  onAction,
}: EmptyStateProps) {
  const linkProps =
    href && LinkComponent ? { component: LinkComponent, href } : href ? { href } : {};

  return (
    <Box
      role="status"
      sx={{
        textAlign: 'center',
        py: 6,
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.10),
            color: 'primary.main',
            '& > svg': { fontSize: 30 },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" color="text.secondary" fontWeight={500}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {actionLabel && (href || onAction) && (
        <Button
          variant="contained"
          size="small"
          onClick={onAction}
          startIcon={actionIcon}
          sx={{ mt: 1 }}
          {...linkProps}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
