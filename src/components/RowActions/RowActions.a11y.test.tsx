import { render } from '@testing-library/react';
import { IconButton, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { axe } from 'vitest-axe';
import { RowActions } from './RowActions';

const Icon = () => <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" /></svg>;

describe('<RowActions> accessibility', () => {
  it('has no axe violations inside a table cell', async () => {
    const { container } = render(
      <Table aria-label="Projects">
        <TableBody>
          <TableRow>
            <TableCell>Website redesign</TableCell>
            <TableCell align="right">
              <RowActions>
                <IconButton aria-label="Edit"><Icon /></IconButton>
                <IconButton aria-label="Delete"><Icon /></IconButton>
              </RowActions>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
