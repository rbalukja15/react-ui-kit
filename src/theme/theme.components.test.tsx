import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, alpha, type Theme } from '@mui/material/styles';
import {
  Button, Card, Chip, Dialog, DialogTitle, Divider, Drawer, Tab, Table, TableBody, TableCell,
  TableHead, TableRow, Tabs, Tooltip, Typography,
} from '@mui/material';
import { createAppTheme, type ThemeMode, type ThemeOverrides } from './theme';

// These render real MUI components under the theme and read the computed
// style, so they check what users see rather than the shape of the options
// object (which differs across MUI majors). jsdom resolves the cascade by
// source order and ignores selector specificity, so overrides that target a
// descendant (``& .MuiTableCell-head``) are checked on the style object.

const modes: ThemeMode[] = ['light', 'dark'];

function renderWith(ui: React.ReactElement, mode: ThemeMode = 'light', overrides?: ThemeOverrides) {
  const theme = createAppTheme(mode, overrides);
  return { theme, ...render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>) };
}

const style = (el: Element) => getComputedStyle(el);

// jsdom serialises colours as rgb()/rgba(); run the expected value through
// the same parser so hex and rgba literals compare equal.
function color(value: string) {
  const el = document.createElement('div');
  el.style.color = value;
  return el.style.color;
}

const semanticColors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const;

describe('MuiButton', () => {
  it('keeps sentence case with the rounded, semibold look', () => {
    renderWith(<Button>Save changes</Button>);
    const button = style(screen.getByRole('button', { name: 'Save changes' }));
    expect(button.textTransform).toBe('none');
    expect(button.fontWeight).toBe('600');
    expect(button.borderRadius).toBe('9px');
  });
});

describe('MuiChip tonal variant', () => {
  describe.each(modes)('%s mode', (mode) => {
    it.each(semanticColors)('renders a filled %s chip as a pale tint with strong text', (key) => {
      const { theme } = renderWith(<Chip label="status" color={key} />, mode);
      const chip = style(screen.getByText('status').parentElement!);
      const palette = theme.palette[key];
      expect(chip.backgroundColor).toBe(color(alpha(palette.main, mode === 'light' ? 0.12 : 0.22)));
      expect(chip.color).toBe(color(mode === 'light' ? palette.dark : palette.light));
      expect(chip.borderRadius).toBe('6px');
    });
  });

  it('leaves outlined chips to MUI', () => {
    const { theme } = renderWith(<Chip label="status" color="error" variant="outlined" />);
    const chip = style(screen.getByText('status').parentElement!);
    expect(chip.backgroundColor).not.toBe(color(alpha(theme.palette.error.main, 0.12)));
    expect(chip.borderStyle).toBe('solid');
  });

  it('leaves default-coloured filled chips untinted', () => {
    const { theme } = renderWith(<Chip label="status" />);
    const chip = style(screen.getByText('status').parentElement!);
    expect(chip.backgroundColor).not.toBe(color(alpha(theme.palette.primary.main, 0.12)));
    expect(chip.borderRadius).toBe('6px');
  });

  it('derives the tint from a brand override', () => {
    renderWith(<Chip label="status" color="primary" />, 'light', { palette: { primary: { main: '#7c3aed' } } });
    expect(style(screen.getByText('status').parentElement!).backgroundColor).toBe(color(alpha('#7c3aed', 0.12)));
  });
});

describe('surfaces', () => {
  it('gives light cards a soft shadow and dark cards a hairline border instead', () => {
    renderWith(<Card data-testid="card" />, 'light');
    expect(style(screen.getByTestId('card')).boxShadow).toBe('0 1px 2px rgba(40,38,31,0.05)');
    expect(style(screen.getByTestId('card')).borderRadius).toBe('12px');

    renderWith(<Card data-testid="dark-card" />, 'dark');
    expect(style(screen.getByTestId('dark-card')).boxShadow).toBe('none');
    expect(style(screen.getByTestId('dark-card')).border).toBe('1px solid rgba(237, 232, 220, 0.1)');
  });

  it.each(modes)('uses warm hairline dividers in %s mode', (mode) => {
    renderWith(<Divider data-testid="divider" />, mode);
    expect(style(screen.getByTestId('divider')).borderColor).toBe(
      color(mode === 'light' ? 'rgba(40,38,31,0.10)' : 'rgba(237,232,220,0.10)'),
    );
  });

  it.each(modes)('paints the drawer with the %s paper and no elevation overlay', (mode) => {
    const { theme } = renderWith(<Drawer open><span>nav</span></Drawer>, mode);
    const paper = style(document.querySelector('.MuiDrawer-paper')!);
    expect(paper.backgroundColor).toBe(color(theme.palette.background.paper));
    expect(paper.backgroundImage).toBe('none');
    expect(paper.color).toBe(color(theme.palette.text.primary));
  });

  it('rounds dialogs and sets their title in the display serif', () => {
    renderWith(<Dialog open><DialogTitle>Delete record</DialogTitle></Dialog>);
    expect(style(document.querySelector('.MuiDialog-paper')!).borderRadius).toBe('16px');
    const title = style(screen.getByText('Delete record'));
    expect(title.fontFamily).toContain('Newsreader');
    expect(title.fontWeight).toBe('600');
  });

  it.each(modes)('uses the warm tooltip in %s mode', (mode) => {
    renderWith(<Tooltip title="Copy" open><span>target</span></Tooltip>, mode);
    const tooltip = style(document.querySelector('.MuiTooltip-tooltip')!);
    expect(tooltip.backgroundColor).toBe(color(mode === 'light' ? '#2A2722' : '#3A3530'));
    expect(tooltip.color).toBe(color('#EDE8DC'));
  });
});

