import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { useTheme } from '@mui/material';
import { ThemeModeProvider, useThemeMode, type ThemeModePreference } from './ThemeModeContext';

function Probe() {
  const { mode, preference, setMode, toggle } = useThemeMode();
  const theme = useTheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="preference">{preference}</span>
      <span data-testid="palette">{theme.palette.mode}</span>
      <button onClick={toggle}>toggle</button>
      <button onClick={() => setMode('system')}>system</button>
    </div>
  );
}

const text = (id: string) => screen.getByTestId(id).textContent;

// jsdom has no matchMedia; install a controllable one.
function mockSystemDark(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() { return matches; },
    media: query,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  }));
  return (next: boolean) => {
    matches = next;
    act(() => listeners.forEach((cb) => cb()));
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe('<ThemeModeProvider>', () => {
  it('toggles between light and dark when uncontrolled', () => {
    render(<ThemeModeProvider><Probe /></ThemeModeProvider>);
    expect(text('mode')).toBe('light');
    fireEvent.click(screen.getByText('toggle'));
    expect(text('mode')).toBe('dark');
    expect(text('palette')).toBe('dark');
  });

  it('follows the controlled mode prop and reports changes instead of applying them', () => {
    const onModeChange = vi.fn();
    const { rerender } = render(
      <ThemeModeProvider mode="dark" onModeChange={onModeChange}><Probe /></ThemeModeProvider>,
    );
    expect(text('mode')).toBe('dark');

    fireEvent.click(screen.getByText('toggle'));
    expect(onModeChange).toHaveBeenCalledWith('light');
    expect(text('mode')).toBe('dark');

    rerender(<ThemeModeProvider mode="light" onModeChange={onModeChange}><Probe /></ThemeModeProvider>);
    expect(text('mode')).toBe('light');
  });

  it('calls onModeChange when uncontrolled too', () => {
    const onModeChange = vi.fn();
    render(<ThemeModeProvider onModeChange={onModeChange}><Probe /></ThemeModeProvider>);
    fireEvent.click(screen.getByText('system'));
    expect(onModeChange).toHaveBeenCalledWith('system');
    expect(text('preference')).toBe('system');
  });

  it("resolves 'system' from prefers-color-scheme and tracks changes", () => {
    const setSystemDark = mockSystemDark(true);
    render(<ThemeModeProvider defaultMode="system"><Probe /></ThemeModeProvider>);
    expect(text('preference')).toBe('system');
    expect(text('mode')).toBe('dark');

    setSystemDark(false);
    expect(text('mode')).toBe('light');
    expect(text('palette')).toBe('light');
  });

  it("toggle leaves 'system' for the opposite of what is shown", () => {
    mockSystemDark(true);
    render(<ThemeModeProvider defaultMode="system"><Probe /></ThemeModeProvider>);
    fireEvent.click(screen.getByText('toggle'));
    expect(text('preference')).toBe('light');
  });

  it('falls back to light for system when matchMedia is unavailable', () => {
    render(<ThemeModeProvider defaultMode="system"><Probe /></ThemeModeProvider>);
    expect(text('mode')).toBe('light');
  });

  it('does not touch localStorage without a storageKey', () => {
    render(<ThemeModeProvider><Probe /></ThemeModeProvider>);
    fireEvent.click(screen.getByText('toggle'));
    expect(window.localStorage.length).toBe(0);
  });

  it('persists and restores the preference with a storageKey', () => {
    const { unmount } = render(<ThemeModeProvider storageKey="ui-mode"><Probe /></ThemeModeProvider>);
    fireEvent.click(screen.getByText('toggle'));
    expect(window.localStorage.getItem('ui-mode')).toBe('dark');
    unmount();

    render(<ThemeModeProvider storageKey="ui-mode"><Probe /></ThemeModeProvider>);
    expect(text('mode')).toBe('dark');
  });

  it('ignores a corrupt stored value', () => {
    window.localStorage.setItem('ui-mode', 'purple');
    render(<ThemeModeProvider storageKey="ui-mode" defaultMode="dark"><Probe /></ThemeModeProvider>);
    expect(text('mode')).toBe('dark');
  });

  it('picks up a change made in another tab', () => {
    render(<ThemeModeProvider storageKey="ui-mode"><Probe /></ThemeModeProvider>);
    act(() => {
      window.localStorage.setItem('ui-mode', 'dark');
      window.dispatchEvent(new StorageEvent('storage', { key: 'ui-mode' }));
    });
    expect(text('mode')).toBe('dark');
  });

  it('keeps working when localStorage throws', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    try {
      render(<ThemeModeProvider storageKey="ui-throws"><Probe /></ThemeModeProvider>);
      fireEvent.click(screen.getByText('toggle'));
      expect(text('mode')).toBe('dark');
    } finally {
      setItem.mockRestore();
    }
  });

  it('ignores storage while controlled', () => {
    window.localStorage.setItem('ui-mode', 'dark');
    const pref: ThemeModePreference = 'light';
    render(<ThemeModeProvider mode={pref} storageKey="ui-mode"><Probe /></ThemeModeProvider>);
    expect(text('mode')).toBe('light');
  });

  it('renders defaultMode on the server, then hydrates without a mismatch and applies the stored choice', async () => {
    // MUI's ThemeProvider uses useLayoutEffect, which React warns about under renderToString.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    window.localStorage.setItem('ui-mode', 'dark');
    mockSystemDark(true);
    const app = (
      <ThemeModeProvider storageKey="ui-mode" defaultMode="system"><Probe /></ThemeModeProvider>
    );
    try {
      const container = document.createElement('div');
      container.innerHTML = renderToString(app);
      document.body.appendChild(container);
      expect(text('mode')).toBe('light');
      consoleError.mockClear();

      const onRecoverableError = vi.fn();
      await act(async () => { hydrateRoot(container, app, { onRecoverableError }); });
      expect(onRecoverableError).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
      expect(text('mode')).toBe('dark');
      container.remove();
    } finally {
      consoleError.mockRestore();
    }
  });
});
