import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { DatePresets, addToDate } from './DatePresets';

const local = (y: number, m: number, d: number) => new Date(y, m - 1, d);

describe('addToDate', () => {
  it('adds days, weeks, months and years', () => {
    const base = local(2026, 3, 15);
    expect(addToDate(base, 10, 'day')).toEqual(local(2026, 3, 25));
    expect(addToDate(base, 2, 'week')).toEqual(local(2026, 3, 29));
    expect(addToDate(base, 3, 'month')).toEqual(local(2026, 6, 15));
    expect(addToDate(base, 1, 'year')).toEqual(local(2027, 3, 15));
    expect(addToDate(base, -1, 'month')).toEqual(local(2026, 2, 15));
  });

  it('goes back in time with negative weeks and years', () => {
    expect(addToDate(local(2026, 3, 4), -1, 'week')).toEqual(local(2026, 2, 25));
    expect(addToDate(local(2026, 3, 15), -2, 'year')).toEqual(local(2024, 3, 15));
    expect(addToDate(local(2028, 2, 29), -1, 'year')).toEqual(local(2027, 2, 28));
  });

  it('returns the same day for an amount of 0', () => {
    for (const unit of ['day', 'week', 'month', 'year'] as const) {
      expect(addToDate(local(2026, 1, 31), 0, unit)).toEqual(local(2026, 1, 31));
    }
  });

  it('clamps to the end of shorter months', () => {
    expect(addToDate(local(2026, 1, 31), 1, 'month')).toEqual(local(2026, 2, 28));
    expect(addToDate(local(2028, 1, 31), 1, 'month')).toEqual(local(2028, 2, 29));
    expect(addToDate(local(2028, 2, 29), 1, 'year')).toEqual(local(2029, 2, 28));
    expect(addToDate(local(2026, 10, 31), 3, 'month')).toEqual(local(2027, 1, 31));
  });

  it('does not change the date it was given', () => {
    const base = local(2026, 1, 31);
    addToDate(base, 1, 'month');
    expect(base).toEqual(local(2026, 1, 31));
  });
});

describe('<DatePresets>', () => {
  afterEach(() => vi.useRealTimers());

  it('renders the default presets as a named group', () => {
    render(<DatePresets onPick={() => {}} />);
    const group = screen.getByRole('group', { name: 'Date presets' });
    expect(group).toHaveTextContent('+1 month+3 months+1 year');
  });

  it('adds the preset to the base date read at click time', () => {
    const onPick = vi.fn();
    let base = '2026-01-31';
    render(<DatePresets getBaseDate={() => base} onPick={onPick} />);

    fireEvent.click(screen.getByRole('button', { name: '+1 month' }));
    expect(onPick).toHaveBeenLastCalledWith('2026-02-28', local(2026, 2, 28));

    base = '2026-05-10';
    fireEvent.click(screen.getByRole('button', { name: '+1 year' }));
    expect(onPick).toHaveBeenLastCalledWith('2027-05-10', local(2027, 5, 10));
  });

  it('accepts a Date as the base', () => {
    const onPick = vi.fn();
    render(<DatePresets getBaseDate={() => local(2026, 12, 1)} onPick={onPick} />);
    fireEvent.click(screen.getByRole('button', { name: '+3 months' }));
    expect(onPick).toHaveBeenCalledWith('2027-03-01', local(2027, 3, 1));
  });

  it('counts from today when the base is blank or invalid', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(local(2026, 10, 6));
    const onPick = vi.fn();
    let base: string | undefined = undefined;
    render(<DatePresets getBaseDate={() => base} onPick={onPick} />);

    fireEvent.click(screen.getByRole('button', { name: '+1 month' }));
    expect(onPick).toHaveBeenLastCalledWith('2026-11-06', local(2026, 11, 6));

    base = '2026-02-30';
    fireEvent.click(screen.getByRole('button', { name: '+1 month' }));
    expect(onPick).toHaveBeenLastCalledWith('2026-11-06', local(2026, 11, 6));
  });

  it('takes custom presets and a group label', () => {
    const onPick = vi.fn();
    render(
      <DatePresets
        label="Follow-up in"
        presets={[
          { label: '1 week', amount: 1, unit: 'week' },
          { label: '10 days', amount: 10, unit: 'day' },
        ]}
        getBaseDate={() => '2026-12-28'}
        onPick={onPick}
      />,
    );
    expect(screen.getByRole('group', { name: 'Follow-up in' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '1 week' }));
    expect(onPick).toHaveBeenLastCalledWith('2027-01-04', local(2027, 1, 4));
    fireEvent.click(screen.getByRole('button', { name: '10 days' }));
    expect(onPick).toHaveBeenLastCalledWith('2027-01-07', local(2027, 1, 7));
  });

  it('does not pick while disabled', () => {
    const onPick = vi.fn();
    render(<DatePresets onPick={onPick} disabled />);
    fireEvent.click(screen.getByText('+1 month'));
    expect(onPick).not.toHaveBeenCalled();
  });
});
