import * as React from 'react';
import { Box } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';
import { kit } from '../../internal/kitTokens';

export type PillTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface PillProps {
  children: React.ReactNode;
  /**
   * `neutral` is a filled grey badge (counts). The others are a pale tint
   * with a matching outline and strong text (trends, overdue, low stock).
   * Defaults to `'neutral'`.
   */
  tone?: PillTone;
  /** Leading outline icon, about 12px. */
  icon?: React.ReactNode;
  /** `small` for counts and header badges, `medium` for table cells. Defaults to `'small'`. */
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}

/**
 * A rounded label for counts, trends and warnings. It is plain text, not a
 * control; use `FilterChips` for choices.
 *
 * ```tsx
 * <Pill tone="primary" icon={<TrendUpIcon />}>6% vs Sep</Pill>
 * <Pill tone="warning">4 overdue</Pill>
 * ```
 */
export function Pill({ children, tone = 'neutral', icon, size = 'small', sx }: PillProps) {
  return (
    <Box
      component="span"
      sx={[
        (theme) => {
          const base = {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            flex: 'none',
            whiteSpace: 'nowrap' as const,
            borderRadius: '999px',
            fontWeight: 600,
            lineHeight: 1.4,
            fontVariantNumeric: 'tabular-nums',
            padding: size === 'small' ? '2px 8px' : '3px 10px',
            fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
            '& > svg': { flex: 'none', width: size === 'small' ? 12 : 13, height: size === 'small' ? 12 : 13 },
          };
          if (tone === 'neutral') {
            return { ...base, bgcolor: kit(theme).surface.track, color: theme.palette.text.primary, border: '1px solid transparent' };
          }
          const color = theme.palette[tone];
          const light = theme.palette.mode === 'light';
          return {
            ...base,
            bgcolor: alpha(color.main, light ? 0.08 : 0.16),
            border: `1px solid ${alpha(color.main, light ? 0.32 : 0.4)}`,
            color: light ? (tone === 'primary' ? color.main : color.dark) : color.light,
          };
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {icon}
      {children}
    </Box>
  );
}
