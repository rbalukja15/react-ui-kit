import { render, screen } from '@testing-library/react';
import { RowActions } from './RowActions';

describe('<RowActions>', () => {
  it('renders its children on a single non-wrapping line', () => {
    render(
      <RowActions>
        <button type="button">Edit</button>
        <button type="button">Delete</button>
      </RowActions>,
    );
    const edit = screen.getByRole('button', { name: 'Edit' });
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    const wrapper = edit.parentElement!;
    expect(wrapper).toHaveStyle({ display: 'inline-flex', flexWrap: 'nowrap', whiteSpace: 'nowrap' });
  });

  it('passes props through to the wrapper and merges sx', () => {
    render(
      <RowActions role="group" aria-label="Actions for Jane Doe" data-testid="actions" sx={{ gap: 2 }}>
        <button type="button">Edit</button>
      </RowActions>,
    );
    const group = screen.getByRole('group', { name: 'Actions for Jane Doe' });
    expect(group).toHaveAttribute('data-testid', 'actions');
    expect(group).toHaveStyle({ display: 'inline-flex', gap: '16px' });
  });
});
