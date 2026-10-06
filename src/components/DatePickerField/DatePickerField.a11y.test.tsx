import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { DatePickerField } from './DatePickerField';

describe('<DatePickerField> accessibility', () => {
  it('has no axe violations when empty', async () => {
    const { container } = render(<DatePickerField label="Start date" value="" onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations when filled, required and described', async () => {
    const { container } = render(
      <DatePickerField
        label="Start date"
        value="2026-10-05"
        onChange={() => {}}
        required
        helperText="When the work begins"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations with an error message', async () => {
    const { container } = render(
      <DatePickerField label="Start date" value="" onChange={() => {}} required errorMessage="Pick a start date" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations when disabled', async () => {
    const { container } = render(
      <DatePickerField label="Start date" value="2026-10-05" onChange={() => {}} disabled size="small" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations with the calendar open', async () => {
    render(<DatePickerField label="Start date" value="2026-10-05" onChange={() => {}} minDate="2026-10-03" />);
    fireEvent.click(screen.getByRole('button', { name: /choose date/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // The calendar is portalled to the body, so the body is checked. `region`
    // is a whole-page rule (content outside landmarks), not one for a widget.
    expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
