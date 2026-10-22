import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type DataTableColumn, type DataTableProps } from './DataTable';

interface Person {
  id: number;
  name: string;
  age: number | null;
  city: string;
}

const people: Person[] = [
  { id: 1, name: 'Ada', age: 36, city: 'London' },
  { id: 2, name: 'Grace', age: 85, city: 'New York' },
  { id: 3, name: 'Alan', age: 41, city: 'Wilmslow' },
  { id: 4, name: 'Katherine', age: null, city: 'Hampton' },
  { id: 5, name: 'Edsger', age: 72, city: 'Nuenen' },
];

const columns: DataTableColumn<Person>[] = [
  { id: 'name', header: 'Name', sortable: true },
  { id: 'age', header: 'Age', sortable: true, align: 'right' },
  { id: 'city', header: 'City', cell: (p) => <em>{p.city}</em> },
];

function setup(props: Partial<DataTableProps<Person>> = {}) {
  const user = userEvent.setup();
  render(<DataTable rows={people} columns={columns} getRowId={(p) => p.id} label="People" {...props} />);
  return { user, table: screen.getByRole('table', { name: 'People' }) };
}

/** Text of the first cell of each body row. */
function names(table: HTMLElement, column = 0) {
  const body = within(table).getAllByRole('rowgroup')[1]!;
  return within(body)
    .getAllByRole('row')
    .map((row) => within(row).getAllByRole('cell')[column]!.textContent);
}

