import * as React from 'react';
import {
  Autocomplete,
  Box,
  CircularProgress,
  ListSubheader,
  TextField,
  createFilterOptions,
  type AutocompleteRenderInputParams,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { isCreateOption, withCreateOption, type CreateOption } from './createOption';

/**
 * One choice in an {@link IdAutocomplete}. Extra fields (an email, a code, …)
 * belong on your own option type, which may be an interface: the picker is
 * generic over it, so `onChange` and `onChangeOption` hand back that type.
 */
export interface IdOption {
  /**
   * What the picker stores when this option is chosen: `onChange` and the
   * react-hook-form adapter always write this field, so a form that stores a
   * code rather than a database id puts the code here. Numbers and strings
   * both work; the value is matched to an option by `String(id)` unless
   * `isOptionEqualToValue` says otherwise. `''` means "nothing chosen", so it
   * cannot be a real option's id.
   */
  id: number | string;
  /** The text shown in the list and, once chosen, in the input. */
  label: string;
  /** Optional second line shown under the label in the list. */
  sublabel?: string;
  /**
   * A header drawn over this option and the ones after it that share it, such
   * as "Recent" rows at the top of the list. Options with a group must come
   * first and together; the options after them get no header.
   */
  group?: string;
}

export interface IdAutocompleteProps<TOption extends IdOption = IdOption> {
  /** The choices. */
  options: readonly TOption[];
  /**
   * The id of the chosen option. `null`, `undefined` and `''` all mean
   * nothing is chosen, so form state that starts empty in any of those ways
   * works without conversion.
   */
  value: IdOption['id'] | null | undefined;
  /**
   * Called when the user picks an option, with its id and the option itself,
   * or with `null, null` when the field is cleared. Not called for the create
   * row: that calls `onCreate` instead.
   */
  onChange: (id: TOption['id'] | null, option: TOption | null) => void;
  /**
   * Called after `onChange` with the chosen option, or `null` when cleared.
   * Handy where `onChange` is owned by a form library, for example to fill
   * other fields from the option's extra data.
   */
  onChangeOption?: (option: TOption | null) => void;
  /** Called when focus leaves the field. */
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  /** The field's label. */
  label: React.ReactNode;
  /**
   * Marks the field as required: MUI adds the asterisk to the label and the
   * `required` attribute to the input. The label text itself is not changed.
   */
  required?: boolean;
  /** Disables the field. */
  disabled?: boolean;
  /** Hint shown under the field. Replaced by `errorMessage` while there is one. */
  helperText?: React.ReactNode;
  /**
   * A validation message. A non-empty string puts the field in its error
   * state (`aria-invalid`) and is shown instead of `helperText`.
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
   * Compares an option with the stored `value`, for when the default does
   * not match them. Defaults to `String(option.id) === String(value)`, which
   * already matches a stored `'7'` with an option id of `7`. Never called
   * while the value is empty.
   *
   * It only changes how the value is read back: a pick always reports the
   * option's `id`, as the first argument of `onChange` and as the
   * react-hook-form field value. A controlled caller that stores another
   * field can save it from the option, `onChange`'s second argument, and
   * match it here.
   */
  isOptionEqualToValue?: (option: TOption, value: IdOption['id']) => boolean;
  /**
   * Called with the text as the user types (not when the picker rewrites the
   * text itself, for example after a pick). Use it to search on the server:
   * own the query and debouncing, and pass the results back as `options`.
   *
   * While it is set, the picker does not filter `options` itself, since the
   * server already did and may match on more than the label. Keep the chosen
   * option in `options` when nothing has been searched yet, or fetch it by
   * id, so the input can show its label; once shown, it stays shown while
   * later results leave it out.
   */
  onInputChange?: (text: string) => void;
  /**
   * Shows a spinner in the input, and `loadingText` in the list while it has
   * no options, for example while a search is in flight. On MUI 5 to 7,
   * screen readers are not told that a search is running or found nothing:
   * MUI only puts `loadingText` and `noOptionsText` in a live region from
   * MUI 9.
   */
  loading?: boolean;
  /**
   * Offers a last row for creating a new record from what was typed, shown
   * while text is typed unless an option already has exactly that label
   * (ignoring case and surrounding spaces). Picking it calls this with the
   * typed text, trimmed, and leaves the value alone: open your create flow,
   * then set the value to the new record's id and keep that record in
   * `options` (see `withPinnedOption`).
   */
  onCreate?: (typed: string) => void;
  /** Text of the create row. Defaults to `` (typed) => `Add "${typed}"` ``. */
  createLabel?: (typed: string) => string;
  /**
   * Shown in the list when no option matches. Defaults to MUI's
   * `'No options'`. Screen readers only hear it from MUI 9, which puts it in
   * a live region; see `loading`.
   */
  noOptionsText?: React.ReactNode;
  /**
   * Shown in the list while `loading` and there are no options. Defaults to
   * MUI's `'Loading…'`. A string also names the spinner for screen readers.
   */
  loadingText?: React.ReactNode;
  /** Accessible name of the clear button. Defaults to MUI's `'Clear'`. */
  clearText?: string;
  /** Accessible name of the button that opens the list. Defaults to MUI's `'Open'`. */
  openText?: string;
  /** Accessible name of the button that closes the list. Defaults to MUI's `'Close'`. */
  closeText?: string;
  /** `id` of the input. A unique one is used when omitted. */
  id?: string;
  /**
   * `name` attribute of the input. A native form submission (`FormData`, a
   * plain POST) posts the input's text, which is the chosen option's label,
   * not its id: read the id from `onChange`.
   */
  name?: string;
  /** Placeholder shown in the empty input. */
  placeholder?: string;
  /** Focuses the input on mount. */
  autoFocus?: boolean;
  /** Ref to the `<input>` element, for example to focus it. */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Styles for the root element. */
  sx?: SxProps<Theme>;
}

type Row<TOption extends IdOption> = TOption | CreateOption;

const defaultCreateLabel = (typed: string) => `Add "${typed}"`;

/** Add, inlined so the kit does not need `@mui/icons-material`. */
function PlusIcon() {
  return (
    <svg aria-hidden="true" focusable="false" width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

/** The `li` props MUI passes to `renderOption`, minus the `key` it includes in newer versions. */
function withoutKey<T extends object>(props: T): Omit<T, 'key'> {
  const { key, ...rest } = props as T & { key?: React.Key };
  void key;
  return rest;
}

/**
 * Props that add `node` before the input's end adornment (the clear and open
 * buttons). MUI 5 to 7 pass the input's props to `renderInput` as
 * `InputProps`; MUI 9 passes them as `slotProps.input`, and its `TextField`
 * reads only that. Whichever one MUI provided is extended, so one source works
 * on every supported major.
 */
function withEndAdornment(params: AutocompleteRenderInputParams, node: React.ReactNode): object {
  type InputSlot = { endAdornment?: React.ReactNode };
  const shape = params as unknown as { InputProps?: InputSlot; slotProps?: { input?: InputSlot } };
  const extend = (input: InputSlot) => ({
    ...input,
    endAdornment: (
      <>
        {node}
        {input.endAdornment}
      </>
    ),
  });
  if (shape.slotProps?.input) return { slotProps: { ...shape.slotProps, input: extend(shape.slotProps.input) } };
  if (shape.InputProps) return { InputProps: extend(shape.InputProps) };
  return {};
}

/**
 * A single-select picker over `{ id, label }` options whose value is the
 * chosen option's **id**, not the option object, which is what a form or an
 * API usually stores. Built on MUI `Autocomplete`, it is controlled: pass the
 * id as `value` and update it in `onChange`.
 *
 * ```tsx
 * const [ownerId, setOwnerId] = React.useState<number | null>(null);
 * <IdAutocomplete label="Owner" options={people} value={ownerId} onChange={setOwnerId} />
 * ```
 *
 * Options can carry a `sublabel` (a second line) and a `group` (a header).
 * For large lists, search on the server with `onInputChange` and `loading`;
 * `onCreate` adds an "Add …" row for records that do not exist yet. For
 * react-hook-form, use `RhfIdAutocomplete` from
 * `@rbalukja15/ui-components/rhf`.
 */
export function IdAutocomplete<TOption extends IdOption = IdOption>({
  options,
  value,
  onChange,
  onChangeOption,
  onBlur,
  label,
  required,
  disabled,
  helperText,
  errorMessage,
  error,
  size = 'medium',
  fullWidth,
  isOptionEqualToValue,
  onInputChange,
  loading,
  onCreate,
  createLabel = defaultCreateLabel,
  noOptionsText,
  loadingText,
  clearText,
  openText,
  closeText,
  id,
  name,
  placeholder,
  autoFocus,
  inputRef,
  sx,
}: IdAutocompleteProps<TOption>) {
  // What the user typed, for the create row. Only 'input' events count: the
  // 'reset' after a pick writes the picked label, which nobody typed.
  const [typed, setTyped] = React.useState('');
  // The option the value last resolved to. A server-searched list drops the
  // chosen option as soon as the user types something else, and callers often
  // rebuild their options on every render. Resolving to null, or to a fresh
  // object, is a value change to MUI, which then overwrites the text being
  // typed with the label. Typing over a chosen option to reach the create row
  // depends on this.
  const resolved = React.useRef<TOption | null>(null);
  const filter = React.useMemo(() => createFilterOptions<TOption>(), []);
  const groupId = React.useId();

  const stored = value === null || value === undefined || value === '' ? null : value;
  const matches = (option: TOption): boolean =>
    stored !== null &&
    (isOptionEqualToValue ? isOptionEqualToValue(option, stored) : String(option.id) === String(stored));

  // Resolve the stored id back to an option, so the input shows its label
  // after a reset or a load. Keep the previous object while it still matches
  // and its label is unchanged; the ref only ever holds what this computes, so
  // rendering twice gives the same answer.
  const found = options.find(matches) ?? null;
  const last = resolved.current;
  const current = last && matches(last) ? (found && found.label !== last.label ? found : last) : found;
  resolved.current = current;
  // An option kept from earlier that `options` no longer holds. It is handed
  // to MUI, which otherwise warns that the value matches no option, and
  // filtered out of the list, which shows exactly `options`.
  const carried = current && !found ? current : null;

  const rows: ReadonlyArray<Row<TOption>> = onCreate ? withCreateOption(options, typed, createLabel) : options;
  const grouped = options.some((o) => o.group);
  const hasError = error === true || Boolean(errorMessage);
  const spinnerLabel = typeof loadingText === 'string' ? loadingText : 'Loading…';

  return (
    <Autocomplete<Row<TOption>, false, false, false>
      id={id}
      sx={sx}
      options={carried ? [...rows, carried] : rows}
      value={current}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      loading={loading}
      noOptionsText={noOptionsText}
      loadingText={loadingText}
      clearText={clearText}
      openText={openText}
      closeText={closeText}
      groupBy={grouped ? (o) => o.group ?? '' : undefined}
      renderGroup={
        grouped
          ? (params) =>
              // A listbox may only hold options and groups, so a real group is
              // a `group` named by its header and the list elements around the
              // options are presentational. Ungrouped options still form a
              // group, keyed '': an empty header would take up a row, so they
              // get none and belong to the listbox directly.
              params.group ? (
                <li key={params.key} role="none">
                  <div role="group" aria-labelledby={`${groupId}-${params.key}`}>
                    <ListSubheader id={`${groupId}-${params.key}`} component="div" sx={{ lineHeight: '32px' }}>
                      {params.group}
                    </ListSubheader>
                    <ul role="none" style={{ padding: 0 }}>
                      {params.children}
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={params.key} role="none">
                  <ul role="none" style={{ padding: 0 }}>
                    {params.children}
                  </ul>
                </li>
              )
          : undefined
      }
      // MUI filters by label. When the caller searches on the server, the
      // server has already filtered, and filtering again would hide rows it
      // matched on something other than the label. The create row survives
      // either way: it is the way out of exactly the search that matched
      // nothing.
      filterOptions={(opts, state) => {
        const real = opts.filter((o): o is TOption => !isCreateOption(o) && o !== carried);
        const kept = onInputChange ? real : filter(real, state);
        const create = opts.find(isCreateOption);
        return create ? [...kept, create] : kept;
      }}
      // The create row reads back as what was typed: MUI writes the picked
      // option's label into the box before the change handler runs.
      getOptionLabel={(o) => (isCreateOption(o) ? o.typed : o.label)}
      // MUI only compares options with the current value, which stands for
      // the stored id.
      isOptionEqualToValue={(o) => !isCreateOption(o) && matches(o)}
      onChange={(_, picked) => {
        if (isCreateOption(picked)) {
          onCreate?.(picked.typed);
          return;
        }
        onChange(picked ? picked.id : null, picked);
        onChangeOption?.(picked);
      }}
      onBlur={onBlur}
      onInputChange={(_, text, reason) => {
        // Only forward typing. A 'reset' follows every value change,
        // including a pick, and would clear the caller's search.
        if (reason === 'input') onInputChange?.(text);
        setTyped(reason === 'input' ? text : '');
      }}
      renderOption={(props, option) =>
        // Keyed by id rather than MUI's default (the label): two options may
        // share a label.
        isCreateOption(option) ? (
          // The text keeps the body colour, which stays at AA contrast over
          // the hover and keyboard highlights; as text the brand colour falls
          // below it once highlighted (and in dark mode even at rest), so it
          // only tints the icon.
          <Box
            component="li"
            {...withoutKey(props)}
            key={option.id}
            sx={{ color: 'text.primary', fontWeight: 500, gap: 1 }}
          >
            <Box component="span" sx={{ display: 'flex', color: 'primary.main' }}>
              <PlusIcon />
            </Box>
            <Box sx={{ fontSize: '0.875rem', minWidth: 0 }}>{option.label}</Box>
          </Box>
        ) : (
          <Box component="li" {...withoutKey(props)} key={String(option.id)}>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ fontSize: '0.875rem' }}>{option.label}</Box>
              {option.sublabel && (
                <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{option.sublabel}</Box>
              )}
            </Box>
          </Box>
        )
      }
      renderInput={(params) => (
        <TextField
          {...params}
          {...(loading ? withEndAdornment(params, <CircularProgress color="inherit" size={16} aria-label={spinnerLabel} />) : {})}
          label={label}
          required={required}
          name={name}
          placeholder={placeholder}
          autoFocus={autoFocus}
          inputRef={inputRef}
          error={hasError}
          helperText={errorMessage ? errorMessage : helperText}
        />
      )}
    />
  );
}
