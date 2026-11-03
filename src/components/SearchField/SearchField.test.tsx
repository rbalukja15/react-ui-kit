import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { SearchField } from './SearchField';
import { DropdownButton } from '../DropdownButton';
import { PageHeader } from '../PageHeader';
import { TwoLineCell } from '../TwoLineCell';

describe('<SearchField>', () => {
  it('is a labelled search box that reports its value', async () => {
    const onChange = vi.fn();
    const { container } = render(<SearchField label="Search products" placeholder="Name or barcode" onChange={onChange} />);
    const box = screen.getByRole('searchbox', { name: 'Search products' });
    await userEvent.type(box, 'rab');
    expect(onChange).toHaveBeenLastCalledWith('rab', expect.anything());
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('<DropdownButton>', () => {
  it('announces the popup it opens', () => {
    render(<DropdownButton open={false}>Last 12 months</DropdownButton>);
    const button = screen.getByRole('button', { name: 'Last 12 months' });
    expect(button).toHaveAttribute('aria-haspopup', 'true');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('<PageHeader> and <TwoLineCell>', () => {
  it('renders the page heading, subtitle, actions and two-line content', async () => {
    const { container } = render(
      <>
        <PageHeader title="Product sales" subtitle="What sold" actions={<button type="button">Export</button>} />
        <TwoLineCell primary="Rabies vaccine" secondary="Vaccine" icon={<svg aria-hidden="true" />} />
      </>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Product sales' })).toBeInTheDocument();
    expect(screen.getByText('Vaccine')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
