import * as React from 'react';
import { Box, type BoxProps } from '@mui/material';

export interface RowActionsProps extends BoxProps {
  children: React.ReactNode;
}

/**
 * Horizontal, never-wrapping container for a table row's action buttons.
 *
 * Icon buttons dropped straight into a `<TableCell>` stack vertically as soon
 * as the column gets narrow. Wrapping them in `RowActions` keeps them on one
 * line and lets the cell keep its natural width:
 *
 * ```tsx
 * <TableCell align="right">
 *   <RowActions>
 *     <IconButton aria-label="Edit">…</IconButton>
 *     <IconButton aria-label="Delete">…</IconButton>
 *   </RowActions>
 * </TableCell>
 * ```
 *
 * Other props go to the wrapping `Box`, e.g. `role="group"` with an
 * `aria-label` to name each row's action set, or `sx` to change the gap.
 */
export function RowActions({ children, sx, ...props }: RowActionsProps) {
  return (
    <Box
      {...props}
      sx={[
        {
          display: 'inline-flex',
          flexWrap: 'nowrap',
          alignItems: 'center',
          gap: 0.25,
          whiteSpace: 'nowrap',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}
