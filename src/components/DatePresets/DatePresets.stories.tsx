import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stack, TextField } from '@mui/material';
import { DatePresets } from './DatePresets';

const meta: Meta<typeof DatePresets> = { title: 'Inputs/DatePresets', component: DatePresets };
export default meta;

function NextDueForm() {
  const [start, setStart] = React.useState('2026-01-31');
  const [due, setDue] = React.useState('');
  return (
    <Stack spacing={2} sx={{ maxWidth: 280 }}>
      <TextField label="Start date" type="date" value={start} onChange={(e) => setStart(e.target.value)} InputLabelProps={{ shrink: true }} />
      <div>
        <TextField label="Next due" type="date" value={due} onChange={(e) => setDue(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
        <DatePresets label="Set next due" getBaseDate={() => start} onPick={setDue} sx={{ mt: 1 }} />
      </div>
    </Stack>
  );
}

export const NextToADateField: StoryObj<typeof DatePresets> = { render: () => <NextDueForm /> };

export const CustomPresets: StoryObj<typeof DatePresets> = {
  args: {
    label: 'Follow up in',
    presets: [
      { label: 'Tomorrow', amount: 1, unit: 'day' },
      { label: '1 week', amount: 1, unit: 'week' },
      { label: '2 weeks', amount: 2, unit: 'week' },
      { label: '6 months', amount: 6, unit: 'month' },
    ],
    onPick: () => {},
  },
};
