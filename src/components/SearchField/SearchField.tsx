import * as React from 'react';
import { Box, InputAdornment, OutlinedInput } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { SearchIcon } from '../../internal/outlineIcons';

export interface SearchFieldProps {
  /** Accessible name, e.g. `'Search products'`. Not drawn; the placeholder shows instead. */
  label: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Input id. Generated when left out. */
  id?: string;
  /** `small` is 40px tall, `medium` 44px. Defaults to `'small'`. */
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
}

const visuallyHidden = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
} as const;

/**
 * A compact search input with a leading magnifier. Debounce it with
 * `useDebouncedValue`, or keep it in the URL with `useUrlSearch`.
 *
 * ```tsx
 * <SearchField label="Search products" placeholder="Name or barcode" value={q} onChange={setQ} />
 * ```
 */
export function SearchField({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  id,
  size = 'small',
  fullWidth,
  sx,
}: SearchFieldProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  return (
    <Box sx={[{ display: fullWidth ? 'block' : 'inline-block', position: 'relative' }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Box component="label" htmlFor={inputId} sx={visuallyHidden}>
        {label}
      </Box>
      <OutlinedInput
        id={inputId}
        type="search"
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange ? (event) => onChange(event.target.value, event as React.ChangeEvent<HTMLInputElement>) : undefined}
        fullWidth={fullWidth}
        size={size}
        startAdornment={
          <InputAdornment position="start" sx={{ color: 'text.secondary', mr: 0.5 }}>
            <SearchIcon />
          </InputAdornment>
        }
        sx={{ minHeight: size === 'small' ? 40 : 44, fontSize: '0.875rem' }}
      />
    </Box>
  );
}
