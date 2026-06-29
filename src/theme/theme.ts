import { createTheme, type Theme, alpha } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

export type ThemeMode = 'light' | 'dark';

// Display/serif face — editorial serif headings. Consumers load
// Newsreader themselves (see README "Fonts"). Falls back to a system
// serif stack if the webfont isn't present.
const displayFont = '"Newsreader", Georgia, "Times New Roman", serif';

/**
 * Library theme — a warm editorial design language on a teal brand
 * axis, in both light and a muted dark mode.
 *
 * Four principles drive the design:
 *
 *   1. **Warm tinted neutrals over pure white/black.** Surfaces are warm
 *      paper (``#FBFAF6`` light / ``#262320`` dark) sitting just above a
 *      warm page (``#EFEEE7`` / ``#1C1A17``). Cards read as gently
 *      raised rather than as harsh cut-outs. Dividers and borders are
 *      warm hairlines, never pure grey.
 *
 *   2. **Confidently muted secondary text.** ``text.secondary`` is muted
 *      but assertive enough to scan (``#6F6A5C`` light / ``#B8B0A0``
 *      dark) — not washed-out.
 *
 *   3. **Interaction polish tinted with the brand.** MUI's neutral-grey
 *      defaults (hover ``rgba(0,0,0,0.04)``, divider ``rgba(0,0,0,0.12)``,
 *      tooltip dark-grey, focus ring blue) fight a warm palette. Every
 *      hover / divider / tooltip / focus is re-routed through the warm
 *      + teal axis below. Teal is muted in dark mode to avoid glare.
 *
 *   4. **Editorial serif display.** ``h1``–``h6``, dialog titles and stat
 *      numbers use Newsreader; body, captions and buttons stay Inter
 *      sentence-case.
 *
 * Tonal chips are the other behavioural change: MUI's default
 * ``<Chip color="error" />`` is a vivid filled block — fine for a single
 * attention-grabbing chip, jarring across a dense table of status badges.
 * The ``MuiChip`` override below converts filled semantic chips to a
 * pale-tint background + strong-text foreground (similar to GitHub /
 * Linear / Stripe). Outlined chips are untouched.
 */

const sharedComponents = (mode: PaletteMode) => ({
  // Reserve the scrollbar's gutter on the root scroller so a page that
  // grows tall enough to need a vertical scrollbar doesn't shift the
  // whole layout sideways when it appears. No-op where the OS uses
  // overlay scrollbars.
  MuiCssBaseline: {
    styleOverrides: {
      html: { scrollbarGutter: 'stable' },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 9,
        textTransform: 'none' as const,
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: mode === 'light' ? '0 1px 2px rgba(40,38,31,0.05)' : 'none',
        border: mode === 'light' ? undefined : '1px solid rgba(237,232,220,0.10)',
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: mode === 'light' ? 'rgba(40,38,31,0.10)' : 'rgba(237,232,220,0.10)',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        '&.MuiTableRow-hover:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.06),
        },
      }),
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottomColor: mode === 'light' ? 'rgba(40,38,31,0.08)' : 'rgba(237,232,220,0.08)',
        fontVariantNumeric: 'tabular-nums',
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: mode === 'light' ? '#2A2722' : '#3A3530',
        color: '#EDE8DC',
        fontSize: '0.75rem',
        fontWeight: 500,
        padding: '6px 10px',
        borderRadius: 6,
      },
      arrow: { color: mode === 'light' ? '#2A2722' : '#3A3530' },
    },
  },
  MuiChip: {
    styleOverrides: {
      // Filled semantic chips → pale-tinted background + strong-text
      // foreground (the signature tonal-chip behavior). Outlined and
      // default chips pass through unchanged.
      root: ({ ownerState, theme }: { ownerState: { variant?: string; color?: string }; theme: Theme }) => {
        const baseStyles = { borderRadius: 6 };
        const { variant, color } = ownerState;
        if (variant !== 'filled') return baseStyles;
        if (!color || color === 'default') return baseStyles;
        const palette = (theme.palette as unknown as Record<string, { main: string; dark: string; light: string } | undefined>)[color];
        if (!palette) return baseStyles;
        const tintAlpha = theme.palette.mode === 'light' ? 0.12 : 0.22;
        // Hover/focus carry their own (higher) alpha. Text stays in
        // place to avoid the "label disappears on hover" bug from MUI's
        // default ``backgroundColor: palette.dark`` hover rule.
        const hoverAlpha = theme.palette.mode === 'light' ? 0.20 : 0.32;
        const fg = theme.palette.mode === 'light' ? palette.dark : palette.light;
        return {
          ...baseStyles,
          backgroundColor: alpha(palette.main, tintAlpha),
          color: fg,
          border: 'none',
          '&:hover, &.MuiChip-clickable:hover, &.MuiChip-clickable:focus, &.MuiChip-clickable:active': {
            backgroundColor: `${alpha(palette.main, hoverAlpha)} !important`,
            color: fg,
          },
          '&.Mui-focusVisible': {
            backgroundColor: `${alpha(palette.main, hoverAlpha)} !important`,
            color: fg,
          },
          '& .MuiChip-icon': { color: 'inherit' },
          '& .MuiChip-deleteIcon': {
            color: 'inherit',
            opacity: 0.7,
            '&:hover': { opacity: 1 },
          },
        };
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-head': {
          fontWeight: 700,
          backgroundColor: mode === 'light' ? '#F2F0E8' : '#2E2A26',
        },
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: { backgroundColor: '#292723', color: '#EDE8DC' },
    },
  },
  // Hide browser-default spinner buttons on number inputs (they overlap
  // values in narrow cells and step behavior is inconsistent across
  // browsers). Soften the resting outline and trim the focused outline
  // to 1.5px so focus reads as "focused" not "alarmed".
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: alpha(theme.palette.text.primary, 0.18),
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: alpha(theme.palette.text.primary, 0.32),
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderWidth: 1.5,
        },
      }),
      input: {
        '&[type=number]': { MozAppearance: 'textfield' },
        '&[type=number]::-webkit-outer-spin-button, &[type=number]::-webkit-inner-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        },
      },
    },
  },
  // Slightly darker / heavier label when the field has focus or a
  // value — default labels read faint against the warm tinted paper.
  MuiInputLabel: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        '&.MuiInputLabel-outlined:not(.MuiInputLabel-shrink)': {
          color: alpha(theme.palette.text.primary, 0.55),
        },
        '&.Mui-focused': { fontWeight: 500 },
      }),
    },
  },
  // Bump helper-text size a touch so per-field hints are scannable.
  MuiFormHelperText: {
    styleOverrides: {
      root: { fontSize: '0.72rem', marginTop: 4 },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
        boxShadow: mode === 'light'
          ? '0 24px 60px rgba(40,38,31,0.22)'
          : '0 24px 60px rgba(0,0,0,0.5)',
        ...(mode === 'dark' ? { border: '1px solid rgba(237,232,220,0.10)' } : {}),
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontFamily: displayFont,
        fontSize: '1.25rem',
        fontWeight: 600,
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: ({ theme }: { theme: Theme }) => ({
        height: 2,
        backgroundColor: theme.palette.primary.main,
      }),
    },
  },
  MuiTab: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        textTransform: 'none',
        fontWeight: 500,
        letterSpacing: '-0.01em',
        '&.Mui-selected': { fontWeight: 600, color: theme.palette.primary.main },
      }),
    },
  },
  MuiBottomNavigationAction: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        color: theme.palette.text.secondary,
        '&.Mui-selected': { color: theme.palette.primary.main },
      }),
    },
  },
});

