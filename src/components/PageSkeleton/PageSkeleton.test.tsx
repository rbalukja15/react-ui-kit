import { render, screen } from '@testing-library/react';
import { PageSkeleton } from './PageSkeleton';

describe('<PageSkeleton>', () => {
  it('announces a single loading status', () => {
    render(<PageSkeleton />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });

  it('uses the label prop for the status text', () => {
    render(<PageSkeleton label="Wird geladen" />);
    expect(screen.getByRole('status')).toHaveTextContent('Wird geladen');
  });

  it('hides the placeholder shapes from assistive tech', () => {
    render(<PageSkeleton variant="profile" />);
    // The table inside is hidden, so it is not exposed as a table.
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it.each(['profile', 'document', 'list'] as const)('renders the %s variant', (variant) => {
    const { container } = render(<PageSkeleton variant={variant} />);
    expect(container.querySelector(`[data-variant="${variant}"]`)).toBeInTheDocument();
    expect(container.querySelectorAll('.MuiCard-root')).toHaveLength(variant === 'list' ? 1 : 2);
  });

  it('draws an avatar only for the profile variant', () => {
    const { container, rerender } = render(<PageSkeleton variant="profile" />);
    expect(container.querySelector('.MuiSkeleton-circular')).toBeInTheDocument();
    rerender(<PageSkeleton variant="document" />);
    expect(container.querySelector('.MuiSkeleton-circular')).not.toBeInTheDocument();
  });
});
