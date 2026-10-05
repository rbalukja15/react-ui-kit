import { render, screen } from '@testing-library/react';
import { TableSkeleton } from './TableSkeleton';

describe('<TableSkeleton>', () => {
  it('sets aria-busy so assistive tech knows the table is loading', () => {
    render(<TableSkeleton />);
    expect(screen.getByRole('table', { name: 'Loading' })).toHaveAttribute('aria-busy', 'true');
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

  it('uses the label prop as the accessible name', () => {
    render(<TableSkeleton label="Wird geladen" />);
    expect(screen.getByRole('table', { name: 'Wird geladen' })).toBeInTheDocument();
  });

  it('only renders header cells for labelled columns', () => {
    const { container, rerender } = render(<TableSkeleton columns={3} />);
    expect(container.querySelectorAll('thead th').length).toBe(0);
    expect(container.querySelectorAll('thead td').length).toBe(3);

    rerender(<TableSkeleton columns={['Name', 'Email']} />);
    expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual(['Name', 'Email']);
  });
});
