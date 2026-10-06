import * as React from 'react';
import { Box, Chip, Divider, Menu, MenuItem, Tooltip, type ChipProps } from '@mui/material';

export type StatusChipColor = NonNullable<ChipProps['color']>;

/** An extra menu entry shown above the status options, e.g. "Complete and record visit". */
export interface StatusChipAction {
  key: string;
  label: React.ReactNode;
  onClick: () => void;
}

export interface StatusChipProps<S extends string = string>
  extends Omit<ChipProps, 'label' | 'color' | 'onClick' | 'onChange' | 'children'> {
  /** The current status. */
  status: S;
  /**
   * The statuses the current one may move to. With none (and no `actions`),
   * or without `onChange`, the chip renders as a plain, non-interactive label.
   */
  options?: readonly S[];
  /** Called with the picked status. */
  onChange?: (next: S) => void;
  /** Display text for a status. Defaults to the status itself. */
  getLabel?: (status: S) => React.ReactNode;
  /** Chip color per status; statuses without one use `'default'`. */
  colors?: Partial<Record<S, StatusChipColor>>;
  /** Extra entries listed above the status options, separated by a divider. */
  actions?: readonly StatusChipAction[];
  /** Tooltip describing what clicking the chip does. Defaults to `'Change status'`. */
  changeLabel?: string;
}

/** ArrowDropDown, inlined so the kit does not need `@mui/icons-material`. */
function Caret() {
  return (
    <svg aria-hidden="true" focusable="false" width="1.25em" height="1.25em" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: -2 }}>
      <path d="m7 10 5 5 5-5z" />
    </svg>
  );
}

/**
 * A status chip that opens a menu of the statuses it may move to next, so a
 * row's status changes in one step instead of through an edit form:
 *
 * ```tsx
 * <StatusChip
 *   status={order.status}
 *   options={nextStatuses[order.status]}
 *   colors={{ pending: 'warning', shipped: 'info', delivered: 'success' }}
 *   getLabel={(s) => t(`orders.status.${s}`)}
 *   onChange={(next) => updateStatus(order.id, next)}
 * />
 * ```
 *
 * Leave out `onChange` (e.g. for a read-only user) or pass no `options` and
 * it renders as a plain chip.
 */
export function StatusChip<S extends string = string>({
  status,
  options = [],
  onChange,
  getLabel = (s) => s,
  colors,
  actions = [],
  changeLabel = 'Change status',
  size = 'small',
  disabled,
  sx,
  ...chipProps
}: StatusChipProps<S>) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const clickable = !!onChange && !disabled && (options.length > 0 || actions.length > 0);
  const label = getLabel(status);
  const close = () => setAnchorEl(null);

  const chip = (
    <Chip
      {...chipProps}
      size={size}
      disabled={disabled}
      color={colors?.[status] ?? 'default'}
      label={
        clickable ? (
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
            {label}
            <Caret />
          </Box>
        ) : (
          label
        )
      }
      onClick={clickable ? (e) => setAnchorEl(e.currentTarget) : undefined}
      aria-haspopup={clickable ? 'menu' : undefined}
      aria-expanded={clickable ? !!anchorEl : undefined}
      sx={[{ cursor: clickable ? 'pointer' : 'default' }, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );

  if (!clickable) return chip;

  return (
    <>
      {/* `describeChild` so the tooltip describes the chip rather than naming
          it: as a name it would replace the chip's text, and a screen reader
          would hear "Change status" instead of the current status. */}
      <Tooltip title={changeLabel} describeChild>
        {chip}
      </Tooltip>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={close}>
        {/* Arrays rather than fragments: MenuList reads its direct children to
            wire arrow-key navigation, and a fragment hides them. */}
        {actions.length > 0
          ? [
              ...actions.map((action) => (
                <MenuItem
                  key={`action-${action.key}`}
                  onClick={() => {
                    close();
                    action.onClick();
                  }}
                  sx={{ minHeight: 44, fontWeight: 600 }}
                >
                  {action.label}
                </MenuItem>
              )),
              ...(options.length > 0
                ? // `component="li"`: a MenuList is a <ul>, and a bare Divider is an <hr>.
                  [<Divider key="actions-divider" component="li" />]
                : []),
            ]
          : null}
        {options.map((option) => (
          <MenuItem
            key={option}
            onClick={() => {
              close();
              onChange(option);
            }}
            sx={{ minHeight: 44 }}
          >
            {getLabel(option)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
