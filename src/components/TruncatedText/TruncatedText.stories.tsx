import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import { TruncatedText } from './TruncatedText';

const meta: Meta<typeof TruncatedText> = {
  title: 'Data display/TruncatedText',
  component: TruncatedText,
  decorators: [(Story) => <Box sx={{ maxWidth: 220, border: 1, borderColor: 'divider', p: 1 }}><Story /></Box>],
};
export default meta;

export const Overflowing: StoryObj<typeof TruncatedText> = {
  args: { text: 'Quarterly marketing report for the northern region' },
};
export const Fits: StoryObj<typeof TruncatedText> = { args: { text: 'Short name' } };
