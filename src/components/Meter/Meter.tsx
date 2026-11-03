import * as React from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { kit } from '../../internal/kitTokens';

export interface MeterProps {
  /** Current value, between `min` and `max`. Values outside are clamped. */
  value: number;
  min?: number;
  /** Defaults to `100`. */
  max?: number;
  /** Accessible name, e.g. `'Profit margin'`. */
  'aria-label'?: string;
  /** Read out instead of the bare number, e.g. `'57%'`. */
  valueText?: string;
  /** Fill colour: a palette key or any CSS colour. Defaults to `'primary'`. */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'muted' | (string & {});
  /** Bar thickness in px. Defaults to `6`. */
  height?: number;
  sx?: SxProps<Theme>;
}

const paletteKeys = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];

/**
 * A thin rounded bar showing how full something is: a margin, a share of
 * revenue, stock against its reorder point.
 */
export function Meter({
  value,
  min = 0,
  max = 100,
  'aria-label': ariaLabel,
  valueText,
  color = 'primary',
  height = 6,
  sx,
}: MeterProps) {
  const clamped = Math.min(max, Math.max(min, value));
  const percent = max === min ? 0 : ((clamped - min) / (max - min)) * 100;

  return (
    <Box
      role="meter"
      aria-label={ariaLabel}
      aria-valuenow={clamped}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={valueText}
      sx={[
        (theme) => ({ height, borderRadius: '999px', bgcolor: kit(theme).surface.track, overflow: 'hidden', minWidth: 24 }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={(theme) => ({
          height: '100%',
          width: `${percent}%`,
          borderRadius: '999px',
          bgcolor:
            color === 'muted'
              ? kit(theme).chart.muted
              : paletteKeys.includes(color)
                ? theme.palette[color as 'primary'].main
                : color,
        })}
      />
    </Box>
  );
}
