import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialogProvider, useConfirm, type ConfirmOptions } from './ConfirmDialog';

function Trigger({ onResult }: { onResult: (confirmed: boolean) => void }) {
  const confirm = useConfirm();
  return (
    <button onClick={async () => { onResult(await confirm({ message: 'Sure?' })); }}>
      open
    </button>
  );
}

function TitledTrigger() {
  const confirm = useConfirm();
  return (
    <button onClick={() => { void confirm({ title: 'Delete record', message: 'This cannot be undone.' }); }}>
      open
    </button>
  );
}

describe('<ConfirmDialog>', () => {
  it('resolves true when the confirm button is clicked', async () => {
    let result: boolean | undefined;
    render(
      <ConfirmDialogProvider>
        <Trigger onResult={(b) => { result = b; }} />
      </ConfirmDialogProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm' }));
    // Flush the resolver microtask.
    await act(async () => { await Promise.resolve(); });
    expect(result).toBe(true);
  });

  it('resolves false when the cancel button is clicked', async () => {
    let result: boolean | undefined;
    render(
      <ConfirmDialogProvider>
        <Trigger onResult={(b) => { result = b; }} />
      </ConfirmDialogProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    await act(async () => { await Promise.resolve(); });
    expect(result).toBe(false);
  });

  it('resolves a pending prompt as false when a newer one supersedes it', async () => {
    let confirm!: ReturnType<typeof useConfirm>;
    const Grab = () => { confirm = useConfirm(); return null; };
    render(
      <ConfirmDialogProvider>
        <Grab />
      </ConfirmDialogProvider>,
    );

    let first: Promise<boolean> | undefined;
    let second: Promise<boolean> | undefined;
    act(() => { first = confirm({ message: 'First?' }); });
    act(() => { second = confirm({ message: 'Second?' }); });
    await expect(first).resolves.toBe(false);

    fireEvent.click(await screen.findByRole('button', { name: 'Confirm' }));
    await expect(second).resolves.toBe(true);
  });

  it('resolves a pending prompt as false when the provider unmounts', async () => {
    let confirm!: ReturnType<typeof useConfirm>;
    const Grab = () => { confirm = useConfirm(); return null; };
    const { unmount } = render(
      <ConfirmDialogProvider>
        <Grab />
      </ConfirmDialogProvider>,
    );

    let pending: Promise<boolean> | undefined;
    act(() => { pending = confirm({ message: 'Sure?' }); });
    unmount();
    await expect(pending).resolves.toBe(false);
  });

  it('names the dialog by its title and describes it by its message', async () => {
    render(
      <ConfirmDialogProvider>
        <TitledTrigger />
      </ConfirmDialogProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    const dialog = await screen.findByRole('dialog', { name: 'Delete record' });
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.');
  });

  it('falls back to the message as the dialog name when there is no title', async () => {
    render(
      <ConfirmDialogProvider>
        <Trigger onResult={() => {}} />
      </ConfirmDialogProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    expect(await screen.findByRole('dialog', { name: 'Sure?' })).toBeInTheDocument();
  });

  async function openWith(options: ConfirmOptions) {
    let confirm!: ReturnType<typeof useConfirm>;
    const Grab = () => { confirm = useConfirm(); return null; };
    render(
      <ConfirmDialogProvider>
        <Grab />
      </ConfirmDialogProvider>,
    );
    let pending!: Promise<boolean>;
    act(() => { pending = confirm(options); });
    await screen.findByRole('dialog');
    // Wrapped, or awaiting this helper would wait for the answer too.
    return { pending };
  }

  it('focuses Cancel on a destructive prompt, so Enter backs out', async () => {
    const { pending } = await openWith({ message: 'Delete this record?', destructive: true });
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(pending).resolves.toBe(false);
  });

  it('focuses Confirm on a non-destructive prompt, so Enter goes ahead', async () => {
    const { pending } = await openWith({ message: 'Send the reminder?' });
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(pending).resolves.toBe(true);
  });

  it('lets the caller choose the focused button', async () => {
    await openWith({ message: 'Delete this record?', destructive: true, focus: 'confirm' });
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus();
  });

  it('keeps the dialog compact and full width', async () => {
    await openWith({ message: 'Sure?' });
    const paper = screen.getByRole('dialog');
    expect(paper).toHaveClass('MuiDialog-paperWidthXs');
    expect(paper).toHaveClass('MuiDialog-paperFullWidth');
  });

  it('throws if useConfirm is used outside the provider', () => {
    const Boom = () => { useConfirm(); return null; };
    // Suppress React's expected error log so the test output stays clean.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Boom />)).toThrow(/ConfirmDialogProvider/);
    spy.mockRestore();
  });
});
