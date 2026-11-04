import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ListRow, SummaryList } from './ListRow';

describe('<ListRow>', () => {
  it('joins primary and meta with a dot and shows the status', async () => {
    const { container } = render(
      <ListRow primary="Luna" meta="Elira Hoxha" secondary="Rabies" trailing="12 days overdue" trailingTone="warning" />,
    );
    expect(container).toHaveTextContent('Luna · Elira HoxhaRabies12 days overdue');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('becomes a link with href', () => {
    render(<ListRow href="/invoices/1871" primary="Invoice #1871" trailing="Invoice" />);
    expect(screen.getByRole('link', { name: /Invoice #1871/ })).toHaveAttribute('href', '/invoices/1871');
  });
});

describe('<SummaryList>', () => {
  it('renders terms and values', async () => {
    const { container } = render(
      <SummaryList items={[{ label: 'Cost', value: '466 L' }, { label: 'Net profit', value: '405 L', total: true }]} />,
    );
    expect(screen.getByText('Net profit').tagName).toBe('DT');
    expect(screen.getByText('405 L').tagName).toBe('DD');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('widens the leading slot with leadingWidth', () => {
    render(<ListRow leading="10:30 AM" leadingWidth={72} primary="Rex" />);
    expect(getComputedStyle(screen.getByText('10:30 AM')).width).toBe('72px');
  });
});
