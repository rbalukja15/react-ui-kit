'use client';

import * as React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme, type ThemeMode, type ThemeOverrides } from './theme';

/** What the user picked. `'system'` follows `prefers-color-scheme`. */
export type ThemeModePreference = ThemeMode | 'system';

export interface ThemeModeContextValue {
  /** The mode the theme is rendered in, with `'system'` already resolved. */
  mode: ThemeMode;
  /** The stored choice, which may be `'system'`. */
  preference: ThemeModePreference;
  /** What the OS currently asks for. `'light'` during SSR. */
  systemMode: ThemeMode;
  setMode: (mode: ThemeModePreference) => void;
  /** Switches to the opposite of the rendered mode (leaves `'system'`). */
  toggle: () => void;
}

export interface ThemeModeProviderProps {
  children: React.ReactNode;
  /** Controlled preference. When set, the provider never changes it on its own. */
  mode?: ThemeModePreference;
  /** Initial preference when uncontrolled and nothing is stored. */
  defaultMode?: ThemeModePreference;
  /** Called with the new preference from `setMode` / `toggle`, controlled or not. */
  onModeChange?: (mode: ThemeModePreference) => void;
  /** Opt-in: remember the uncontrolled preference in `localStorage` under this key. */
  storageKey?: string;
  /** Forwarded to `createAppTheme`; define it outside the component (or memoize
   *  it) so the theme isn't rebuilt every render. */
  overrides?: ThemeOverrides;
}

const ThemeModeContext = React.createContext<ThemeModeContextValue | null>(null);

export function useThemeMode(): ThemeModeContextValue {
  const ctx = React.useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within <ThemeModeProvider>');
  return ctx;
}

// --- prefers-color-scheme -------------------------------------------------

const DARK_QUERY = '(prefers-color-scheme: dark)';

function darkQuery(): MediaQueryList | null {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(DARK_QUERY)
    : null;
}

function subscribeSystem(onChange: () => void) {
  const mql = darkQuery();
  if (!mql) return () => {};
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

const getSystemMode = (): ThemeMode => (darkQuery()?.matches ? 'dark' : 'light');
const getServerSystemMode = (): ThemeMode => 'light';

// --- localStorage ---------------------------------------------------------

// `storage` events only reach other tabs, so writes from this tab notify here.
const storageListeners = new Set<() => void>();

function subscribeStorage(onChange: () => void) {
  storageListeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    storageListeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

const subscribeNothing = () => () => {};

function isPreference(value: unknown): value is ThemeModePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

// Values that failed to persist (quota, blocked storage) so the choice still
// sticks for this page instead of snapping back to an older stored value.
const unsaved = new Map<string, ThemeModePreference>();

// Storage can throw (Safari private mode, blocked cookies); treat that as empty.
function readStored(key: string): ThemeModePreference | null {
  const pending = unsaved.get(key);
  if (pending) return pending;
  try {
    const value = window.localStorage.getItem(key);
    return isPreference(value) ? value : null;
  } catch {
    return null;
  }
}

function writeStored(key: string, value: ThemeModePreference) {
  try {
    window.localStorage.setItem(key, value);
    unsaved.delete(key);
  } catch {
    unsaved.set(key, value);
  }
  storageListeners.forEach((listener) => listener());
}

// --------------------------------------------------------------------------

/** Provides the MUI theme + a light/dark/system mode.
 *
 *  Uncontrolled by default (`defaultMode`); pass `mode` + `onModeChange` to
 *  own the state yourself. `'system'` follows `prefers-color-scheme` live.
 *  `storageKey` remembers an uncontrolled choice across visits. Stored and
 *  system values are read after hydration, so server HTML always renders
 *  the `defaultMode` (or `'light'` for `'system'`). */
export function ThemeModeProvider({
  children,
  mode: controlledMode,
  defaultMode = 'light',
  onModeChange,
  storageKey,
  overrides,
}: ThemeModeProviderProps) {
  const isControlled = controlledMode !== undefined;
  const [uncontrolledMode, setUncontrolledMode] = React.useState<ThemeModePreference>(defaultMode);

  const stored = React.useSyncExternalStore(
    storageKey ? subscribeStorage : subscribeNothing,
    () => (storageKey ? readStored(storageKey) : null),
    () => null,
  );
  const systemMode = React.useSyncExternalStore(subscribeSystem, getSystemMode, getServerSystemMode);

  const preference: ThemeModePreference = isControlled
    ? controlledMode
    : (storageKey ? stored : null) ?? uncontrolledMode;
  const mode: ThemeMode = preference === 'system' ? systemMode : preference;

  // Kept in a ref so an inline `onModeChange` doesn't rebuild the context value.
  const onModeChangeRef = React.useRef(onModeChange);
  React.useEffect(() => {
    onModeChangeRef.current = onModeChange;
  });

  const setMode = React.useCallback(
    (next: ThemeModePreference) => {
      if (!isControlled) {
        setUncontrolledMode(next);
        if (storageKey) writeStored(storageKey, next);
      }
      onModeChangeRef.current?.(next);
    },
    [isControlled, storageKey],
  );

  const value = React.useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      preference,
      systemMode,
      setMode,
      toggle: () => setMode(mode === 'light' ? 'dark' : 'light'),
    }),
    [mode, preference, systemMode, setMode],
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
