import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { DatePresets } from './DatePresets';

describe('<DatePresets> accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = render(<DatePresets onPick={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
