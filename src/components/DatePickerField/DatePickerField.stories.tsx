import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useForm } from 'react-hook-form';
import 'dayjs/locale/de';
import 'dayjs/locale/en-gb';
import { DatePickerField, type DatePickerFieldProps } from './DatePickerField';
import { RhfDatePickerField } from './DatePickerField.rhf';

const meta: Meta<typeof DatePickerField> = {
  title: 'Inputs/DatePickerField',
  component: DatePickerField,
  args: { label: 'Start date', value: '', onChange: () => {} },
  decorators: [(Story) => <Box sx={{ maxWidth: 360 }}><Story /></Box>],
};
export default meta;

type Story = StoryObj<typeof DatePickerField>;

/** Keeps the value in state and shows the ISO string the field reports. */
function Stateful(props: DatePickerFieldProps) {
  const [value, setValue] = React.useState(props.value);
  return (
    <Stack spacing={1}>
      <DatePickerField {...props} value={value} onChange={setValue} />
      <Typography variant="caption" color="text.secondary">
        Value: {JSON.stringify(value)}
      </Typography>
    </Stack>
  );
}

/** Type a date or pick one: the value is ISO, and `''` while a date is half typed. */
export const Controlled: Story = {
  render: (args) => <Stateful {...args} />,
  args: { helperText: 'When the project starts', fullWidth: true },
};

/** `format` sets how the date is shown and typed; the value stays ISO. */
export const CustomFormat: Story = {
  render: (args) => <Stateful {...args} />,
  args: { value: '2026-10-05', format: 'DD/MM/YYYY', helperText: 'Day first' },
};

export const Required: Story = {
  render: (args) => <Stateful {...args} />,
  args: { required: true },
};

export const WithError: Story = {
  render: (args) => <Stateful {...args} />,
  args: { required: true, errorMessage: 'Pick a start date', helperText: 'Hidden while there is an error' },
};

export const Disabled: Story = {
  args: { value: '2026-10-05', disabled: true },
};

/** The calendar only offers days in October 2026. */
export const WithRange: Story = {
  render: (args) => <Stateful {...args} />,
  args: { label: 'Kickoff', value: '2026-10-12', minDate: '2026-10-01', maxDate: '2026-10-31' },
};

/** `adapterLocale` and `localeText` translate the field without any i18n library. */
export const Localised: Story = {
  render: (args) => <Stateful {...args} />,
  args: {
    label: 'Startdatum',
    value: '2026-10-05',
    adapterLocale: 'de',
    localeText: {
      openDatePickerDialogue: (date) => (date ? `Datum wählen, gewählt ist ${date}` : 'Datum wählen'),
      previousMonth: 'Vorheriger Monat',
      nextMonth: 'Nächster Monat',
      fieldDayPlaceholder: () => 'TT',
      fieldYearPlaceholder: ({ digitAmount }) => 'J'.repeat(digitAmount),
    },
  },
};

/** Inside an app-level `LocalizationProvider`, the field follows its locale. */
export const InsideAppProvider: Story = {
  render: (args) => (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Stateful {...args} />
    </LocalizationProvider>
  ),
  args: { value: '2026-10-05', helperText: 'British English from the app: day first, weeks start on Monday' },
};

interface ProjectForm {
  name: string;
  startDate: string;
  endDate: string;
}

function ReactHookFormDemo() {
  const { control, handleSubmit, getValues } = useForm<ProjectForm>({
    defaultValues: { name: 'Website redesign', startDate: '', endDate: '' },
  });
  const [submitted, setSubmitted] = React.useState<ProjectForm | null>(null);
  return (
    <Stack component="form" spacing={2} noValidate onSubmit={handleSubmit(setSubmitted)}>
      <RhfDatePickerField
        name="startDate"
        control={control}
        label="Start date"
        required
        rules={{ required: 'Pick a start date' }}
        fullWidth
      />
      <RhfDatePickerField
        name="endDate"
        control={control}
        label="End date"
        helperText="Optional"
        rules={{
          validate: (endDate) => {
            const startDate = getValues('startDate');
            return !endDate || !startDate || endDate >= startDate || 'End on or after the start date';
          },
        }}
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

/**
 * `RhfDatePickerField` from `@rbalukja15/ui-components/date-picker/rhf`,
 * inside a `useForm` form. The form holds ISO strings, so dates compare as
 * strings in `validate`.
 */
export const ReactHookForm: Story = {
  render: () => <ReactHookFormDemo />,
};
