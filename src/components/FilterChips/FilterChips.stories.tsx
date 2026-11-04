import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterChips } from './FilterChips';

const meta: Meta<typeof FilterChips> = { title: 'Inputs/FilterChips', component: FilterChips };
export default meta;

function Demo() {
  const [value, setValue] = React.useState('All');
  return <FilterChips aria-label="Category" options={['All', 'Medicine', 'Vaccine', 'Food']} value={value} onChange={setValue} />;
}
export const Default: StoryObj<typeof FilterChips> = { render: () => <Demo /> };
