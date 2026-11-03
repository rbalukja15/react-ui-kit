import type { Meta, StoryObj } from '@storybook/react';
import { ListRow, SummaryList } from './ListRow';

const meta: Meta<typeof ListRow> = { title: 'Data display/ListRow', component: ListRow, decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>] };
export default meta;

export const Overdue: StoryObj<typeof ListRow> = { args: { primary: 'Luna', meta: 'Elira Hoxha', secondary: 'Rabies', trailing: '12 days overdue', trailingTone: 'warning' } };
export const WithTime: StoryObj<typeof ListRow> = { args: { leading: '09:30', primary: 'Rex', meta: 'Vaccination', trailing: 'Done' } };
export const AsLink: StoryObj<typeof ListRow> = { args: { href: '#', primary: 'Invoice #1871', trailing: 'Invoice' } };
export const Summary: StoryObj<typeof ListRow> = {
  render: () => (
    <SummaryList items={[{ label: 'Net revenue', value: '1,084,320 L' }, { label: 'Cost', value: '466,325 L' }, { label: 'Net profit', value: '405,595 L', total: true }]} />
  ),
};
