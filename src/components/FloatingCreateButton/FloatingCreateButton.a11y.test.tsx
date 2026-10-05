import * as React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { FloatingCreateButton } from './FloatingCreateButton';

const Icon = () => <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" /></svg>;

describe('<FloatingCreateButton> accessibility', () => {
  it('has no axe violations as a button', async () => {
    const { container } = render(<FloatingCreateButton label="Create" icon={<Icon />} onClick={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations as a link', async () => {
    const Link = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
      (props, ref) => <a ref={ref} {...props} />,
    );
    Link.displayName = 'Link';
    const { container } = render(
      <FloatingCreateButton label="Create" icon={<Icon />} href="/new" LinkComponent={Link} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
