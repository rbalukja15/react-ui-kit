'use client';

import * as React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme, type ThemeMode } from './theme';

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

/** Provides the MUI theme + a light/dark toggle. Optionally controlled. */
export function ThemeModeProvider({
  children,
  defaultMode = 'light',
}: {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}) {
  const [mode, setMode] = React.useState<ThemeMode>(defaultMode);
  const value = React.useMemo<ThemeModeContextValue>(
    () => ({ mode, setMode, toggle: () => setMode((m) => (m === 'light' ? 'dark' : 'light')) }),
    [mode],
  );
  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
