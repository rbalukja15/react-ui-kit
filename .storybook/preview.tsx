import * as React from 'react';
import type { Preview } from '@storybook/react';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
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
          {/* Paint the theme's page colour behind the story, so dark mode
              reads correctly on Docs pages, whose canvas is always white. */}
          <Box
            sx={{
              bgcolor: 'background.default',
              color: 'text.primary',
              ...(ctx.parameters.layout === 'fullscreen' ? {} : { p: 3, borderRadius: 1 }),
            }}
          >
            <Story />
          </Box>
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
    // Chromatic snapshots every story once per mode, so a theme change in
    // either palette shows up as a visual diff on the pull request.
    chromatic: {
      modes: {
        light: { mode: 'light' },
        dark: { mode: 'dark' },
      },
    },
  },
};

export default preview;
