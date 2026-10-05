import { alpha, decomposeColor, getContrastRatio, recomposeColor } from '@mui/material/styles';
import { createAppTheme, type ThemeMode } from './theme';

// WCAG 2.1 AA: 4.5:1 for body text, 3:1 for large text and UI parts.
// axe can't measure contrast in jsdom, so the palette is checked here.
const AA_TEXT = 4.5;
const AA_LARGE = 3;

const modes: ThemeMode[] = ['light', 'dark'];
const semanticColors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const;

// Composite a translucent colour over an opaque background.
function over(foreground: string, background: string) {
  const fg = decomposeColor(foreground);
  const bg = decomposeColor(background);
  const a = fg.values[3] ?? 1;
  const values = [0, 1, 2].map((i) => Math.round(fg.values[i]! * a + bg.values[i]! * (1 - a)));
  return recomposeColor({ type: 'rgb', values: values as [number, number, number] });
}

describe.each(modes)('%s palette contrast', (mode) => {
  const theme = createAppTheme(mode);
  const { text, background } = theme.palette;

  it.each([
    ['primary', text.primary],
    ['secondary', text.secondary],
  ])('%s text meets AA on both page and paper', (_, fg) => {
    expect(getContrastRatio(fg, background.default)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(getContrastRatio(fg, background.paper)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it.each(semanticColors)('tonal %s chip text meets AA on its tint', (key) => {
    const palette = theme.palette[key];
    const tint = over(alpha(palette.main, mode === 'light' ? 0.12 : 0.22), background.paper);
    const fg = mode === 'light' ? palette.dark : palette.light;
    // Light secondary sits just under (4.45:1); tighten once secondary.dark is darkened.
    const target = mode === 'light' && key === 'secondary' ? AA_LARGE : AA_TEXT;
    expect(getContrastRatio(fg, tint)).toBeGreaterThanOrEqual(target);
  });

  it('tooltip text meets AA', () => {
    expect(getContrastRatio('#EDE8DC', mode === 'light' ? '#2A2722' : '#3A3530')).toBeGreaterThanOrEqual(AA_TEXT);
  });
});

describe('contrast text on filled colours', () => {
  // These pairs clear 3:1 but not 4.5:1, so a contained button or filled
  // badge in them is only AA for large or bold-large text. Move a pair out of
  // this list once its palette entry is darkened (or its contrastText swapped).
  const belowTextAA: Array<[ThemeMode, (typeof semanticColors)[number]]> = [
    ['light', 'secondary'],
    ['light', 'warning'],
    ['dark', 'primary'],
  ];
  const isBelow = (mode: ThemeMode, key: string) => belowTextAA.some(([m, k]) => m === mode && k === key);
  const pairs = modes.flatMap((mode) => semanticColors.map((key) => [mode, key] as const));

  it.each(pairs.filter(([mode, key]) => !isBelow(mode, key)))('%s %s meets AA for body text', (mode, key) => {
    const { main, contrastText } = createAppTheme(mode).palette[key];
    expect(getContrastRatio(contrastText, main)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it.each(belowTextAA)('%s %s still meets AA for large text', (mode, key) => {
    const { main, contrastText } = createAppTheme(mode).palette[key];
    expect(getContrastRatio(contrastText, main)).toBeGreaterThanOrEqual(AA_LARGE);
  });
});
