import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/de';
import 'dayjs/locale/en-gb';
import { DatePickerField, type DatePickerFieldProps } from './DatePickerField';

// These tests run unchanged on every supported @mui/x-date-pickers major. Up
// to v7 the field is one text input; from v8 it is a group of day, month and
// year spinbuttons over a hidden input. Both carry the value as text, take a
// whole typed date through a change event, and focus the field on `focus()`.

/** The `<input>`: the visible text input up to v7, the hidden one from v8. */
const input = (container: HTMLElement) => container.querySelector('input') as HTMLInputElement;

/** A sectioned field's parts joined with `/` (empty ones show their placeholder), or `null` for a text input. */
function sectionsText(container: HTMLElement) {
  const sections = container.querySelectorAll('[role="spinbutton"]');
  return sections.length > 0 ? Array.from(sections, (section) => section.textContent).join('/') : null;
}

/** The date as the field shows it. */
const shownText = (container: HTMLElement) => sectionsText(container) ?? input(container).value;

/** The placeholder pattern of the empty field. */
const placeholderPattern = (container: HTMLElement) => sectionsText(container) ?? input(container).placeholder;

/** Focuses the first part of the field (its first spinbutton, or the start of the input). */
async function focusFirstPart(container: HTMLElement) {
  const section = container.querySelector<HTMLElement>('[role="spinbutton"]');
  if (section) {
    await act(async () => section.focus());
    fireEvent.click(section);
    return section;
  }
  const el = input(container);
  await act(async () => el.focus());
  // The text input picks its active part on a timer after focus.
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  el.setSelectionRange(0, 0);
  fireEvent.mouseUp(el);
  fireEvent.click(el);
  return el;
}

/** Types one digit into the year part, which the field has selected. */
async function typeYearDigit(container: HTMLElement, digit: string) {
  const year = container.querySelectorAll<HTMLElement>('[role="spinbutton"]')[2];
  if (year) {
    if (document.activeElement !== year) {
      await act(async () => year.focus());
      fireEvent.click(year);
    }
    year.textContent = digit;
    fireEvent.input(year);
    return;
  }
  // The text input: select the year (characters 6-10 of DD/MM/YYYY) once,
  // then replace the selection with the digit, as typing does.
  const el = input(container);
  if (document.activeElement !== el) {
    await act(async () => el.focus());
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    el.setSelectionRange(6, 10);
    fireEvent.mouseUp(el);
    fireEvent.click(el);
  }
  fireEvent.change(el, { target: { value: el.value.slice(0, 6) + digit } });
}

/** What loses focus when the user leaves the field. */
const blurTarget = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[role="spinbutton"]') ?? input(container);

const openCalendar = () => fireEvent.click(screen.getByRole('button', { name: /choose date/i }));

type StatefulProps = Omit<DatePickerFieldProps, 'value' | 'onChange' | 'label'> & {
  initialValue?: string;
  onChange?: (value: string) => void;
};

