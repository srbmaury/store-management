import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SalesHistory from '../SalesHistory';

// Mock the SaleCard component
vi.mock('../SaleCard', () => ({
  default: ({ sale }) => (
    <div data-testid="sale-card">Mocked SaleCard for {sale._id}</div>
  ),
}));

const mockSales = [
  { _id: '1', totalAmount: 100 },
  { _id: '2', totalAmount: 200 },
];

describe('SalesHistory', () => {
  it('displays no history message when salesHistory is empty', () => {
    render(<SalesHistory salesHistory={[]} />);
    expect(screen.getByText('No sales history available.')).toBeInTheDocument();
  });

  it('renders a list of SaleCard components when salesHistory is present', () => {
    render(<SalesHistory salesHistory={mockSales} />);
    const cards = screen.getAllByTestId('sale-card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('Mocked SaleCard for 1');
    expect(cards[1]).toHaveTextContent('Mocked SaleCard for 2');
  });

  it('handles missing salesHistory prop gracefully', () => {
    render(<SalesHistory />);
    expect(screen.getByText('No sales history available.')).toBeInTheDocument();
  });
});
