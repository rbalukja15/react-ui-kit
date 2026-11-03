import * as React from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

export interface PageHeaderProps {
  /** The page's `<h1>`, set in the display face. */
  title: React.ReactNode;
  /** One grey line under the title. */
  subtitle?: React.ReactNode;
  /** Right side: primary and secondary buttons, a date range. Wraps under the title on narrow screens. */
  actions?: React.ReactNode;
  sx?: SxProps<Theme>;
}

/** Page title, a one-line description and the page's main actions. */
export function PageHeader({ title, subtitle, actions, sx }: PageHeaderProps) {
  return (
    <Box
      component="header"
      sx={[
        { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h1">{title}</Typography>
        {subtitle !== undefined && (
          <Typography sx={{ mt: 0.75, fontSize: '0.875rem', color: 'text.secondary' }}>{subtitle}</Typography>
        )}
      </Box>
      {actions !== undefined && <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>{actions}</Box>}
    </Box>
  );
}
