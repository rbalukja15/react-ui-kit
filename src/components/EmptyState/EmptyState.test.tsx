import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('<EmptyState>', () => {
  it('renders title and optional description', () => {
    render(<EmptyState title="No clients yet" description="Add your first client to start." />);
    expect(screen.getByText('No clients yet')).toBeInTheDocument();
    expect(screen.getByText('Add your first client to start.')).toBeInTheDocument();
  });

  it('does not render the CTA when no actionLabel is provided', () => {
    render(<EmptyState title="No data" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render the CTA when actionLabel is provided but no handler/href', () => {
    render(<EmptyState title="No data" actionLabel="Should not show" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('fires onAction when the CTA is clicked', () => {
    const onAction = vi.fn();
    render(<EmptyState title="No items" actionLabel="Add item" onAction={onAction} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders as a link when href + LinkComponent are provided', () => {
    const FakeLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>(
      ({ href, children, ...rest }, ref) => (
        <a ref={ref} href={href} {...rest}>{children}</a>
      ),
    );
    FakeLink.displayName = 'FakeLink';

    render(
      <EmptyState
        title="No items"
        actionLabel="Add"
        href="/new"
        LinkComponent={FakeLink}
      />,
    );
    const link = screen.getByRole('link', { name: /add/i });
    expect(link).toHaveAttribute('href', '/new');
  });
});
