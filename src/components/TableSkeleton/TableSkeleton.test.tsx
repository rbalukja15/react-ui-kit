import { render, screen } from '@testing-library/react';
import { TableSkeleton } from './TableSkeleton';

describe('<TableSkeleton>', () => {
  it('sets aria-busy so assistive tech knows the table is loading', () => {
    render(<TableSkeleton />);
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders the requested number of rows and columns', () => {
    const { container } = render(<TableSkeleton rows={2} columns={3} showHeader={false} />);
    // 2 body rows × 3 cells each.
    expect(container.querySelectorAll('tbody td').length).toBe(6);
  });

  it('renders header labels when an array of strings is passed', () => {
    render(<TableSkeleton columns={['Name', 'Email']} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('omits the header row when showHeader is false', () => {
    const { container } = render(<TableSkeleton columns={['Name', 'Email']} showHeader={false} />);
    expect(container.querySelector('thead')).toBeNull();
  });
});
