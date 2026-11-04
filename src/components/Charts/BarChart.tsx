import * as React from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { Pill } from '../Pill';
import { kit } from '../../internal/kitTokens';
import { maxOf } from '../../internal/maxOf';

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
  /** Lets people pick a bar by pointer or keyboard; the chart becomes one slider. */
  onSelect?: (index: number) => void;
  /** Text of the pill above the selected bar. Defaults to the bar's `label`. */
  formatSelected?: (datum: BarDatum, index: number) => React.ReactNode;
  /** Read by screen readers while no bar is picked. Defaults to `'No bar selected'`. */
  noneSelectedText?: string;
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
 *
 * A selectable chart is one `slider`: click or tap anywhere above a bar, or
 * focus the chart and use the arrow keys, Home and End. Thin bars stay
 * visuals rather than separate buttons, which would be too small to hit.
 */
export function BarChart({
  data,
  'aria-label': ariaLabel,
  selectedIndex,
  onSelect,
  formatSelected = (d) => d.label,
  noneSelectedText = 'No bar selected',
  axisLabels,
  height = 172,
  gridLines = 2,
  sx,
}: BarChartProps) {
  const max = maxOf(data.map((d) => d.value)) || 1;
  const plot = height - PILL_ROOM;
  const selected = selectedIndex !== undefined ? data[selectedIndex] : undefined;
  const pillLeft = selectedIndex !== undefined ? Math.min(88, Math.max(12, ((selectedIndex + 0.5) * 100) / data.length)) : 0;

  const count = data.length;
  const interactive = onSelect !== undefined && count > 0;
  const current = selectedIndex ?? -1;

  const pick = (index: number) => {
    if (!onSelect) return;
    const next = Math.min(count - 1, Math.max(0, index));
    if (next !== selectedIndex) onSelect(next);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const steps: Record<string, number> = {
      ArrowRight: current + 1,
      ArrowUp: current + 1,
      ArrowLeft: current < 0 ? 0 : current - 1,
      ArrowDown: current < 0 ? 0 : current - 1,
      Home: 0,
      End: count - 1,
    };
    const target = steps[event.key];
    if (target === undefined) return;
    event.preventDefault();
    pick(target);
  };

  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    pick(Math.floor(((event.clientX - rect.left) / rect.width) * count));
  };

  const sliderProps = interactive
    ? {
        role: 'slider',
        tabIndex: 0,
        'aria-label': ariaLabel,
        'aria-valuemin': 0,
        'aria-valuemax': count - 1,
        // A slider must have aria-valuenow, so with nothing picked it reports
        // 0, and the text tells screen readers that no bar is chosen.
        'aria-valuenow': selectedIndex ?? 0,
        'aria-valuetext': selected ? selected.label : noneSelectedText,
        onKeyDown,
        onClick,
      }
    : { role: 'group', 'aria-label': ariaLabel };

  return (
    <Box sx={[{ display: 'flex', flexDirection: 'column', gap: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Box
        {...sliderProps}
        sx={(theme) => ({
          position: 'relative',
          height,
          borderBottom: `1px solid ${kit(theme).line.main}`,
          ...(interactive && {
            cursor: 'pointer',
            borderRadius: '4px',
            '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 4 },
          }),
        })}
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
            <span aria-hidden={interactive ? true : undefined}>{formatSelected(selected, selectedIndex)}</span>
          </Pill>
        )}
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: PILL_ROOM, display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
          {data.map((d, i) => {
            const on = i === selectedIndex;
            return (
              <Box
                key={i}
                {...(interactive ? { 'aria-hidden': true } : { role: 'img', 'aria-label': d.label })}
                sx={(theme: Theme) => ({
                  flex: '1 1 0',
                  minWidth: 0,
                  height: Math.max(4, Math.round((d.value / max) * (plot - 4))),
                  borderRadius: '4px 4px 1px 1px',
                  bgcolor: on ? theme.palette.primary.main : kit(theme).chart.muted,
                  transition: theme.transitions.create('background-color', { duration: 120 }),
                })}
              />
            );
          })}
        </Box>
      </Box>
      {axisLabels && <AxisLabels labels={axisLabels} spread />}
    </Box>
  );
}

/**
 * Tick labels under a chart: spread edge to edge, or one centred under each
 * bar. More than eight per-bar labels keep only every other one on phones,
 * so neighbours don't run into each other.
 */
export function AxisLabels({ labels, spread = false }: { labels: readonly React.ReactNode[]; spread?: boolean }) {
  const thin = !spread && labels.length > 8;
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
        <Box
          component="span"
          key={i}
          sx={
            spread
              ? undefined
              : {
                  flex: '1 1 0',
                  minWidth: 0,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  ...(thin && i % 2 === 1 && { visibility: { xs: 'hidden', sm: 'visible' } }),
                }
          }
        >
          {label}
        </Box>
      ))}
    </Box>
  );
}
