import type { Meta, StoryObj } from '@storybook/react';
import { DropdownButton } from './DropdownButton';

const meta: Meta<typeof DropdownButton> = { title: 'Inputs/DropdownButton', component: DropdownButton, args: { children: '1 – 31 Oct 2026', size: 'large' } };
export default meta;
export const Default: StoryObj<typeof DropdownButton> = {};
export const Small: StoryObj<typeof DropdownButton> = { args: { children: 'Last 12 months', size: 'small' } };
