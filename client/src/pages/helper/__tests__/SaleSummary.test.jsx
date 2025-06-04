import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SaleSummary from '../SaleSummary';

const selectedItems = [
  { item: '1', name: 'Apple', quantity: 2, price: 10 },
  { item: '2', name: 'Banana', quantity: 3, price: 5 },
];

const inventory = [
  { _id: '1', stock: 5 },
  { _id: '2', stock: 3 },
];

describe('SaleSummary', () => {
  it('shows "No items selected." when cart is empty', () => {
    render(
      <SaleSummary
        selectedItems={[]}
        inventory={inventory}
        handleQuantityChange={vi.fn()}
        totalAmount={0}
        customerName=""
        setCustomerName={vi.fn()}
        handleSubmit={vi.fn()}
        clearCart={vi.fn()}
      />
    );
    expect(screen.getByText('No items selected.')).toBeInTheDocument();
  });

  it('renders selected items with correct values', () => {
    render(
      <SaleSummary
        selectedItems={selectedItems}
        inventory={inventory}
        handleQuantityChange={vi.fn()}
        totalAmount={35}
        customerName="John"
        setCustomerName={vi.fn()}
        handleSubmit={vi.fn()}
        clearCart={vi.fn()}
      />
    );

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByText('₹10')).toBeInTheDocument();
    expect(screen.getByText('₹20.00')).toBeInTheDocument();

    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
    expect(screen.getByText('₹5')).toBeInTheDocument();
    expect(screen.getByText('₹15.00')).toBeInTheDocument();

    expect(screen.getByText('Total: ₹35.00')).toBeInTheDocument();
  });

  it('disables buttons when no items are selected', () => {
    render(
      <SaleSummary
        selectedItems={[]}
        inventory={inventory}
        handleQuantityChange={vi.fn()}
        totalAmount={0}
        customerName=""
        setCustomerName={vi.fn()}
        handleSubmit={vi.fn()}
        clearCart={vi.fn()}
      />
    );

    expect(screen.getByText('Submit Sale')).toBeDisabled();
    expect(screen.getByText('Clear Cart')).toBeDisabled();
  });

  it('calls handlers correctly', () => {
    const handleQuantityChange = vi.fn();
    const setCustomerName = vi.fn();
    const handleSubmit = vi.fn();
    const clearCart = vi.fn();

    render(
      <SaleSummary
        selectedItems={selectedItems}
        inventory={inventory}
        handleQuantityChange={handleQuantityChange}
        totalAmount={35}
        customerName="John"
        setCustomerName={setCustomerName}
        handleSubmit={handleSubmit}
        clearCart={clearCart}
      />
    );

    // Change quantity input
    fireEvent.change(screen.getByDisplayValue('2'), { target: { value: '4' } });
    expect(handleQuantityChange).toHaveBeenCalledWith('1', '4');

    // Change customer name
    fireEvent.change(screen.getByPlaceholderText('Enter customer name'), { target: { value: 'Alice' } });
    expect(setCustomerName).toHaveBeenCalledWith('Alice');

    // Click Submit Sale
    fireEvent.click(screen.getByText('Submit Sale'));
    expect(handleSubmit).toHaveBeenCalled();

    // Click Clear Cart
    fireEvent.click(screen.getByText('Clear Cart'));
    expect(clearCart).toHaveBeenCalled();
  });
});
