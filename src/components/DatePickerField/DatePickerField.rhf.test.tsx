import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm, type UseFormProps } from 'react-hook-form';
import { RhfDatePickerField, type RhfDatePickerFieldProps } from './DatePickerField.rhf';

interface Values {
  startDate: string | null | undefined;
}

type FormProps = Partial<Omit<RhfDatePickerFieldProps<Values, 'startDate'>, 'control'>> & {
  options?: UseFormProps<Values>;
  onValid?: (values: Values) => void;
};

/** A one-field form, with its touched state shown so tests can read it. */
function Form({ options, onValid = () => {}, ...fieldProps }: FormProps) {
  const { control, handleSubmit, formState } = useForm<Values>(options);
  return (
    <form onSubmit={handleSubmit(onValid)} noValidate>
      <RhfDatePickerField name="startDate" control={control} label="Start date" format="DD/MM/YYYY" {...fieldProps} />
      <output data-testid="touched">{String(Boolean(formState.touchedFields.startDate))}</output>
      <button type="submit">Save</button>
    </form>
  );
}

/** The `<input>`: the visible text input up to MUI X 7, the hidden one from 8. */
const input = (container: HTMLElement) => container.querySelector('input') as HTMLInputElement;
const blurTarget = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[role="spinbutton"]') ?? input(container);
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Save' }));
const leaveField = () =>
  act(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });

