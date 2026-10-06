import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { TruncatedText } from './TruncatedText';

describe('<TruncatedText> accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = render(<TruncatedText text="A very long project name" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
