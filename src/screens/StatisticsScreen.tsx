import * as React from 'react';
import { Box, Button, Link } from '@mui/material';
import {
  BarChart,
  DataTable,
  DropdownButton,
  FilterChips,
  Meter,
  PageHeader,
  Panel,
  Pill,
  SearchField,
  Sparkline,
  StatTile,
  TwoLineCell,
  type DataTableColumn,
} from '../index';
import {
  AlertIcon,
  ArrowRightIcon,
  BagIcon,
  BoxIcon,
  CalendarIcon,
  ChartIcon,
  CoinIcon,
  DownloadIcon,
  GridIcon,
  ListIcon,
  PillIcon,
  ReceiptIcon,
  ShieldIcon,
  SyringeIcon,
  TrendUpIcon,
} from './icons';
import { VetAppShell } from './VetAppShell';

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

const categories: [string, number, number][] = [
  ['Food', 204650, 41320],
  ['Medicine', 187930, 79815],
  ['Vaccine', 176400, 88740],
  ['Endo-ectoparasiticide', 86215, 31960],
  ['Ectoparasiticide', 51780, 17145],
  ['Supplement', 18960, 6890],
  ['Consumable', 11470, 5210],
];
const totalRevenue = categories.reduce((a, c) => a + c[1], 0);
const totalProfit = categories.reduce((a, c) => a + c[2], 0);
const maxCategory = Math.max(...categories.map((c) => c[1]));

// October 2026 starts on a Thursday; Sundays are quiet.
const dayWeights = [0.9, 1.2, 1.5, 0.25, 1.0, 0.8, 1.1, 0.9, 1.3, 1.6, 0.2, 1.1, 0.9, 1.0, 1.2, 1.4, 1.7, 0.3, 1.0, 0.8, 1.2, 1.0, 1.3, 1.5, 0.25, 0.9, 1.1, 1.0, 1.2, 1.4, 1.3];
const weightSum = dayWeights.reduce((a, b) => a + b, 0);
const weekdays = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];
const days = dayWeights.map((w, i) => {
  const value = (totalRevenue * w) / weightSum;
  return { value, label: `${weekdays[i % 7]} ${i + 1} Oct, ${fmt(value)} L` };
});

type Kind = 'food' | 'vac' | 'med' | 'para';
interface Product {
  id: number;
  name: string;
  category: string;
  kind: Kind;
  units: string;
  prev: string;
  revenue: number;
  profit: number;
  stock: string;
  stockQty: number;
  low: boolean;
  weeks: number[];
}

const products: Product[] = [
  { id: 1, name: 'Adult dry food 15 kg', category: 'Food', kind: 'food', units: '570 kg', prev: '435 kg', revenue: 151620, profit: 30780, stock: '75 kg', stockQty: 75, low: true, weeks: [2, 3, 2, 4, 3, 3, 2, 4, 5, 3, 4, 5] },
  { id: 2, name: 'Rabies vaccine', category: 'Vaccine', kind: 'vac', units: '73 doses', prev: '68 doses', revenue: 102200, profit: 58035, stock: '19 doses', stockQty: 19, low: false, weeks: [14, 15, 16, 17, 15, 18, 16, 17, 19, 16, 18, 20] },
  { id: 3, name: 'DHPPi+L vaccine', category: 'Vaccine', kind: 'vac', units: '36 doses', prev: '37 doses', revenue: 50400, profit: 25380, stock: '17 doses', stockQty: 17, low: false, weeks: [8, 9, 9, 10, 8, 9, 9, 8, 9, 10, 8, 9] },
  { id: 4, name: 'Spot-on dog 10–20 kg', category: 'Endo-ectoparasiticide', kind: 'para', units: '41 pieces', prev: '46 pieces', revenue: 49200, profit: 18245, stock: '33 pieces', stockQty: 33, low: false, weeks: [14, 13, 12, 12, 11, 11, 10, 9, 10, 9, 11, 10] },
  { id: 5, name: 'Meloxicam 1.5 mg/ml, 10 ml', category: 'Medicine', kind: 'med', units: '57 bottles', prev: '61 bottles', revenue: 39900, profit: 15390, stock: '8 bottles', stockQty: 8, low: true, weeks: [13, 15, 14, 14, 16, 15, 14, 15, 13, 15, 14, 15] },
  { id: 6, name: 'Amoxicillin 250 mg', category: 'Medicine', kind: 'med', units: '186 tablets', prev: '140 tablets', revenue: 28740, profit: 11390, stock: '280 tablets', stockQty: 280, low: false, weeks: [1, 2, 1, 2, 2, 1, 2, 2, 2, 3, 2, 2] },
  { id: 7, name: 'Flea collar, cat', category: 'Ectoparasiticide', kind: 'para', units: '26 pieces', prev: '31 pieces', revenue: 23140, profit: 7710, stock: '2 pieces', stockQty: 2, low: true, weeks: [9, 10, 9, 8, 8, 7, 8, 7, 6, 7, 6, 7] },
  { id: 8, name: 'Praziquantel 50 mg', category: 'Medicine', kind: 'med', units: '64 tablets', prev: '40 tablets', revenue: 6930, profit: 3080, stock: '120 tablets', stockQty: 120, low: false, weeks: [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1] },
];

