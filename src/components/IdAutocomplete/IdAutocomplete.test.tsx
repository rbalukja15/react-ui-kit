import * as React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { IdAutocomplete, type IdAutocompleteProps, type IdOption } from './IdAutocomplete';
import { withPinnedOption } from './createOption';

/** Options carry extra fields through the caller's own type. */
type Person = IdOption & { team?: string };

const people: Person[] = [
  { id: 1, label: 'Ada Lovelace', sublabel: 'ada@example.com', team: 'Engines' },
  { id: 2, label: 'Grace Hopper' },
  { id: 3, label: 'Alan Turing' },
];

/** The same people without sublabels, so an option's text is just its label. */
const plain = people.map(({ id, label }) => ({ id, label }));

type Id = IdOption['id'] | null | undefined;

/** The picker with its value in state, as a caller would hold it. */
function Picker({
  initial = null,
  onValue,
  ...props
}: Partial<IdAutocompleteProps> & { initial?: Id; onValue?: IdAutocompleteProps['onChange'] }) {
  const [value, setValue] = React.useState<Id>(initial);
  return (
    <IdAutocomplete
      label="Owner"
      options={people}
      value={value}
      onChange={(id, option) => {
        setValue(id);
        onValue?.(id, option);
      }}
      {...props}
    />
  );
}

const input = () => screen.getByRole<HTMLInputElement>('combobox', { name: 'Owner' });
const optionNames = () => screen.queryAllByRole('option').map((o) => o.textContent);

