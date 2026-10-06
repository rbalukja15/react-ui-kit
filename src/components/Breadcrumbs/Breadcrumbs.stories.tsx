import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = { title: 'Navigation/Breadcrumbs', component: Breadcrumbs };
export default meta;

export const Default: StoryObj<typeof Breadcrumbs> = {
  args: {
    items: [
      { label: 'Projects', href: '#projects' },
      { label: 'Website redesign', href: '#project' },
      { label: 'Settings' },
    ],
  },
};

export const SlashSeparator: StoryObj<typeof Breadcrumbs> = {
  args: { ...Default.args, separator: '/' },
};