const kindIcon: Record<Kind, React.ReactNode> = {
  food: <BagIcon />,
  vac: <SyringeIcon />,
  med: <PillIcon />,
  para: <ShieldIcon />,
};

const columns: DataTableColumn<Product>[] = [
  {
    id: 'name',
    header: 'Product',
    sortable: true,
    cell: (p) => (
      <TwoLineCell
        icon={kindIcon[p.kind]}
        primary={
          <Link href="#" underline="hover" color="inherit" onClick={(e) => e.preventDefault()}>
            {p.name}
          </Link>
        }
        secondary={p.category}
      />
    ),
  },
  {
    id: 'weeks',
    header: 'Last 12 weeks',
    hideable: false,
    hideBelow: 'md',
    cell: (p) => <Sparkline values={p.weeks} aria-label={`Weekly sales, last 12 weeks: ${p.weeks.join(', ')}`} />,
  },
  {
    id: 'units',
    header: 'Sold',
    align: 'right',
    hideBelow: 'sm',
    cell: (p) => <TwoLineCell align="right" strong primary={p.units} secondary={`Sep: ${p.prev}`} />,
  },
  { id: 'revenue', header: 'Revenue', align: 'right', sortable: true, cell: (p) => fmt(p.revenue) },
  { id: 'profit', header: 'Profit', align: 'right', sortable: true, hideBelow: 'md', cell: (p) => fmt(p.profit) },
  {
    id: 'stock',
    header: 'In stock',
    align: 'right',
    sortable: true,
    sortValue: (p) => p.stockQty,
    cell: (p) =>
      p.low ? (
        <Pill tone="warning" size="medium" icon={<AlertIcon />}>
          {p.stock}
        </Pill>
      ) : (
        p.stock
      ),
  },
];

const chipOptions = ['All', 'Medicine', 'Vaccine', 'Food', 'Endo-ectoparasiticide', 'Ectoparasiticide'] as const;
type Chip = (typeof chipOptions)[number];

