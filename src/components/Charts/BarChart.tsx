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
/** Space kept between the pill and the tallest bar when the pill wraps. */
const PILL_GAP = 6;

// useLayoutEffect warns when rendered on the server, where it never runs.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

/**
 * The plot's width and the pill's size, kept current as either changes, so
 * the pill can be centred over its bar without leaving the plot.
 */
function usePillFit(plot: React.RefObject<HTMLElement | null>, pill: React.RefObject<HTMLElement | null>, deps: unknown[]) {
  const [fit, setFit] = React.useState<{ plotWidth: number; pillWidth: number; pillHeight: number } | null>(null);
  useIsomorphicLayoutEffect(() => {
    const measure = () => {
      if (!plot.current || !pill.current) {
        setFit(null);
        return;
      }
      const next = {
        plotWidth: plot.current.clientWidth,
        pillWidth: pill.current.offsetWidth,
        pillHeight: pill.current.offsetHeight,
      };
      setFit((prev) =>
        prev && prev.plotWidth === next.plotWidth && prev.pillWidth === next.pillWidth && prev.pillHeight === next.pillHeight
          ? prev
          : next,
      );
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    if (plot.current) observer.observe(plot.current);
    if (pill.current) observer.observe(pill.current);
    return () => observer.disconnect();
  }, deps);
  return fit;
}

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
  const selected = selectedIndex !== undefined ? data[selectedIndex] : undefined;
  const label = selected && selectedIndex !== undefined ? formatSelected(selected, selectedIndex) : undefined;

  // The pill sits centred over its bar, slid sideways as far as it must to
  // stay inside the plot, and wraps if it is wider than the plot; the bars
  // then start lower, so a wrapped pill never covers the tallest one.
  const plotRef = React.useRef<HTMLDivElement>(null);
  const pillRef = React.useRef<HTMLSpanElement>(null);
  const fit = usePillFit(plotRef, pillRef, [selectedIndex, data.length, label]);
  const centre = selectedIndex !== undefined ? ((selectedIndex + 0.5) * 100) / data.length : 0;
  const pillLeft = fit
    ? `${Math.max(0, Math.min(fit.plotWidth - fit.pillWidth, (centre / 100) * fit.plotWidth - fit.pillWidth / 2))}px`
    : `${centre}%`;
  // Before it is measured, translating by the same share of its own width
  // keeps the pill inside the plot wherever its bar is.
  const pillShift = fit ? undefined : `translateX(-${centre}%)`;
  const room = selected && fit ? Math.max(PILL_ROOM, fit.pillHeight + PILL_GAP) : PILL_ROOM;
  const plot = height - room;

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
        ref={plotRef}
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
          <Box
            ref={pillRef}
            component="span"
            sx={{
              position: 'absolute',
              top: 0,
              left: pillLeft,
              transform: pillShift,
              // Sized by its text, not by the room right of `left`, which near
              // the last bar is a sliver and would squeeze the pill into a column.
              width: 'max-content',
              maxWidth: '100%',
              display: 'flex',
            }}
          >
            <Pill tone="primary" size="medium" sx={{ maxWidth: '100%', whiteSpace: 'normal', textAlign: 'center', fontSize: '0.75rem' }}>
              <span aria-hidden={interactive ? true : undefined}>{label}</span>
            </Pill>
          </Box>
        )}
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: room, display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
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
