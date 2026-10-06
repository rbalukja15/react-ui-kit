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
});