/** The "Product sales" tab of VetApp's statistics page, built only from kit components. */
export function StatisticsScreen() {
  const [day, setDay] = React.useState(16);
  const [category, setCategory] = React.useState<Chip>('All');
  const [query, setQuery] = React.useState('');

  const rows = products.filter(
    (p) => (category === 'All' || p.category === category) && p.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <VetAppShell currentPath="/statistics">
      <PageHeader
        title="Product sales"
        subtitle="What sold, how fast, and what is about to run out."
        actions={
          <DropdownButton size="large" icon={<CalendarIcon />}>
            1 – 31 Oct 2026
          </DropdownButton>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5 }}>
        <StatTile
          label="Revenue"
          icon={<ReceiptIcon />}
          value={fmt(totalRevenue)}
          unit="L"
          aside={<Pill tone="primary" icon={<TrendUpIcon />}>6% vs Sep</Pill>}
          note="Products only, services left out"
        />
        <StatTile
          label="Profit"
          icon={<CoinIcon />}
          value={fmt(totalProfit)}
          unit="L"
          aside={`${Math.round((totalProfit * 100) / totalRevenue)}% margin`}
        >
          <Meter value={(totalProfit * 100) / totalRevenue} aria-label="Profit margin" valueText={`${Math.round((totalProfit * 100) / totalRevenue)}%`} color="#5FB3A8" />
        </StatTile>
        <StatTile label="Products sold" icon={<BoxIcon />} value={84} unit="of 117" note="33 products sold nothing" />
        <StatTile label="Running low" icon={<AlertIcon />} value={6} unit="products">
          <Link href="#" underline="none" onClick={(e) => e.preventDefault()} sx={{ fontSize: '0.8125rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            Open restock <ArrowRightIcon />
          </Link>
        </StatTile>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: 1.5 }}>
        <Panel title="Revenue by day" icon={<ChartIcon />} action={<Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Pick a day</Box>}>
          <BarChart
            aria-label="Revenue by day, October 2026"
            data={days}
            selectedIndex={day}
            onSelect={setDay}
            formatSelected={(d, i) => `${weekdays[i % 7]} ${i + 1} Oct · ${fmt(d.value)} L`}
            axisLabels={['1 Oct', '8', '15', '22', '31 Oct']}
          />
        </Panel>
        <Panel title="By category" icon={<GridIcon />} action={<Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Revenue · margin</Box>} contentSx={{ gap: 0.5 }}>
          {categories.map(([name, revenue, profit]) => (
            <Box
              key={name}
              sx={{
                display: 'grid',
                // Phones put the meter on its own line under the figures.
                gridTemplateColumns: { xs: 'minmax(0, 1fr) auto 40px', sm: 'minmax(0, 1.3fr) minmax(0, 1fr) 84px 40px' },
                gridTemplateAreas: { xs: '"name revenue margin" "bar bar bar"', sm: '"name bar revenue margin"' },
                alignItems: 'center',
                columnGap: 1.5,
                rowGap: 0.75,
                py: '7px',
                fontSize: '0.875rem',
              }}
            >
              <Box component="span" sx={{ gridArea: 'name', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</Box>
              <Meter value={revenue} max={maxCategory} aria-label={`${name} revenue`} valueText={`${fmt(revenue)} L`} sx={{ gridArea: 'bar' }} />
              <Box component="span" sx={{ gridArea: 'revenue', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(revenue)}</Box>
              <Box component="span" sx={{ gridArea: 'margin', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'text.secondary' }}>
                {Math.round((profit * 100) / revenue)}%
              </Box>
            </Box>
          ))}
        </Panel>
      </Box>

      <Panel
        title={<>Products <Pill>84</Pill></>}
        icon={<ListIcon />}
        action={
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', flex: { xs: '1 1 100%', sm: '0 1 auto' } }}>
            <SearchField label="Search products" placeholder="Name or barcode" value={query} onChange={setQuery} fullWidth sx={{ flex: '1 1 200px' }} />
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Export CSV
            </Button>
          </Box>
        }
        contentSx={{ pb: 1 }}
      >
        <FilterChips aria-label="Category" options={chipOptions} value={category} onChange={setCategory} />
        <DataTable
          label="Products sold in October"
          rows={rows}
          columns={columns}
          getRowId={(p) => p.id}
          defaultSort={{ columnId: 'revenue', direction: 'desc' }}
          defaultPageSize={20}
          pageSizeOptions={[]}
          footer="Paid and unpaid invoices. Drafts and cancelled ones are left out."
          labels={{ displayedRows: ({ from, to }) => `${from}–${to} of 84` }}
        />
      </Panel>
    </VetAppShell>
  );
}
