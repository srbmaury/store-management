import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { within } from '@testing-library/react';
import Items from '../Items';

const groupedInventory = {
  Electronics: [
    { _id: '1', name: 'Laptop', price: 50000, stock: 5 },
    { _id: '2', name: 'Phone', price: 20000, stock: 0 }, // out of stock
  ],
  Groceries: [
    { _id: '3', name: 'Apple', price: 100, stock: 10 },
    { _id: '4', name: 'Banana', price: 50, stock: 3 },
  ],
};

describe('Items component', () => {
  let handleAddItem, handleDecreaseItem;

  beforeEach(() => {
    handleAddItem = vi.fn();
    handleDecreaseItem = vi.fn();
  });

  it('renders categories and items', () => {
    render(
      <Items
        groupedInventory={groupedInventory}
        selectedItems={[]}
        handleAddItem={handleAddItem}
        handleDecreaseItem={handleDecreaseItem}
      />
    );

    expect(screen.getByText('Select Items')).toBeInTheDocument();

    // Categories
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();

    // Items
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('filters items based on search input', async () => {
    render(
      <Items
        groupedInventory={groupedInventory}
        selectedItems={[]}
        handleAddItem={handleAddItem}
        handleDecreaseItem={handleDecreaseItem}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search items/i);

    await userEvent.type(searchInput, 'lap');

    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.queryByText('Phone')).not.toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('calls handleAddItem when Add button is clicked', async () => {
    render(
      <Items
        groupedInventory={groupedInventory}
        selectedItems={[]}
        handleAddItem={handleAddItem}
        handleDecreaseItem={handleDecreaseItem}
      />
    );

    const addButton = screen.getAllByRole('button', { name: 'Add' })[0];
    await userEvent.click(addButton);

    expect(handleAddItem).toHaveBeenCalledWith('1'); // Laptop's _id
  });

  it('shows Out of Stock and disables button for out of stock items', () => {
    render(
      <Items
        groupedInventory={groupedInventory}
        selectedItems={[]}
        handleAddItem={handleAddItem}
        handleDecreaseItem={handleDecreaseItem}
      />
    );

    const outOfStockButton = screen.getByRole('button', { name: 'Out of Stock' });

    expect(outOfStockButton).toBeDisabled();
  });

  it('displays current quantity with + and - buttons and disables + if quantity reaches stock', async () => {
    const selectedItems = [{ item: '4', quantity: 3 }]; // Banana, stock 3

    render(
      <Items
        groupedInventory={groupedInventory}
        selectedItems={selectedItems}
        handleAddItem={handleAddItem}
        handleDecreaseItem={handleDecreaseItem}
      />
    );

    // Find the specific item container (e.g. Banana, id = 4)
    const bananaCard = screen.getByText('Banana').closest('div');

    const bananaUtils = within(bananaCard);

    // Get all buttons inside the card
    const buttons = bananaUtils.getAllByRole('button');

    // Find the − and + buttons
    const minusButton = buttons.find(btn => btn.textContent === '−');
    const plusButton = buttons.find(btn => btn.textContent === '+');

    // Get the parent of the buttons (the control container)
    const quantityContainer = minusButton.parentElement;

    // Ensure the span with quantity 3 is between them
    const quantitySpan = within(quantityContainer).getByText('3');
    expect(quantitySpan).toBeInTheDocument();

    // Additionally, check the structure is correct
    expect(quantityContainer).toContainElement(minusButton);
    expect(quantityContainer).toContainElement(plusButton);
    expect(quantityContainer).toContainElement(quantitySpan);

    // Buttons
    const decreaseBtn = bananaUtils.getByRole('button', { name: '−' });
    const increaseBtn = bananaUtils.getByRole('button', { name: '+' });

    // - button should be enabled
    expect(decreaseBtn).toBeEnabled();

    // + button should be disabled (qty === stock)
    expect(increaseBtn).toBeDisabled();

    // Click decrease
    await userEvent.click(decreaseBtn);
    expect(handleDecreaseItem).toHaveBeenCalledWith('4');
  });

  it('loads more items on clicking Load more button', async () => {
    // Create 10 items in a category to test load more
    const manyItems = {
      TestCategory: Array.from({ length: 10 }, (_, i) => ({
        _id: `item${i}`,
        name: `Item ${i}`,
        price: i * 10,
        stock: 10,
      })),
    };

    render(
      <Items
        groupedInventory={manyItems}
        selectedItems={[]}
        handleAddItem={handleAddItem}
        handleDecreaseItem={handleDecreaseItem}
      />
    );

    // Initially only ITEMS_PER_PAGE(8) items visible
    expect(screen.queryByText('Item 8')).not.toBeInTheDocument();

    // Click Load more
    const loadMoreBtn = screen.getByRole('button', { name: /load more/i });
    await userEvent.click(loadMoreBtn);

    // Now the 9th item should be visible
    expect(screen.getByText('Item 8')).toBeInTheDocument();
  });
});