describe('<RhfDatePickerField>', () => {
  it('shows the form value and uses the field path as the input name', () => {
    const { container } = render(<Form options={{ defaultValues: { startDate: '2026-10-05' } }} />);
    expect(input(container)).toHaveValue('05/10/2026');
    expect(input(container)).toHaveAttribute('name', 'startDate');
  });

  it('writes typed and picked dates to the form as ISO strings', async () => {
    const onValid = vi.fn();
    const { container } = render(<Form options={{ defaultValues: { startDate: '' } }} onValid={onValid} />);
    fireEvent.change(input(container), { target: { value: '05/10/2026' } });
    submit();
    await waitFor(() => expect(onValid).toHaveBeenCalledTimes(1));
    expect(onValid.mock.calls[0]?.[0]).toEqual({ startDate: '2026-10-05' });

    fireEvent.click(screen.getByRole('button', { name: /choose date/i }));
    fireEvent.click(screen.getByRole('gridcell', { name: '12' }));
    submit();
    await waitFor(() => expect(onValid).toHaveBeenCalledTimes(2));
    expect(onValid.mock.calls[1]?.[0]).toEqual({ startDate: '2026-10-12' });
  });

  it("writes '' to the form when the field is cleared", async () => {
    const onValid = vi.fn();
    const { container } = render(<Form options={{ defaultValues: { startDate: '2026-10-05' } }} onValid={onValid} />);
    fireEvent.change(input(container), { target: { value: '' } });
    submit();
    await waitFor(() => expect(onValid).toHaveBeenCalledTimes(1));
    expect(onValid.mock.calls[0]?.[0]).toEqual({ startDate: '' });
  });

  it('shows the message of a failed rule, and clears it once a date is entered', async () => {
    const onValid = vi.fn();
    const { container } = render(
      <Form
        options={{ defaultValues: { startDate: '' } }}
        onValid={onValid}
        required
        helperText="When the work begins"
        rules={{ required: 'Pick a start date' }}
      />,
    );
    submit();
    expect(await screen.findByText('Pick a start date')).toHaveClass('Mui-error');
    expect(screen.queryByText('When the work begins')).not.toBeInTheDocument();
    expect(container.querySelector('[aria-invalid="true"]')).not.toBeNull();
    expect(onValid).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /choose date/i }));
    fireEvent.click(screen.getByRole('gridcell', { name: '12' }));
    await waitFor(() => expect(screen.queryByText('Pick a start date')).not.toBeInTheDocument());
    expect(screen.getByText('When the work begins')).toBeInTheDocument();
  });

  it('turns the field invalid for a failed rule that has no message', async () => {
    const { container } = render(
      <Form
        options={{ defaultValues: { startDate: '' } }}
        helperText="When the work begins"
        rules={{ validate: (value) => value !== '' }}
      />,
    );
    expect(container.querySelector('[aria-invalid="true"]')).toBeNull();
    submit();
    await waitFor(() => expect(container.querySelector('[aria-invalid="true"]')).not.toBeNull());
    // There is no message to show, so the hint stays.
    expect(screen.getByText('When the work begins')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /choose date/i }));
    fireEvent.click(screen.getByRole('gridcell', { name: '12' }));
    await waitFor(() => expect(container.querySelector('[aria-invalid="true"]')).toBeNull());
  });

  it('turns the field invalid for a required rule without a message', async () => {
    const { container } = render(<Form options={{ defaultValues: { startDate: '' } }} rules={{ required: true }} />);
    submit();
    await waitFor(() => expect(container.querySelector('[aria-invalid="true"]')).not.toBeNull());
  });

  it('runs validate rules on the ISO value', async () => {
    const { container } = render(
      <Form
        options={{ defaultValues: { startDate: '2025-12-31' } }}
        rules={{ validate: (value) => !value || value >= '2026-01-01' || 'Pick a date in 2026 or later' }}
      />,
    );
    submit();
    expect(await screen.findByText('Pick a date in 2026 or later')).toBeInTheDocument();
    // The failed submit focused the field; a whole date is typed into it from outside.
    leaveField();
    fireEvent.change(input(container), { target: { value: '02/01/2026' } });
    await waitFor(() => expect(screen.queryByText('Pick a date in 2026 or later')).not.toBeInTheDocument());
  });

  it('prefers an explicit errorMessage over the rule message', async () => {
    render(
      <Form
        options={{ defaultValues: { startDate: '' } }}
        rules={{ required: 'Pick a start date' }}
        errorMessage="Enter the start date"
      />,
    );
    submit();
    expect(await screen.findByText('Enter the start date')).toBeInTheDocument();
    expect(screen.queryByText('Pick a start date')).not.toBeInTheDocument();
  });

  it('focuses the field when its rule fails on submit', async () => {
    const { container } = render(
      <Form options={{ defaultValues: { startDate: '' } }} rules={{ required: 'Pick a start date' }} />,
    );
    submit();
    await screen.findByText('Pick a start date');
    expect(container.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(screen.getByRole('button', { name: 'Save' }));
  });

  it('marks the field as touched when focus leaves it', () => {
    const { container } = render(<Form options={{ defaultValues: { startDate: '' } }} />);
    expect(screen.getByTestId('touched')).toHaveTextContent('false');
    const target = blurTarget(container);
    fireEvent.focus(target);
    act(() => {
      fireEvent.blur(target);
    });
    expect(screen.getByTestId('touched')).toHaveTextContent('true');
  });

  it('is disabled by its own prop or while the form is', () => {
    const { container, unmount } = render(<Form options={{ defaultValues: { startDate: '' } }} disabled />);
    expect(input(container)).toBeDisabled();
    unmount();

    const form = render(<Form options={{ defaultValues: { startDate: '' }, disabled: true }} />);
    expect(input(form.container)).toBeDisabled();
  });

  it('shows an empty field for an undefined or null value', () => {
    const { container, unmount } = render(<Form />);
    expect(input(container)).toHaveValue('');
    unmount();

    const form = render(<Form options={{ defaultValues: { startDate: null } }} />);
    expect(input(form.container)).toHaveValue('');
  });

  it('also hands the input to an inputRef passed by the caller', () => {
    const ref = React.createRef<HTMLInputElement>();
    const { container } = render(<Form options={{ defaultValues: { startDate: '' } }} inputRef={ref} />);
    expect(ref.current).toBe(input(container));
  });
});