/** Theme factory. Pair with `ThemeModeProvider` for an integrated
 *  light/dark toggle, or pass directly to MUI's `ThemeProvider`. */
export function createAppTheme(mode: ThemeMode = 'light'): Theme {
  const isLight = mode === 'light';
  return createTheme({
    palette: {
      mode,
      primary: isLight
        ? { main: '#0f766e', light: '#5eead4', dark: '#115e59', contrastText: '#ffffff' }
        : { main: '#2E9488', light: '#84B7AE', dark: '#3F8C82', contrastText: '#F4F7F5' },
      secondary: isLight
        ? { main: '#0891b2', light: '#67e8f9', dark: '#0e7490', contrastText: '#ffffff' }
        : { main: '#3FA4BE', light: '#9BD8E6', dark: '#2C7E94', contrastText: '#08222A' },
      success: isLight
        ? { main: '#5F7544', light: '#8BA862', dark: '#516237', contrastText: '#ffffff' }
        : { main: '#A8C089', light: '#C2D6A8', dark: '#7C9658', contrastText: '#14210A' },
      warning: isLight
        ? { main: '#B0792E', light: '#D8A24A', dark: '#8A5E1E', contrastText: '#ffffff' }
        : { main: '#E0B468', light: '#EECB92', dark: '#B0892E', contrastText: '#241803' },
      error: isLight
        ? { main: '#B23A3A', light: '#D87A7A', dark: '#A0342E', contrastText: '#ffffff' }
        : { main: '#E89B9B', light: '#F0B9B9', dark: '#C24A4A', contrastText: '#2A0E0E' },
      info: isLight
        ? { main: '#4A6E8C', light: '#86A6C0', dark: '#3C5870', contrastText: '#ffffff' }
        : { main: '#A9C6DE', light: '#C8DCEC', dark: '#6E91AE', contrastText: '#0A1922' },
      background: isLight
        ? { default: '#EFEEE7', paper: '#FBFAF6' }
        : { default: '#1C1A17', paper: '#262320' },
      text: isLight
        ? { primary: '#2A2722', secondary: '#6F6A5C', disabled: '#A8A294' }
        : { primary: '#EDE8DC', secondary: '#B8B0A0', disabled: '#7C766A' },
      divider: isLight ? 'rgba(40,38,31,0.10)' : 'rgba(237,232,220,0.10)',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontFamily: displayFont, fontWeight: 600, fontSize: '2.25rem', lineHeight: 1.15, letterSpacing: '-0.01em' },
      h2: { fontFamily: displayFont, fontWeight: 600, fontSize: '1.875rem', lineHeight: 1.2, letterSpacing: '-0.01em' },
      h3: { fontFamily: displayFont, fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.25, letterSpacing: '-0.005em' },
      h4: { fontFamily: displayFont, fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.3 },
      h5: { fontFamily: displayFont, fontWeight: 600, fontSize: '1.2rem', lineHeight: 1.35 },
      h6: { fontFamily: displayFont, fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.4 },
      body1: { fontSize: '0.9375rem', lineHeight: 1.55 },
      body2: { fontSize: '0.875rem', lineHeight: 1.55 },
      caption: { fontSize: '0.75rem', lineHeight: 1.4, letterSpacing: '0.01em' },
      button: { fontWeight: 600, letterSpacing: '-0.01em', textTransform: 'none' as const },
    },
    components: sharedComponents(mode),
    shape: { borderRadius: 8 },
  });
}
