import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ConfirmDialogProvider, useConfirm, type ConfirmOptions } from './ConfirmDialog';

function Trigger(options: ConfirmOptions) {
  const confirm = useConfirm();
  return <button onClick={() => { void confirm(options); }}>open</button>;
}

async function openWith(options: ConfirmOptions) {
  const { baseElement } = render(
    <ConfirmDialogProvider>
      <Trigger {...options} />
    </ConfirmDialogProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'open' }));
  await screen.findByRole('dialog');
  // The dialog renders in a portal, so check the whole document.
  return baseElement;
}

describe('<ConfirmDialog> accessibility', () => {
  it('has no axe violations with a title and message', async () => {
    expect(await axe(await openWith({ title: 'Delete record', message: 'This cannot be undone.' }))).toHaveNoViolations();
  });

  it('has no axe violations with only a message', async () => {
    expect(await axe(await openWith({ message: 'Sure?' }))).toHaveNoViolations();
  });

  it('has no axe violations as a destructive prompt with custom labels', async () => {
    const baseElement = await openWith({
      title: 'Remove member',
      message: 'They lose access immediately.',
      destructive: true,
      confirmLabel: 'Remove',
      cancelLabel: 'Keep',
    });
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
