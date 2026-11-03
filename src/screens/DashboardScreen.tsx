import * as React from 'react';
import { Box, Button, Link } from '@mui/material';
import {
  ChartLegend,
  DropdownButton,
  ListRow,
  PageHeader,
  Panel,
  Pill,
  StackedBarChart,
  StatTile,
  SummaryList,
  type ChartSeries,
} from '../index';
import { AlertIcon, ChartIcon, ClockIcon, HistoryIcon, PlusIcon, ShieldIcon, SyringeIcon } from './icons';
import { DemoLink, VetAppShell } from './VetAppShell';

const tiles = [
  { label: 'Revenue this month', value: '268,140', unit: 'L', note: 'Received so far in November' },
  { label: 'Profit this month', value: '148,060', unit: 'L', note: '55% margin · net 97,300 after expenses' },
  { label: 'Unpaid invoices', value: '17', unit: 'invoices', note: '86,450 L owed' },
  { label: 'Running low', value: '6', unit: 'products', note: 'Below their reorder level' },
];

type Due = { pet: string; owner: string; what: string; when: string; overdue: boolean };
const vaccinations: Due[] = [
  { pet: 'Luna', owner: 'Elira Hoxha', what: 'Rabies', when: '12 days overdue', overdue: true },
  { pet: 'Rex', owner: 'Arben Kola', what: 'DHPPi+L', when: '5 days overdue', overdue: true },
  { pet: 'Miu', owner: 'Teuta Dervishi', what: 'Feline trivalent', when: '2 days overdue', overdue: true },
  { pet: 'Bobi', owner: 'Gentian Shehu', what: 'Rabies', when: 'in 3 days', overdue: false },
  { pet: 'Leo', owner: 'Anisa Prifti', what: 'DHPPi+L', when: 'in 6 days', overdue: false },
];
const antiparasites: Due[] = [
  { pet: 'Max', owner: 'Ilir Basha', what: 'Spot-on, monthly', when: '9 days overdue', overdue: true },
  { pet: 'Kiki', owner: 'Mirela Gjoni', what: 'Deworming', when: '1 day overdue', overdue: true },
  { pet: 'Rocky', owner: 'Besnik Leka', what: 'Spot-on, monthly', when: 'in 2 days', overdue: false },
  { pet: 'Nala', owner: 'Erisa Mema', what: 'Deworming', when: 'in 4 days', overdue: false },
  { pet: 'Tom', owner: 'Dritan Çela', what: 'Flea collar', when: 'in 8 days', overdue: false },
];
const lowStock = [
  { name: 'Flea collar, cat', sold: '26 pieces', stock: '2 pieces', reorder: '10 pieces' },
  { name: 'Adult dry food 15 kg', sold: '570 kg', stock: '75 kg', reorder: '150 kg' },
  { name: 'Meloxicam 1.5 mg/ml, 10 ml', sold: '57 bottles', stock: '8 bottles', reorder: '15 bottles' },
  { name: 'Ear cleaner 125 ml', sold: '14 bottles', stock: '3 bottles', reorder: '6 bottles' },
  { name: 'Cefalexin 500 mg', sold: '120 tablets', stock: '40 tablets', reorder: '60 tablets' },
];
const today = [
  { time: '09:30', pet: 'Rex', type: 'Vaccination', status: 'Done' },
  { time: '11:00', pet: 'Luna', type: 'Check-up', status: 'Confirmed' },
  { time: '16:15', pet: 'Max', type: 'Surgery follow-up', status: 'Scheduled' },
];
const recent = [
  { name: 'Invoice #1871', kind: 'Invoice' },
  { name: 'Elira Hoxha', kind: 'Client' },
  { name: 'Adult dry food 15 kg', kind: 'Product' },
];

const monthLabels = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
const cost = [380, 352, 401, 418, 436, 455, 470, 448, 431, 452, 466, 120];
const revenue = [842, 790, 905, 948, 1001, 1046, 1088, 1032, 987, 1040, 1084, 268];
const series: ChartSeries[] = [{ label: 'Cost' }, { label: 'Profit' }];
const months = monthLabels.map((label, i) => ({
  label,
  'aria-label': `${label}: revenue ${revenue[i]}k L, cost ${cost[i]}k L`,
  values: [cost[i]!, revenue[i]! - cost[i]!],
}));

const footLink = (label: string) => (
  <Link href="#" component={DemoLink} underline="none" sx={{ mt: 'auto', pt: 1, fontSize: '0.8125rem', fontWeight: 600 }}>
    {label}
  </Link>
);