describe('<DataTable>', () => {
  it('renders a header per column and a row per record, with custom cells', () => {
    const { table } = setup();
    expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Name', 'Age', 'City']);
    expect(names(table)).toEqual(['Ada', 'Grace', 'Alan', 'Katherine', 'Edsger']);
    expect(within(table).getByText('London').tagName).toBe('EM');
  });

  it('cycles a sortable column through ascending, descending and unsorted', async () => {
    const { user, table } = setup();
    const header = within(table).getByRole('columnheader', { name: 'Name' });
    expect(header).toHaveAttribute('aria-sort', 'none');
    expect(within(table).getByRole('columnheader', { name: 'City' })).not.toHaveAttribute('aria-sort');

    await user.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(header).toHaveTextContent('sorted ascending');
    expect(names(table)).toEqual(['Ada', 'Alan', 'Edsger', 'Grace', 'Katherine']);

    await user.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(names(table)).toEqual(['Katherine', 'Grace', 'Edsger', 'Alan', 'Ada']);

    await user.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'none');
    expect(names(table)).toEqual(['Ada', 'Grace', 'Alan', 'Katherine', 'Edsger']);
  });

  it('sorts numbers by value with empty values last, and honours sortValue', async () => {
    const { user, table } = setup({
      columns: [...columns.slice(0, 2), { id: 'city', header: 'City', sortable: true, sortValue: (p) => p.city.length }],
    });
    await user.click(within(table).getByRole('button', { name: 'Age' }));
    expect(names(table, 1)).toEqual(['36', '41', '72', '85', '']);
    await user.click(within(table).getByRole('button', { name: 'City' }));
    expect(names(table, 2)).toEqual(['London', 'Nuenen', 'Hampton', 'New York', 'Wilmslow']);
  });

  it('pages rows and resets to the first page when the page size or sort changes', async () => {
    const { user, table } = setup({ pageSizeOptions: [2, 5] });
    expect(names(table)).toEqual(['Ada', 'Grace']);
    expect(screen.getByText('1–2 of 5')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(names(table)).toEqual(['Alan', 'Katherine']);
    await user.click(within(table).getByRole('button', { name: 'Name' }));
    expect(names(table)).toEqual(['Ada', 'Alan']);

    await user.click(screen.getByRole('button', { name: 'Go to next page' }));
    await user.click(screen.getByRole('combobox', { name: /Rows per page/ }));
    await user.click(screen.getByRole('option', { name: '5' }));
    expect(names(table)).toHaveLength(5);
    expect(screen.getByText('1–5 of 5')).toBeInTheDocument();
  });

  it('shows the last page when the page is past the end', () => {
    const { table } = setup({ pageSizeOptions: [2], page: 9 });
    expect(names(table)).toEqual(['Edsger']);
  });

  it('shows every row without pagination when it is disabled', () => {
    const { table } = setup({ pageSizeOptions: [2], disablePagination: true });
    expect(names(table)).toHaveLength(5);
    expect(screen.queryByText(/of 5/)).not.toBeInTheDocument();
  });

  it('in server mode shows rows as given and reports sort and page changes', async () => {
    const onSortChange = vi.fn();
    const onPageChange = vi.fn();
    const { user, table } = setup({
      mode: 'server',
      rows: people.slice(0, 2),
      rowCount: 40,
      pageSizeOptions: [2],
      onSortChange,
      onPageChange,
    });
    await user.click(within(table).getByRole('button', { name: 'Name' }));
    expect(onSortChange).toHaveBeenCalledWith({ columnId: 'name', direction: 'asc' });
    expect(names(table)).toEqual(['Ada', 'Grace']);
    expect(screen.getByText('1–2 of 40')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
  });

  it('reports an unknown server total as "more than"', () => {
    setup({ mode: 'server', rows: people.slice(0, 2), rowCount: -1, pageSizeOptions: [2] });
    expect(screen.getByText('1–2 of more than 2')).toBeInTheDocument();
  });

  it('selects rows, keeps the selection across pages and toggles a whole page', async () => {
    const onSelectionChange = vi.fn();
    const { user, table } = setup({
      selectable: true,
      pageSizeOptions: [2],
      getRowLabel: (p) => p.name,
      onSelectionChange,
    });
    const all = within(table).getByRole('checkbox', { name: 'Select all rows on this page' });

    await user.click(within(table).getByRole('checkbox', { name: 'Select Ada' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([1]);
    expect((all as HTMLInputElement).indeterminate).toBe(true);
    expect(all).not.toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('1 selected');

    await user.click(screen.getByRole('button', { name: 'Go to next page' }));
    await user.click(all);
    expect(onSelectionChange).toHaveBeenLastCalledWith([1, 3, 4]);
    expect(all).toBeChecked();
    expect((all as HTMLInputElement).indeterminate).toBe(false);
    await user.click(all);
    expect(onSelectionChange).toHaveBeenLastCalledWith([1]);
  });

  it('marks selected rows', async () => {
    const { user, table } = setup({ selectable: true, defaultSelectedIds: [2] });
    const row = within(table).getByRole('checkbox', { name: 'Select 2' }).closest('tr')!;
    expect(row).toHaveClass('Mui-selected');
    await user.click(within(table).getByRole('checkbox', { name: 'Select 2' }));
    expect(row).not.toHaveClass('Mui-selected');
  });

  it('hides and shows columns from the columns menu, keeping at least one', async () => {
    const onHiddenColumnsChange = vi.fn();
    const { user, table } = setup({
      columnsMenu: true,
      columns: [...columns.slice(0, 2), { ...columns[2]!, hideable: false }],
      onHiddenColumnsChange,
    });
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getAllByRole('menuitemcheckbox').map((i) => i.textContent)).toEqual(['Name', 'Age']);

    await user.click(within(menu).getByRole('menuitemcheckbox', { name: 'Name' }));
    expect(onHiddenColumnsChange).toHaveBeenLastCalledWith(['name']);
    expect(within(menu).getByRole('menuitemcheckbox', { name: 'Name' })).toHaveAttribute('aria-checked', 'false');
    expect(within(menu).getByRole('menuitemcheckbox', { name: 'Age' })).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{Escape}');
    expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Age', 'City']);

    await user.click(screen.getByRole('button', { name: 'Columns' }));
    await user.click(within(screen.getByRole('menu')).getByRole('menuitemcheckbox', { name: 'Name' }));
    await user.keyboard('{Escape}');
    expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Name', 'Age', 'City']);
  });

  it('renders row actions in a labelled last column', async () => {
    const onEdit = vi.fn();
    const { user, table } = setup({
      rowActions: (p) => (
        <button type="button" onClick={() => onEdit(p.id)}>
          Edit {p.name}
        </button>
      ),
    });
    expect(within(table).getAllByRole('columnheader').at(-1)).toHaveTextContent('Actions');
    await user.click(within(table).getByRole('button', { name: 'Edit Grace' }));
    expect(onEdit).toHaveBeenCalledWith(2);
  });

  it('keeps the header and marks the table busy while loading', () => {
    const { table } = setup({ loading: true, selectable: true });
    expect(table).toHaveAttribute('aria-busy', 'true');
    expect(within(table).getAllByRole('columnheader')).toHaveLength(4);
    expect(within(table).queryByText('Ada')).not.toBeInTheDocument();
    expect(within(table).getByRole('checkbox', { name: 'Select all rows on this page' })).toBeDisabled();
  });

  it('shows an empty state when there are no rows', () => {
    const { table } = setup({ rows: [] });
    expect(within(table).getByRole('heading', { name: 'No results' })).toBeInTheDocument();
  });

  it('accepts a custom empty state and labels', () => {
    setup({
      rows: [],
      emptyState: <p>Nothing here yet</p>,
      labels: { rowsPerPage: 'Zeilen pro Seite:' },
    });
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
    expect(screen.getByText('Zeilen pro Seite:')).toBeInTheDocument();
  });

  it('follows controlled sort and selection props', async () => {
    function Controlled() {
      const [sort, setSort] = React.useState<DataTableProps<Person>['sort']>({ columnId: 'age', direction: 'desc' });
      const [selectedIds, setSelectedIds] = React.useState<(string | number)[]>([]);
      return (
        <DataTable
          rows={people}
          columns={columns}
          getRowId={(p) => p.id}
          label="People"
          sort={sort}
          onSortChange={setSort}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    const table = screen.getByRole('table', { name: 'People' });
    expect(names(table, 1)).toEqual(['Grace', 'Edsger', 'Alan', 'Ada', 'Katherine']);
    await user.click(within(table).getByRole('checkbox', { name: 'Select 5' }));
    expect(within(table).getByRole('checkbox', { name: 'Select 5' })).toBeChecked();
  });

  it('makes a scrolling table reachable by keyboard', () => {
    setup({ maxHeight: 200, stickyHeader: true });
    const region = screen.getByRole('region', { name: 'People' });
    expect(region).toHaveAttribute('tabindex', '0');
  });
});
