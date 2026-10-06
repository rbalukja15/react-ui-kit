import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box,
  Button,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { UrlStateProvider, type UrlAdapter } from './UrlStateProvider';
import { useUrlSearch } from './useUrlSearch';
import { useUrlState } from './useUrlState';

const projects = [
  { name: 'Website redesign', archived: false },
  { name: 'Mobile app', archived: false },
  { name: 'Annual report', archived: true },
  { name: 'Design system', archived: false },
  { name: 'Onboarding emails', archived: true },
  { name: 'Data warehouse', archived: false },
];

const DEFAULTS = { q: '', archived: false };

function ProjectList() {
  const [{ q, archived }, setFilters] = useUrlState(DEFAULTS);
  const [search, setSearch, query] = useUrlSearch(q, (value) => setFilters({ q: value }));
  const shown = projects.filter(
    (project) => project.archived === archived && project.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField label="Search projects" size="small" value={search} onChange={(event) => setSearch(event.target.value)} />
        <FormControlLabel
          control={<Switch checked={archived} onChange={(event) => setFilters({ archived: event.target.checked })} />}
          label="Archived"
        />
      </Stack>
      <List dense aria-label="Projects">
        {shown.map((project) => (
          <ListItem key={project.name}>
            <ListItemText primary={project.name} />
          </ListItem>
        ))}
        {shown.length === 0 && (
          <ListItem>
            <ListItemText primary="No projects match" />
          </ListItem>
        )}
      </List>
    </Stack>
  );
}

/**
 * Stands in for a router so the story does not rewrite Storybook's own URL.
 * Like Next.js, it reports each write on a later render.
 */
function DemoRouter({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = React.useState('');
  const adapter = React.useMemo<UrlAdapter>(
    () => ({ search, replace: (next) => setTimeout(() => setSearch(next), 50) }),
    [search],
  );
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          /projects{search ? `?${search}` : ''}
        </Typography>
        <Button size="small" onClick={() => setSearch('')}>
          Back to all projects
        </Button>
      </Stack>
      <UrlStateProvider adapter={adapter}>{children}</UrlStateProvider>
    </Stack>
  );
}

const meta: Meta = {
  title: 'Hooks/URL state',
  decorators: [(Story) => <Box sx={{ maxWidth: 480 }}><Story /></Box>],
};
export default meta;

/**
 * The search box and the switch live in the query string shown above the
 * list. The box keeps every keystroke while the URL catches up, and the list
 * filters once typing pauses. "Back to all projects" changes the URL from
 * outside, and the box follows it.
 */
export const FilteredList: StoryObj = {
  render: () => (
    <DemoRouter>
      <ProjectList />
    </DemoRouter>
  ),
};