function DueList({ rows }: { rows: Due[] }) {
  return (
    <Box>
      {rows.map((r) => (
        <ListRow
          key={r.pet}
          primary={r.pet}
          meta={r.owner}
          secondary={r.what}
          trailing={r.when}
          trailingTone={r.overdue ? 'warning' : 'muted'}
        />
      ))}
    </Box>
  );
}

/** VetApp's slimmed-down dashboard, built only from kit components. */
export function DashboardScreen() {
  return (
    <VetAppShell currentPath="/">
      <PageHeader
        title="Dashboard"
        subtitle="Tuesday, 3 November 2026"
        actions={
          <>
            <Button variant="contained" size="large" startIcon={<PlusIcon />} href="#" LinkComponent={DemoLink}>
              New invoice
            </Button>
            <Button variant="outlined" size="large" href="#" LinkComponent={DemoLink}>
              New appointment
            </Button>
            <Button variant="outlined" size="large" href="#" LinkComponent={DemoLink}>
              New client
            </Button>
          </>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5 }}>
        {tiles.map((t) => (
          <StatTile key={t.label} {...t} />
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 1.5 }}>
        <Panel title="Vaccinations due" icon={<SyringeIcon />} action={<Pill tone="warning">4 overdue</Pill>} contentSx={{ gap: 1 }}>
          <DueList rows={vaccinations} />
          {footLink('All 23 in follow-ups')}
        </Panel>
        <Panel title="Antiparasites due" icon={<ShieldIcon />} action={<Pill tone="warning">2 overdue</Pill>} contentSx={{ gap: 1 }}>
          <DueList rows={antiparasites} />
          {footLink('All 14 in follow-ups')}
        </Panel>
        <Panel
          title="Running low"
          icon={<AlertIcon />}
          action={<Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>In stock · reorder at</Box>}
          contentSx={{ gap: 1 }}
        >
          <Box>
            {lowStock.map((r) => (
              <ListRow
                key={r.name}
                primary={r.name}
                secondary={`Sold ${r.sold} last 30 days`}
                trailing={
                  <Box component="span" sx={{ fontSize: '0.8125rem' }}>
                    <Box component="span" sx={{ fontWeight: 600, color: 'warning.dark' }}>{r.stock}</Box>
                    <Box component="span" sx={{ color: 'text.secondary' }}> · {r.reorder}</Box>
                  </Box>
                }
              />
            ))}
          </Box>
          {footLink('Restock these 6')}
        </Panel>
      </Box>

      <Panel
        title={<>Revenue vs. cost <Box component="span" sx={{ fontWeight: 400 }}>(by invoice date)</Box></>}
        icon={<ChartIcon />}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
            <ChartLegend series={series} />
            <DropdownButton size="small">Last 12 months</DropdownButton>
          </Box>
        }
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '2 1 460px', minWidth: 0 }}>
            <StackedBarChart aria-label="Revenue and cost by month, last 12 months" series={series} data={months} />
          </Box>
          <Box sx={{ flex: '1 1 240px', alignSelf: 'flex-start' }}>
            <Box sx={{ fontSize: '0.8125rem', color: 'text.secondary', mb: 1 }}>October</Box>
            <SummaryList
              items={[
                { label: 'Net revenue', value: '1,084,320 L' },
                { label: 'Cost', value: '466,325 L' },
                { label: 'Gross profit', value: '617,995 L' },
                { label: 'Expenses', value: '212,400 L' },
                { label: 'Net profit', value: '405,595 L', total: true },
              ]}
            />
          </Box>
        </Box>
      </Panel>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 1.5 }}>
        <Panel
          title="Today"
          icon={<ClockIcon />}
          action={
            <Link href="#" component={DemoLink} underline="none" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              Day sheet
            </Link>
          }
          contentSx={{ gap: 1 }}
        >
          <Box>
            {today.map((a) => (
              <ListRow key={a.time} leading={a.time} primary={a.pet} meta={a.type} trailing={a.status} />
            ))}
          </Box>
        </Panel>
        <Panel title="Recently opened" icon={<HistoryIcon />} contentSx={{ gap: 1 }}>
          <Box>
            {recent.map((r) => (
              <ListRow key={r.name} href="#" LinkComponent={DemoLink} primary={r.name} trailing={r.kind} />
            ))}
          </Box>
        </Panel>
      </Box>
    </VetAppShell>
  );
}
