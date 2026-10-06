import * as React from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useLocalizationContext } from '@mui/x-date-pickers/internals';
import dayjs, { type Dayjs } from 'dayjs';

/**
 * Texts of the picker that can be translated. Every key is optional and
 * defaults to MUI's English text, or to the text an app-level
 * `LocalizationProvider` sets. Only keys that work the same way in every
 * supported MUI X major are listed; set any other key on your own
 * `LocalizationProvider`, which the field respects.
 */
export interface DatePickerFieldLocaleText {
  /**
   * Accessible name of the button that opens the calendar. Receives the
   * selected date written out for reading (`'Oct 12, 2026'` in English), or
   * `null` while the field is empty. MUI's default reads "Choose date" and
   * "Choose date, selected date is Oct 12, 2026".
   */
  openDatePickerDialogue?: (formattedDate: string | null) => string;
  /** Accessible name of the calendar's previous-month button. */
  previousMonth?: string;
  /** Accessible name of the calendar's next-month button. */
  nextMonth?: string;
  /** Accessible name of the button that switches between the day and year views. */
  calendarViewSwitchingButtonAriaLabel?: (view: 'year' | 'month' | 'day') => string;
  /** Title of the toolbar the mobile picker shows above the calendar. */
  datePickerToolbarTitle?: string;
  /** Label of the OK button (mobile picker). */
  okButtonLabel?: string;
  /** Label of the Cancel button (mobile picker). */
  cancelButtonLabel?: string;
  /** Label of the Clear button, when the picker shows one. */
  clearButtonLabel?: string;
  /** Label of the Today button, when the picker shows one. */
  todayButtonLabel?: string;
  /** Placeholder of the day part of the empty field. MUI's default is `'DD'`. */
  fieldDayPlaceholder?: () => string;
  /**
   * Placeholder of the month part of the empty field. `contentType` is
   * `'letter'` for a month written as a name (`MMM`), and `'digit'` for a
   * number. MUI's default is `'MMMM'` or `'MM'`.
   */
  fieldMonthPlaceholder?: (params: { contentType: string }) => string;
  /**
   * Placeholder of the year part of the empty field, given how many digits
   * the format writes. MUI's default is that many `'Y'`s.
   */
  fieldYearPlaceholder?: (params: { digitAmount: number }) => string;
}

export interface DatePickerFieldProps {
  /**
   * The date, as an ISO `YYYY-MM-DD` string, or `''` when empty. Anything
   * that does not start with a real `YYYY-MM-DD` date shows as an empty
   * field; a time after the date is ignored.
   */
  value: string;
  /**
   * Called with the new date as an ISO `YYYY-MM-DD` string, or with `''` when
   * the field is cleared or holds a date that is still incomplete or does not
   * exist (`31/02`). It never receives a half-typed date; a year below 1000
   * counts as one still being typed.
   */
  onChange: (value: string) => void;
  /**
   * Called when focus leaves the field. With the sectioned field of MUI X 8
   * and later, moving between the day, month and year parts does not count.
   */
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  /** The field's label. */
  label: React.ReactNode;
  /**
   * Marks the field as required: MUI adds the asterisk to the label and the
   * `required` attribute to the input. The label text itself is not changed.
   *
   * Up to MUI X 7 that input is the text box screen readers announce. From
   * MUI X 8 it is a hidden input behind the day, month and year parts, and
   * MUI X marks none of the parts as required, so screen readers are not
   * told; say so in the label or `helperText` where it matters.
   */
  required?: boolean;
  /** Disables the field and its calendar button. */
  disabled?: boolean;
  /** Hint shown under the field. Replaced by `errorMessage` while there is one. */
  helperText?: React.ReactNode;
  /**
   * A validation message. A non-empty string puts the field in its error
   * state (`aria-invalid`) and is shown instead of `helperText`. Without one,
   * the field still turns invalid on its own while it holds a date the
   * picker rejects (outside `minDate`/`maxDate`, or a date that does not
   * exist), but shows no message.
   */
  errorMessage?: string;
  /**
   * Puts the field in its error state (`aria-invalid`) without a message,
   * for example for a failed rule that has none. `helperText` stays shown.
   * A non-empty `errorMessage` turns the field invalid on its own.
   */
  error?: boolean;
  /** The field's size. Defaults to `'medium'`. */
  size?: 'small' | 'medium';
  /** Stretches the field to the width of its container. */
  fullWidth?: boolean;
  /**
   * How the date is shown and typed, as a dayjs format such as
   * `'DD/MM/YYYY'`. Defaults to the locale's short date (`MM/DD/YYYY` in
   * English, `DD.MM.YYYY` in German), so it follows `adapterLocale`. The
   * empty field's placeholder follows it too. The value passed to `onChange`
   * is always ISO, whatever the format.
   */
  format?: string;
  /** The earliest date the calendar offers, as ISO `YYYY-MM-DD`. */
  minDate?: string;
  /** The latest date the calendar offers, as ISO `YYYY-MM-DD`. */
  maxDate?: string;
  /** Disables the dates before today. */
  disablePast?: boolean;
  /** Disables the dates after today. */
  disableFuture?: boolean;
  /**
   * The dayjs locale for month and weekday names, the first day of the week
   * and the default `format`, such as `'de'` or `'en-gb'`. Load it first
   * (`import 'dayjs/locale/de'`). When left out, the field uses the locale of
   * an app-level `LocalizationProvider`, or dayjs's global locale without one.
   */
  adapterLocale?: string;
  /**
   * Translations for the picker's own texts, merged over those of an
   * app-level `LocalizationProvider`, which in turn win over MUI's English.
   */
  localeText?: DatePickerFieldLocaleText;
  /**
   * The input's `name` attribute. A native form submission (`FormData`, a
   * plain POST) posts the date as displayed, in `format` (`05.10.2026` with
   * the German default), not the ISO value: read the ISO date from
   * `onChange` instead.
   */
  name?: string;
  /**
   * Ref to the field's `<input>`. Its `focus()` focuses the field. It holds
   * the field's value as text. With MUI X 8 and later it is a hidden input
   * behind the editable day, month and year parts.
   */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Styles for the field's root element. */
  sx?: SxProps<Theme>;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

/** The date at the start of `value`, or `null` when there is no real one. */
function parseIsoDate(value: string | undefined): Dayjs | null {
  const match = value ? ISO_DATE.exec(value) : null;
  if (!match) return null;
  const date = dayjs(match[0]);
  // dayjs rolls 2026-02-30 over to March 2 instead of rejecting it.
  return date.isValid() && date.format('YYYY-MM-DD') === match[0] ? date : null;
}

/**
 * ISO `YYYY-MM-DD`, or `''` for an empty or invalid date, or one whose year
 * is still being typed: typing 2026 into the year passes through 0202, which
 * the picker reports as a valid date.
 */
function toIsoDate(date: Dayjs | null): string {
  if (!date || !date.isValid() || date.year() < 1000) return '';
  // Formatted in `en`, so a locale that writes its own digits cannot change them.
  return date.locale('en').format('YYYY-MM-DD');
}

/** A copy of `props` without the keys whose value is `undefined`. */
function withoutUndefined<T extends object>(props: T): Partial<T> {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined)) as Partial<T>;
}

