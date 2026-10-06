import { isCreateOption, withCreateOption, withPinnedOption } from './createOption';
import type { IdOption } from './IdAutocomplete';

const rows: IdOption[] = [
  { id: '1', label: 'Ada Lovelace' },
  { id: '2', label: 'Grace Hopper' },
];

describe('withCreateOption', () => {
  const label = (typed: string) => `+ New person "${typed}"`;

  it('adds the create row last, carrying the typed text', () => {
    const out = withCreateOption(rows, 'Alan', label);
    expect(out.slice(0, 2)).toEqual(rows);
    expect(out[2]).toMatchObject({ label: '+ New person "Alan"', typed: 'Alan' });
    expect(isCreateOption(out[2])).toBe(true);
  });

  it('adds it even when the search found nothing', () => {
    const out = withCreateOption([], 'Alan', label);
    expect(out).toHaveLength(1);
    expect(isCreateOption(out[0])).toBe(true);
  });

  it('trims the typed text', () => {
    const out = withCreateOption(rows, '  Alan  ', label);
    expect(out[2]).toMatchObject({ label: '+ New person "Alan"', typed: 'Alan' });
  });

  it('adds nothing while the box is blank', () => {
    expect(withCreateOption(rows, '', label)).toBe(rows);
    expect(withCreateOption(rows, '   ', label)).toBe(rows);
  });

  it('is not offered when an option already carries exactly that label', () => {
    // Typing someone's full name means picking them, not making a twin.
    expect(withCreateOption(rows, 'Grace Hopper', label)).toBe(rows);
    expect(withCreateOption(rows, '  grace hopper ', label)).toBe(rows);
    expect(withCreateOption([{ id: 3, label: ' Alan Turing ' }], 'alan turing', label)).toHaveLength(1);
  });

  it('is still offered for a name that only starts like an existing one', () => {
    expect(withCreateOption(rows, 'Grace', label)).toHaveLength(3);
  });

  it('does not mutate the list it was given', () => {
    const copy = [...rows];
    withCreateOption(copy, 'Alan', label);
    expect(copy).toEqual(rows);
  });
});

describe('isCreateOption', () => {
  it('is false for real options, null and undefined', () => {
    expect(isCreateOption(rows[0])).toBe(false);
    expect(isCreateOption(null)).toBe(false);
    expect(isCreateOption(undefined)).toBe(false);
  });

  it('does not depend on the id, so no real option can pass for the create row', () => {
    const create = withCreateOption(rows, 'Alan', (t) => t)[2];
    expect(isCreateOption({ id: create?.id ?? '', label: 'Ada Lovelace' })).toBe(false);
  });
});

describe('withPinnedOption', () => {
  it('leaves the list alone when nothing is pinned', () => {
    expect(withPinnedOption(rows, null)).toBe(rows);
    expect(withPinnedOption(rows, undefined)).toBe(rows);
  });

  it('puts a record the list does not hold first, so it shows without scrolling', () => {
    const pinned = { id: '9', label: 'Zora Neale Hurston' };
    expect(withPinnedOption(rows, pinned)).toEqual([pinned, ...rows]);
  });

  it('does not duplicate a record the list already holds', () => {
    // Duplicate ids would render the option twice.
    const result = withPinnedOption(rows, { id: '2', label: 'Grace Hopper' });
    expect(result).toBe(rows);
  });

  it('matches ids as strings', () => {
    expect(withPinnedOption(rows, { id: 2, label: 'Grace Hopper' })).toBe(rows);
  });

  it('prefers the list copy over a stale pinned copy of the same record', () => {
    // The pinned option is a snapshot; a fresh one from the server wins.
    const stale = { id: 7, label: 'Website redesign', budget: 10 };
    const fresh = { id: 7, label: 'Website redesign', budget: 12 };
    const result = withPinnedOption([fresh], stale);
    expect(result).toHaveLength(1);
    expect(result[0]?.budget).toBe(12);
  });

  it('puts an ungrouped record first among the ungrouped options, so grouped ones stay first', () => {
    // IdOption.group: options with a group come first and together.
    const grouped = [
      { id: 1, label: 'Ada Lovelace', group: 'Recent' },
      { id: 2, label: 'Grace Hopper', group: 'Recent' },
      { id: 3, label: 'Alan Turing' },
    ];
    const pinned = { id: 9, label: 'Zora Neale Hurston' };
    expect(withPinnedOption(grouped, pinned)).toEqual([grouped[0], grouped[1], pinned, grouped[2]]);
  });

  it('puts an ungrouped record last when every option is grouped', () => {
    const grouped = [{ id: 1, label: 'Ada Lovelace', group: 'Recent' }];
    const pinned = { id: 9, label: 'Zora Neale Hurston' };
    expect(withPinnedOption(grouped, pinned)).toEqual([grouped[0], pinned]);
  });

  it('puts a grouped record first in its group, or first of all when its group is new', () => {
    const grouped = [
      { id: 1, label: 'Ada Lovelace', group: 'Recent' },
      { id: 2, label: 'Grace Hopper', group: 'Team' },
      { id: 3, label: 'Alan Turing' },
    ];
    const team = { id: 9, label: 'Zora Neale Hurston', group: 'Team' };
    expect(withPinnedOption(grouped, team)).toEqual([grouped[0], team, grouped[1], grouped[2]]);
    const created = { id: 10, label: 'Mary Jackson', group: 'Created' };
    expect(withPinnedOption(grouped, created)).toEqual([created, ...grouped]);
  });

  it('works when the list is empty', () => {
    const pinned = { id: 7, label: 'Website redesign' };
    expect(withPinnedOption([], pinned)).toEqual([pinned]);
  });
});
