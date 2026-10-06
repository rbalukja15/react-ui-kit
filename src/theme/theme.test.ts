import { createAppTheme } from './theme';

describe('createAppTheme', () => {
  it('builds a light theme with the warm cream background', () => {
    const t = createAppTheme('light');
    expect(t.palette.mode).toBe('light');
    expect(t.palette.background.default).toBe('#EFEEE7');
    expect(t.palette.background.paper).toBe('#FBFAF6');
  });

  it('builds a dark theme with the warm espresso background', () => {
    const t = createAppTheme('dark');
    expect(t.palette.mode).toBe('dark');
    expect(t.palette.background.default).toBe('#1C1A17');
    expect(t.palette.background.paper).toBe('#262320');
  });

  it('uses a muted teal primary in dark mode (not the saturated light-mode teal)', () => {
    const light = createAppTheme('light');
    const dark = createAppTheme('dark');
    expect(light.palette.primary.main).toBe('#0f766e');
    expect(dark.palette.primary.main).toBe('#2E9488');
  });

  it('defaults to light when no mode is passed', () => {
    expect(createAppTheme().palette.mode).toBe('light');
  });
});

describe('createAppTheme overrides', () => {
  it('replaces a palette colour so MUI derives its shades from the new main', () => {
    const t = createAppTheme('light', { palette: { primary: { main: '#7c3aed' } } });
    expect(t.palette.primary.main).toBe('#7c3aed');
    expect(t.palette.primary.dark).not.toBe('#115e59');
    expect(t.palette.secondary.main).toBe('#0a7c97');
  });

  it('deep-merges background and keeps the untouched keys', () => {
    const t = createAppTheme('light', { palette: { background: { default: '#ffffff' } } });
    expect(t.palette.background.default).toBe('#ffffff');
    expect(t.palette.background.paper).toBe('#FBFAF6');
  });

  it('accepts a function of the mode', () => {
    const overrides = (mode: 'light' | 'dark') => ({
      palette: { primary: { main: mode === 'light' ? '#1d4ed8' : '#93c5fd' } },
    });
    expect(createAppTheme('light', overrides).palette.primary.main).toBe('#1d4ed8');
    expect(createAppTheme('dark', overrides).palette.primary.main).toBe('#93c5fd');
  });

  it('merges typography and component overrides over the defaults', () => {
    const t = createAppTheme('light', {
      typography: { h1: { fontFamily: 'Poppins' } },
      components: { MuiButton: { styleOverrides: { root: { borderRadius: 2 } } } },
    });
    expect(t.typography.h1.fontFamily).toBe('Poppins');
    expect(t.typography.h1.fontWeight).toBe(600);
    expect(t.components?.MuiButton?.styleOverrides?.root).toMatchObject({ borderRadius: 2, fontWeight: 600 });
  });
});

describe('MuiDrawer paper', () => {
  type PaperFn = (props: { theme: ReturnType<typeof createAppTheme> }) => { backgroundColor: string; color: string };
  const paper = (t: ReturnType<typeof createAppTheme>) =>
    (t.components?.MuiDrawer?.styleOverrides?.paper as unknown as PaperFn)({ theme: t });

  it('follows the mode instead of staying dark', () => {
    expect(paper(createAppTheme('light')).backgroundColor).toBe('#FBFAF6');
    expect(paper(createAppTheme('dark')).backgroundColor).toBe('#262320');
  });

  it('picks up a background override', () => {
    const t = createAppTheme('light', { palette: { background: { paper: '#ffffff' } } });
    expect(paper(t).backgroundColor).toBe('#ffffff');
  });
});
