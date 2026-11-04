import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { axe } from 'vitest-axe';
import { createAppTheme } from '../theme/theme';
import { DashboardScreen } from './DashboardScreen';
import { StatisticsScreen } from './StatisticsScreen';

// The example screens double as an integration check: whole pages built
// from the kit should pass axe as composed.
describe.each([
  ['Statistics', StatisticsScreen, 'Product sales'],
  ['Dashboard', DashboardScreen, 'Dashboard'],
] as const)('%s screen', (_, Screen, title) => {
  it('renders and has no axe violations', async () => {
    const { container } = render(
      <ThemeProvider theme={createAppTheme('light')}>
        <Screen />
      </ThemeProvider>,
    );
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  }, 20000);
});
