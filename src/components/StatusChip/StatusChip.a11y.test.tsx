import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { StatusChip } from './StatusChip';

describe('<StatusChip> accessibility', () => {
  it('has no axe violations as a plain chip', async () => {
    const { container } = render(<StatusChip status="Delivered" colors={{ Delivered: 'success' }} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations with its menu open', async () => {
    render(
      <StatusChip
        status="Pending"
        options={['Shipped', 'Cancelled']}
        onChange={() => {}}
        actions={[{ key: 'ship-and-notify', label: 'Ship and notify customer', onClick: () => {} }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Pending' }));
    // The menu renders in a portal, so check the whole document. `region`
    // only flags that the test page has no landmarks around the portal.
    expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
