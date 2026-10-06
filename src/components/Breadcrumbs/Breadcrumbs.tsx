import * as React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

export interface Crumb {
  label: string;
  /** Where the crumb links to. Leave it out on the current page. */
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
 * Breadcrumb trail for detail-page headers. Crumbs with an `href` render as
 * links to their parent pages; a crumb without one renders as the current
 * page (`aria-current="page"`), normally the last item.
 */
export function Breadcrumbs({
  items,
  LinkComponent,
  separator = <Chevron />,
  label = 'Breadcrumb',
  sx,
}: BreadcrumbsProps) {
  return (
    <MuiBreadcrumbs separator={separator} aria-label={label} sx={[{ mb: 2 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      {items.map((crumb, i) =>
        crumb.href ? (
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
        ) : (
          <Typography key={i} color="text.primary" aria-current="page" sx={{ fontWeight: 600 }}>
            {crumb.label}
          </Typography>
        ),
      )}
    </MuiBreadcrumbs>
  );
}
