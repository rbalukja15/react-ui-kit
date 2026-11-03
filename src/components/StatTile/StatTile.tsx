import * as React from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { Panel, PanelLabel } from '../Panel';

export interface StatTileProps {
  /** Small grey label, also the tile's accessible name. */
  label: string;
  /** Outline icon before the label. */
  icon?: React.ReactNode;
  /** The big number, already formatted (`'1,084,320'`, `84`). */
  value: React.ReactNode;
  /** Grey text after the number: a unit (`'L'`) or a total (`'of 117'`). */
  unit?: React.ReactNode;
  /** Top right: a trend `Pill` or a short grey note such as `'57% margin'`. */
  aside?: React.ReactNode;
  /** One grey line under the number. */
  note?: React.ReactNode;
  /** Anything else under the number, such as a `Meter` or a link. */
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * A single figure with its label, unit and one line of context.
 *
 * ```tsx
 * <StatTile label="Products sold" icon={<BoxIcon />} value={84} unit="of 117" note="33 products sold nothing" />
 * ```
 */
export function StatTile({ label, icon, value, unit, aside, note, children, sx }: StatTileProps) {
  return (
    <Panel aria-label={label} landmark={false} sx={sx} contentSx={{ p: '16px 18px', gap: 1.25 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minHeight: 22 }}>
        <PanelLabel icon={icon}>{label}</PanelLabel>
        {typeof aside === 'string' ? (
          <Typography component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {aside}
          </Typography>
        ) : (
          aside
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, flexWrap: 'wrap' }}>
        <Typography
          component="span"
          sx={{ fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </Typography>
        {unit !== undefined && (
          <Typography component="span" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            {unit}
          </Typography>
        )}
      </Box>
      {note !== undefined && (
        <Typography component="div" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
          {note}
        </Typography>
      )}
      {children}
    </Panel>
  );
}
