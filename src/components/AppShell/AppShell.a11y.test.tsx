import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { AppShell } from './AppShell';

const icon = <svg aria-hidden="true" width="24" height="24" />;
const navItems = [
  { label: 'Dashboard', href: '/', icon },
  { label: 'Projects', href: '/projects', icon },
];

function Shell() {
  return (
    <AppShell
      navItems={navItems}
      footerItems={[{ label: 'Log out', icon, onClick: () => {} }]}
      bottomNavItems={navItems}
      currentPath="/projects"
      brand="Acme"
      collapsedBrand="A"
      title="Projects"
    >
      <h1>Projects</h1>
    </AppShell>
  );
}

describe('<AppShell> accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = render(<Shell />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations with the sidebar collapsed', async () => {
    const { container } = render(<Shell />);
    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations with the mobile drawer open', async () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
