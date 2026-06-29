import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Card, Chip, Divider, Stack, Typography } from '@mui/material';

function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box
        sx={{
          width: 96,
          height: 64,
          borderRadius: 1.5,
          bgcolor: color,
          border: '1px solid',
          borderColor: 'divider',
        }}
      />
      <Typography variant="caption" sx={{ fontWeight: 500 }}>{label}</Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>{color}</Typography>
    </Box>
  );
}

function TokensShowcase() {
  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h3" gutterBottom>Tokens</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560, mb: 1 }}>
          Warm editorial surfaces with a teal brand axis. Headings render in Newsreader serif; body and labels in Inter sans. Light and a muted dark mode ship together — toggle via the Mode control in the toolbar.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h5" gutterBottom>Palette</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" rowGap={2}>
          <Swatch label="primary" color="#0f766e" />
          <Swatch label="primary.light" color="#5eead4" />
          <Swatch label="secondary" color="#0891b2" />
          <Swatch label="success" color="#5F7544" />
          <Swatch label="warning" color="#B0792E" />
          <Swatch label="error" color="#B23A3A" />
          <Swatch label="info" color="#4A6E8C" />
        </Stack>
      </Box>

      <Divider />

      <Box>
        <Typography variant="h5" gutterBottom>Typography</Typography>
        <Stack spacing={1}>
          <Typography variant="h1">h1 · Newsreader serif</Typography>
          <Typography variant="h2">h2 · Newsreader serif</Typography>
          <Typography variant="h3">h3 · Newsreader serif</Typography>
          <Typography variant="h4">h4 · Newsreader serif</Typography>
          <Typography variant="h5">h5 · Newsreader serif</Typography>
          <Typography variant="h6">h6 · Newsreader serif</Typography>
          <Typography variant="body1">Body 1 — Inter sans, 0.9375rem with 1.55 line-height for breathable scanning.</Typography>
          <Typography variant="body2">Body 2 — Inter sans, 0.875rem; the default for dense metadata.</Typography>
          <Typography variant="caption" display="block">Caption — Inter sans, 0.75rem; single-line labels.</Typography>
        </Stack>
      </Box>

      <Divider />

      <Box>
        <Typography variant="h5" gutterBottom>Surfaces</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" rowGap={2}>
          <Card sx={{ p: 2, width: 200 }}>
            <Typography variant="body2">Card on warm paper</Typography>
            <Typography variant="caption" color="text.secondary">background.paper</Typography>
          </Card>
          <Box sx={{ p: 2, width: 200, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
            <Typography variant="body2">Page background</Typography>
            <Typography variant="caption" color="text.secondary">background.default</Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      <Box>
        <Typography variant="h5" gutterBottom>Tonal chips</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 560 }}>
          Filled `Chip color="…"` renders as pale-tinted background + strong-text foreground — quieter than MUI's default vivid block.
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
          <Chip label="Default" />
          <Chip label="Primary" color="primary" />
          <Chip label="Secondary" color="secondary" />
          <Chip label="Success" color="success" />
          <Chip label="Warning" color="warning" />
          <Chip label="Error" color="error" />
          <Chip label="Info" color="info" />
        </Stack>
      </Box>
    </Box>
  );
}

const meta: Meta = {
  title: 'Theme/Tokens',
};
export default meta;

export const Tokens: StoryObj = {
  render: () => <TokensShowcase />,
};
