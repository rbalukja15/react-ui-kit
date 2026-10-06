import type * as React from 'react';

export interface NavItem {
  label: string;
  icon: React.ReactNode;
  /** Where the item links to. Rendered through the shell's `LinkComponent`. */
  href?: string;
  /** Runs on click, after or instead of following `href` (a logout action, say). */
  onClick?: () => void;
  /** React key. Defaults to `href`, then `label`. */
  key?: string;
}

/** Decides whether `item` is the current page. */
export type IsNavItemActive = (item: NavItem, currentPath: string) => boolean;

/**
 * The default active-item rule: `/` matches only itself, any other `href`
 * matches itself and the paths below it (`/clients` matches `/clients/42`,
 * not `/clientsarchive`). A query string or hash on either side is ignored.
 */
export function isPathActive(href: string, currentPath: string): boolean {
  const path = stripSearch(currentPath);
  const target = stripSearch(href).replace(/(.)\/+$/, '$1');
  if (target === '/') return path === '/';
  return path === target || path.startsWith(`${target}/`);
}

function stripSearch(path: string): string {
  const end = path.search(/[?#]/);
  return end === -1 ? path : path.slice(0, end);
}

export const navItemKey = (item: NavItem) => item.key ?? item.href ?? item.label;

/**
 * Index of the item to mark as the current page, or -1. With the default
 * rule several items can match (`/settings` and `/settings/users`), so the
 * longest `href` wins.
 */
export function findActiveIndex(items: NavItem[], currentPath: string | undefined, isActive?: IsNavItemActive): number {
  if (currentPath === undefined) return -1;
  let best = -1;
  let bestLength = -1;
  items.forEach((item, i) => {
    if (isActive) {
      if (best === -1 && isActive(item, currentPath)) best = i;
      return;
    }
    if (item.href === undefined || !isPathActive(item.href, currentPath)) return;
    if (item.href.length > bestLength) {
      best = i;
      bestLength = item.href.length;
    }
  });
  return best;
}

export type ShellBreakpoint = 'sm' | 'md' | 'lg' | 'xl';
