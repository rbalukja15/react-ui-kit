import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, waitFor, within } from '@storybook/test';
import { Button, Stack, Typography } from '@mui/material';
import { ConfirmDialogProvider, useConfirm } from './ConfirmDialog';

const meta: Meta = { title: 'Feedback/ConfirmDialog' };
export default meta;

function Demo() {
  const confirm = useConfirm();
  const [result, setResult] = React.useState<string>();
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Button
        variant="contained"
        color="error"
        onClick={async () => {
          const ok = await confirm({
            title: 'Delete record',
            message: 'This action cannot be undone. Continue?',
            confirmLabel: 'Delete',
            destructive: true,
          });
          setResult(ok ? 'Confirmed' : 'Cancelled');
        }}
      >
        Delete
      </Button>
      {result && <Typography role="status">{result}</Typography>}
    </Stack>
  );
}

export const Destructive: StoryObj = {
  render: () => (
    <ConfirmDialogProvider>
      <Demo />
    </ConfirmDialogProvider>
  ),
};

/** Opens the dialog, checks it is labelled, and cancels it with the keyboard. */
export const CancelWithEscape: StoryObj = {
  ...Destructive,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('dialog', { name: 'Delete record' });
    await waitFor(() => expect(within(dialog).getByText('This action cannot be undone. Continue?')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByRole('status')).toHaveTextContent('Cancelled');
  },
};

/** Confirms through the destructive button. */
export const Confirm: StoryObj = {
  ...Destructive,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('dialog', { name: 'Delete record' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await expect(await canvas.findByRole('status')).toHaveTextContent('Confirmed');
  },
};
