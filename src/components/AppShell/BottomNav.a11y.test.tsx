import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { BottomNav } from './BottomNav';

const icon = <svg aria-hidden="true" width="24" height="24" />;

describe('<BottomNav> accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = render(
      <BottomNav
        currentPath="/projects"
        items={[
          { label: 'Home', href: '/', icon },
          { label: 'Projects', href: '/projects', icon },
          { label: 'More', icon, onClick: () => {} },
        ]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
