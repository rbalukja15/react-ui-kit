import * as React from 'react';
import { Button, type ButtonProps } from '@mui/material';
import { ChevronDownIcon } from '../../internal/outlineIcons';

export interface DropdownButtonProps extends Omit<ButtonProps, 'variant' | 'endIcon' | 'startIcon'> {
  /** Leading outline icon, such as a calendar for a date range. */
  icon?: React.ReactNode;
  /** Set while its menu or picker is open; drives `aria-expanded`. */
  open?: boolean;
}

/**
 * An outlined button with a chevron that opens a menu or picker: a date
 * range (`1 – 31 Oct 2026`), a period (`Last 12 months`). Wire `onClick` to
 * your own `Menu`, `Popover` or date picker.
 */
export const DropdownButton = /* @__PURE__ */ React.forwardRef<HTMLButtonElement, DropdownButtonProps>(function DropdownButton(
  { icon, open, children, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant="outlined"
      aria-haspopup="true"
      aria-expanded={open}
      startIcon={icon}
      endIcon={<ChevronDownIcon />}
      {...props}
      sx={[
        {
          fontVariantNumeric: 'tabular-nums',
          '& .MuiButton-startIcon, & .MuiButton-endIcon': { color: 'text.secondary' },
          '& .MuiButton-startIcon > svg': { width: 18, height: 18 },
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    >
      {children}
    </Button>
  );
});
