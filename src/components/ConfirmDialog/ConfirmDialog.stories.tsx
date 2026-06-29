import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@mui/material';
import { ConfirmDialogProvider, useConfirm } from './ConfirmDialog';

const meta: Meta = { title: 'Feedback/ConfirmDialog' };
export default meta;

function Demo() {
  const confirm = useConfirm();
  return (
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
        alert(ok ? 'confirmed' : 'cancelled');
      }}
    >
      Delete
    </Button>
  );
}

export const Destructive: StoryObj = {
  render: () => (
    <ConfirmDialogProvider>
      <Demo />
    </ConfirmDialogProvider>
  ),
};
