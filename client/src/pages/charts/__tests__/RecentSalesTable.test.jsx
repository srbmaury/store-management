import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RecentSalesTable from '../RecentSalesTable';

describe('RecentSalesTable', () => {
  it('displays message when no recent sales', () => {
    render(<RecentSalesTable recentSales={[]} />);
    expect(screen.getByText('No recent sales.')).toBeInTheDocument();
  });

  it('renders table rows for recent sales with formatted data', () => {
    const sales = [
      {
        _id: '1',
        date: '2025-06-01T10:00:00Z',
        customerName: 'John Doe',
        totalAmount: 123.45,
      }
    ];

    render(<RecentSalesTable recentSales={sales} />);

    // Check first row
    expect(screen.getByText(new Date(sales[0].date).toLocaleString())).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('₹123.45')).toBeInTheDocument();
  });
});
