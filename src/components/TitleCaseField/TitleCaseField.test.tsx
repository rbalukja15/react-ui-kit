import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { TitleCaseField, type TitleCaseFieldProps } from './TitleCaseField';

type HarnessProps = Partial<TitleCaseFieldProps> & {
  initialValue?: string;
  onValue?: (value: string) => void;
};

/** Holds the value in state, the way a caller would. */
function Harness({ initialValue = '', onValue, ...props }: HarnessProps) {
  const [value, setValue] = React.useState(initialValue);
  return (
    <TitleCaseField
      label="Full name"
      value={value}
      onChange={(next) => {
        onValue?.(next);
        setValue(next);
      }}
      {...props}
    />
  );
}

const field = () => screen.getByRole('textbox', { name: 'Full name' });

describe('<TitleCaseField>', () => {
  it('renders a labelled text box showing the value', () => {
    render(<TitleCaseField label="Full name" value="Jane Doe" onChange={() => {}} />);
    expect(field()).toHaveValue('Jane Doe');
  });

  it('calls onChange with the typed text as a string, not the event', () => {
    const onChange = vi.fn();
    render(<TitleCaseField label="Full name" value="" onChange={onChange} />);
    fireEvent.change(field(), { target: { value: 'jane' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('jane');
  });

  it('does not change the text while typing', () => {
    render(<Harness />);
    fireEvent.change(field(), { target: { value: '  jane   doe' } });
    expect(field()).toHaveValue('  jane   doe');
  });

  it('title-cases the value on blur', () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    fireEvent.change(field(), { target: { value: '  jane   doe ' } });
    fireEvent.blur(field());
    expect(field()).toHaveValue('Jane Doe');
    expect(onValue.mock.calls).toEqual([['  jane   doe '], ['Jane Doe']]);
  });

  it('cleans the value it was given, so a value set by the caller is cleaned too', () => {
    const onChange = vi.fn();
    render(<TitleCaseField label="Full name" value="  ada   lovelace" onChange={onChange} />);
    fireEvent.blur(field());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('Ada Lovelace');
  });

  it('does not call onChange on blur when the value is already clean', () => {
    const onChange = vi.fn();
    const onBlur = vi.fn();
    render(<TitleCaseField label="Full name" value="Jane Doe" onChange={onChange} onBlur={onBlur} />);
    fireEvent.blur(field());
    expect(onChange).not.toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('does not call onChange on blur when the field is empty', () => {
    const onChange = vi.fn();
    render(<TitleCaseField label="Full name" value="" onChange={onChange} />);
    fireEvent.blur(field());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clears a whitespace-only value on blur', () => {
    const onChange = vi.fn();
    render(<TitleCaseField label="Full name" value={' \t '} onChange={onChange} />);
    fireEvent.blur(field());
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('calls onBlur with the blur event after onChange has the cleaned value', () => {
    const calls: string[] = [];
    let blurEventType = '';
    render(
      <TitleCaseField
        label="Full name"
        value="jane doe"
        onChange={(value) => calls.push(`change:${value}`)}
        onBlur={(event) => {
          blurEventType = event.type;
          calls.push('blur');
        }}
      />,
    );
    fireEvent.blur(field());
    expect(calls).toEqual(['change:Jane Doe', 'blur']);
    expect(blurEventType).toBe('blur');
  });

  it('leaves the value alone when the window loses focus but the field keeps it', () => {
    const onValue = vi.fn();
    const onBlur = vi.fn();
    render(<Harness onValue={onValue} onBlur={onBlur} />);
    act(() => field().focus());
    fireEvent.change(field(), { target: { value: 'ada ' } });
    // Switching to another window blurs the input but leaves it the active
    // element, so the user has not left the field: the space must survive.
    fireEvent.blur(field());
    expect(field()).toHaveFocus();
    expect(field()).toHaveValue('ada ');
    expect(onBlur).not.toHaveBeenCalled();

    fireEvent.change(field(), { target: { value: 'ada lovelace' } });
    act(() => field().blur());
    expect(field()).toHaveValue('Ada Lovelace');
    expect(onValue.mock.calls).toEqual([['ada '], ['ada lovelace'], ['Ada Lovelace']]);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('uppercases with the given locale', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <TitleCaseField label="Full name" value="istanbul" onChange={onChange} locale="tr" />,
    );
    fireEvent.blur(field());
    expect(onChange).toHaveBeenLastCalledWith('İstanbul');

    rerender(<TitleCaseField label="Full name" value="istanbul" onChange={onChange} locale="en" />);
    fireEvent.blur(field());
    expect(onChange).toHaveBeenLastCalledWith('Istanbul');
  });

  it('follows the value prop', () => {
    const { rerender } = render(<TitleCaseField label="Full name" value="Jane" onChange={() => {}} />);
    rerender(<TitleCaseField label="Full name" value="John" onChange={() => {}} />);
    expect(field()).toHaveValue('John');
  });

  describe('field props', () => {
    it('shows helperText as the description when there is no error', () => {
      render(<Harness helperText="As it appears on the passport" />);
      expect(field()).toHaveAccessibleDescription('As it appears on the passport');
      expect(field()).not.toBeInvalid();
    });

    it('shows errorMessage instead of helperText, in the error state', () => {
      render(<Harness helperText="As it appears on the passport" errorMessage="Enter a name" />);
      expect(field()).toBeInvalid();
      expect(field()).toHaveAttribute('aria-invalid', 'true');
      expect(field()).toHaveAccessibleDescription('Enter a name');
      expect(screen.queryByText('As it appears on the passport')).not.toBeInTheDocument();
      expect(screen.getByText('Enter a name')).toHaveClass('Mui-error');
    });

    it('treats an empty errorMessage as no error', () => {
      render(<Harness helperText="Hint" errorMessage="" />);
      expect(field()).not.toBeInvalid();
      expect(field()).toHaveAccessibleDescription('Hint');
    });

    it('can be put in the error state without a message, keeping helperText', () => {
      render(<Harness helperText="As it appears on the passport" error />);
      expect(field()).toBeInvalid();
      expect(field()).toHaveAttribute('aria-invalid', 'true');
      expect(field()).toHaveAccessibleDescription('As it appears on the passport');
      expect(screen.getByText('As it appears on the passport')).toHaveClass('Mui-error');
    });

    it('marks the field required through MUI, without changing the label text', () => {
      const { container } = render(<Harness required />);
      // The asterisk is aria-hidden, so the accessible name stays the label text.
      expect(field()).toBeRequired();
      expect(container.querySelector('.MuiFormLabel-asterisk')).toBeInTheDocument();
      const label = container.querySelector('label');
      expect(label?.firstChild?.textContent).toBe('Full name');
    });

    it('is not required by default', () => {
      const { container } = render(<Harness />);
      expect(field()).not.toBeRequired();
      expect(container.querySelector('.MuiFormLabel-asterisk')).not.toBeInTheDocument();
    });

    it('can be disabled', () => {
      render(<Harness disabled />);
      expect(field()).toBeDisabled();
    });

    it('passes size and fullWidth to the TextField', () => {
      const { container } = render(<Harness size="small" fullWidth />);
      expect(container.querySelector('.MuiInputBase-sizeSmall')).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('MuiFormControl-fullWidth');
    });

    it('passes other TextField props through', () => {
      const inputRef = React.createRef<HTMLInputElement>();
      render(
        <Harness
          name="fullName"
          id="full-name"
          placeholder="Jane Doe"
          autoComplete="name"
          inputRef={inputRef}
        />,
      );
      expect(field()).toHaveAttribute('name', 'fullName');
      expect(field()).toHaveAttribute('id', 'full-name');
      expect(field()).toHaveAttribute('placeholder', 'Jane Doe');
      expect(field()).toHaveAttribute('autocomplete', 'name');
      expect(inputRef.current).toBe(field());
    });
  });
});