interface DateAdapterLike {
  isValid: (value: unknown) => boolean;
  format: (value: unknown, formatKey: string) => string;
}

function isDateAdapter(value: unknown): value is DateAdapterLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Partial<DateAdapterLike>).isValid === 'function' &&
    typeof (value as Partial<DateAdapterLike>).format === 'function'
  );
}

/**
 * Wraps `openDatePickerDialogue` so one function fits every MUI X major,
 * which call it with `(date, adapter)` in v6, `(date, adapter, formattedDate)`
 * in v7 and `(formattedDate)` from v8 on.
 */
function toPickerOpenLabel(label: (formattedDate: string | null) => string) {
  return (first: unknown, adapter?: unknown, third?: unknown): string => {
    if (typeof first === 'string') return label(first);
    if (typeof third === 'string') return label(third);
    if (first != null && isDateAdapter(adapter) && adapter.isValid(first)) {
      return label(adapter.format(first, 'fullDate'));
    }
    return label(null);
  };
}

/**
 * The caller's texts in the shape the picker reads. Keys set to `undefined`
 * are dropped: merged over the app's texts they would blank them out.
 */
function toPickerLocaleText(localeText: DatePickerFieldLocaleText | undefined) {
  if (!localeText) return undefined;
  const { openDatePickerDialogue, ...rest } = withoutUndefined(localeText);
  return openDatePickerDialogue
    ? { ...rest, openDatePickerDialogue: toPickerOpenLabel(openDatePickerDialogue) }
    : rest;
}

/**
 * Whether an app-level `LocalizationProvider` above supplies a dayjs adapter
 * the field can share.
 *
 * MUI X 9 no longer exports the adapter context, and the public hook that
 * reads it (`usePickerAdapter`, from 8 on) throws without a provider, so the
 * one reader present in every supported major is `useLocalizationContext`
 * from `internals`. When it throws it has called fewer hooks than when it
 * returns, so a provider that gains or loses its adapter while the field
 * stays mounted is not supported; app-level providers are set up once.
 */
function useAppDayjsAdapter(): boolean {
  let context: unknown;
  try {
    context = useLocalizationContext();
  } catch {
    return false;
  }
  // `utils` up to v8, `adapter` from v8 on.
  const { adapter, utils } = context as { adapter?: unknown; utils?: unknown };
  const shared = adapter ?? utils;
  return typeof shared === 'object' && shared !== null && (shared as { lib?: unknown }).lib === 'dayjs';
}

