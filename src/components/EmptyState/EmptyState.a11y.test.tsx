import * as React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { EmptyState } from './EmptyState';

const Icon = () => <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" /></svg>;

describe('<EmptyState> accessibility', () => {
  it('has no axe violations with only a title', async () => {
    const { container } = render(<EmptyState title="No data" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations with an icon, description and button action', async () => {
    const { container } = render(
      <EmptyState
        title="No items"
        description="Add your first item to get started."
        icon={<Icon />}
        actionLabel="Add item"
        actionIcon={<Icon />}
        onAction={() => {}}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations with a link action', async () => {
    const Link = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
      (props, ref) => <a ref={ref} {...props} />,
    );
    Link.displayName = 'Link';
    const { container } = render(
      <EmptyState title="No items" actionLabel="Add item" href="/new" LinkComponent={Link} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
