import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LowStockAlert from '../LowStockAlert';

describe('LowStockAlert', () => {
  it('shows message when no low stock items', () => {
    render(<LowStockAlert lowStockItems={[]} />);
    expect(screen.getByText('All inventory items are sufficiently stocked.')).toBeInTheDocument();
  });

  it('renders list of low stock items with correct text and style', () => {
    const items = [
      { _id: '1', name: 'Item A', stock: 2 },
      { _id: '2', name: 'Item B', stock: 1 },
    ];

    render(<LowStockAlert lowStockItems={items} />);

    items.forEach(({ name, stock }) => {
      const listItem = screen.getByText(`${name} — Only ${stock} left!`);
      expect(listItem).toBeInTheDocument();
      expect(listItem).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    });
  });
});