/**
 * Supplies the adapter and texts the picker reads. Sharing the app's
 * adapter keeps its locale, formats and dayjs instance; otherwise the field
 * makes its own dayjs adapter, so it works without any provider. Texts merge
 * over the app's, so keys the caller leaves out keep the app's wording.
 */
function DatePickerLocalization({
  adapterLocale,
  localeText,
  children,
}: Pick<DatePickerFieldProps, 'adapterLocale' | 'localeText'> & { children: React.ReactNode }) {
  const shareAppAdapter = useAppDayjsAdapter() && adapterLocale === undefined;
  const pickerLocaleText = React.useMemo(() => toPickerLocaleText(localeText), [localeText]);
  return (
    // Without a `dateAdapter`, a nested LocalizationProvider reuses the one
    // above it (every major); with one, it makes a new adapter.
    <LocalizationProvider
      dateAdapter={shareAppAdapter ? undefined : AdapterDayjs}
      adapterLocale={adapterLocale}
      localeText={pickerLocaleText}
    >
      {children}
    </LocalizationProvider>
  );
}

/**
 * A date input with a popover calendar, built on MUI X `DatePicker`, whose
 * value is a plain ISO `YYYY-MM-DD` string: `''` when empty, never a half-typed
 * date. Dates can be typed in the display `format` or picked from the
 * calendar.
 *
 * ```tsx
 * const [start, setStart] = React.useState('');
 * <DatePickerField label="Start date" value={start} onChange={setStart} />
 * ```
 *
 * It needs `@mui/x-date-pickers` (6.2 or later) and `dayjs`, and is imported
 * from `@rbalukja15/ui-components/date-picker` so apps without them can still
 * use the main entry. No `LocalizationProvider` is needed. When the app has
 * one with a dayjs adapter, the field uses its locale and texts unless
 * `adapterLocale` or `localeText` say otherwise. With a different adapter
 * (date-fns, Luxon, …) the field still uses dayjs, and only the app's texts
 * carry over.
 *
 * While a typed date is incomplete the field keeps the text and `onChange`
 * receives `''`; echoing that `''` back as `value` does not clear what was
 * typed. Setting `value` to anything else replaces it.
 *
 * `minDate`, `maxDate`, `disablePast` and `disableFuture` restrict the
 * calendar. A date typed outside them still reaches `onChange` and marks the
 * field invalid, so validate the range in the form as well. For
 * react-hook-form, use `RhfDatePickerField` from
 * `@rbalukja15/ui-components/date-picker/rhf`.
 */
export function DatePickerField({
  value,
  onChange,
  onBlur,
  label,
  required,
  disabled,
  helperText,
  errorMessage,
  error,
  size,
  fullWidth,
  format,
  minDate,
  maxDate,
  disablePast,
  disableFuture,
  adapterLocale,
  localeText,
  name,
  inputRef,
  sx,
}: DatePickerFieldProps) {
  // The picker's own value, which can be an invalid date while one is being
  // typed. It follows `value` unless `value` is just the ISO form of what the
  // picker holds already: that is the parent echoing `onChange`, and
  // replacing the picker's value then would wipe a half-typed date.
  const [picker, setPicker] = React.useState(() => ({ value, date: parseIsoDate(value) }));
  let date = picker.date;
  if (picker.value !== value) {
    date = toIsoDate(picker.date) === value ? picker.date : parseIsoDate(value);
    setPicker({ value, date });
  }

  const handleChange = (next: Dayjs | null) => {
    const iso = toIsoDate(next);
    setPicker({ value: iso, date: next });
    onChange(iso);
  };

  const handleBlur = onBlur
    ? (event: React.FocusEvent<HTMLElement>) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        onBlur(event);
      }
    : undefined;

  const hasError = error === true || Boolean(errorMessage);
  const min = React.useMemo(() => parseIsoDate(minDate), [minDate]);
  const max = React.useMemo(() => parseIsoDate(maxDate), [maxDate]);

  return (
    <DatePickerLocalization adapterLocale={adapterLocale} localeText={localeText}>
      <DatePicker
        label={label}
        value={date}
        onChange={handleChange}
        disabled={disabled}
        disablePast={disablePast}
        disableFuture={disableFuture}
        {...(format ? { format } : {})}
        {...(min ? { minDate: min } : {})}
        {...(max ? { maxDate: max } : {})}
        slotProps={{
          // Only the props that are set: an `undefined` here would override
          // what the picker itself passes the field. That is also why there
          // is no `id` prop: the calendar dialog is named after the label of
          // the id the picker generates, so an id set here leaves it unnamed.
          textField: withoutUndefined({
            name,
            inputRef,
            sx,
            size,
            fullWidth,
            required,
            onBlur: handleBlur,
            // Left out, not false, without a message, so the picker can still
            // flag a date it rejects.
            error: hasError ? true : undefined,
            helperText: errorMessage ? errorMessage : helperText,
          }),
        }}
      />
    </DatePickerLocalization>
  );
}
