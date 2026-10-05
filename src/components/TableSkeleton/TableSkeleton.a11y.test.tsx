import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { TableSkeleton } from './TableSkeleton';

describe('<TableSkeleton> accessibility', () => {
  it('has no axe violations with labelled headers', async () => {
    const { container } = render(<TableSkeleton columns={['Name', 'Email', 'Role']} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations with placeholder headers', async () => {
    const { container } = render(<TableSkeleton />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations without a header row', async () => {
    const { container } = render(<TableSkeleton rows={2} columns={3} showHeader={false} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
