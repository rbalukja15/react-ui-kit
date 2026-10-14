import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { BottomNav } from './BottomNav';

const icon = <svg aria-hidden="true" width="24" height="24" />;
const items = [
  { label: 'Home', href: '/', icon },
  { label: 'Clients', href: '/clients', icon },
  { label: 'Invoices', href: '/invoices', icon },
];

describe('<BottomNav>', () => {
  it('renders a named navigation landmark with a link per item', () => {
    render(<BottomNav items={items} currentPath="/" />);
    const nav = screen.getByRole('navigation', { name: 'Quick navigation' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Clients' })).toHaveAttribute('href', '/clients');
  });

  it('marks the active item as the current page', () => {
    render(<BottomNav items={items} currentPath="/clients/7" />);
    expect(screen.getByRole('link', { name: 'Clients' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Clients' })).toHaveClass('Mui-selected');
  });

  it('marks nothing when no item matches', () => {
    render(<BottomNav items={items} currentPath="/elsewhere" />);
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(0);
  });

  it('renders links through the injected LinkComponent', () => {
    const RouterLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
      (props, ref) => <a ref={ref} data-router-link="" {...props} />,
    );
    RouterLink.displayName = 'RouterLink';
    render(<BottomNav items={items} LinkComponent={RouterLink} />);
    expect(screen.getByRole('link', { name: 'Invoices' })).toHaveAttribute('data-router-link');
  });

  it('renders an item without an href as a button that runs its onClick', () => {
    const onClick = vi.fn();
    render(<BottomNav items={[...items, { label: 'More', icon, onClick }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('takes a custom landmark label', () => {
    render(<BottomNav items={items} label="Schnellnavigation" />);
    expect(screen.getByRole('navigation', { name: 'Schnellnavigation' })).toBeInTheDocument();
  });
});