function focus() {
  act(() => input().focus());
}
function type(text: string) {
  fireEvent.change(input(), { target: { value: text } });
}
function openList() {
  focus();
  fireEvent.keyDown(input(), { key: 'ArrowDown' });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<IdAutocomplete>', () => {
  describe('value', () => {
    it('shows the label of the option whose id is the value', () => {
      render(<Picker initial={2} />);
      expect(input()).toHaveValue('Grace Hopper');
    });

    it('matches ids as strings, so a string value finds a number id and back', () => {
      const { unmount } = render(<Picker initial="2" />);
      expect(input()).toHaveValue('Grace Hopper');
      unmount();
      render(<Picker initial={7} options={[{ id: '7', label: 'Website redesign' }]} />);
      expect(input()).toHaveValue('Website redesign');
    });

    it.each([
      ['null', null],
      ['undefined', undefined],
      ['an empty string', ''],
    ])('treats %s as empty', (_name, value) => {
      render(<Picker initial={value} options={[...people, { id: '', label: 'Blank id' }]} />);
      expect(input()).toHaveValue('');
    });

    it('follows a value changed from outside, including back to empty', () => {
      const props = { label: 'Owner', options: people, onChange: () => {} };
      const { rerender } = render(<IdAutocomplete {...props} value={1} />);
      expect(input()).toHaveValue('Ada Lovelace');
      rerender(<IdAutocomplete {...props} value={3} />);
      expect(input()).toHaveValue('Alan Turing');
      rerender(<IdAutocomplete {...props} value={null} />);
      expect(input()).toHaveValue('');
    });

    it('uses isOptionEqualToValue to match the stored value', () => {
      type Country = IdOption & { code: string };
      const compare = vi.fn((option: Country, value: IdOption['id']) => option.code === value);
      const options: Country[] = [
        { id: 1, label: 'Portugal', code: 'PT' },
        { id: 2, label: 'Japan', code: 'JP' },
      ];
      render(<IdAutocomplete label="Owner" options={options} value="JP" onChange={() => {}} isOptionEqualToValue={compare} />);
      expect(input()).toHaveValue('Japan');
      expect(compare).toHaveBeenCalledWith(options[0], 'JP');
    });

    it('never asks isOptionEqualToValue about an empty value', () => {
      const compare = vi.fn(() => true);
      render(<Picker initial="" isOptionEqualToValue={compare} />);
      expect(input()).toHaveValue('');
      openList();
      expect(compare).not.toHaveBeenCalled();
    });
  });

  describe('picking', () => {
    it('reports the id and the option, and shows the label', () => {
      const onValue = vi.fn();
      const onChangeOption = vi.fn();
      render(<Picker onValue={onValue} onChangeOption={onChangeOption} />);
      openList();
      fireEvent.click(screen.getByRole('option', { name: /Ada Lovelace/ }));
      expect(onValue).toHaveBeenCalledWith(1, people[0]);
      // Extra fields come back with the option.
      expect(onChangeOption).toHaveBeenCalledWith(expect.objectContaining({ id: 1, team: 'Engines' }));
      expect(input()).toHaveValue('Ada Lovelace');
    });

    it('reports null for both when cleared', () => {
      const onValue = vi.fn();
      const onChangeOption = vi.fn();
      render(<Picker initial={2} onValue={onValue} onChangeOption={onChangeOption} />);
      focus();
      type('');
      expect(onValue).toHaveBeenCalledWith(null, null);
      expect(onChangeOption).toHaveBeenCalledWith(null);
      expect(input()).toHaveValue('');
    });

    it('lets the clear button name be overridden', () => {
      render(<Picker initial={2} clearText="Remove" openText="Show people" closeText="Hide people" />);
      expect(screen.getByLabelText('Remove')).toBeInTheDocument();
      expect(screen.getByLabelText('Show people')).toBeInTheDocument();
      openList();
      expect(screen.getByRole('button', { name: 'Hide people' })).toBeInTheDocument();
    });

    it('marks the chosen option selected, and never the create row', () => {
      render(<Picker initial={2} options={plain} onCreate={() => {}} />);
      focus();
      type('Grace');
      expect(screen.getByRole('option', { name: 'Grace Hopper' })).toHaveAttribute('aria-selected', 'true');
      type('Gracey');
      expect(screen.getByRole('option', { name: 'Add "Gracey"' })).toHaveAttribute('aria-selected', 'false');
    });

    it('calls onBlur when focus leaves the field', () => {
      const onBlur = vi.fn();
      render(<Picker onBlur={onBlur} />);
      focus();
      act(() => input().blur());
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('list', () => {
    it('shows the sublabel as a second line', () => {
      render(<Picker />);
      openList();
      const ada = screen.getByRole('option', { name: /Ada Lovelace/ });
      expect(within(ada).getByText('ada@example.com')).toBeInTheDocument();
    });

    it('filters by label as the user types', () => {
      render(<Picker />);
      focus();
      type('al');
      expect(optionNames()).toEqual(['Alan Turing']);
    });

    it('renders options that share a label, keyed by id', () => {
      const error = vi.spyOn(console, 'error');
      render(
        <Picker
          options={[
            { id: 1, label: 'Sam Lee', sublabel: 'Design' },
            { id: 2, label: 'Sam Lee', sublabel: 'Sales' },
          ]}
        />,
      );
      openList();
      expect(screen.getAllByRole('option')).toHaveLength(2);
      expect(error).not.toHaveBeenCalled();
    });

    it('draws a header over grouped options and none over the ungrouped rest', () => {
      render(
        <Picker
          options={[
            { id: 3, label: 'Alan Turing', group: 'Recent' },
            { id: 1, label: 'Ada Lovelace', group: 'Recent' },
            { id: 2, label: 'Grace Hopper' },
          ]}
        />,
      );
      openList();
      const listbox = screen.getByRole('listbox');
      expect(listbox.querySelectorAll('.MuiListSubheader-root')).toHaveLength(1);
      expect(within(listbox).getByText('Recent')).toBeInTheDocument();
      expect(optionNames()).toEqual(['Alan Turing', 'Ada Lovelace', 'Grace Hopper']);
      // Screen readers hear the header as the name of a group holding exactly
      // the grouped options; the rest belong to the listbox itself.
      const group = within(listbox).getByRole('group', { name: 'Recent' });
      expect(within(group).getAllByRole('option').map((o) => o.textContent)).toEqual(['Alan Turing', 'Ada Lovelace']);
      expect(within(listbox).getAllByRole('group')).toHaveLength(1);
      expect(screen.getByRole('option', { name: 'Grace Hopper' }).closest('[role="group"]')).toBeNull();
    });

    it('keeps the header over the grouped options when a record is pinned', () => {
      const warn = vi.spyOn(console, 'warn');
      const grouped = [
        { id: 3, label: 'Alan Turing', group: 'Recent' },
        { id: 1, label: 'Ada Lovelace' },
        { id: 2, label: 'Grace Hopper' },
      ];
      render(<Picker options={withPinnedOption(grouped, { id: 9, label: 'Zora Neale Hurston' })} />);
      openList();
      expect(optionNames()).toEqual(['Alan Turing', 'Zora Neale Hurston', 'Ada Lovelace', 'Grace Hopper']);
      const group = within(screen.getByRole('listbox')).getByRole('group', { name: 'Recent' });
      expect(within(group).getAllByRole('option').map((o) => o.textContent)).toEqual(['Alan Turing']);
      // MUI warns when the same group shows up twice.
      expect(warn).not.toHaveBeenCalled();
    });

    it('draws no headers when no option has a group', () => {
      render(<Picker />);
      openList();
      expect(screen.getByRole('listbox').querySelectorAll('.MuiListSubheader-root')).toHaveLength(0);
    });

    it('shows noOptionsText when nothing matches', () => {
      render(<Picker noOptionsText="Nobody found" />);
      focus();
      type('zzz');
      expect(screen.getByText('Nobody found')).toBeInTheDocument();
    });
  });

  describe('server search', () => {
    /** Searches "on the server": every keystroke replaces the options. */
    function Search({
      initial = null,
      onSearch,
      ...props
    }: Partial<IdAutocompleteProps> & { initial?: Id; onSearch?: (text: string) => void }) {
      const [results, setResults] = React.useState(people);
      return (
        <Picker
          initial={initial}
          options={results}
          onInputChange={(text) => {
            onSearch?.(text);
            // Also matches the sublabel, which MUI's own filter does not look at.
            const needle = text.toLowerCase();
            setResults(
              people.filter((p) => `${p.label} ${p.sublabel ?? ''}`.toLowerCase().includes(needle)),
            );
          }}
          {...props}
        />
      );
    }

    it('forwards typing but not the text a pick writes', () => {
      const onSearch = vi.fn();
      render(<Search onSearch={onSearch} />);
      focus();
      type('gr');
      expect(onSearch).toHaveBeenCalledWith('gr');
      fireEvent.click(screen.getByRole('option', { name: 'Grace Hopper' }));
      expect(input()).toHaveValue('Grace Hopper');
      expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it('does not filter the options itself', () => {
      render(<Search />);
      focus();
      type('example.com');
      // The server matched the email in the sublabel; MUI's label filter would
      // have hidden the row.
      expect(screen.getAllByRole('option')).toHaveLength(1);
      expect(screen.getByRole('option', { name: /Ada Lovelace/ })).toBeInTheDocument();
    });

    it('keeps the typed text when the results drop the chosen option', () => {
      render(<Search initial={1} />);
      expect(input()).toHaveValue('Ada Lovelace');
      focus();
      type('Grac');
      expect(optionNames()).toEqual(['Grace Hopper']);
      expect(input()).toHaveValue('Grac');
    });

    it('keeps the chosen option out of the list, and MUI quiet, once the results drop it', () => {
      const warn = vi.spyOn(console, 'warn');
      render(<Search initial={1} />);
      focus();
      type('Grac');
      expect(optionNames()).toEqual(['Grace Hopper']);
      expect(warn).not.toHaveBeenCalled();
    });

    it('shows a spinner while loading, named by loadingText', () => {
      const { rerender } = render(<IdAutocomplete label="Owner" options={[]} value={null} onChange={() => {}} loading />);
      expect(screen.getByRole('progressbar', { name: 'Loading…' })).toBeInTheDocument();
      rerender(
        <IdAutocomplete label="Owner" options={[]} value={null} onChange={() => {}} loading loadingText="Searching" />,
      );
      expect(screen.getByRole('progressbar', { name: 'Searching' })).toBeInTheDocument();
      openList();
      expect(within(document.body).getByText('Searching')).toHaveClass('MuiAutocomplete-loading');
    });

    it('shows no spinner when not loading', () => {
      render(<Picker />);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  describe('options rebuilt on every render', () => {
    it('keeps the typed text when the chosen option is a new object with the same label', () => {
      const props = { label: 'Owner', value: 1, onChange: () => {} };
      const { rerender } = render(<IdAutocomplete {...props} options={people.map((p) => ({ ...p }))} />);
      focus();
      type('Gr');
      rerender(<IdAutocomplete {...props} options={people.map((p) => ({ ...p }))} />);
      expect(input()).toHaveValue('Gr');
    });

    it('shows the new label when the chosen option was renamed', () => {
      const props = { label: 'Owner', value: 1, onChange: () => {} };
      const { rerender } = render(<IdAutocomplete {...props} options={people} />);
      expect(input()).toHaveValue('Ada Lovelace');
      rerender(<IdAutocomplete {...props} options={[{ id: 1, label: 'Ada King' }, ...people.slice(1)]} />);
      expect(input()).toHaveValue('Ada King');
    });
  });

  describe('create row', () => {
    it('is offered last while text is typed, with the default label', () => {
      render(<Picker options={plain} onCreate={() => {}} />);
      focus();
      type('a');
      expect(optionNames()).toEqual(['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Add "a"']);
    });

    it('is not offered before anything is typed', () => {
      render(<Picker options={plain} onCreate={() => {}} />);
      openList();
      expect(optionNames()).toEqual(['Ada Lovelace', 'Grace Hopper', 'Alan Turing']);
    });

    it('survives filtering, as the only row when nothing matches', () => {
      render(<Picker onCreate={() => {}} createLabel={(typed) => `New person "${typed}"`} />);
      focus();
      // The trailing spaces would fail MUI's filter, which does not trim.
      type('Zora  ');
      expect(screen.getAllByRole('option')).toHaveLength(1);
      expect(screen.getByRole('option', { name: 'New person "Zora"' })).toBeInTheDocument();
    });

    it('is hidden when an option already has exactly that label, ignoring case and spaces', () => {
      render(<Picker onCreate={() => {}} />);
      focus();
      type(' grace HOPPER ');
      expect(screen.queryByRole('option', { name: /Add/ })).not.toBeInTheDocument();
    });

    it('calls onCreate with the trimmed text, leaves the value alone and keeps the text', () => {
      const onCreate = vi.fn();
      const onValue = vi.fn();
      const onChangeOption = vi.fn();
      render(<Picker initial={2} onCreate={onCreate} onValue={onValue} onChangeOption={onChangeOption} />);
      focus();
      type('Zora ');
      fireEvent.click(screen.getByRole('option', { name: 'Add "Zora"' }));
      expect(onCreate).toHaveBeenCalledWith('Zora');
      expect(onValue).not.toHaveBeenCalled();
      expect(onChangeOption).not.toHaveBeenCalled();
      expect(input()).toHaveValue('Zora');
    });

    it('does not offer the label a pick writes into the box', () => {
      // A pick rewrites the text with the picked label. That is not typed text:
      // once the results no longer hold the picked option, it must not turn
      // into an "Add" row for a record that exists.
      const props = { label: 'Owner', onCreate: () => {}, onInputChange: () => {}, onChange: () => {} };
      const { rerender } = render(<IdAutocomplete {...props} options={people} value={null} />);
      focus();
      type('Grace');
      fireEvent.click(screen.getByRole('option', { name: 'Grace Hopper' }));
      rerender(<IdAutocomplete {...props} options={people.slice(2)} value={2} />);
      openList();
      expect(input()).toHaveValue('Grace Hopper');
      expect(optionNames()).toEqual(['Alan Turing']);
    });

    it('is reachable by typing over a chosen option while searching on the server', () => {
      const onCreate = vi.fn();
      function Search() {
        const [results, setResults] = React.useState(people);
        return (
          <Picker
            initial={1}
            options={results}
            onCreate={onCreate}
            onInputChange={(text) => setResults(people.filter((p) => p.label.includes(text)))}
          />
        );
      }
      render(<Search />);
      focus();
      type('Zora');
      expect(input()).toHaveValue('Zora');
      fireEvent.click(screen.getByRole('option', { name: 'Add "Zora"' }));
      expect(onCreate).toHaveBeenCalledWith('Zora');
    });

    it('shows a record created from it once the caller selects and pins it', () => {
      function CreateFlow() {
        const [value, setValue] = React.useState<Id>(null);
        const [created, setCreated] = React.useState<IdOption | null>(null);
        return (
          <IdAutocomplete
            label="Owner"
            options={withPinnedOption(people, created)}
            value={value}
            onChange={setValue}
            onCreate={(typed) => {
              setCreated({ id: 99, label: typed });
              setValue(99);
            }}
          />
        );
      }
      render(<CreateFlow />);
      focus();
      type('Zora');
      fireEvent.click(screen.getByRole('option', { name: 'Add "Zora"' }));
      act(() => input().blur());
      expect(input()).toHaveValue('Zora');
      openList();
      expect(optionNames()[0]).toBe('Zora');
    });
  });

  describe('field props', () => {
    it('marks the field required through MUI, without changing the label text', () => {
      render(<Picker required />);
      expect(input()).toBeRequired();
      const label = document.querySelector('label');
      expect(label?.querySelector('.MuiFormLabel-asterisk')).toBeInTheDocument();
      expect(label?.firstChild?.textContent).toBe('Owner');
    });

    it('shows helperText, replaced by errorMessage in the error state', () => {
      const { rerender } = render(<Picker helperText="Who runs it" />);
      expect(screen.getByText('Who runs it')).toBeInTheDocument();
      expect(input()).toHaveAttribute('aria-invalid', 'false');
      rerender(<Picker helperText="Who runs it" errorMessage="Pick an owner" />);
      expect(screen.queryByText('Who runs it')).not.toBeInTheDocument();
      expect(screen.getByText('Pick an owner')).toHaveClass('Mui-error');
      expect(input()).toHaveAttribute('aria-invalid', 'true');
      expect(input()).toHaveAccessibleDescription('Pick an owner');
    });

    it('can be put in the error state without a message, keeping helperText', () => {
      render(<Picker helperText="Who runs it" error />);
      expect(input()).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText('Who runs it')).toHaveClass('Mui-error');
      expect(input()).toHaveAccessibleDescription('Who runs it');
    });

    it('treats an empty errorMessage as no error', () => {
      render(<Picker helperText="Who runs it" errorMessage="" />);
      expect(input()).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByText('Who runs it')).toBeInTheDocument();
    });

    it('can be disabled', () => {
      render(<Picker initial={1} disabled />);
      expect(input()).toBeDisabled();
    });

    it('passes size, fullWidth, id, name, placeholder and inputRef through', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(
        <Picker size="small" fullWidth id="owner" name="owner" placeholder="Search people" inputRef={ref} />,
      );
      expect(input()).toHaveAttribute('id', 'owner');
      expect(input()).toHaveAttribute('name', 'owner');
      expect(input()).toHaveAttribute('placeholder', 'Search people');
      expect(ref.current).toBe(input());
      expect(input().closest('.MuiInputBase-root')).toHaveClass('MuiInputBase-sizeSmall');
      expect(input().closest('.MuiAutocomplete-root')).toHaveClass('MuiAutocomplete-fullWidth');
    });
  });
});
