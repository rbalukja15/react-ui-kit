import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = { title: 'Feedback/EmptyState', component: EmptyState };
export default meta;

export const Default: StoryObj<typeof EmptyState> = {
  args: {
    title: 'No patients yet',
    description: 'Add your first patient to get started.',
    actionLabel: 'Add patient',
    onAction: () => alert('clicked'),
  },
};
