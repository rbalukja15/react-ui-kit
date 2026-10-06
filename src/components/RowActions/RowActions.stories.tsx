import type { Meta, StoryObj } from '@storybook/react';
import { IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';
import { RowActions } from './RowActions';

const Icon = ({ d }: { d: string }) => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d={d} /></svg>
);
const EDIT = 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z';
const DELETE = 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z';

const meta: Meta<typeof RowActions> = { title: 'Data display/RowActions', component: RowActions };
export default meta;

export const InATable: StoryObj<typeof RowActions> = {
  render: () => (
    <Table sx={{ maxWidth: 420 }}>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {['Website redesign', 'Quarterly report'].map((name) => (
          <TableRow key={name}>
            <TableCell>{name}</TableCell>
            <TableCell align="right">
              <RowActions>
                <Tooltip title="Edit"><IconButton size="small" aria-label="Edit"><Icon d={EDIT} /></IconButton></Tooltip>
                <Tooltip title="Delete"><IconButton size="small" aria-label="Delete"><Icon d={DELETE} /></IconButton></Tooltip>
              </RowActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
