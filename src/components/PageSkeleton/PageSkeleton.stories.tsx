import type { Meta, StoryObj } from '@storybook/react';
import { PageSkeleton } from './PageSkeleton';

const meta: Meta<typeof PageSkeleton> = { title: 'Feedback/PageSkeleton', component: PageSkeleton };
export default meta;

export const List: StoryObj<typeof PageSkeleton> = { args: { variant: 'list' } };
export const Profile: StoryObj<typeof PageSkeleton> = { args: { variant: 'profile' } };
export const Document: StoryObj<typeof PageSkeleton> = { args: { variant: 'document' } };
