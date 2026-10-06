import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { IdAutocomplete, type IdAutocompleteProps, type IdOption } from './IdAutocomplete';
import { RhfIdAutocomplete } from './IdAutocomplete.rhf';
import { withPinnedOption } from './createOption';

const people: IdOption[] = [
  { id: 1, label: 'Ada Lovelace', sublabel: 'ada@example.com' },
  { id: 2, label: 'Grace Hopper', sublabel: 'grace@example.com' },
  { id: 3, label: 'Alan Turing', sublabel: 'alan@example.com' },
  { id: 4, label: 'Katherine Johnson', sublabel: 'katherine@example.com' },
  { id: 5, label: 'Edsger Dijkstra', sublabel: 'edsger@example.com' },
];

const countries: IdOption[] = [
  { id: 'PT', label: 'Portugal', group: 'Recent' },
  { id: 'JP', label: 'Japan', group: 'Recent' },
  { id: 'BR', label: 'Brazil' },
  { id: 'CA', label: 'Canada' },
  { id: 'KE', label: 'Kenya' },
  { id: 'NZ', label: 'New Zealand' },
];

const meta: Meta<typeof IdAutocomplete> = {
  title: 'Inputs/IdAutocomplete',
  component: IdAutocomplete,
  args: { label: 'Owner', options: people, value: null, onChange: () => {} },
  decorators: [(Story) => <Box sx={{ maxWidth: 360 }}><Story /></Box>],
};
export default meta;

type Story = StoryObj<typeof IdAutocomplete>;

/** Keeps the value in state so the picker can be used. */
function Stateful(props: IdAutocompleteProps) {
  const [value, setValue] = React.useState(props.value);
  return (
    <Stack spacing={1}>
      <IdAutocomplete {...props} value={value} onChange={setValue} />
      <Typography variant="caption" color="text.secondary">
        Value: {JSON.stringify(value ?? null)}
      </Typography>
    </Stack>
  );
}

/** The value is the chosen person's id; the email shows as a second line. */
export const Controlled: Story = {
  render: (args) => <Stateful {...args} />,
  args: { helperText: 'Who runs the project' },
};

/** Options with a `group` come first under their header; the rest get none. */
export const Grouped: Story = {
  render: (args) => <Stateful {...args} />,
  args: { label: 'Country', options: countries, value: 'JP' },
};

export const Required: Story = {
  render: (args) => <Stateful {...args} />,
  args: { required: true },
};

export const WithError: Story = {
  render: (args) => <Stateful {...args} />,
  args: { required: true, errorMessage: 'Pick an owner', helperText: 'Hidden while there is an error' },
};

export const Disabled: Story = {
  args: { value: 2, disabled: true },
};

export const Small: Story = {
  render: (args) => <Stateful {...args} />,
  args: { size: 'small', value: 3 },
};

/** Pretends to be a server: matches the label or the email, after a delay. */
function useFakeSearch(source: IdOption[], delay = 400) {
  const [results, setResults] = React.useState(source.slice(0, 3));
  const [loading, setLoading] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const search = React.useCallback(
    (text: string) => {
      clearTimeout(timer.current);
      setLoading(true);
      timer.current = setTimeout(() => {
        const needle = text.trim().toLowerCase();
        setResults(source.filter((o) => `${o.label} ${o.sublabel ?? ''}`.toLowerCase().includes(needle)).slice(0, 3));
        setLoading(false);
      }, delay);
    },
    [source, delay],
  );
  React.useEffect(() => () => clearTimeout(timer.current), []);
  return { results, loading, search };
}

function ServerSearchDemo(props: IdAutocompleteProps) {
  const [value, setValue] = React.useState<IdOption['id'] | null>(1);
  const { results, loading, search } = useFakeSearch(people);
  return (
    <Stack spacing={1}>
      <IdAutocomplete
        {...props}
        options={results}
        value={value}
        onChange={setValue}
        onInputChange={search}
        loading={loading}
        loadingText="Searching…"
      />
      <Typography variant="caption" color="text.secondary">
        Value: {JSON.stringify(value)}. Try typing an email: the results are not filtered again by label.
      </Typography>
    </Stack>
  );
}

/** `onInputChange` + `loading`: the caller searches; the chosen label stays while results change. */
export const ServerSearch: Story = {
  render: (args) => <ServerSearchDemo {...args} />,
  args: { helperText: 'Results come from a (fake) server' },
};

function CreateRowDemo(props: IdAutocompleteProps) {
  const [value, setValue] = React.useState<IdOption['id'] | null>(null);
  const [created, setCreated] = React.useState<IdOption[]>([]);
  const options = created.reduce<readonly IdOption[]>((list, person) => withPinnedOption(list, person), people);
  return (
    <Stack spacing={1}>
      <IdAutocomplete
        {...props}
        options={options}
        value={value}
        onChange={setValue}
        onCreate={(typed) => {
          // An app would open its create form here and wait for the new record.
          const person = { id: 100 + created.length, label: typed, sublabel: 'Just added' };
          setCreated((list) => [...list, person]);
          setValue(person.id);
        }}
        createLabel={(typed) => `Add "${typed}" as a new person`}
      />
      <Typography variant="caption" color="text.secondary">
        Value: {JSON.stringify(value)}
      </Typography>
    </Stack>
  );
}

/** Type a name nobody has: the last row creates it and selects the new record. */
export const CreateRow: Story = {
  render: (args) => <CreateRowDemo {...args} />,
};

interface AssignmentForm {
  ownerId: number | null;
  countryId: string;
}

function ReactHookFormDemo() {
  const { control, handleSubmit } = useForm<AssignmentForm>({ defaultValues: { ownerId: null, countryId: '' } });
  const [submitted, setSubmitted] = React.useState<AssignmentForm | null>(null);
  return (
    <Stack component="form" spacing={2} noValidate onSubmit={handleSubmit(setSubmitted)}>
      <RhfIdAutocomplete
        name="ownerId"
        control={control}
        label="Owner"
        options={people}
        required
        rules={{ required: 'Pick an owner' }}
        fullWidth
      />
      <RhfIdAutocomplete
        name="countryId"
        control={control}
        label="Country"
        options={countries}
        emptyValue=""
        helperText="Optional; stored as '' when empty"
        fullWidth
      />
      <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
        Save
      </Button>
      {submitted && (
        <Typography variant="body2" component="pre">
          {JSON.stringify(submitted, null, 2)}
        </Typography>
      )}
    </Stack>
  );
}

/** `RhfIdAutocomplete` from `@rbalukja15/ui-components/rhf`, inside a `useForm` form. */
export const ReactHookForm: Story = {
  render: () => <ReactHookFormDemo />,
};
