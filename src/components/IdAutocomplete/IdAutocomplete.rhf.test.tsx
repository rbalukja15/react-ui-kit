import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { RhfIdAutocomplete, type RhfIdAutocompleteProps } from './IdAutocomplete.rhf';
import type { IdOption } from './IdAutocomplete';

/** Options carry extra fields through the caller's own type. */
const people: Array<IdOption & { team?: string }> = [
  { id: 1, label: 'Ada Lovelace', team: 'Engines' },
  { id: 2, label: 'Grace Hopper' },
  { id: 3, label: 'Alan Turing' },
];

interface Values {
  ownerId: IdOption['id'] | null;
}

/** A tiny form around the adapter. `onReady` hands the form methods to the test. */
function Form({
  defaultValues = { ownerId: null },
  formDisabled,
  onValid = () => {},
  onReady,
  ...props
}: Partial<RhfIdAutocompleteProps<Values, 'ownerId'>> & {
  defaultValues?: Values;
  /** `useForm`'s own `disabled` option (react-hook-form 7.48 and later). */
  formDisabled?: boolean;
  onValid?: (values: Values) => void;
  onReady?: (form: UseFormReturn<Values>) => void;
}) {
  const form = useForm<Values>({ defaultValues, disabled: formDisabled });
  onReady?.(form);
  return (
    <form noValidate onSubmit={form.handleSubmit(onValid)}>
      <RhfIdAutocomplete name="ownerId" control={form.control} label="Owner" options={people} {...props} />
      <button type="submit">Save</button>
    </form>
  );
}

const input = () => screen.getByRole<HTMLInputElement>('combobox', { name: 'Owner' });

function pick(name: string) {
  act(() => input().focus());
  fireEvent.keyDown(input(), { key: 'ArrowDown' });
  fireEvent.click(screen.getByRole('option', { name }));
}
function clear() {
  act(() => input().focus());
  fireEvent.change(input(), { target: { value: '' } });
}
async function submit() {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  });
}

