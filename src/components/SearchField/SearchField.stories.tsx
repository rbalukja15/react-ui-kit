import type { Meta, StoryObj } from '@storybook/react';
import { SearchField } from './SearchField';

const meta: Meta<typeof SearchField> = { title: 'Inputs/SearchField', component: SearchField, args: { label: 'Search products', placeholder: 'Name or barcode' } };
export default meta;
export const Default: StoryObj<typeof SearchField> = {};
