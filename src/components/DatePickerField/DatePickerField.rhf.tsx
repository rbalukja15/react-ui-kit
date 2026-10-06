import * as React from 'react';
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { DatePickerField, type DatePickerFieldProps } from './DatePickerField';

/**
 * A form's `control`. Leaves out the members typed by the resolver's output,
 * so the `control` of a form whose resolver transforms its values
 * (`useForm<Input, Context, Output>`, react-hook-form 7.55 and later) is
 * accepted as well.
 */
type FormControl<TFieldValues extends FieldValues> = Omit<Control<TFieldValues>, '_options' | 'handleSubmit'>;

export type RhfDatePickerFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<DatePickerFieldProps, 'value' | 'onChange' | 'onBlur' | 'name'> & {
  /** Path of the field in the form values. Also set as the input's `name`. */
  name: TName;
  /** The `control` object returned by `useForm`. */
  control: FormControl<TFieldValues>;
  /**
   * Validation rules, as accepted by react-hook-form's `useController`. An
   * empty field holds `''`, so `{ required: 'Pick a date' }` makes the date
   * required, and ISO dates compare as strings in `validate`.
   */
  rules?: UseControllerProps<TFieldValues, TName>['rules'];
};

/** Assigns `node` to each ref, whether it is a callback or an object ref. */
function assignRefs<T>(node: T | null, refs: ReadonlyArray<React.Ref<T> | undefined>) {
  for (const ref of refs) {
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
  }
}

/**
 * {@link DatePickerField} bound to a react-hook-form field. The form holds
 * the date as an ISO `YYYY-MM-DD` string, and `''` while the field is empty or
 * a typed date is incomplete.
 *
 * ```tsx
 * const { control } = useForm({ defaultValues: { startDate: '' } });
 * <RhfDatePickerField
 *   name="startDate"
 *   control={control}
 *   label="Start date"
 *   required
 *   rules={{
 *     required: 'Pick a start date',
 *     validate: (value) => !value || value >= '2026-01-01' || 'Pick a date in 2026 or later',
 *   }}
 * />
 * ```
 *
 * To require a date, pass `required` for the asterisk and a `required` rule
 * for the check: the prop alone only marks the field. Range props
 * (`minDate`, `disablePast`, …) restrict the calendar but not typing, so
 * repeat them in `validate` when the stored date must respect them.
 *
 * The field's validation message is shown unless you pass `errorMessage`
 * yourself, and a failed rule turns the field invalid even when it has no
 * message (`required: true`). Leaving the field marks it as touched. The input is registered
 * as the field's ref, so react-hook-form can focus the field when validation
 * fails, and it is disabled while the form is (`useForm({ disabled: true })`,
 * react-hook-form 7.48 and later). An empty (`undefined` or `null`) value
 * shows as an empty field. Every other {@link DatePickerFieldProps} prop
 * passes through.
 *
 * Imported from `@rbalukja15/ui-components/date-picker/rhf`, the one entry
 * that needs react-hook-form, `@mui/x-date-pickers` and `dayjs` together.
 */
export function RhfDatePickerField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  rules,
  errorMessage,
  error,
  disabled,
  inputRef,
  ...props
}: RhfDatePickerFieldProps<TFieldValues, TName>) {
  const { field, fieldState } = useController({ name, control: control as Control<TFieldValues>, rules });
  const fieldRef = field.ref;
  const setInputRef = React.useCallback(
    (node: HTMLInputElement | null) => assignRefs(node, [fieldRef, inputRef]),
    [fieldRef, inputRef],
  );
  // `field.disabled` reflects the form-level `disabled` option; it only exists
  // from react-hook-form 7.48, so it is read without relying on its type.
  const formDisabled = 'disabled' in field && field.disabled === true;
  const value: unknown = field.value;

  return (
    <DatePickerField
      {...props}
      name={field.name}
      value={typeof value === 'string' ? value : ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={setInputRef}
      disabled={Boolean(disabled) || formDisabled}
      errorMessage={errorMessage ?? fieldState.error?.message}
      // A rule written without a message (`required: true`) leaves an error
      // whose message is '', which on its own would not mark the field.
      error={error === true || fieldState.invalid}
    />
  );
}
