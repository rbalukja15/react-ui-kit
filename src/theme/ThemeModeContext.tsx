'use client';

import * as React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme, type ThemeMode, type ThemeOverrides } from './theme';

interface ThemeModeContextValue {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = React.createContext<ThemeModeContextValue | null>(null);

export function useThemeMode(): ThemeModeContextValue {
  const ctx = React.useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within <ThemeModeProvider>');
  return ctx;
}

/** Provides the MUI theme + a light/dark toggle. Optionally controlled.
 *  `overrides` is forwarded to `createAppTheme`; define it outside the
 *  component (or memoize it) so the theme isn't rebuilt every render. */
export function ThemeModeProvider({
  children,
  defaultMode = 'light',
  overrides,
}: {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  overrides?: ThemeOverrides;
}) {
  const [mode, setMode] = React.useState<ThemeMode>(defaultMode);
  const value = React.useMemo<ThemeModeContextValue>(
    () => ({ mode, setMode, toggle: () => setMode((m) => (m === 'light' ? 'dark' : 'light')) }),
    [mode],
  );
  const theme = React.useMemo(() => createAppTheme(mode, overrides), [mode, overrides]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