describe('tables', () => {
  const table = (
    <Table>
      <TableHead><TableRow><TableCell>Name</TableCell></TableRow></TableHead>
      <TableBody><TableRow><TableCell>Ada</TableCell></TableRow></TableBody>
    </Table>
  );

  it.each(modes)('tints and bolds the header row in %s mode', (mode) => {
    const { theme } = renderWith(table, mode);
    expect(style(screen.getByText('Name')).backgroundColor).toBe(color(mode === 'light' ? '#F2F0E8' : '#2E2A26'));
    const root = theme.components?.MuiTableHead?.styleOverrides?.root as Record<string, { fontWeight: number }>;
    expect(root['& .MuiTableCell-head']?.fontWeight).toBe(700);
  });

  it('lines numbers up in table cells', () => {
    const root = createAppTheme('light').components?.MuiTableCell?.styleOverrides?.root as { fontVariantNumeric: string };
    expect(root.fontVariantNumeric).toBe('tabular-nums');
  });

  it('tints row hover with the brand colour, including an overridden one', () => {
    type RootFn = (props: { theme: Theme }) => Record<string, { backgroundColor: string }>;
    const hover = (theme: Theme) =>
      (theme.components?.MuiTableRow?.styleOverrides?.root as unknown as RootFn)({ theme })['&.MuiTableRow-hover:hover']!;
    expect(hover(createAppTheme('light')).backgroundColor).toBe(alpha('#0f766e', 0.06));
    const branded = createAppTheme('light', { palette: { primary: { main: '#7c3aed' } } });
    expect(hover(branded).backgroundColor).toBe(alpha('#7c3aed', 0.06));
  });
});

describe('navigation and inputs', () => {
  it('colours the selected tab and indicator with the brand', () => {
    renderWith(
      <Tabs value={0}><Tab label="Overview" /><Tab label="History" /></Tabs>,
      'light',
      { palette: { primary: { main: '#7c3aed' } } },
    );
    const selected = style(screen.getByRole('tab', { name: 'Overview' }));
    expect(selected.color).toBe(color('#7c3aed'));
    expect(selected.textTransform).toBe('none');
    expect(style(document.querySelector('.MuiTabs-indicator')!).backgroundColor).toBe(color('#7c3aed'));
  });

  it.each(modes)('softens the resting outline of text fields in %s mode', (mode) => {
    type RootFn = (props: { theme: Theme }) => Record<string, { borderColor?: string; borderWidth?: number }>;
    const theme = createAppTheme(mode);
    const root = (theme.components?.MuiOutlinedInput?.styleOverrides?.root as unknown as RootFn)({ theme });
    expect(root['& .MuiOutlinedInput-notchedOutline']?.borderColor).toBe(alpha(theme.palette.text.primary, 0.18));
    expect(root['&:hover .MuiOutlinedInput-notchedOutline']?.borderColor).toBe(alpha(theme.palette.text.primary, 0.32));
    expect(root['&.Mui-focused .MuiOutlinedInput-notchedOutline']?.borderWidth).toBe(1.5);
  });

  it('hides the number spinners on outlined inputs', () => {
    // jsdom drops vendor-prefixed properties, so read the style object.
    const input = createAppTheme('light').components?.MuiOutlinedInput?.styleOverrides?.input as Record<string, Record<string, unknown>>;
    expect(input['&[type=number]']).toEqual({ MozAppearance: 'textfield' });
    expect(input['&[type=number]::-webkit-outer-spin-button, &[type=number]::-webkit-inner-spin-button'])
      .toMatchObject({ WebkitAppearance: 'none' });
  });
});

describe('typography', () => {
  it('sets headings in the display serif and body copy in Inter', () => {
    renderWith(<><Typography variant="h1">Heading</Typography><Typography>Body</Typography></>);
    expect(style(screen.getByText('Heading')).fontFamily).toContain('Newsreader');
    expect(style(screen.getByText('Body')).fontFamily).toContain('Inter');
  });

  it('lets a brand swap the body font without losing the display headings', () => {
    renderWith(
      <><Typography variant="h1">Heading</Typography><Typography>Body</Typography></>,
      'light',
      { typography: { fontFamily: 'Poppins, sans-serif' } },
    );
    expect(style(screen.getByText('Body')).fontFamily).toContain('Poppins');
    expect(style(screen.getByText('Heading')).fontFamily).toContain('Newsreader');
  });
});

describe('consumer component overrides', () => {
  it('win over the library style while keeping the rest of it', () => {
    renderWith(<Button>Save</Button>, 'light', {
      components: { MuiButton: { styleOverrides: { root: { borderRadius: 2 } } } },
    });
    const button = style(screen.getByRole('button', { name: 'Save' }));
    expect(button.borderRadius).toBe('2px');
    expect(button.textTransform).toBe('none');
    expect(button.fontWeight).toBe('600');
  });

  it('can replace a style function with a plain object', () => {
    renderWith(<Drawer open><span>nav</span></Drawer>, 'dark', {
      components: { MuiDrawer: { styleOverrides: { paper: { backgroundColor: '#000000' } } } },
    });
    expect(style(document.querySelector('.MuiDrawer-paper')!).backgroundColor).toBe(color('#000000'));
  });

  it('can add overrides for components the library does not style', () => {
    renderWith(<Typography variant="overline">Label</Typography>, 'light', {
      components: { MuiTypography: { styleOverrides: { overline: { letterSpacing: '0.2em' } } } },
    });
    expect(style(screen.getByText('Label')).letterSpacing).toBe('0.2em');
  });
});
