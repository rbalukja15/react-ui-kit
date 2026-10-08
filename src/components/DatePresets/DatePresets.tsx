import * as React from 'react';
import { Box, Chip, type ChipProps, type SxProps, type Theme } from '@mui/material';

export type DatePresetUnit = 'day' | 'week' | 'month' | 'year';

export interface DatePreset {
  label: React.ReactNode;
  /** How many `unit`s to add to the base date. Negative values go back in time. */
  amount: number;
  unit: DatePresetUnit;
  /** Defaults to `${amount}${unit}`. */
  key?: string;
}

export const DEFAULT_DATE_PRESETS: readonly DatePreset[] = [
  { label: '+1 month', amount: 1, unit: 'month' },
  { label: '+3 months', amount: 3, unit: 'month' },
  { label: '+1 year', amount: 1, unit: 'year' },
];

export interface DatePresetsProps {
  /** Called with the picked date as an ISO `YYYY-MM-DD` string, and as a local `Date`. */
  onPick: (iso: string, date: Date) => void;
  /** Defaults to `+1 month`, `+3 months` and `+1 year`. */
  presets?: readonly DatePreset[];
  /**
   * The date presets count from, read when a chip is clicked so it follows
   * edits to another field. An ISO `YYYY-MM-DD` string or a `Date`; when it
   * returns nothing or an invalid date, presets count from today.
   */
  getBaseDate?: () => string | Date | null | undefined;
  /** Accessible name of the chip group. Defaults to `'Date presets'`. */
  label?: string;
  disabled?: boolean;
  size?: ChipProps['size'];
  variant?: ChipProps['variant'];
  sx?: SxProps<Theme>;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses `YYYY-MM-DD` as a local date (not UTC midnight); `null` when invalid. */
function parseIsoDate(value: string): Date | null {
  const match = ISO_DATE.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

/** Formats a date as a local `YYYY-MM-DD` string. */
function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${String(date.getFullYear()).padStart(4, '0')}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Adds `amount` `unit`s to a date and returns a new one. Months and years
 * clamp to the last day of the target month, so Jan 31 + 1 month is Feb 28
 * (or 29), never Mar 3.
 */
export function addToDate(date: Date, amount: number, unit: DatePresetUnit): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (unit === 'day' || unit === 'week') {
    result.setDate(result.getDate() + amount * (unit === 'week' ? 7 : 1));
    return result;
  }
  const months = unit === 'year' ? amount * 12 : amount;
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

function resolveBase(raw: string | Date | null | undefined): Date {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw;
  if (typeof raw === 'string') {
    const parsed = parseIsoDate(raw);
    if (parsed) return parsed;
  }
  return new Date();
}

/**
 * Quick-pick chips for a date field, such as "+1 month / +3 months / +1 year"
 * next to a "next due" date:
 *
 * ```tsx
 * <DatePresets
 *   getBaseDate={() => getValues('visitDate')}
 *   onPick={(iso) => setValue('nextDue', iso)}
 * />
 * ```
 *
 * Each chip adds its interval to `getBaseDate()` (or today) and calls
 * `onPick`. Pass `presets` to change the intervals or their labels.
 */
export function DatePresets({
  onPick,
  presets = DEFAULT_DATE_PRESETS,
  getBaseDate,
  label = 'Date presets',
  disabled,
  size = 'small',
  variant = 'outlined',
  sx,
}: DatePresetsProps) {
  return (
    <Box
      role="group"
      aria-label={label}
      sx={[{ display: 'flex', flexWrap: 'wrap', gap: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {presets.map((preset) => (
        <Chip
          key={preset.key ?? `${preset.amount}${preset.unit}`}
          label={preset.label}
          size={size}
          variant={variant}
          disabled={disabled}
          onClick={
            disabled
              ? undefined
              : () => {
                  const date = addToDate(resolveBase(getBaseDate?.()), preset.amount, preset.unit);
                  onPick(toIsoDate(date), date);
                }
          }
        />
      ))}
    </Box>
  );
}
