import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ConfirmDialogProvider, useConfirm } from './ConfirmDialog';

function Trigger({ onResult }: { onResult: (confirmed: boolean) => void }) {
  const confirm = useConfirm();
  return (
    <button onClick={async () => { onResult(await confirm({ message: 'Sure?' })); }}>
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

  it('throws if useConfirm is used outside the provider', () => {
    const Boom = () => { useConfirm(); return null; };
    // Suppress React's expected error log so the test output stays clean.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Boom />)).toThrow(/ConfirmDialogProvider/);
    spy.mockRestore();
  });
});
