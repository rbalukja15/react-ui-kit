import { findActiveIndex, isPathActive } from './navItems';

describe('isPathActive', () => {
  it('matches the root only on the root', () => {
    expect(isPathActive('/', '/')).toBe(true);
    expect(isPathActive('/', '/clients')).toBe(false);
  });

  it('matches a path and the paths below it, on segment boundaries', () => {
    expect(isPathActive('/clients', '/clients')).toBe(true);
    expect(isPathActive('/clients', '/clients/42/edit')).toBe(true);
    expect(isPathActive('/clients', '/clientsarchive')).toBe(false);
    expect(isPathActive('/clients/', '/clients')).toBe(true);
  });

  it('ignores the query string and hash', () => {
    expect(isPathActive('/clients', '/clients?page=2')).toBe(true);
    expect(isPathActive('/clients?tab=open', '/clients#top')).toBe(true);
    expect(isPathActive('/', '/?q=x')).toBe(true);
  });
});

describe('findActiveIndex', () => {
  const items = [
    { label: 'Home', href: '/', icon: null },
    { label: 'Settings', href: '/settings', icon: null },
    { label: 'Users', href: '/settings/users', icon: null },
    { label: 'Log out', icon: null },
  ];

  it('picks the longest matching href', () => {
    expect(findActiveIndex(items, '/settings/users/3')).toBe(2);
    expect(findActiveIndex(items, '/settings/billing')).toBe(1);
    expect(findActiveIndex(items, '/')).toBe(0);
    expect(findActiveIndex(items, '/elsewhere')).toBe(-1);
  });

  it('returns -1 without a current path', () => {
    expect(findActiveIndex(items, undefined)).toBe(-1);
  });

  it('takes the first match of a custom rule', () => {
    expect(findActiveIndex(items, '/anything', (item) => item.label.startsWith('S') || item.label === 'Users')).toBe(1);
  });
});
