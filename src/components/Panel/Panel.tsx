import * as React from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { kit } from '../../internal/kitTokens';

export interface PanelProps {
  /** Small label at the top left, rendered as the section's `<h2>` (or `headingComponent`). */
  title?: React.ReactNode;
  /** Outline icon before the title, about 16px. */
  icon?: React.ReactNode;
  /** Right side of the header: a link, a count pill, a legend, a dropdown. */
  action?: React.ReactNode;
  /** Accessible name when there is no `title`. */
  'aria-label'?: string;
  /**
   * `true` (default) makes the panel a `<section>` region, listed among the
   * page's landmarks. `false` makes it a named `group`, for small repeated
   * cards such as stat tiles.
   */
  landmark?: boolean;
  /** Heading element for the title. Defaults to `'h2'`. */
  headingComponent?: React.ElementType;
  children?: React.ReactNode;
  /** Styles for the outer tray. */
  sx?: SxProps<Theme>;
  /** Styles for the inner card, e.g. a different `gap` or `p`. */
  contentSx?: SxProps<Theme>;
}

/**
 * The page's building block: a white card inside a slightly darker tray,
 * both with hairline borders and no shadow. The optional header is a small
 * grey label with an outline icon and an action on the right.
 *
 * ```tsx
 * <Panel title="Running low" icon={<AlertIcon />} action={<Link href="/restock">Restock</Link>}>
 *   …
 * </Panel>
 * ```
 */
export function Panel({
  title,
  icon,
  action,
  'aria-label': ariaLabel,
  landmark = true,
  headingComponent = 'h2',
  children,
  sx,
  contentSx,
}: PanelProps) {
  const headingId = React.useId();
  const hasHeader = title !== undefined || action !== undefined;

  return (
    <Box
      component={landmark ? 'section' : 'div'}
      role={landmark ? undefined : 'group'}
      aria-labelledby={title !== undefined ? headingId : undefined}
      aria-label={title === undefined ? ariaLabel : undefined}
      sx={[
        (theme) => ({
          bgcolor: kit(theme).surface.tray,
          border: `1px solid ${kit(theme).line.soft}`,
          borderRadius: '16px',
          p: '6px',
          minWidth: 0,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={[
          (theme) => ({
            bgcolor: kit(theme).surface.card,
            // Lets pinned table headers inside the panel match its surface.
            '--ui-surface': kit(theme).surface.card,
            border: `1px solid ${kit(theme).line.soft}`,
            borderRadius: '12px',
            p: { xs: '14px', sm: '18px' },
            height: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }),
          ...(Array.isArray(contentSx) ? contentSx : [contentSx]),
        ]}
      >
        {hasHeader && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            {title !== undefined ? (
              <PanelLabel id={headingId} component={headingComponent} icon={icon}>
                {title}
              </PanelLabel>
            ) : (
              <span />
            )}
            {action}
          </Box>
        )}
        {children}
      </Box>
    </Box>
  );
}

export interface PanelLabelProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  id?: string;
  component?: React.ElementType;
}

/** The small grey "icon + label" used in panel and stat tile headers. */
export function PanelLabel({ children, icon, id, component = 'span' }: PanelLabelProps) {
  return (
    <Typography
      id={id}
      component={component}
      sx={{
        m: 0,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        fontSize: '0.8125rem',
        fontWeight: 500,
        lineHeight: 1.4,
        color: 'text.secondary',
        '& > svg': { flex: 'none', width: 16, height: 16 },
      }}
    >
      {icon}
      {children}
    </Typography>
  );
}
