import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent } from '@storybook/test';
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

/**
 * A long label on a phone: the pill stays inside the plot, centred over its
 * bar where there is room, and wraps when it is wider than the plot, with
 * the bars moved down to make room. Picking the first or last bar slides it
 * in from the edge.
 */
function PhoneLongLabelDemo() {
  const [index, setIndex] = React.useState(data.length - 1);
  return (
    <div style={{ width: 280 }}>
      <BarChart
        aria-label="Revenue by day"
        data={data}
        selectedIndex={index}
        onSelect={setIndex}
        formatSelected={(_, i) => `${i + 1} Nov · 14,850.00\u00a0L · profit\u00a06,546.25\u00a0L`}
        axisLabels={['1 Nov', '13 Nov']}
      />
    </div>
  );
}
export const PhoneLongLabel: StoryObj = {
  render: () => <PhoneLongLabelDemo />,
  parameters: { testRunner: { viewportWidth: 360 } },
  play: async ({ canvasElement }) => {
    const plot = canvasElement.querySelector<HTMLElement>('[role="slider"]')!;
    const fits = () => {
      const box = plot.getBoundingClientRect();
      const pill = plot.querySelector<HTMLElement>('span[aria-hidden="true"]')!.parentElement!.getBoundingClientRect();
      const bars = plot.lastElementChild!.getBoundingClientRect();
      return { left: pill.left - box.left, right: box.right - pill.right, gap: bars.top - pill.bottom };
    };
    for (const key of ['End', 'Home']) {
      plot.focus();
      await userEvent.keyboard(`{${key}}`);
      await new Promise((resolve) => setTimeout(resolve, 50));
      const fit = fits();
      await expect(fit.left).toBeGreaterThanOrEqual(-0.5);
      await expect(fit.right).toBeGreaterThanOrEqual(-0.5);
      await expect(fit.gap).toBeGreaterThanOrEqual(0);
    }
  },
};

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
