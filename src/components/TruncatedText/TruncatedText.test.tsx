import { act, fireEvent, render, screen } from '@testing-library/react';
import { TruncatedText } from './TruncatedText';

/** jsdom has no layout, so fake the element's widths. */
function mockWidths(scrollWidth: number, clientWidth: number) {
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(scrollWidth);
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(clientWidth);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('<TruncatedText>', () => {
  it('renders the text without wrapping', () => {
    render(<TruncatedText text="Short" />);
    expect(screen.getByText('Short')).toHaveClass('MuiTypography-noWrap');
  });

  it('shows the full text in a tooltip when it overflows', async () => {
    mockWidths(300, 100);
    render(<TruncatedText text="A very long project name" />);
    fireEvent.mouseOver(screen.getByText('A very long project name'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('A very long project name');
  });

  it('shows no tooltip when the text fits', async () => {
    vi.useFakeTimers();
    mockWidths(100, 100);
    render(<TruncatedText text="Fits" />);
    fireEvent.mouseOver(screen.getByText('Fits'));
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('passes Typography props through', () => {
    render(<TruncatedText text="Caption" variant="caption" component="span" />);
    expect(screen.getByText('Caption')).toHaveClass('MuiTypography-caption');
  });
});
