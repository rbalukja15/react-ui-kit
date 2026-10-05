import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingCreateButton } from './FloatingCreateButton';

describe('<FloatingCreateButton>', () => {
  it('exposes its label as the accessible name', () => {
    render(
      <FloatingCreateButton
        label="New item"
        icon={<span data-testid="icon" aria-hidden>+</span>}
        onClick={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'New item' })).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('fires onClick when tapped', () => {
    const onClick = vi.fn();
    render(
      <FloatingCreateButton
        label="Add"
        icon={<span>+</span>}
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('sits 16px from the corner by default', () => {
    render(<FloatingCreateButton label="Add" icon={<span>+</span>} />);
    const style = getComputedStyle(screen.getByRole('button', { name: 'Add' }));
    expect(style.bottom).toBe('16px');
    expect(style.right).toBe('16px');
  });

  it('takes the offsets as spacing units or CSS lengths', () => {
    render(
      <FloatingCreateButton
        label="Add"
        icon={<span>+</span>}
        bottomOffset={9.5}
        rightOffset="calc(8px + 1rem)"
      />,
    );
    const style = getComputedStyle(screen.getByRole('button', { name: 'Add' }));
    expect(style.bottom).toBe('76px');
    expect(style.right).toBe('calc(8px + 1rem)');
  });
});
