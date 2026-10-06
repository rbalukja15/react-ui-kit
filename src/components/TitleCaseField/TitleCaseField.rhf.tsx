import * as React from 'react';
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { TitleCaseField, type TitleCaseFieldProps } from './TitleCaseField';

/**
 * A form's `control`. Leaves out the members typed by the resolver's output,
 * so the `control` of a form whose resolver transforms its values
 * (`useForm<Input, Context, Output>`, react-hook-form 7.55 and later) is
 * accepted as well.
 */
type FormControl<TFieldValues extends FieldValues> = Omit<Control<TFieldValues>, '_options' | 'handleSubmit'>;

export type RhfTitleCaseFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<TitleCaseFieldProps, 'value' | 'onChange' | 'onBlur' | 'name'> & {
  /** Path of the field in the form values. Also set as the input's `name`. */
  name: TName;
  /**
   * The `control` object returned by `useForm`, including that of a form
   * whose resolver transforms its values.
   */
  control: FormControl<TFieldValues>;
  /** Validation rules, as accepted by react-hook-form's `useController`. */
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
 * {@link TitleCaseField} bound to a react-hook-form field. The form holds the
 * value; on blur the title-cased text is written back to it, then the field
 * is marked as touched.
 *
 * ```tsx
 * const { control, handleSubmit } = useForm({ defaultValues: { fullName: '' } });
 * <RhfTitleCaseField name="fullName" control={control} label="Full name" rules={{ required: 'Enter a name' }} />
 * ```
 *
 * The field's validation message is shown unless you pass `errorMessage`
 * yourself, and a failed rule turns the field invalid even when it has no
 * message (`required: true`). The input is registered as the field's ref, so react-hook-form
 * can focus it when validation fails, and it is disabled while the form is
 * (`useForm({ disabled: true })`, react-hook-form 7.48 and later). The
 * `disabled` prop only disables the input: unlike the `disabled` option of
 * `useController`, it keeps the value in the submitted data. An empty
 * (`undefined` or `null`) value shows as an empty field. Every other
 * {@link TitleCaseFieldProps} prop passes through.
 *
 * Imported from `@rbalukja15/ui-components/rhf`, so apps without
 * react-hook-form can still use the main entry.
 */
export function RhfTitleCaseField<
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
}: RhfTitleCaseFieldProps<TFieldValues, TName>) {
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
    <TitleCaseField
      {...props}
      name={field.name}
      value={value == null ? '' : String(value)}
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
