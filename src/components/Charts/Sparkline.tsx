import * as React from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { kit } from '../../internal/kitTokens';

export interface SparklineProps {
  values: readonly number[];
  /** Accessible name, ideally with the values: `'Weekly sales, last 12 weeks: 2, 3, 2, …'`. */
  'aria-label': string;
  /** Bar drawn in the primary colour. Defaults to the last one; `null` for none. */
  highlightIndex?: number | null;
  /** Defaults to `120`. */
  width?: number;
  /** Defaults to `26`. */
  height?: number;
  sx?: SxProps<Theme>;
}

/** A tiny bar chart that fits in a table cell, such as 12 weeks of sales. */
export function Sparkline({ values, 'aria-label': ariaLabel, highlightIndex, width = 120, height = 26, sx }: SparklineProps) {
  const max = Math.max(0, ...values) || 1;
  const highlight = highlightIndex === undefined ? values.length - 1 : highlightIndex;
  return (
    <Box
      role="img"
      aria-label={ariaLabel}
      sx={[{ display: 'flex', alignItems: 'flex-end', gap: '3px', width, height }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {values.map((v, i) => (
        <Box
          key={i}
          sx={(theme) => ({
            flex: '1 1 0',
            height: Math.max(3, Math.round((v / max) * height)),
            borderRadius: '2px',
            bgcolor: i === highlight ? theme.palette.primary.main : kit(theme).chart.muted,
          })}
        />
      ))}
    </Box>
  );
}
