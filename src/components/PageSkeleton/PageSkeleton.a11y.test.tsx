import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { PageSkeleton } from './PageSkeleton';

describe('<PageSkeleton> accessibility', () => {
  it.each(['profile', 'document', 'list'] as const)('has no axe violations for %s', async (variant) => {
    const { container } = render(<PageSkeleton variant={variant} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
