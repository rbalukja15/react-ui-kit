import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { DataTable, type DataTableColumn, type DataTableProps } from './DataTable';

interface Item {
  id: number;
  name: string;
  qty: number;
}

const rows: Item[] = [
  { id: 1, name: 'Bolts', qty: 120 },
  { id: 2, name: 'Nuts', qty: 80 },
  { id: 3, name: 'Washers', qty: 300 },
];
const columns: DataTableColumn<Item>[] = [
  { id: 'name', header: 'Name', sortable: true },
  { id: 'qty', header: 'Quantity', sortable: true, align: 'right' },
];

function renderTable(props: Partial<DataTableProps<Item>> = {}) {
  return render(
    <DataTable
      rows={rows}
      columns={columns}
      getRowId={(r) => r.id}
      label="Stock"
      selectable
      getRowLabel={(r) => r.name}
      columnsMenu
      rowActions={(r) => (
        <button type="button" aria-label={`Edit ${r.name}`}>
          Edit
        </button>
      )}
      {...props}
    />,
  );
}

describe('<DataTable> accessibility', () => {
  it('has no axe violations with selection, sorting, actions and pagination', async () => {
    const { container } = renderTable({ defaultSort: { columnId: 'qty', direction: 'desc' }, defaultSelectedIds: [2] });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations while loading', async () => {
    const { container } = renderTable({ loading: true });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations when empty', async () => {
    const { container } = renderTable({ rows: [] });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations in a scrolling container with a sticky header', async () => {
    const { container } = renderTable({ maxHeight: 200, stickyHeader: true });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations with the columns menu open', async () => {
    renderTable();
    fireEvent.click(screen.getByRole('button', { name: 'Columns' }));
    // The menu renders in a portal, so check the whole document. `region`
    // only flags that the test page has no landmarks around the portal.
    expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
