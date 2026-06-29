import type { Meta, StoryObj } from '@storybook/react';
import { TableSkeleton } from './TableSkeleton';

const meta: Meta<typeof TableSkeleton> = { title: 'Feedback/TableSkeleton', component: TableSkeleton };
export default meta;

export const Default: StoryObj<typeof TableSkeleton> = { args: { rows: 5, columns: 4 } };
export const WithHeaders: StoryObj<typeof TableSkeleton> = {
  args: { rows: 4, columns: ['Name', 'Owner', 'Status', 'Updated'] },
};
