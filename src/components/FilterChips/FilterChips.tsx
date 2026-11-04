import * as React from 'react';
import { Box, ButtonBase } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';
import { CheckIcon } from '../../internal/outlineIcons';
import { kit } from '../../internal/kitTokens';

export interface FilterChipOption<V extends string> {
  value: V;
  label: React.ReactNode;
}

export interface FilterChipsProps<V extends string> {
  /** The choices, as values or `{ value, label }` pairs. */
  options: readonly (V | FilterChipOption<V>)[];
  /** The active choice. */
  value: V;
  onChange: (value: V) => void;
  /** Names the group for screen readers, e.g. `'Category'`. */
  'aria-label': string;
  sx?: SxProps<Theme>;
}

/**
 * A row of pill-shaped toggle buttons for one filter. The active one is
 * tinted with the primary colour and shows a check, so it reads as selected
 * without relying on colour alone.
 *
 * ```tsx
 * <FilterChips aria-label="Category" options={['All', 'Medicine', 'Food']} value={cat} onChange={setCat} />
 * ```
 */
export function FilterChips<V extends string>({ options, value, onChange, 'aria-label': ariaLabel, sx }: FilterChipsProps<V>) {
  return (
    <Box
      role="group"
      aria-label={ariaLabel}
      sx={[{ display: 'flex', flexWrap: 'wrap', gap: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {options.map((option) => {
        const { value: v, label } = typeof option === 'string' ? { value: option as V, label: option } : option;
        const active = v === value;
        return (
          <ButtonBase
            key={v}
            aria-pressed={active}
            onClick={() => onChange(v)}
            sx={(theme) => ({
              height: 36,
              px: '14px',
              gap: '6px',
              borderRadius: '999px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              fontFamily: 'inherit',
              color: active ? (theme.palette.mode === 'light' ? 'primary.main' : 'primary.light') : 'text.primary',
              bgcolor: active ? alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.08 : 0.16) : kit(theme).surface.card,
              border: `1px solid ${active ? alpha(theme.palette.primary.main, 0.4) : kit(theme).line.strong}`,
              transition: theme.transitions.create(['background-color', 'border-color'], { duration: 120 }),
              '&:hover': { bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : kit(theme).surface.tray },
              '&.Mui-focusVisible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
            })}
          >
            {active && <CheckIcon />}
            {label}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
