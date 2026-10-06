import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm, type UseFormProps } from 'react-hook-form';
import { RhfTitleCaseField, type RhfTitleCaseFieldProps } from './TitleCaseField.rhf';

interface Values {
  fullName: string | null;
}

type FormProps = Partial<Omit<RhfTitleCaseFieldProps<Values, 'fullName'>, 'control'>> & {
  options?: UseFormProps<Values>;
  onValid?: (values: Values) => void;
};

/** A one-field form, with its dirty state shown so tests can read it. */
function Form({ options, onValid = () => {}, ...fieldProps }: FormProps) {
  const { control, handleSubmit, formState } = useForm<Values>(options);
  return (
    <form onSubmit={handleSubmit(onValid)} noValidate>
      <RhfTitleCaseField name="fullName" control={control} label="Full name" {...fieldProps} />
      <output data-testid="dirty">{String(formState.isDirty)}</output>
      <button type="submit">Save</button>
    </form>
  );
}

const field = () => screen.getByRole('textbox', { name: 'Full name' });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Save' }));

describe('<RhfTitleCaseField>', () => {
  it('shows the form value and uses the field path as the input name', () => {
    render(<Form options={{ defaultValues: { fullName: 'Jane Doe' } }} />);
    expect(field()).toHaveValue('Jane Doe');
    expect(field()).toHaveAttribute('name', 'fullName');
  });

  it('writes the title-cased value back to the form on blur', async () => {
    const onValid = vi.fn();
    render(<Form options={{ defaultValues: { fullName: '' } }} onValid={onValid} />);
    fireEvent.change(field(), { target: { value: '  jane   doe ' } });
    expect(field()).toHaveValue('  jane   doe ');
    fireEvent.blur(field());
    expect(field()).toHaveValue('Jane Doe');

    submit();
    await waitFor(() => expect(onValid).toHaveBeenCalledTimes(1));
    expect(onValid.mock.calls[0]?.[0]).toEqual({ fullName: 'Jane Doe' });
  });

  it('uppercases with the given locale', () => {
    render(<Form options={{ defaultValues: { fullName: 'izmir' } }} locale="tr" />);
    fireEvent.blur(field());
    expect(field()).toHaveValue('İzmir');
  });

  it('shows an empty field for an undefined or null value, without dirtying the form on blur', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(<Form />);
    expect(field()).toHaveValue('');
    fireEvent.blur(field());
    expect(screen.getByTestId('dirty')).toHaveTextContent('false');
    unmount();

    render(<Form options={{ defaultValues: { fullName: null } }} />);
    expect(field()).toHaveValue('');
    fireEvent.blur(field());
    expect(screen.getByTestId('dirty')).toHaveTextContent('false');

    // No "uncontrolled to controlled" warning from React.
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('shows the validation message from rules after a failed submit', async () => {
    const onValid = vi.fn();
    render(
      <Form
        options={{ defaultValues: { fullName: '' } }}
        rules={{ required: 'Enter a name' }}
        helperText="As it appears on the passport"
        onValid={onValid}
      />,
    );
    expect(field()).not.toBeInvalid();
    expect(field()).toHaveAccessibleDescription('As it appears on the passport');

    submit();
    await waitFor(() => expect(field()).toBeInvalid());
    expect(field()).toHaveAccessibleDescription('Enter a name');
    expect(onValid).not.toHaveBeenCalled();
  });

  it('turns the field invalid for a failed rule that has no message', async () => {
    render(
      <Form
        options={{ defaultValues: { fullName: '' } }}
        rules={{ required: true }}
        helperText="As it appears on the passport"
      />,
    );
    expect(field()).toHaveAttribute('aria-invalid', 'false');
    submit();
    await waitFor(() => expect(field()).toHaveFocus());
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    // There is no message to show, so the hint stays.
    expect(field()).toHaveAccessibleDescription('As it appears on the passport');

    fireEvent.change(field(), { target: { value: 'Ada' } });
    await waitFor(() => expect(field()).toHaveAttribute('aria-invalid', 'false'));
  });

  it('validates the cleaned value, so whitespace alone does not pass a required rule', async () => {
    render(<Form options={{ defaultValues: { fullName: '' }, mode: 'onBlur' }} rules={{ required: 'Enter a name' }} />);
    fireEvent.change(field(), { target: { value: '   ' } });
    fireEvent.blur(field());
    expect(field()).toHaveValue('');
    await waitFor(() => expect(field()).toHaveAccessibleDescription('Enter a name'));
  });

  it('marks the field touched on blur, so onBlur validation runs', async () => {
    render(
      <Form
        options={{ defaultValues: { fullName: 'x' }, mode: 'onBlur' }}
        rules={{ minLength: { value: 2, message: 'Too short' } }}
      />,
    );
    expect(field()).not.toBeInvalid();
    fireEvent.blur(field());
    await waitFor(() => expect(field()).toHaveAccessibleDescription('Too short'));
    expect(field()).toHaveValue('X');
  });

  it('neither cleans nor touches the field when the window loses focus but the field keeps it', () => {
    let touched = false;
    function Probe() {
      const { control, formState } = useForm<Values>({ defaultValues: { fullName: '' } });
      touched = Boolean(formState.touchedFields.fullName);
      return <RhfTitleCaseField name="fullName" control={control} label="Full name" />;
    }
    render(<Probe />);
    act(() => field().focus());
    fireEvent.change(field(), { target: { value: 'ada ' } });
    fireEvent.blur(field());
    expect(field()).toHaveValue('ada ');
    expect(touched).toBe(false);

    act(() => field().blur());
    expect(field()).toHaveValue('Ada');
    expect(touched).toBe(true);
  });

  it("prefers the caller's errorMessage over the field's error", async () => {
    render(
      <Form
        options={{ defaultValues: { fullName: '' } }}
        rules={{ required: 'Enter a name' }}
        errorMessage="This name is taken"
      />,
    );
    expect(field()).toHaveAccessibleDescription('This name is taken');
    submit();
    await waitFor(() => expect(field()).toHaveFocus());
    expect(field()).toHaveAccessibleDescription('This name is taken');
  });

  it('registers the input, so the form focuses it when validation fails', async () => {
    render(<Form options={{ defaultValues: { fullName: '' } }} rules={{ required: 'Enter a name' }} />);
    expect(field()).not.toHaveFocus();
    submit();
    await waitFor(() => expect(field()).toHaveFocus());
  });

  it("still gives the input to the caller's inputRef", () => {
    const inputRef = React.createRef<HTMLInputElement>();
    render(<Form options={{ defaultValues: { fullName: '' } }} inputRef={inputRef} />);
    expect(inputRef.current).toBe(field());
  });

  it('can be disabled with the prop, and still submits the value', async () => {
    const onValid = vi.fn();
    render(<Form options={{ defaultValues: { fullName: 'Jane Doe' } }} disabled onValid={onValid} />);
    expect(field()).toBeDisabled();
    submit();
    await waitFor(() => expect(onValid).toHaveBeenCalledTimes(1));
    expect(onValid.mock.calls[0]?.[0]).toEqual({ fullName: 'Jane Doe' });
  });

  it('is disabled while the whole form is', () => {
    render(<Form options={{ defaultValues: { fullName: 'Jane Doe' }, disabled: true }} />);
    expect(field()).toBeDisabled();
  });

  it('passes the field props through', () => {
    const { container } = render(
      <Form options={{ defaultValues: { fullName: '' } }} required size="small" placeholder="Jane Doe" />,
    );
    expect(field()).toBeRequired();
    expect(field()).toHaveAttribute('placeholder', 'Jane Doe');
    expect(container.querySelector('.MuiInputBase-sizeSmall')).toBeInTheDocument();
  });
});
