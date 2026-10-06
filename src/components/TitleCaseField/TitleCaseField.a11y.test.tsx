import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { axe } from 'vitest-axe';
import { TitleCaseField } from './TitleCaseField';
import { RhfTitleCaseField } from './TitleCaseField.rhf';

const noop = () => {};

describe('<TitleCaseField> accessibility', () => {
  it('has no axe violations when empty', async () => {
    const { container } = render(<TitleCaseField label="Full name" value="" onChange={noop} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations when filled, with helper text', async () => {
    const { container } = render(
      <TitleCaseField
        label="Full name"
        value="Jane Doe"
        onChange={noop}
        helperText="As it appears on the passport"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations when required', async () => {
    const { container } = render(<TitleCaseField label="Full name" value="" onChange={noop} required />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations in the error state', async () => {
    const { container } = render(
      <TitleCaseField label="Full name" value="" onChange={noop} required errorMessage="Enter a name" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations when disabled', async () => {
    const { container } = render(
      <TitleCaseField label="Full name" value="Jane Doe" onChange={noop} disabled />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

function Form() {
  const { control, handleSubmit } = useForm({ defaultValues: { fullName: '' } });
  return (
    <form onSubmit={handleSubmit(noop)} noValidate>
      <RhfTitleCaseField
        name="fullName"
        control={control}
        label="Full name"
        required
        rules={{ required: 'Enter a name' }}
      />
      <button type="submit">Save</button>
    </form>
  );
}

describe('<RhfTitleCaseField> accessibility', () => {
  it('has no axe violations before and after a failed submit', async () => {
    const { container } = render(<Form />);
    expect(await axe(container)).toHaveNoViolations();

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Full name' })).toBeInvalid());
    expect(await axe(container)).toHaveNoViolations();
  });
});
