import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { BarChart } from './BarChart';
import { ChartLegend, StackedBarChart } from './StackedBarChart';
import { Sparkline } from './Sparkline';

const data = [
  { label: 'Mon, 10 L', value: 10 },
  { label: 'Tue, 30 L', value: 30 },
];

describe('<BarChart>', () => {
  it('is one slider when selectable, moved by the arrow keys', async () => {
    const onSelect = vi.fn();
    const { container } = render(
      <BarChart aria-label="Revenue by day" data={data} selectedIndex={1} onSelect={onSelect} formatSelected={(d) => `Picked ${d.value}`} />,
    );
    const slider = screen.getByRole('slider', { name: 'Revenue by day' });
    expect(slider).toHaveAttribute('aria-valuetext', 'Tue, 30 L');
    expect(screen.getByText('Picked 30')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    slider.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(onSelect).toHaveBeenCalledWith(0);
    await userEvent.keyboard('{End}');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('draws plain labelled bars when not selectable', () => {
    render(<BarChart aria-label="Revenue" data={data} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });
});

describe('<StackedBarChart> and <ChartLegend>', () => {
  it('labels each bar and lists the series', async () => {
    const series = [{ label: 'Cost' }, { label: 'Profit' }];
    const { container } = render(
      <>
        <ChartLegend series={series} />
        <StackedBarChart
          aria-label="Revenue vs cost"
          series={series}
          data={[{ label: 'Oct', 'aria-label': 'October: cost 4, profit 6', values: [4, 6] }]}
        />
      </>,
    );
    expect(screen.getByRole('img', { name: 'October: cost 4, profit 6' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Cost', 'Profit']);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('<Sparkline>', () => {
  it('is one labelled image', () => {
    render(<Sparkline values={[1, 2, 3]} aria-label="Weekly sales: 1, 2, 3" />);
    expect(screen.getByRole('img', { name: 'Weekly sales: 1, 2, 3' })).toBeInTheDocument();
  });

  it('draws negative values as empty bars', () => {
    const { container } = render(<Sparkline values={[-5, 10]} aria-label="Change" />);
    const bars = container.querySelectorAll('[role="img"] > div');
    expect(getComputedStyle(bars[0]!).height).toBe('3px');
    expect(getComputedStyle(bars[1]!).height).toBe('26px');
  });
});
