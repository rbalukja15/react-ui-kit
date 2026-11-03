import type { Meta, StoryObj } from '@storybook/react';
import { DashboardScreen } from './DashboardScreen';
import { StatisticsScreen } from './StatisticsScreen';

/**
 * Whole VetApp pages built only from kit components, as a check that the
 * kit covers a real screen without hand-styled MUI.
 */
const meta: Meta = {
  title: 'Screens/VetApp',
  parameters: { layout: 'fullscreen' },
  tags: ['!autodocs'],
};
export default meta;

export const Statistics: StoryObj = { render: () => <StatisticsScreen /> };
export const Dashboard: StoryObj = { render: () => <DashboardScreen /> };
