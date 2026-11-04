import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { axe } from 'vitest-axe';
import { createAppTheme } from '../../theme/theme';
import { Panel } from './Panel';
import { StatTile } from '../StatTile';
import { Pill } from '../Pill';
import { Meter } from '../Meter';

const withKit = (ui: React.ReactElement) => render(<ThemeProvider theme={createAppTheme('light')}>{ui}</ThemeProvider>);

describe('<Panel>', () => {
  it('is a region named by its title, with the action beside it', async () => {
    const { container } = withKit(
      <Panel title="Running low" action={<a href="/restock">Restock</a>}>
        <p>content</p>
      </Panel>,
    );
    expect(screen.getByRole('region', { name: 'Running low' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Running low' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Restock' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('takes an aria-label when it has no title', () => {
    withKit(<Panel aria-label="Totals">x</Panel>);
    expect(screen.getByRole('region', { name: 'Totals' })).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders under a plain MUI theme', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <Panel title="Plain">
          <Meter value={40} aria-label="Share" />
          <Pill>3</Pill>
        </Panel>
      </ThemeProvider>,
    );
    expect(screen.getByRole('region', { name: 'Plain' })).toBeInTheDocument();
  });
});

describe('<StatTile>', () => {
  it('shows the label, value, unit, aside and note', async () => {
    const { container } = withKit(
      <StatTile label="Products sold" value={84} unit="of 117" aside={<Pill tone="primary">6% vs Sep</Pill>} note="33 sold nothing" />,
    );
    const tile = screen.getByRole('group', { name: 'Products sold' });
    expect(tile).toHaveTextContent('84of 117');
    expect(tile).toHaveTextContent('6% vs Sep');
    expect(tile).toHaveTextContent('33 sold nothing');
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('<Meter>', () => {
  it('exposes its value and clamps it to the range', () => {
    withKit(<Meter value={140} aria-label="Margin" valueText="140%" />);
    const meter = screen.getByRole('meter', { name: 'Margin' });
    expect(meter).toHaveAttribute('aria-valuenow', '100');
    expect(meter).toHaveAttribute('aria-valuetext', '140%');
    expect(getComputedStyle(meter.firstElementChild!).width).toBe('100%');
  });

  it('keeps the fill inside the bar for values outside the range', () => {
    withKit(
      <>
        <Meter value={-20} aria-label="Low" />
        <Meter value={30} min={10} max={50} aria-label="Middle" />
        <Meter value={5} min={5} max={5} aria-label="Empty range" />
      </>,
    );
    const fill = (name: string) => getComputedStyle(screen.getByRole('meter', { name }).firstElementChild!).width;
    expect(screen.getByRole('meter', { name: 'Low' })).toHaveAttribute('aria-valuenow', '0');
    expect(fill('Low')).toBe('0%');
    expect(fill('Middle')).toBe('50%');
    expect(fill('Empty range')).toBe('0%');
  });

  it('can be named by a visible label instead', () => {
    withKit(
      <>
        <span id="stock-label">Stock left</span>
        <Meter value={30} aria-labelledby="stock-label" />
      </>,
    );
    expect(screen.getByRole('meter', { name: 'Stock left' })).toBeInTheDocument();
  });
});
