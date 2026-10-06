import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { ThemeProvider, decomposeColor, getContrastRatio, recomposeColor } from '@mui/material/styles';
import { axe } from 'vitest-axe';
import { createAppTheme, type ThemeMode } from '../../theme/theme';
import { IdAutocomplete, type IdAutocompleteProps, type IdOption } from './IdAutocomplete';

const people: IdOption[] = [
  { id: 3, label: 'Alan Turing', sublabel: 'alan@example.com', group: 'Recent' },
  { id: 1, label: 'Ada Lovelace', sublabel: 'ada@example.com' },
  { id: 2, label: 'Grace Hopper' },
];

function renderPicker(props: Partial<IdAutocompleteProps> = {}) {
  return render(<IdAutocomplete label="Owner" options={people} value={null} onChange={() => {}} {...props} />);
}

describe('<IdAutocomplete> accessibility', () => {
  it('has no axe violations when empty', async () => {
    const { container } = renderPicker({ helperText: 'Who runs the project' });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations with a value', async () => {
    const { container } = renderPicker({ value: 1 });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations when required and in the error state', async () => {
    const { container } = renderPicker({ required: true, errorMessage: 'Pick an owner' });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations when disabled', async () => {
    const { container } = renderPicker({ value: 2, disabled: true });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations while loading', async () => {
    const { container } = renderPicker({ loading: true });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations with the list open, grouped, with sublabels and the create row', async () => {
    const { baseElement } = renderPicker({ onCreate: () => {} });
    const input = screen.getByRole('combobox', { name: 'Owner' });
    act(() => input.focus());
    fireEvent.change(input, { target: { value: 'a' } });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Add "a"' })).toBeInTheDocument();
    // The list renders in a portal, so check the whole document. `region`
    // (all content inside landmarks) is about the page around the component,
    // which this test does not have.
    expect(await axe(baseElement, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});

/** A translucent colour composited over an opaque background. */
function over(foreground: string, background: string) {
  const fg = decomposeColor(foreground);
  const bg = decomposeColor(background);
  const a = fg.values[3] ?? 1;
  const values = [0, 1, 2].map((i) => Math.round(fg.values[i]! * a + bg.values[i]! * (1 - a)));
  return recomposeColor({ type: 'rgb', values: values as [number, number, number] });
}

// axe cannot measure contrast in jsdom, so the create row, whose colour the
// component sets, is measured here against the list's paper in each state
// MUI draws an option in: at rest, under the mouse (action.hover) and
// highlighted from the keyboard (action.focus).
describe.each<ThemeMode>(['light', 'dark'])('<IdAutocomplete> create row contrast, %s theme', (mode) => {
  it('meets AA for body text at rest, hovered and highlighted', () => {
    const theme = createAppTheme(mode);
    render(
      <ThemeProvider theme={theme}>
        <IdAutocomplete label="Owner" options={people} value={null} onChange={() => {}} onCreate={() => {}} />
      </ThemeProvider>,
    );
    const input = screen.getByRole('combobox', { name: 'Owner' });
    act(() => input.focus());
    fireEvent.change(input, { target: { value: 'Zora' } });
    const label = within(screen.getByRole('option', { name: 'Add "Zora"' })).getByText('Add "Zora"');
    const color = getComputedStyle(label).color;
    const { paper } = theme.palette.background;
    const { hover, focus } = theme.palette.action;
    for (const background of [paper, over(hover, paper), over(focus, paper)]) {
      expect(getContrastRatio(color, background)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
