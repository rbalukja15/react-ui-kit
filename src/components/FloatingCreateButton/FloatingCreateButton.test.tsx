import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingCreateButton } from './FloatingCreateButton';

describe('<FloatingCreateButton>', () => {
  it('exposes its label as the accessible name', () => {
    render(
      <FloatingCreateButton
        label="New patient"
        icon={<span data-testid="icon" aria-hidden>+</span>}
        onClick={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'New patient' })).toBeInTheDocument();
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
});
