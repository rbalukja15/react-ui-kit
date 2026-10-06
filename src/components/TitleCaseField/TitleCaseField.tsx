import * as React from 'react';
import { TextField, type TextFieldProps } from '@mui/material';
import { titleCase } from './titleCase';

/**
 * TextField props the component sets itself, or that do not fit a single-line
 * name field (`select`, `multiline`: collapsing whitespace would join lines).
 * The shared field props are re-declared on {@link TitleCaseFieldProps}.
 */
type OwnedTextFieldProp =
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onBlur'
  | 'error'
  | 'select'
  | 'SelectProps'
  | 'children'
  | 'multiline'
  | 'rows'
  | 'minRows'
  | 'maxRows'
  | 'label'
  | 'required'
  | 'disabled'
  | 'helperText'
  | 'size'
  | 'fullWidth';

export interface TitleCaseFieldProps extends Omit<TextFieldProps, OwnedTextFieldProp> {
  /** The current text. The field is controlled: it shows exactly this value. */
  value: string;
  /**
   * Called with the new text, as a plain string rather than the change event:
   * on every keystroke with the text as typed, and once on blur with the
   * title-cased text, but only when title-casing changed it.
   */
  onChange: (value: string) => void;
  /**
   * Called when focus leaves the field, after `onChange` has received the
   * title-cased text. Not called when only the window loses focus.
   */
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  /**
   * Locale used to uppercase the first letter of each word, as a BCP 47 tag
   * such as `'tr'` (or a list of them). Defaults to the runtime's locale. See
   * {@link titleCase}.
   */
  locale?: string | string[];
  /** The field's label. */
  label?: React.ReactNode;
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
  /** The field's size. Defaults to MUI's `'medium'`. */
  size?: TextFieldProps['size'];
  /** Stretches the field to the width of its container. */
  fullWidth?: boolean;
}

/**
 * A controlled MUI `TextField` that title-cases its value when it loses focus,
 * using {@link titleCase}: edges trimmed, inner whitespace collapsed, and the
 * first letter of each word uppercased. Letters the user typed in capitals
 * are kept. Typing is never interrupted; the value is only cleaned when focus
 * leaves the field. Switching to another window or tab does not count, so a
 * trailing space typed before copying the next word survives.
 *
 * Meant for short, name-like values: people, projects, places. Not for free
 * text, descriptions or addresses, where capitalising every word reads wrong.
 *
 * ```tsx
 * const [name, setName] = React.useState('');
 * <TitleCaseField label="Full name" value={name} onChange={setName} />
 * ```
 *
 * `onChange` receives the text as a string, not the change event. Other
 * `TextField` props (`name`, `id`, `placeholder`, `autoComplete`, `sx`, …) pass
 * through. For react-hook-form, use `RhfTitleCaseField` from
 * `@rbalukja15/ui-components/rhf`.
 *
 * Because the value is cleaned on blur, a form submitted with Enter while the
 * field still has focus receives the text as typed. Run `titleCase` in the
 * submit handler as well if the stored value must always be cleaned (a
 * client-side handler: see {@link titleCase}).
 */
export function TitleCaseField({
  value,
  onChange,
  onBlur,
  locale,
  label,
  required,
  disabled,
  helperText,
  errorMessage,
  error,
  size,
  fullWidth,
  ...textFieldProps
}: TitleCaseFieldProps) {
  const hasError = error === true || Boolean(errorMessage);

  return (
    <TextField
      {...textFieldProps}
      label={label}
      required={required}
      disabled={disabled}
      size={size}
      fullWidth={fullWidth}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={(event) => {
        // The input is still the active element when only the window or tab
        // lost focus: the user has not left the field, and comes back to it.
        // Neither the text nor the caller (react-hook-form's touched state)
        // hears about it until focus really leaves.
        if (event.currentTarget === event.currentTarget.ownerDocument.activeElement) return;
        const cleaned = titleCase(value, locale);
        if (cleaned !== value) onChange(cleaned);
        onBlur?.(event);
      }}
      error={hasError}
      helperText={errorMessage ? errorMessage : helperText}
    />
  );
}
