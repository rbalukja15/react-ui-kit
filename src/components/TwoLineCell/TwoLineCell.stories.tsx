import type { Meta, StoryObj } from '@storybook/react';
import { TwoLineCell } from './TwoLineCell';

const meta: Meta<typeof TwoLineCell> = { title: 'Data display/TwoLineCell', component: TwoLineCell };
export default meta;
export const NameAndCategory: StoryObj<typeof TwoLineCell> = {
  args: { primary: 'Rabies vaccine', secondary: 'Vaccine', icon: <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /></svg> },
};
export const Figure: StoryObj<typeof TwoLineCell> = { args: { primary: '57 bottles', secondary: 'Sep: 61 bottles', align: 'right', strong: true } };
