import { render, screen } from '@testing-library/react';
import { FeedList } from '@pawfectmatch/ui/components/FeedList';

const mockItems = [
  { id: '1', title: 'Test Item 1', description: 'Description 1' },
  { id: '2', title: 'Test Item 2', description: 'Description 2' },
];

describe('FeedList', () => {
  it('renders feed items correctly', () => {
    render(<FeedList items={mockItems} />);

    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<FeedList loading={true} />);

    const loadingElements = screen.getAllByText('Loading...');
    expect(loadingElements).toHaveLength(3); // 3 skeleton items
  });

  it('renders empty list when no items', () => {
    const { container } = render(<FeedList items={[]} />);
    expect(container.firstChild?.childNodes).toHaveLength(0);
  });
});
