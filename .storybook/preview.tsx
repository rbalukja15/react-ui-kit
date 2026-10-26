import * as React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme } from '../src/theme/theme';

// Wrap every story in the library theme so Storybook doubles as living
// docs. The "Mode" toolbar toggle below flips between light and dark.
const preview: Preview = {
  // Every component gets a generated Docs page with its prop table.
  tags: ['autodocs'],
  globalTypes: {
    mode: {
      name: 'Mode',
      description: 'Light / dark',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light' },
          { value: 'dark', icon: 'circle', title: 'Dark' },
        ],
        showName: true,
      },
    },
  },
  decorators: [
    (Story, ctx) => {
      const mode = (ctx.globals.mode as 'light' | 'dark') ?? 'light';
      return (
        <ThemeProvider theme={createAppTheme(mode)}>
          <CssBaseline />
          <Story />
        </ThemeProvider>
      );
    },
  ],
  parameters: {
    controls: { expanded: true },
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: ['Introduction', 'Getting started', 'Theme', 'Layout', 'Navigation', 'Inputs', 'Data display', 'Feedback', 'Hooks'],
      },
    },
  },
};

export default preview;
