import * as React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AppShell } from './AppShell';

const icon = <svg aria-hidden="true" width="24" height="24" />;
const navItems = [
  { label: 'Dashboard', href: '/', icon },
  { label: 'Clients', href: '/clients', icon },
  { label: 'Invoices', href: '/invoices', icon },
];

// The permanent drawer is always in the DOM; the overlay only while open.
const sidebar = () => screen.getAllByRole('navigation', { name: 'Main navigation' })[0]!;
const overlay = () => document.querySelector<HTMLElement>('.MuiDrawer-modal')!;

describe('<AppShell>', () => {
  afterEach(() => window.localStorage.clear());

  it('renders the page in a main landmark with the title in the header', () => {
    render(
      <AppShell navItems={navItems} title="Clients" headerActions={<button type="button">Account</button>}>
        <p>Page body</p>
      </AppShell>,
    );
    expect(within(screen.getByRole('main')).getByText('Page body')).toBeInTheDocument();
    const banner = screen.getByRole('banner');
    expect(within(banner).getByText('Clients')).toBeInTheDocument();
    expect(within(banner).getByRole('button', { name: 'Account' })).toBeInTheDocument();
  });

  it('links the nav items and marks the current page', () => {
    render(
      <AppShell navItems={navItems} currentPath="/clients/42">
        x
      </AppShell>,
    );
    const nav = sidebar();
    expect(within(nav).getByRole('link', { name: 'Clients' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
    expect(within(nav).getByRole('link', { name: 'Invoices' })).toHaveAttribute('href', '/invoices');
  });

  it('renders links through the injected LinkComponent', () => {
    const RouterLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
      (props, ref) => <a ref={ref} data-router-link="" {...props} />,
    );
    RouterLink.displayName = 'RouterLink';
    render(
      <AppShell navItems={navItems} LinkComponent={RouterLink}>
        x
      </AppShell>,
    );
    expect(within(sidebar()).getByRole('link', { name: 'Clients' })).toHaveAttribute('data-router-link');
  });

  it('renders footer items, running their onClick', () => {
    const onLogout = vi.fn();
    render(
      <AppShell navItems={navItems} footerItems={[{ label: 'Log out', icon, onClick: onLogout }]}>
        x
      </AppShell>,
    );
    fireEvent.click(screen.getAllByRole('button', { name: 'Log out' })[0]);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('collapses the sidebar to an icon rail with labelled items', () => {
    const onCollapsedChange = vi.fn();
    render(
      <AppShell navItems={navItems} brand="Acme" collapsedBrand="A" onCollapsedChange={onCollapsedChange}>
        x
      </AppShell>,
    );
    expect(within(sidebar()).getByText('Clients')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
    // The label is gone from the row but still names the link.
    expect(within(sidebar()).queryByText('Clients')).not.toBeInTheDocument();
    expect(within(sidebar()).getByRole('link', { name: 'Clients' })).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.queryByText('Acme')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }));
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
    expect(within(sidebar()).getByText('Clients')).toBeInTheDocument();
  });

  it('follows a controlled collapsed prop', () => {
    const onCollapsedChange = vi.fn();
    const { rerender } = render(
      <AppShell navItems={navItems} collapsed onCollapsedChange={onCollapsedChange}>
        x
      </AppShell>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }));
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    // Still collapsed until the parent passes the new value.
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
    rerender(
      <AppShell navItems={navItems} collapsed={false} onCollapsedChange={onCollapsedChange}>
        x
      </AppShell>,
    );
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument();
  });

  it('remembers the collapsed state under storageKey', () => {
    const { unmount } = render(
      <AppShell navItems={navItems} storageKey="test:sidebar">
        x
      </AppShell>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(window.localStorage.getItem('test:sidebar')).toBe('1');
    unmount();

    render(
      <AppShell navItems={navItems} storageKey="test:sidebar">
        x
      </AppShell>,
    );
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
  });

  it('falls back to the default when storage throws', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    render(
      <AppShell navItems={navItems} storageKey="test:sidebar" defaultCollapsed>
        x
      </AppShell>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }));
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument();
    getItem.mockRestore();
    setItem.mockRestore();
  });

  it('opens the mobile drawer from the menu button and closes it on navigation', () => {
    // jsdom cannot follow links, so the router link stops the default.
    const RouterLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
      ({ onClick, ...props }, ref) => (
        <a
          ref={ref}
          {...props}
          onClick={(event) => {
            event.preventDefault();
            onClick?.(event);
          }}
        />
      ),
    );
    RouterLink.displayName = 'RouterLink';
    render(
      <AppShell navItems={navItems} LinkComponent={RouterLink}>
        x
      </AppShell>,
    );
    const menu = screen.getByRole('button', { name: 'Open navigation' });
    expect(menu).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(menu);
    expect(menu).toHaveAttribute('aria-expanded', 'true');
    const drawer = overlay();
    expect(drawer).toBeInTheDocument();
    fireEvent.click(within(drawer).getByRole('link', { name: 'Invoices' }));
    expect(menu).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the mobile drawer after an action item runs', () => {
    const onLogout = vi.fn();
    render(
      <AppShell navItems={navItems} footerItems={[{ label: 'Log out', icon, onClick: onLogout }]}>
        x
      </AppShell>,
    );
    const menu = screen.getByRole('button', { name: 'Open navigation' });
    fireEvent.click(menu);
    fireEvent.click(within(overlay()).getByRole('button', { name: 'Log out' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(menu).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows the label as a tooltip on the collapsed rail only', async () => {
    render(
      <AppShell navItems={navItems} footerItems={[{ label: 'Log out', icon, onClick: () => {} }]}>
        x
      </AppShell>,
    );
    fireEvent.mouseOver(within(sidebar()).getByRole('link', { name: 'Clients' }));
    // Expanded rows show the label as text, so no tooltip opens.
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    const link = within(sidebar()).getByRole('link', { name: 'Clients' });
    expect(link).toHaveAttribute('aria-label', 'Clients');
    expect(within(sidebar()).getByRole('button', { name: 'Log out' })).toHaveAttribute('aria-label', 'Log out');
    fireEvent.mouseOver(link);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Clients');
  });

  it('applies a stored collapsed state without animating it in', async () => {
    window.localStorage.setItem('test:sidebar', '1');
    render(
      <AppShell navItems={navItems} storageKey="test:sidebar">
        x
      </AppShell>,
    );
    const paper = sidebar().closest('.MuiDrawer-paper')!;
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
    expect(getComputedStyle(paper).transition).toBe('none');
    await waitFor(() => expect(getComputedStyle(paper).transition).toContain('width'));
  });

  it('renders the bottom bar only when bottomNavItems are given', () => {
    const { rerender } = render(
      <AppShell navItems={navItems}>
        x
      </AppShell>,
    );
    expect(screen.queryByRole('navigation', { name: 'Quick navigation' })).not.toBeInTheDocument();
    rerender(
      <AppShell navItems={navItems} bottomNavItems={navItems.slice(0, 2)} currentPath="/">
        x
      </AppShell>,
    );
    const bottom = screen.getByRole('navigation', { name: 'Quick navigation' });
    expect(within(bottom).getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
  });

  it('takes translated labels', () => {
    render(
      <AppShell
        navItems={navItems}
        bottomNavItems={navItems}
        labels={{
          navigation: 'Hauptnavigation',
          bottomNavigation: 'Schnellzugriff',
          openNavigation: 'Menü öffnen',
          collapseSidebar: 'Seitenleiste einklappen',
        }}
      >
        x
      </AppShell>,
    );
    expect(screen.getByRole('navigation', { name: 'Hauptnavigation' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Schnellzugriff' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Menü öffnen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Seitenleiste einklappen' })).toBeInTheDocument();
  });
});
