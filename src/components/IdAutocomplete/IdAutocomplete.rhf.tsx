import * as React from 'react';
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { IdAutocomplete, type IdAutocompleteProps, type IdOption } from './IdAutocomplete';

/**
 * A form's `control`. Leaves out the members typed by the resolver's output,
 * so the `control` of a form whose resolver transforms its values
 * (`useForm<Input, Context, Output>`, react-hook-form 7.55 and later) is
 * accepted as well.
 */
type FormControl<TFieldValues extends FieldValues> = Omit<Control<TFieldValues>, '_options' | 'handleSubmit'>;

export interface RhfIdAutocompleteProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends IdOption = IdOption,
> extends Omit<IdAutocompleteProps<TOption>, 'value' | 'onChange' | 'onBlur' | 'name'> {
  /** Path of the field in the form values. Also set as the input's `name`. */
  name: TName;
  /**
   * The `control` object returned by `useForm`, including that of a form
   * whose resolver transforms its values.
   */
  control: FormControl<TFieldValues>;
  /** Validation rules, as accepted by react-hook-form's `useController`. */
  rules?: UseControllerProps<TFieldValues, TName>['rules'];
  /**
   * The value written when the field is cleared, and shown as empty when the
   * field holds it. Defaults to `null`; pass `''` for forms that use empty
   * strings.
   */
  emptyValue?: IdOption['id'] | null;
}

/** Assigns `node` to each ref, whether it is a callback or an object ref. */
function assignRefs<T>(node: T | null, refs: ReadonlyArray<React.Ref<T> | undefined>) {
  for (const ref of refs) {
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
  }
}

/**
 * {@link IdAutocomplete} bound to a react-hook-form field. The field holds the
 * chosen option's `id`, or `emptyValue` (`null` by default) once cleared. It
 * is always the `id`, so a form that stores a code puts the code in `id`.
 *
 * ```tsx
 * const { control } = useForm<{ ownerId: number | null }>({ defaultValues: { ownerId: null } });
 * <RhfIdAutocomplete name="ownerId" control={control} label="Owner" options={people} rules={{ required: 'Pick an owner' }} />
 * ```
 *
 * The field's validation message is shown unless you pass `errorMessage`
 * yourself, and a failed rule turns the field invalid even when it has no
 * message (`required: true`). The input is registered as the field's ref, so react-hook-form
 * can focus it when validation fails, and it is disabled while the form is
 * (`useForm({ disabled: true })`, react-hook-form 7.48 and later). The
 * `disabled` prop only disables the input: unlike the `disabled` option of
 * `useController`, it keeps the value in the submitted data. Every other
 * {@link IdAutocompleteProps} prop passes through.
 *
 * Imported from `@rbalukja15/ui-components/rhf`, so apps without
 * react-hook-form can still use the main entry.
 */
export function RhfIdAutocomplete<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends IdOption = IdOption,
>({
  name,
  control,
  rules,
  emptyValue = null,
  errorMessage,
  error,
  disabled,
  inputRef,
  ...props
}: RhfIdAutocompleteProps<TFieldValues, TName, TOption>) {
  const { field, fieldState } = useController({ name, control: control as Control<TFieldValues>, rules });
  const fieldRef = field.ref;
  const setInputRef = React.useCallback(
    (node: HTMLInputElement | null) => assignRefs(node, [fieldRef, inputRef]),
    [fieldRef, inputRef],
  );
  // `field.disabled` reflects the form-level `disabled` option; it only exists
  // from react-hook-form 7.48, so it is read without relying on its type.
  const formDisabled = 'disabled' in field && field.disabled === true;
  const stored = field.value as IdOption['id'] | null | undefined;

  return (
    <IdAutocomplete<TOption>
      {...props}
      name={field.name}
      value={stored === emptyValue ? null : stored}
      onChange={(id) => field.onChange(id ?? emptyValue)}
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
