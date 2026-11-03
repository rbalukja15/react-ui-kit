import * as React from 'react';
import { Box } from '@mui/material';
import { kit } from '../../internal/kitTokens';

export interface TwoLineCellProps {
  /** First line, e.g. a product name or a link to it. */
  primary: React.ReactNode;
  /** Small grey second line. */
  secondary?: React.ReactNode;
  /** Outline icon shown in a small rounded tile before the text. Hidden on phones, where the column needs the room. */
  icon?: React.ReactNode;
  /** `right` for figures: `57 bottles` over `Sep: 61`. Defaults to `'left'`. */
  align?: 'left' | 'right';
  /** Bold first line, for the figure in a numeric column. Defaults to `false`. */
  strong?: boolean;
}

/**
 * Table cell content on two lines: a name over a grey category, or a figure
 * over its previous value. Use it in a `DataTable` column's `cell`.
 */
export function TwoLineCell({ primary, secondary, icon, align = 'left', strong = false }: TwoLineCellProps) {
  const text = (
    <Box sx={{ minWidth: 0, textAlign: align }}>
      <Box sx={{ fontWeight: strong ? 600 : 500, fontVariantNumeric: 'tabular-nums' }}>{primary}</Box>
      {secondary !== undefined && (
        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{secondary}</Box>
      )}
    </Box>
  );
  if (icon === undefined) return text;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        aria-hidden="true"
        sx={(theme) => ({
          flex: 'none',
          width: 34,
          height: 34,
          borderRadius: '10px',
          border: `1px solid ${kit(theme).line.strong}`,
          bgcolor: 'background.paper',
          color: 'text.secondary',
          display: { xs: 'none', sm: 'inline-flex' },
          alignItems: 'center',
          justifyContent: 'center',
          '& > svg': { width: 18, height: 18 },
        })}
      >
        {icon}
      </Box>
      {text}
    </Box>
  );
}
