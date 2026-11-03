import type { Meta, StoryObj } from '@storybook/react';
import { Meter } from './Meter';

const meta: Meta<typeof Meter> = {
  title: 'Data display/Meter',
  component: Meter,
  args: { value: 57, 'aria-label': 'Profit margin', valueText: '57%' },
  decorators: [(Story) => <div style={{ maxWidth: 240 }}><Story /></div>],
};
export default meta;
export const Default: StoryObj<typeof Meter> = {};
export const Muted: StoryObj<typeof Meter> = { args: { color: 'muted' } };
