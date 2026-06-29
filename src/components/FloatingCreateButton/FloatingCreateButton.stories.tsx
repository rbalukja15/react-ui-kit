import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Add as AddIcon } from '@mui/icons-material';
import { FloatingCreateButton } from './FloatingCreateButton';

const meta: Meta<typeof FloatingCreateButton> = {
  title: 'Inputs/FloatingCreateButton',
  component: FloatingCreateButton,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const Default: StoryObj<typeof FloatingCreateButton> = {
  args: {
    label: 'Add new',
    icon: <AddIcon />,
    onClick: () => alert('clicked'),
  },
};

/** Hides at the `lg` breakpoint and above (useful when the toolbar
 *  affordance only appears on wide screens). */
export const HideAtLg: StoryObj<typeof FloatingCreateButton> = {
  args: {
    label: 'Add new',
    icon: <AddIcon />,
    onClick: () => alert('clicked'),
    hideAtBreakpoint: 'lg',
  },
};
