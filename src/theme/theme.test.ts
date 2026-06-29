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
