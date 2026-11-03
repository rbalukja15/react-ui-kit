import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@mui/material';
import { PageHeader } from './PageHeader';

const meta: Meta<typeof PageHeader> = { title: 'Layout/PageHeader', component: PageHeader };
export default meta;
export const Default: StoryObj<typeof PageHeader> = {
  args: {
    title: 'Dashboard',
    subtitle: 'Tuesday, 3 November 2026',
    actions: (
      <>
        <Button variant="contained" size="large">New invoice</Button>
        <Button variant="outlined" size="large">New client</Button>
      </>
    ),
  },
};
