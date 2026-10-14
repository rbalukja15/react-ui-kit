import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { StatusChip } from './StatusChip';

type Status = 'pending' | 'shipped' | 'delivered' | 'cancelled';
const next: Record<Status, Status[]> = {
  pending: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};
const labels: Record<Status, string> = {
  pending: 'Pending',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

describe('<StatusChip>', () => {
  it('opens a menu of the allowed next statuses and reports the pick', async () => {
    const onChange = vi.fn();
    render(
      <StatusChip<Status>
        status="pending"
        options={next.pending}
        getLabel={(s) => labels[s]}
        onChange={onChange}
      />,
    );
    const chip = screen.getByRole('button', { name: 'Pending' });
    expect(chip).toHaveAttribute('aria-haspopup', 'menu');
    expect(chip).toHaveAttribute('aria-expanded', 'false');
    expect(chip).toHaveAccessibleDescription('Change status');

    fireEvent.click(chip);
    expect(chip).toHaveAttribute('aria-expanded', 'true');
    const items = screen.getAllByRole('menuitem');
    expect(items.map((i) => i.textContent)).toEqual(['Shipped', 'Cancelled']);

    fireEvent.click(screen.getByRole('menuitem', { name: 'Shipped' }));
    expect(onChange).toHaveBeenCalledWith('shipped');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('renders a plain chip when there is no onChange or nowhere to go', () => {
    const { rerender } = render(<StatusChip status="pending" options={next.pending} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();

    rerender(<StatusChip status="delivered" options={next.delivered} onChange={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies the color mapped to the current status', () => {
    render(<StatusChip status="shipped" colors={{ shipped: 'info' }} data-testid="chip" />);
    expect(screen.getByTestId('chip').className).toMatch(/colorInfo/);
  });

  it('lists actions above the statuses, separated by a divider', () => {
    const record = vi.fn();
    const onChange = vi.fn();
    render(
      <StatusChip
        status="shipped"
        options={next.shipped}
        onChange={onChange}
        actions={[{ key: 'record', label: 'Deliver and send receipt', onClick: record }]}
        changeLabel="Update order status"
      />,
    );
    const chip = screen.getByRole('button', { name: 'shipped' });
    expect(chip).toHaveAccessibleDescription('Update order status');
    fireEvent.click(chip);
    expect(screen.getAllByRole('menuitem').map((i) => i.textContent)).toEqual([
      'Deliver and send receipt',
      'delivered',
    ]);
    expect(screen.getByRole('separator')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('menuitem', { name: 'Deliver and send receipt' }));
    expect(record).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('opens with only actions when there are no next statuses', () => {
    render(
      <StatusChip
        status="delivered"
        onChange={() => {}}
        actions={[{ key: 'reopen', label: 'Reopen', onClick: () => {} }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'delivered' }));
    expect(screen.getAllByRole('menuitem').map((i) => i.textContent)).toEqual(['Reopen']);
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('is not clickable when disabled', () => {
    render(<StatusChip status="pending" options={next.pending} onChange={() => {}} disabled />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
