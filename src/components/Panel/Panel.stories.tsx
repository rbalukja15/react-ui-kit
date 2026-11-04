import type { Meta, StoryObj } from '@storybook/react';
import { Link } from '@mui/material';
import { Panel } from './Panel';
import { ListRow } from '../ListRow';
import { Pill } from '../Pill';

const Icon = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M12 4l9 16H3l9-16z" />
    <path d="M12 10v4M12 17h.01" />
  </svg>
);

const meta: Meta<typeof Panel> = { title: 'Layout/Panel', component: Panel };
export default meta;

export const WithHeader: StoryObj<typeof Panel> = {
  args: {
    title: 'Running low',
    icon: <Icon />,
    action: <Link href="#">Restock</Link>,
    children: (
      <div>
        <ListRow primary="Flea collar, cat" secondary="Sold 26 pieces last 30 days" trailing="2 pieces" trailingTone="warning" />
        <ListRow primary="Ear cleaner 125 ml" secondary="Sold 14 bottles last 30 days" trailing="3 bottles" trailingTone="warning" />
      </div>
    ),
  },
};

export const WithCountPill: StoryObj<typeof Panel> = {
  args: { title: 'Vaccinations due', action: <Pill tone="warning">4 overdue</Pill>, children: 'Panel content' },
};

export const NoHeader: StoryObj<typeof Panel> = { args: { 'aria-label': 'Totals', children: 'A panel without a header' } };
