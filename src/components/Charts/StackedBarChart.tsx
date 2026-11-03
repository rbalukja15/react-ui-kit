import * as React from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { AxisLabels } from './BarChart';
import { kit } from '../../internal/kitTokens';

export interface ChartSeries {
  label: string;
  /** Any CSS colour. Defaults: the first series is `chart.neutral`, the last `primary.main`. */
  color?: string;
}

export interface StackedBarDatum {
  /** Short label under the bar, e.g. `'Oct'`. */
  label: React.ReactNode;
  /** Read by screen readers, e.g. `'October: cost 466,325 L, profit 617,995 L'`. */
  'aria-label': string;
  /** One value per series, bottom to top. */
  values: readonly number[];
}

export interface StackedBarChartProps {
  series: readonly ChartSeries[];
  data: readonly StackedBarDatum[];
  /** Accessible name of the whole chart. */
  'aria-label': string;
  /** Plot height in px. Defaults to `190`. */
  height?: number;
  sx?: SxProps<Theme>;
}

/** Bars split into stacked parts, such as cost under profit. Pair it with `ChartLegend`. */
export function StackedBarChart({ series, data, 'aria-label': ariaLabel, height = 190, sx }: StackedBarChartProps) {
  const max = Math.max(0, ...data.map((d) => d.values.reduce((a, b) => a + b, 0))) || 1;

  return (
    <Box sx={[{ display: 'flex', flexDirection: 'column', gap: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Box
        role="group"
        aria-label={ariaLabel}
        sx={(theme) => ({ display: 'flex', alignItems: 'flex-end', gap: 1, height, borderBottom: `1px solid ${kit(theme).line.main}` })}
      >
        {data.map((d, i) => (
          <Box
            key={i}
            role="img"
            aria-label={d['aria-label']}
            sx={{ flex: '1 1 0', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column-reverse' }}
          >
            {d.values.map((v, s) => {
              const top = s === d.values.length - 1;
              return (
                <Box
                  key={s}
                  sx={(theme) => ({
                    height: `${(v / max) * 100}%`,
                    bgcolor: seriesColor(theme, series, s),
                    borderRadius: top ? '4px 4px 0 0' : 0,
                  })}
                />
              );
            })}
          </Box>
        ))}
      </Box>
      <AxisLabels labels={data.map((d) => d.label)} />
    </Box>
  );
}

export function seriesColor(theme: Theme, series: readonly ChartSeries[], index: number): string {
  const explicit = series[index]?.color;
  if (explicit) return explicit;
  if (index === series.length - 1) return theme.palette.primary.main;
  return index === 0 ? kit(theme).chart.neutral : kit(theme).chart.muted;
}

/** Colour keys for a chart's series. */
export function ChartLegend({ series }: { series: readonly ChartSeries[] }) {
  return (
    <Box component="ul" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.75, m: 0, p: 0, listStyle: 'none', fontSize: '0.75rem', color: 'text.secondary' }}>
      {series.map((s, i) => (
        <Box component="li" key={s.label} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          <Box aria-hidden="true" sx={(theme) => ({ width: 10, height: 10, borderRadius: '3px', bgcolor: seriesColor(theme, series, i) })} />
          {s.label}
        </Box>
      ))}
    </Box>
  );
}
