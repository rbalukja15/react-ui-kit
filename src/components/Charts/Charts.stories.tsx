import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BarChart } from './BarChart';
import { ChartLegend, StackedBarChart } from './StackedBarChart';
import { Sparkline } from './Sparkline';

const meta: Meta = { title: 'Data display/Charts' };
export default meta;

const values = [12, 18, 22, 4, 15, 13, 17, 14, 20, 24, 3, 17, 14];
const data = values.map((v, i) => ({ label: `Day ${i + 1}, ${v}k L`, value: v }));

function Selectable() {
  const [index, setIndex] = React.useState(9);
  return <BarChart aria-label="Revenue by day" data={data} selectedIndex={index} onSelect={setIndex} formatSelected={(d) => d.label} axisLabels={['Day 1', 'Day 13']} />;
}
export const SelectableBars: StoryObj = { render: () => <Selectable /> };
export const PlainBars: StoryObj = { render: () => <BarChart aria-label="Revenue by day" data={data} height={140} /> };

const series = [{ label: 'Cost' }, { label: 'Profit' }];
export const Stacked: StoryObj = {
  render: () => (
    <div>
      <ChartLegend series={series} />
      <StackedBarChart
        aria-label="Revenue vs cost"
        series={series}
        data={['Jan', 'Feb', 'Mar', 'Apr'].map((label, i) => ({ label, 'aria-label': `${label}: cost ${4 + i}, profit ${6 + i}`, values: [4 + i, 6 + i] }))}
      />
    </div>
  ),
};
export const SparklineInCell: StoryObj = { render: () => <Sparkline values={[2, 3, 2, 4, 3, 3, 2, 4, 5, 3, 4, 5]} aria-label="Weekly sales, last 12 weeks" /> };
