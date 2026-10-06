import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from './Breadcrumbs';

const items = [
  { label: 'Clients', href: '/clients' },
  { label: 'Jane Doe', href: '/clients/1' },
  { label: 'Edit' },
];

describe('<Breadcrumbs>', () => {
  it('renders crumbs with an href as links and the last as the current page', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByRole('link', { name: 'Clients' })).toHaveAttribute('href', '/clients');
    expect(screen.getByRole('link', { name: 'Jane Doe' })).toHaveAttribute('href', '/clients/1');
    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.getByText('Edit')).toHaveAttribute('aria-current', 'page');
  });

  it('names the navigation landmark, with an overridable label', () => {
    const { rerender } = render(<Breadcrumbs items={items} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    rerender(<Breadcrumbs items={items} label="Pfad" />);
    expect(screen.getByRole('navigation', { name: 'Pfad' })).toBeInTheDocument();
  });

  it('renders links through the injected LinkComponent', () => {
    const RouterLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
      (props, ref) => <a ref={ref} data-router-link="" {...props} />,
    );
    RouterLink.displayName = 'RouterLink';
    render(<Breadcrumbs items={items} LinkComponent={RouterLink} />);
    const link = screen.getByRole('link', { name: 'Clients' });
    expect(link).toHaveAttribute('data-router-link');
    expect(link).toHaveAttribute('href', '/clients');
  });

  it('accepts a custom separator', () => {
    render(<Breadcrumbs items={items} separator="/" />);
    expect(screen.getAllByText('/')).toHaveLength(2);
  });
});
