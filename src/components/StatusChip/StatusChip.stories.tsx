import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, waitFor, within } from '@storybook/test';
import { Stack } from '@mui/material';
import { StatusChip, type StatusChipColor } from './StatusChip';

type Status = 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

const nextStatuses: Record<Status, Status[]> = {
  scheduled: ['checked_in', 'cancelled', 'no_show'],
  checked_in: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed: [],
  cancelled: ['scheduled'],
  no_show: ['scheduled'],
};
const labels: Record<Status, string> = {
  scheduled: 'Scheduled',
  checked_in: 'Checked in',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No show',
};
const colors: Partial<Record<Status, StatusChipColor>> = {
  scheduled: 'info',
  checked_in: 'secondary',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'error',
};

const meta: Meta<typeof StatusChip> = { title: 'Data display/StatusChip', component: StatusChip };
export default meta;

function Workflow({ withAction }: { withAction?: boolean }) {
  const [status, setStatus] = React.useState<Status>('scheduled');
  return (
    <StatusChip<Status>
      status={status}
      options={nextStatuses[status]}
      getLabel={(s) => labels[s]}
      colors={colors}
      onChange={setStatus}
      actions={
        withAction && status === 'in_progress'
          ? [{ key: 'complete-and-invoice', label: 'Complete and create invoice', onClick: () => setStatus('completed') }]
          : undefined
      }
    />
  );
}

export const Interactive: StoryObj<typeof StatusChip> = { render: () => <Workflow /> };

/** Walks the status forward through the menu: Scheduled, Checked in, In progress. */
export const MovesThroughStatuses: StoryObj<typeof StatusChip> = {
  render: () => <Workflow />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Scheduled/ }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Checked in' }));
    await userEvent.click(await canvas.findByRole('button', { name: /Checked in/ }));
    await expect(await screen.findByRole('menuitem', { name: 'Cancelled' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: 'In progress' }));
    await waitFor(() => expect(canvas.getByRole('button', { name: /In progress/ })).toBeVisible());
  },
};

export const WithAction: StoryObj<typeof StatusChip> = { render: () => <Workflow withAction /> };

export const ReadOnly: StoryObj<typeof StatusChip> = {
  render: () => (
    <Stack direction="row" spacing={1}>
      {(Object.keys(labels) as Status[]).map((s) => (
        <StatusChip<Status> key={s} status={s} getLabel={(x) => labels[x]} colors={colors} />
      ))}
    </Stack>
  ),
};
