import type { Meta, StoryObj } from '@storybook/react';
import { Pill } from './Pill';

const meta: Meta<typeof Pill> = { title: 'Data display/Pill', component: Pill, args: { children: '4 overdue', tone: 'warning' } };
export default meta;

export const Default: StoryObj<typeof Pill> = {};
export const Tones: StoryObj<typeof Pill> = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Pill>84</Pill>
      <Pill tone="primary">6% vs Sep</Pill>
      <Pill tone="success">Paid</Pill>
      <Pill tone="warning">4 overdue</Pill>
      <Pill tone="error">Failed</Pill>
      <Pill tone="info">Draft</Pill>
      <Pill tone="warning" size="medium">75 kg</Pill>
    </div>
  ),
};
