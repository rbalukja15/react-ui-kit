import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { FilterChips } from './FilterChips';

describe('<FilterChips>', () => {
  it('marks the active chip pressed and reports a pick', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <FilterChips aria-label="Category" options={['All', { value: 'med', label: 'Medicine' }]} value="All" onChange={onChange} />,
    );
    expect(screen.getByRole('group', { name: 'Category' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Medicine' })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(screen.getByRole('button', { name: 'Medicine' }));
    expect(onChange).toHaveBeenCalledWith('med');
    expect(await axe(container)).toHaveNoViolations();
  });
});
