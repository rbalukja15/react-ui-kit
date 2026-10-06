import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Breadcrumbs } from './Breadcrumbs';

describe('<Breadcrumbs> accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = render(
      <Breadcrumbs items={[{ label: 'Projects', href: '/projects' }, { label: 'Website redesign' }]} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
