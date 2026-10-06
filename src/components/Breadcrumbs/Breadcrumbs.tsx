import * as React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

export interface Crumb {
  label: string;
  /** Where the crumb links to. Ignored on the last crumb, which is the current page. */
  href?: string;
}

export interface BreadcrumbsProps {
  items: Crumb[];
  /**
   * Router link component for crumbs with an `href` (Next's `Link`, a
   * react-router `Link`, …). Defaults to a plain `<a>`.
   */
  LinkComponent?: React.ElementType;
  /** Separator between crumbs. Defaults to a chevron. */
  separator?: React.ReactNode;
  /** Accessible name of the navigation landmark. Defaults to `'Breadcrumb'`. */
  label?: string;
  sx?: SxProps<Theme>;
}

/** NavigateNext, inlined so the kit does not need `@mui/icons-material`. */
function Chevron() {
  return (
    <svg aria-hidden="true" focusable="false" width="1.25em" height="1.25em" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );
}

/**
 * Breadcrumb trail for detail-page headers. The last crumb is the current
 * page (`aria-current="page"`) and never a link; earlier crumbs link to their
 * `href`, or render as plain text without one. Spacing is left to the caller
 * (`sx`).
 */
export function Breadcrumbs({
  items,
  LinkComponent,
  separator = <Chevron />,
  label = 'Breadcrumb',
  sx,
}: BreadcrumbsProps) {
  return (
    <MuiBreadcrumbs separator={separator} aria-label={label} sx={sx}>
      {items.map((crumb, i) => {
        const isLast = i === items.length - 1;
        if (crumb.href && !isLast) {
          return (
            <MuiLink
              key={i}
              href={crumb.href}
              underline="hover"
              color="inherit"
              sx={{ display: 'inline-flex', alignItems: 'center' }}
              {...(LinkComponent ? { component: LinkComponent } : {})}
            >
              {crumb.label}
            </MuiLink>
          );
        }
        return (
          <Typography
            key={i}
            color={isLast ? 'text.primary' : 'inherit'}
            aria-current={isLast ? 'page' : undefined}
            sx={isLast ? { fontWeight: 600 } : undefined}
          >
            {crumb.label}
          </Typography>
        );
      })}
    </MuiBreadcrumbs>
  );
}
