import * as React from 'react';
import { Box, Card, CardContent, Skeleton } from '@mui/material';
import { TableSkeleton } from '../TableSkeleton';

/**
 * - `profile`: a contact-style card on the left (1/3) with an avatar, tabs
 *   over a list on the right (2/3).
 * - `document`: content on the left (2/3), a summary card on the right (1/3),
 *   e.g. an invoice with its totals.
 * - `list`: a single list card, for a route-level loading state that does
 *   not know which page is coming.
 */
export type PageSkeletonVariant = 'profile' | 'document' | 'list';

export interface PageSkeletonProps {
  /** Layout to draw. Defaults to `'list'`. */
  variant?: PageSkeletonVariant;
  /** Text announced to screen readers. Pass a translated string to localise it. Defaults to `'Loading'`. */
  label?: string;
}

/** Visible to assistive tech only. */
const visuallyHidden = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
} as const;

function Lines({ count }: { count: number }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {Array.from({ length: count }, (_, i) => (
        <Box key={i}>
          <Skeleton variant="text" width="30%" sx={{ fontSize: '0.75rem' }} />
          <Skeleton variant="text" width={i % 2 ? '55%' : '75%'} />
        </Box>
      ))}
    </Box>
  );
}

function ListCard({ tabs }: { tabs: boolean }) {
  return (
    <Card>
      <CardContent>
        {tabs && (
          <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} variant="text" width={72} sx={{ fontSize: '1rem' }} />
            ))}
          </Box>
        )}
        <TableSkeleton rows={5} columns={4} />
      </CardContent>
    </Card>
  );
}

/**
 * A page's layout drawn as placeholders while its data loads, so only the
 * content fills in and nothing below it jumps. The shapes follow common page
 * grids rather than any page's exact contents.
 *
 * Screen readers hear a single "Loading" status; the placeholder shapes are
 * hidden from them. The status text is the region's own (visually hidden)
 * content, because a live region announces its content, not its label.
 */
export function PageSkeleton({ variant = 'list', label = 'Loading' }: PageSkeletonProps) {
  const side = (
    <Card>
      <CardContent>
        {variant === 'profile' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Skeleton variant="circular" width={72} height={72} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="50%" sx={{ fontSize: '1.25rem' }} />
          </Box>
        )}
        <Lines count={variant === 'profile' ? 3 : 4} />
      </CardContent>
    </Card>
  );

  return (
    <Box role="status">
      <Box component="span" sx={visuallyHidden}>
        {label}
      </Box>
      <Box aria-hidden="true" data-variant={variant}>
        {/* Breadcrumbs, then the title and subtitle. */}
        <Skeleton variant="text" width={180} sx={{ mb: 1 }} />
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="40%" sx={{ fontSize: '1.5rem', maxWidth: 320 }} />
          <Skeleton variant="text" width="25%" sx={{ maxWidth: 200 }} />
        </Box>

        {variant === 'list' ? (
          <ListCard tabs={false} />
        ) : (
          // CSS grid rather than MUI's Grid, whose API differs between MUI majors.
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                md: variant === 'profile' ? '1fr 2fr' : '2fr 1fr',
              },
            }}
          >
            {variant === 'profile' ? (
              <>
                {side}
                <ListCard tabs />
              </>
            ) : (
              <>
                <ListCard tabs={false} />
                {side}
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
