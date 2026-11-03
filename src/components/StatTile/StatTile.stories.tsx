import type { Meta, StoryObj } from '@storybook/react';
import { StatTile } from './StatTile';
import { Pill } from '../Pill';
import { Meter } from '../Meter';

const meta: Meta<typeof StatTile> = { title: 'Data display/StatTile', component: StatTile, decorators: [(Story) => <div style={{ maxWidth: 280 }}><Story /></div>] };
export default meta;

export const WithTrend: StoryObj<typeof StatTile> = {
  args: { label: 'Revenue', value: '737,405', unit: 'L', aside: <Pill tone="primary">6% vs Sep</Pill>, note: 'Products only, services left out' },
};
export const WithMeter: StoryObj<typeof StatTile> = {
  args: { label: 'Profit', value: '271,080', unit: 'L', aside: '37% margin', children: <Meter value={37} aria-label="Profit margin" valueText="37%" /> },
};
export const OfTotal: StoryObj<typeof StatTile> = { args: { label: 'Products sold', value: 84, unit: 'of 117', note: '33 products sold nothing' } };
