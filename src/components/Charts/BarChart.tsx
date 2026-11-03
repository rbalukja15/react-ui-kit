import * as React from 'react';
import { Box, ButtonBase } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { Pill } from '../Pill';
import { kit } from '../../internal/kitTokens';

export interface BarDatum {
  /** Read by screen readers for this bar, e.g. `'Sat 17 Oct, 42,310 L'`. */
  label: string;
  value: number;
}

export interface BarChartProps {
  data: readonly BarDatum[];
  /** Accessible name of the whole chart. */
  'aria-label': string;
  /** The highlighted bar. Drawn in the primary colour with a pill label above it. */
  selectedIndex?: number;
  /** Makes each bar a button that selects it. */
  onSelect?: (index: number) => void;
  /** Text of the pill above the selected bar. Defaults to the bar's `label`. */
  formatSelected?: (datum: BarDatum, index: number) => React.ReactNode;
  /** Labels spread evenly under the chart, e.g. `['1 Oct', '8', '15', '22', '31 Oct']`. */
  axisLabels?: readonly React.ReactNode[];
  /** Plot height in px, pill included. Defaults to `172`. */
  height?: number;
  /** Dashed horizontal guides. Defaults to `2`. */
  gridLines?: number;
  sx?: SxProps<Theme>;
}

const PILL_ROOM = 34;

/**
 * Soft rounded bars, one series. Pass `onSelect` to let people pick a bar;
 * the picked one turns primary and shows its value in a pill.
 */
export function BarChart({
  data,
  'aria-label': ariaLabel,
  selectedIndex,
  onSelect,
  formatSelected = (d) => d.label,
  axisLabels,
  height = 172,
  gridLines = 2,
  sx,
}: BarChartProps) {
  const max = Math.max(0, ...data.map((d) => d.value)) || 1;
  const plot = height - PILL_ROOM;
  const selected = selectedIndex !== undefined ? data[selectedIndex] : undefined;
  const pillLeft = selectedIndex !== undefined ? Math.min(88, Math.max(12, ((selectedIndex + 0.5) * 100) / data.length)) : 0;

  return (
    <Box sx={[{ display: 'flex', flexDirection: 'column', gap: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Box
        role="group"
        aria-label={ariaLabel}
        sx={(theme) => ({ position: 'relative', height, borderBottom: `1px solid ${kit(theme).line.main}` })}
      >
        {Array.from({ length: gridLines }, (_, i) => (
          <Box
            key={i}
            aria-hidden="true"
            sx={(theme) => ({
              position: 'absolute',
              left: 0,
              right: 0,
              top: Math.round((height * (i + 1)) / (gridLines + 1)),
              borderTop: `1px dashed ${kit(theme).line.main}`,
            })}
          />
        ))}
        {selected && selectedIndex !== undefined && (
          <Pill
            tone="primary"
            size="medium"
            sx={{ position: 'absolute', top: 0, left: `${pillLeft}%`, transform: 'translateX(-50%)', fontSize: '0.75rem' }}
          >
            <span aria-live="polite">{formatSelected(selected, selectedIndex)}</span>
          </Pill>
        )}
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: PILL_ROOM, display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
          {data.map((d, i) => {
            const on = i === selectedIndex;
            const barSx = (theme: Theme) => ({
              flex: '1 1 0',
              minWidth: 0,
              height: Math.max(4, Math.round((d.value / max) * (plot - 4))),
              borderRadius: '4px 4px 1px 1px',
              bgcolor: on ? theme.palette.primary.main : kit(theme).chart.muted,
              transition: theme.transitions.create('background-color', { duration: 120 }),
            });
            return onSelect ? (
              <ButtonBase
                key={i}
                aria-label={d.label}
                aria-pressed={on}
                onClick={() => onSelect(i)}
                sx={(theme) => ({
                  ...barSx(theme),
                  '&:hover': { bgcolor: on ? theme.palette.primary.main : theme.palette.primary.light },
                  '&.Mui-focusVisible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
                })}
              />
            ) : (
              <Box key={i} role="img" aria-label={d.label} sx={barSx} />
            );
          })}
        </Box>
      </Box>
      {axisLabels && <AxisLabels labels={axisLabels} spread />}
    </Box>
  );
}

/** Tick labels under a chart: spread edge to edge, or one centred under each bar. */
export function AxisLabels({ labels, spread = false }: { labels: readonly React.ReactNode[]; spread?: boolean }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        display: 'flex',
        justifyContent: spread ? 'space-between' : undefined,
        gap: spread ? 0 : 1,
        fontSize: '0.75rem',
        color: 'text.secondary',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {labels.map((label, i) => (
        <Box component="span" key={i} sx={spread ? undefined : { flex: '1 1 0', minWidth: 0, textAlign: 'center' }}>
          {label}
        </Box>
      ))}
    </Box>
  );
}