describe('<RhfIdAutocomplete>', () => {
  it('shows the label of the id in the form values', () => {
    render(<Form defaultValues={{ ownerId: 2 }} />);
    expect(input()).toHaveValue('Grace Hopper');
  });

  it('writes the picked id into the form', async () => {
    const onValid = vi.fn();
    render(<Form onValid={onValid} />);
    pick('Alan Turing');
    await submit();
    expect(onValid).toHaveBeenCalledWith({ ownerId: 3 }, expect.anything());
  });

  it('writes null when cleared', async () => {
    const onValid = vi.fn();
    render(<Form defaultValues={{ ownerId: 2 }} onValid={onValid} />);
    clear();
    await submit();
    expect(onValid).toHaveBeenCalledWith({ ownerId: null }, expect.anything());
  });

  it('writes emptyValue when cleared, and reads it back as empty', async () => {
    const onValid = vi.fn();
    const { unmount } = render(<Form defaultValues={{ ownerId: 2 }} emptyValue="" onValid={onValid} />);
    clear();
    await submit();
    expect(onValid).toHaveBeenCalledWith({ ownerId: '' }, expect.anything());
    unmount();

    // An option whose id equals emptyValue is not shown as chosen.
    render(<Form defaultValues={{ ownerId: 0 }} emptyValue={0} options={[{ id: 0, label: 'Nobody' }, ...people]} />);
    expect(input()).toHaveValue('');
  });

  it('keeps 0 as a real id', async () => {
    const onValid = vi.fn();
    render(<Form options={[{ id: 0, label: 'Nobody' }, ...people]} onValid={onValid} />);
    pick('Nobody');
    await submit();
    expect(onValid).toHaveBeenCalledWith({ ownerId: 0 }, expect.anything());
  });

  it('follows reset()', () => {
    let form: UseFormReturn<Values> | undefined;
    render(<Form defaultValues={{ ownerId: 1 }} onReady={(f) => (form = f)} />);
    expect(input()).toHaveValue('Ada Lovelace');
    act(() => form?.reset({ ownerId: 3 }));
    expect(input()).toHaveValue('Alan Turing');
    act(() => form?.reset({ ownerId: null }));
    expect(input()).toHaveValue('');
  });

  it('shows the validation message and focuses the field when validation fails', async () => {
    const onValid = vi.fn();
    render(<Form rules={{ required: 'Pick an owner' }} onValid={onValid} />);
    await submit();
    expect(onValid).not.toHaveBeenCalled();
    expect(screen.getByText('Pick an owner')).toHaveClass('Mui-error');
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveFocus();

    pick('Grace Hopper');
    await waitFor(() => expect(screen.queryByText('Pick an owner')).not.toBeInTheDocument());
  });

  it('turns the field invalid for a failed rule that has no message', async () => {
    render(<Form rules={{ required: true }} helperText="Who runs it" />);
    expect(input()).toHaveAttribute('aria-invalid', 'false');
    await submit();
    expect(input()).toHaveFocus();
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    // There is no message to show, so the hint stays.
    expect(screen.getByText('Who runs it')).toBeInTheDocument();

    pick('Grace Hopper');
    await waitFor(() => expect(input()).toHaveAttribute('aria-invalid', 'false'));
  });

  it('prefers an errorMessage passed by the caller', async () => {
    render(<Form rules={{ required: 'Pick an owner' }} errorMessage="Choose someone first" />);
    await submit();
    expect(screen.getByText('Choose someone first')).toBeInTheDocument();
    expect(screen.queryByText('Pick an owner')).not.toBeInTheDocument();
  });

  it('marks the field touched on blur', () => {
    let form: UseFormReturn<Values> | undefined;
    render(<Form onReady={(f) => (form = f)} />);
    act(() => input().focus());
    act(() => input().blur());
    expect(form?.getFieldState('ownerId').isTouched).toBe(true);
  });

  it('calls onChangeOption with the picked option', () => {
    const onChangeOption = vi.fn();
    render(<Form onChangeOption={onChangeOption} />);
    pick('Ada Lovelace');
    expect(onChangeOption).toHaveBeenCalledWith(expect.objectContaining({ id: 1, team: 'Engines' }));
  });

  it('names the input after the field and passes other props through', () => {
    render(<Form helperText="Who runs it" required size="small" />);
    expect(input()).toHaveAttribute('name', 'ownerId');
    expect(input()).toBeRequired();
    expect(input().closest('.MuiInputBase-root')).toHaveClass('MuiInputBase-sizeSmall');
    expect(screen.getByText('Who runs it')).toBeInTheDocument();
  });

  it('hands the input to a caller inputRef as well', async () => {
    const inputRef = React.createRef<HTMLInputElement>();
    render(<Form inputRef={inputRef} rules={{ required: 'Pick an owner' }} />);
    expect(inputRef.current).toBe(input());
    await submit();
    expect(input()).toHaveFocus();
  });

  it('can be disabled with the prop, and still submits the value', async () => {
    const onValid = vi.fn();
    render(<Form defaultValues={{ ownerId: 2 }} disabled onValid={onValid} />);
    expect(input()).toBeDisabled();
    await submit();
    expect(onValid).toHaveBeenCalledWith({ ownerId: 2 }, expect.anything());
  });

  it('is disabled while the whole form is', () => {
    render(<Form defaultValues={{ ownerId: 2 }} formDisabled />);
    expect(input()).toBeDisabled();
  });

  it('offers the create row through the adapter, leaving the field alone', async () => {
    const onCreate = vi.fn();
    const onValid = vi.fn();
    render(<Form defaultValues={{ ownerId: 2 }} onCreate={onCreate} onValid={onValid} />);
    act(() => input().focus());
    fireEvent.change(input(), { target: { value: 'Zora' } });
    fireEvent.click(screen.getByRole('option', { name: 'Add "Zora"' }));
    expect(onCreate).toHaveBeenCalledWith('Zora');
    await submit();
    expect(onValid).toHaveBeenCalledWith({ ownerId: 2 }, expect.anything());
  });
});