/** Holds the value in state, as a parent would. */
function Stateful({ initialValue = '', onChange, ...props }: StatefulProps) {
  const [value, setValue] = React.useState(initialValue);
  return (
    <DatePickerField
      label="Start date"
      {...props}
      value={value}
      onChange={(next) => {
        onChange?.(next);
        setValue(next);
      }}
    />
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe('<DatePickerField>', () => {
  describe('value and format', () => {
    it('shows the ISO value in the locale default format when no format is given', () => {
      const { container } = render(<DatePickerField label="Start date" value="2026-10-05" onChange={() => {}} />);
      expect(input(container)).toHaveValue('10/05/2026');
    });

    it('shows and reads dates in the given format', () => {
      const onChange = vi.fn();
      const { container } = render(<Stateful format="DD/MM/YYYY" initialValue="2026-10-05" onChange={onChange} />);
      expect(input(container)).toHaveValue('05/10/2026');

      fireEvent.change(input(container), { target: { value: '07/11/2026' } });
      expect(onChange).toHaveBeenLastCalledWith('2026-11-07');
      expect(input(container)).toHaveValue('07/11/2026');
    });

    it('reads a typed date in the default format and emits it as ISO', () => {
      const onChange = vi.fn();
      const { container } = render(<Stateful onChange={onChange} />);
      fireEvent.change(input(container), { target: { value: '10/05/2026' } });
      expect(onChange).toHaveBeenLastCalledWith('2026-10-05');
    });

    it('follows the format in the empty field placeholder', () => {
      const { container, rerender } = render(<DatePickerField label="Start date" value="" onChange={() => {}} />);
      expect(placeholderPattern(container)).toBe('MM/DD/YYYY');
      rerender(<DatePickerField label="Start date" value="" onChange={() => {}} format="DD/MM/YYYY" />);
      expect(placeholderPattern(container)).toBe('DD/MM/YYYY');
    });

    it('shows an empty field for a value that is not a real ISO date', () => {
      const { container, rerender } = render(<DatePickerField label="Start date" value="soon" onChange={() => {}} />);
      expect(input(container)).toHaveValue('');
      rerender(<DatePickerField label="Start date" value="2026-02-30" onChange={() => {}} />);
      expect(input(container)).toHaveValue('');
    });

    it('reads only the date part of a value with a time', () => {
      const { container } = render(
        <DatePickerField label="Start date" value="2026-10-05T23:30:00Z" onChange={() => {}} format="DD/MM/YYYY" />,
      );
      expect(input(container)).toHaveValue('05/10/2026');
    });
  });

  describe('onChange', () => {
    it("emits '' when the field is cleared", () => {
      const onChange = vi.fn();
      const { container } = render(<Stateful initialValue="2026-10-05" onChange={onChange} />);
      fireEvent.change(input(container), { target: { value: '' } });
      expect(onChange).toHaveBeenLastCalledWith('');
      expect(input(container)).toHaveValue('');
    });

    it("emits '' for a date that does not exist, never a rolled-over one", () => {
      const onChange = vi.fn();
      const { container } = render(<Stateful format="DD/MM/YYYY" initialValue="2026-10-05" onChange={onChange} />);
      fireEvent.change(input(container), { target: { value: '31/02/2026' } });
      expect(onChange).toHaveBeenLastCalledWith('');
    });

    it("emits '' while a date is incomplete, and keeps what was typed when the parent echoes it", async () => {
      const onChange = vi.fn();
      const { container } = render(<Stateful format="DD/MM/YYYY" initialValue="2026-10-05" onChange={onChange} />);
      const day = await focusFirstPart(container);

      fireEvent.keyDown(day, { key: 'Delete' });
      expect(onChange).toHaveBeenLastCalledWith('');
      expect(shownText(container)).toBe('DD/10/2026');

      fireEvent.keyDown(document.activeElement ?? day, { key: 'ArrowUp' });
      expect(onChange).toHaveBeenLastCalledWith('2026-10-01');
      expect(shownText(container)).toBe('01/10/2026');
    });

    it('does not emit the years passed through while a year is typed', async () => {
      const onChange = vi.fn();
      const { container } = render(<Stateful format="DD/MM/YYYY" initialValue="2026-10-05" onChange={onChange} />);
      for (const digit of ['2', '0', '2', '7']) await typeYearDigit(container, digit);
      expect(shownText(container)).toBe('05/10/2027');
      const emitted: unknown[] = onChange.mock.calls.map((call) => call[0]);
      expect(emitted.filter((value) => value !== '')).toEqual(['2027-10-05']);
    });

    it('shows a new value set by the parent', () => {
      const { container, rerender } = render(
        <DatePickerField label="Start date" value="2026-10-05" onChange={() => {}} format="DD/MM/YYYY" />,
      );
      rerender(<DatePickerField label="Start date" value="2027-01-31" onChange={() => {}} format="DD/MM/YYYY" />);
      expect(input(container)).toHaveValue('31/01/2027');
      rerender(<DatePickerField label="Start date" value="" onChange={() => {}} format="DD/MM/YYYY" />);
      expect(input(container)).toHaveValue('');
    });

    it('shows the value the parent keeps when it adjusts the change', () => {
      /** Snaps every date to the first of its month. */
      function MonthStart() {
        const [value, setValue] = React.useState('2026-10-05');
        return (
          <DatePickerField
            label="Start date"
            value={value}
            onChange={(next) => setValue(next ? `${next.slice(0, 8)}01` : '')}
            format="DD/MM/YYYY"
          />
        );
      }
      const { container } = render(<MonthStart />);
      fireEvent.change(input(container), { target: { value: '17/11/2026' } });
      expect(input(container)).toHaveValue('01/11/2026');
    });
  });

  describe('field props', () => {
    it('marks the field required through MUI, without changing the label text', () => {
      const { container } = render(<DatePickerField label="Start date" value="" onChange={() => {}} required />);
      const label = container.querySelector('label');
      expect(label?.firstChild?.textContent).toBe('Start date');
      expect(label?.querySelector('.MuiFormLabel-asterisk')).not.toBeNull();
      expect(input(container)).toBeRequired();
    });

    it('shows the error message instead of the helper text and marks the field invalid', () => {
      const { container, rerender } = render(
        <DatePickerField label="Start date" value="" onChange={() => {}} helperText="When the work begins" />,
      );
      expect(screen.getByText('When the work begins')).not.toHaveClass('Mui-error');
      expect(container.querySelector('[aria-invalid="true"]')).toBeNull();

      rerender(
        <DatePickerField
          label="Start date"
          value=""
          onChange={() => {}}
          helperText="When the work begins"
          errorMessage="Pick a start date"
        />,
      );
      const message = screen.getByText('Pick a start date');
      expect(message).toHaveClass('Mui-error');
      expect(screen.queryByText('When the work begins')).not.toBeInTheDocument();
      expect(container.querySelector('[aria-invalid="true"]')).not.toBeNull();
      // The message is the field's description.
      const described = container.querySelector('[aria-describedby]');
      expect(described?.getAttribute('aria-describedby')?.split(' ')).toContain(message.id);
    });

    it('tells screen readers the field is required where MUI X can: the text box up to v7', () => {
      render(<DatePickerField label="Start date" value="" onChange={() => {}} required />);
      const textbox = screen.queryByRole('textbox', { name: 'Start date' });
      if (!textbox) {
        // From v8 the field is a group of day, month and year spinbuttons,
        // none of which MUI X marks as required; the `required` docs say so.
        expect(screen.getByRole('group', { name: 'Start date' })).toBeInTheDocument();
        return;
      }
      expect(textbox).toBeRequired();
    });

    it('can be put in the error state without a message, keeping helperText', () => {
      const { container } = render(
        <DatePickerField label="Start date" value="" onChange={() => {}} helperText="When the work begins" error />,
      );
      expect(container.querySelector('[aria-invalid="true"]')).not.toBeNull();
      expect(screen.getByText('When the work begins')).toHaveClass('Mui-error');
    });

    it('disables the field and its calendar button', () => {
      const { container } = render(<DatePickerField label="Start date" value="2026-10-05" onChange={() => {}} disabled />);
      expect(input(container)).toBeDisabled();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('puts the name on the input, which the label points at', () => {
      const { container } = render(<DatePickerField label="Start date" value="" onChange={() => {}} name="startDate" />);
      expect(input(container)).toHaveAttribute('name', 'startDate');
      expect(container.querySelector('label')).toHaveAttribute('for', input(container).id);
    });

    it('applies size, fullWidth and sx', () => {
      const { container } = render(
        <DatePickerField label="Start date" value="" onChange={() => {}} size="small" fullWidth sx={{ mt: 3 }} />,
      );
      expect(container.querySelector('[class*="sizeSmall"]')).not.toBeNull();
      expect(container.firstElementChild).toHaveClass('MuiFormControl-fullWidth');
      expect(container.firstElementChild).toHaveStyle({ marginTop: '24px' });
    });

    it('gives inputRef the input, whose focus() focuses the field', async () => {
      const ref = React.createRef<HTMLInputElement>();
      const { container } = render(<DatePickerField label="Start date" value="" onChange={() => {}} inputRef={ref} />);
      expect(ref.current).toBe(input(container));
      await act(async () => ref.current?.focus());
      expect(document.activeElement).not.toBe(document.body);
      expect(container.contains(document.activeElement)).toBe(true);
    });
  });

  describe('onBlur', () => {
    it('is called when focus leaves the field', () => {
      const onBlur = vi.fn();
      const { container } = render(<DatePickerField label="Start date" value="" onChange={() => {}} onBlur={onBlur} />);
      const target = blurTarget(container);
      fireEvent.focus(target);
      fireEvent.blur(target);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('is not called while focus moves between the parts of a sectioned field', () => {
      const onBlur = vi.fn();
      const { container } = render(<DatePickerField label="Start date" value="" onChange={() => {}} onBlur={onBlur} />);
      const [first, second] = Array.from(container.querySelectorAll<HTMLElement>('[role="spinbutton"]'));
      // Only the sectioned field (MUI X 8 and later) has parts to move between.
      if (!first || !second) return;
      fireEvent.blur(first, { relatedTarget: second });
      expect(onBlur).not.toHaveBeenCalled();
      fireEvent.blur(second, { relatedTarget: document.body });
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('calendar', () => {
    it('emits the picked day as ISO', () => {
      const onChange = vi.fn();
      const { container } = render(<Stateful initialValue="2026-10-05" format="DD/MM/YYYY" onChange={onChange} />);
      openCalendar();
      // The dialog takes its name from the field's label.
      expect(screen.getByRole('dialog', { name: 'Start date' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('gridcell', { name: '12' }));
      expect(onChange).toHaveBeenLastCalledWith('2026-10-12');
      expect(input(container)).toHaveValue('12/10/2026');
    });

    it('only offers days between minDate and maxDate', () => {
      render(
        <DatePickerField
          label="Start date"
          value="2026-10-05"
          onChange={() => {}}
          minDate="2026-10-03"
          maxDate="2026-10-20"
        />,
      );
      openCalendar();
      expect(screen.getByRole('gridcell', { name: '2' })).toBeDisabled();
      expect(screen.getByRole('gridcell', { name: '3' })).toBeEnabled();
      expect(screen.getByRole('gridcell', { name: '20' })).toBeEnabled();
      expect(screen.getByRole('gridcell', { name: '21' })).toBeDisabled();
    });

    it('disables past or future days', () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 9, 15, 12));
      const { unmount } = render(<DatePickerField label="Start date" value="" onChange={() => {}} disablePast />);
      openCalendar();
      expect(screen.getByRole('gridcell', { name: '14' })).toBeDisabled();
      expect(screen.getByRole('gridcell', { name: '16' })).toBeEnabled();
      unmount();

      render(<DatePickerField label="Start date" value="" onChange={() => {}} disableFuture />);
      openCalendar();
      expect(screen.getByRole('gridcell', { name: '14' })).toBeEnabled();
      expect(screen.getByRole('gridcell', { name: '16' })).toBeDisabled();
    });

    it('passes a typed date outside the range through, and marks the field invalid', () => {
      const onChange = vi.fn();
      const { container } = render(<Stateful format="DD/MM/YYYY" minDate="2026-01-01" onChange={onChange} />);
      fireEvent.change(input(container), { target: { value: '31/12/2025' } });
      expect(onChange).toHaveBeenLastCalledWith('2025-12-31');
      expect(container.querySelector('[aria-invalid="true"]')).not.toBeNull();
    });
  });

  describe('localisation', () => {
    it('uses the given adapterLocale for the default format', () => {
      const { container } = render(
        <DatePickerField label="Start date" value="2026-10-05" onChange={() => {}} adapterLocale="de" />,
      );
      expect(input(container)).toHaveValue('05.10.2026');
    });

    it('labels the calendar button through localeText.openDatePickerDialogue', () => {
      const localeText = {
        openDatePickerDialogue: (date: string | null) => (date ? `Change date, now ${date}` : 'Pick a date'),
      };
      const { rerender } = render(
        <DatePickerField label="Start date" value="" onChange={() => {}} localeText={localeText} />,
      );
      expect(screen.getByRole('button', { name: 'Pick a date' })).toBeInTheDocument();
      rerender(<DatePickerField label="Start date" value="2026-10-12" onChange={() => {}} localeText={localeText} />);
      expect(screen.getByRole('button', { name: 'Change date, now Oct 12, 2026' })).toBeInTheDocument();
    });

    it('translates the empty field placeholder through localeText', () => {
      const { container } = render(
        <DatePickerField
          label="Start date"
          value=""
          onChange={() => {}}
          format="DD/MM/YYYY"
          localeText={{
            fieldDayPlaceholder: () => 'JJ',
            fieldMonthPlaceholder: () => 'MM',
            fieldYearPlaceholder: ({ digitAmount }) => 'A'.repeat(digitAmount),
          }}
        />,
      );
      expect(placeholderPattern(container)).toBe('JJ/MM/AAAA');
    });

    it('translates the calendar through localeText', () => {
      render(
        <DatePickerField
          label="Start date"
          value="2026-10-05"
          onChange={() => {}}
          localeText={{
            previousMonth: 'Earlier month',
            nextMonth: 'Later month',
            calendarViewSwitchingButtonAriaLabel: (view) => (view === 'year' ? 'Back to days' : 'Show years'),
          }}
        />,
      );
      openCalendar();
      expect(screen.getByRole('button', { name: 'Earlier month' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Later month' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Show years' })).toBeInTheDocument();
    });

    it("follows an app-level LocalizationProvider's locale and texts when given none", () => {
      const { container } = render(
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale="de"
          localeText={{ previousMonth: 'Vorheriger Monat', nextMonth: 'Nächster Monat' }}
        >
          <DatePickerField label="Start date" value="2026-10-05" onChange={() => {}} />
        </LocalizationProvider>,
      );
      expect(input(container)).toHaveValue('05.10.2026');
      openCalendar();
      expect(screen.getByRole('button', { name: 'Vorheriger Monat' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Nächster Monat' })).toBeInTheDocument();
    });

    it("overrides an app-level LocalizationProvider only where it is told to", () => {
      const { container } = render(
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale="de"
          localeText={{ previousMonth: 'Vorheriger Monat', nextMonth: 'Nächster Monat' }}
        >
          <DatePickerField
            label="Start date"
            value="2026-10-05"
            onChange={() => {}}
            adapterLocale="en-gb"
            localeText={{ nextMonth: 'Later month' }}
          />
        </LocalizationProvider>,
      );
      expect(input(container)).toHaveValue('05/10/2026');
      openCalendar();
      expect(screen.getByRole('button', { name: 'Vorheriger Monat' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Later month' })).toBeInTheDocument();
    });

    it("brings its own dayjs adapter when the app's adapter is another library's", () => {
      /** Stands in for a date-fns or Luxon adapter: same API, another `lib`. */
      class OtherLibraryAdapter extends AdapterDayjs {
        lib = 'other';
      }
      const { container } = render(
        <LocalizationProvider
          dateAdapter={OtherLibraryAdapter}
          adapterLocale="de"
          localeText={{ previousMonth: 'Vorheriger Monat' }}
        >
          <DatePickerField label="Start date" value="2026-10-05" onChange={() => {}} />
        </LocalizationProvider>,
      );
      // Its own adapter has no locale, so the format is English; the texts still carry over.
      expect(input(container)).toHaveValue('10/05/2026');
      openCalendar();
      expect(screen.getByRole('button', { name: 'Vorheriger Monat' })).toBeInTheDocument();
    });

    it('drops localeText keys set to undefined instead of blanking the app texts', () => {
      render(
        <LocalizationProvider dateAdapter={AdapterDayjs} localeText={{ previousMonth: 'Earlier month' }}>
          <DatePickerField
            label="Start date"
            value="2026-10-05"
            onChange={() => {}}
            localeText={{ previousMonth: undefined }}
          />
        </LocalizationProvider>,
      );
      openCalendar();
      expect(screen.getByRole('button', { name: 'Earlier month' })).toBeInTheDocument();
    });

    it('brings its own adapter when an app-level provider has none', () => {
      const onChange = vi.fn();
      render(
        <LocalizationProvider localeText={{ previousMonth: 'Earlier month' }}>
          <Stateful initialValue="2026-10-05" onChange={onChange} />
        </LocalizationProvider>,
      );
      openCalendar();
      expect(screen.getByRole('button', { name: 'Earlier month' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('gridcell', { name: '12' }));
      expect(onChange).toHaveBeenLastCalledWith('2026-10-12');
    });
  });
});
