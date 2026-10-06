import * as React from 'react';
import { Box } from '@mui/material';

export interface RowActionsProps {
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
 */
export function RowActions({ children }: RowActionsProps) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        flexWrap: 'nowrap',
        alignItems: 'center',
        gap: 0.25,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Box>
  );
}
