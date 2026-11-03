import * as React from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { kit } from '../../internal/kitTokens';

export interface ListRowProps {
  /** Main text, e.g. a pet's name. */
  primary: React.ReactNode;
  /** Grey text after the primary one, joined with a dot: `Luna · Ana Hoxha`. */
  meta?: React.ReactNode;
  /** Small grey line underneath. */
  secondary?: React.ReactNode;
  /** Fixed-width slot before the text, such as a time. */
  leading?: React.ReactNode;
  /** Right-aligned status or figure. */
  trailing?: React.ReactNode;
  /** Colour of a text `trailing`. `warning` and `error` are bold. Defaults to `'muted'`. */
  trailingTone?: 'default' | 'muted' | 'warning' | 'error';
  /** Makes the whole row a link. */
  href?: string;
  /** Router link component for `href`. Defaults to `<a>`. */
  LinkComponent?: React.ElementType;
  sx?: SxProps<Theme>;
}

const toneColor = {
  default: 'text.primary',
  muted: 'text.secondary',
  warning: 'warning.dark',
  error: 'error.dark',
} as const;

/**
 * One line of a compact list inside a `Panel`: a name, a grey sub-line and
 * a right-aligned status. Rows are separated by hairlines.
 *
 * ```tsx
 * <ListRow primary="Luna" meta="Ana Hoxha" secondary="Rabies booster" trailing="3 days overdue" trailingTone="warning" />
 * ```
 */
export function ListRow({
  primary,
  meta,
  secondary,
  leading,
  trailing,
  trailingTone = 'muted',
  href,
  LinkComponent,
  sx,
}: ListRowProps) {
  const link = href !== undefined ? { component: LinkComponent ?? 'a', href } : {};
  return (
    <Box
      {...link}
      sx={[
        (theme) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          py: 1,
          borderTop: `1px solid ${kit(theme).line.soft}`,
          fontSize: '0.875rem',
          color: 'text.primary',
          textDecoration: 'none',
          ...(href !== undefined && {
            '&:hover .ListRow-primary': { color: 'primary.main' },
            '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2, borderRadius: '4px' },
          }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {leading !== undefined && (
        <Box sx={{ width: 44, flex: 'none', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{leading}</Box>
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box className="ListRow-primary" sx={{ fontWeight: secondary !== undefined ? 500 : 400 }}>
          {primary}
          {meta !== undefined && (
            <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary' }}>
              {' · '}
              {meta}
            </Box>
          )}
        </Box>
        {secondary !== undefined && (
          <Typography component="div" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {secondary}
          </Typography>
        )}
      </Box>
      {trailing !== undefined && (
        <Box
          sx={{
            flex: 'none',
            fontSize: '0.75rem',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: trailingTone === 'warning' || trailingTone === 'error' ? 600 : 400,
            color: toneColor[trailingTone],
          }}
        >
          {trailing}
        </Box>
      )}
    </Box>
  );
}

export interface SummaryListItem {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Bold row above a stronger hairline, for a total. */
  total?: boolean;
}

/** Label and figure pairs with hairlines between them, ending in an optional total. */
export function SummaryList({ items, sx }: { items: readonly SummaryListItem[]; sx?: SxProps<Theme> }) {
  return (
    <Box component="dl" sx={[{ m: 0, fontSize: '0.875rem' }, ...(Array.isArray(sx) ? sx : [sx])]}>
      {items.map((item, i) => (
        <Box
          key={i}
          sx={(theme) => ({
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            py: item.total ? 1.25 : 1,
            borderTop: `1px solid ${item.total ? kit(theme).line.strong : kit(theme).line.soft}`,
            fontWeight: item.total ? 600 : 400,
          })}
        >
          <Box component="dt">{item.label}</Box>
          <Box component="dd" sx={{ m: 0, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
            {item.value}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
