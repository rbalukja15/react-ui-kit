import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { TitleCaseField, type TitleCaseFieldProps } from './TitleCaseField';
import { RhfTitleCaseField } from './TitleCaseField.rhf';

const meta: Meta<typeof TitleCaseField> = {
  title: 'Inputs/TitleCaseField',
  component: TitleCaseField,
  args: { label: 'Full name', value: '', onChange: () => {} },
  decorators: [(Story) => <Box sx={{ maxWidth: 360 }}><Story /></Box>],
};
export default meta;

type Story = StoryObj<typeof TitleCaseField>;

/** Keeps the value in state so the field can be typed into. */
function Stateful(props: TitleCaseFieldProps) {
  const [value, setValue] = React.useState(props.value);
  return (
    <Stack spacing={1}>
      <TitleCaseField {...props} value={value} onChange={setValue} />
      <Typography variant="caption" color="text.secondary">
        Value: {JSON.stringify(value)}
      </Typography>
    </Stack>
  );
}

/** Type `  ada   lovelace ` and tab out: the value becomes `Ada Lovelace`. */
export const Controlled: Story = {
  render: (args) => <Stateful {...args} />,
  args: { helperText: 'Cleaned up when you leave the field', placeholder: 'ada lovelace' },
};

export const Required: Story = {
  render: (args) => <Stateful {...args} />,
  args: { required: true },
};

export const WithError: Story = {
  render: (args) => <Stateful {...args} />,
  args: { value: '', required: true, errorMessage: 'Enter a name', helperText: 'Hidden while there is an error' },
};

export const Disabled: Story = {
  args: { value: 'Ada Lovelace', disabled: true },
};

/** `istanbul` becomes `İstanbul` with the Turkish locale. */
export const WithLocale: Story = {
  render: (args) => <Stateful {...args} />,
  args: { label: 'City', value: 'istanbul', locale: 'tr', helperText: 'Focus and leave the field' },
};

interface PersonForm {
  fullName: string;
  city: string;
}

function ReactHookFormDemo() {
  const { control, handleSubmit } = useForm<PersonForm>({ defaultValues: { fullName: '', city: '' } });
  const [submitted, setSubmitted] = React.useState<PersonForm | null>(null);
  return (
    <Stack component="form" spacing={2} noValidate onSubmit={handleSubmit(setSubmitted)}>
      <RhfTitleCaseField
        name="fullName"
        control={control}
        label="Full name"
        required
        rules={{ required: 'Enter a name' }}
        fullWidth
      />
      <RhfTitleCaseField name="city" control={control} label="City" helperText="Optional" fullWidth />
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

/** `RhfTitleCaseField` from `@rbalukja15/ui-components/rhf`, inside a `useForm` form. */
export const ReactHookForm: Story = {
  render: () => <ReactHookFormDemo />,
};
