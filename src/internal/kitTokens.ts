import { alpha, type Theme } from '@mui/material/styles';
import type { ChartTokens, LineTokens, SurfaceTokens } from '../theme/theme';

/**
 * The kit's extra palette tokens, with fallbacks derived from the standard
 * palette, so the components still render under a plain MUI theme that was
 * not built with `createAppTheme`.
 */
export function kit(theme: Theme): { surface: SurfaceTokens; line: LineTokens; chart: ChartTokens } {
  const { palette } = theme;
  const ink = palette.text.primary;
  return {
    surface: palette.surface ?? {
      tray: alpha(ink, 0.03),
      card: palette.background.paper,
      track: alpha(ink, 0.08),
    },
    line: palette.line ?? { soft: alpha(ink, 0.06), main: palette.divider, strong: alpha(ink, 0.14) },
    chart: palette.chart ?? { muted: alpha(palette.primary.main, 0.22), neutral: alpha(ink, 0.16) },
  };
}
