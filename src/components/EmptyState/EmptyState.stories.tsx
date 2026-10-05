import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = { title: 'Feedback/EmptyState', component: EmptyState };
export default meta;

export const Default: StoryObj<typeof EmptyState> = {
  args: {
    title: 'No projects yet',
    description: 'Create your first project to get started.',
    actionLabel: 'New project',
    onAction: () => alert('clicked'),
  },
};
