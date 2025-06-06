import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { it, expect, describe, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import InventoryPage from '../InventoryPage';
import API from '../../utils/api';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

// Mock API methods
vi.mock('../../utils/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('../utils/Spinner', () => () => <div>Loading Spinner...</div>);
vi.mock('xlsx', () => ({
    read: vi.fn(() => ({
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
    })),
    utils: {
        sheet_to_json: vi.fn(() => [
            { sku: 'sku1', name: 'Test Item', price: 100, stock: 5, category: 'Cat1' },
        ]),
    },
}));

const renderWithRouter = (ui, options) =>
    render(<MemoryRouter>{ui}</MemoryRouter>, options);

describe('InventoryPage', () => {
    const mockItems = [
        { _id: '1', name: 'Item A', sku: 'SKU001', price: 100, stock: 10, category: 'Electronics' },
        { _id: '2', name: 'Item B', sku: 'SKU002', price: 50, stock: 5, category: 'Toys' },
    ];

    beforeEach(() => {
        API.get.mockReset();
        API.get.mockResolvedValue({
            data: {
                items: mockItems,
                totalPages: 1,
            },
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders inventory items after fetch', async () => {
        renderWithRouter(<InventoryPage />);

        expect(screen.getByText(/Loading Inventory/)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Item A')).toBeInTheDocument();
            expect(screen.getByText('Item B')).toBeInTheDocument();
        });
    });

    it('shows toast error if API.get fails with error', async () => {
        API.get.mockRejectedValueOnce(new Error('API failed'));

        renderWithRouter(<InventoryPage />);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to fetch inventory');
        });
    });

    it('opens form and adds a new item', async () => {
        // Mock initial GET inventory fetch to return some items
        API.get.mockResolvedValueOnce({
            data: {
                items: [
                    { _id: '1', name: 'Item A', sku: 'SKU001', price: 50, stock: 5, category: 'Electronics' },
                    { _id: '2', name: 'Item B', sku: 'SKU002', price: 100, stock: 10, category: 'Clothing' },
                ],
                totalPages: 1,
            },
        });

        // Mock POST to add item
        API.post.mockResolvedValueOnce({
            data: {
                _id: '3',
                name: 'Item C',
                sku: 'SKU003',
                price: 200,
                stock: 20,
                category: 'Books',
            },
        });

        // Mock GET again after adding new item (optional)
        API.get.mockResolvedValueOnce({
            data: {
                items: [
                    { _id: '1', name: 'Item A', sku: 'SKU001', price: 50, stock: 5, category: 'Electronics' },
                    { _id: '2', name: 'Item B', sku: 'SKU002', price: 100, stock: 10, category: 'Clothing' },
                    { _id: '3', name: 'Item C', sku: 'SKU003', price: 200, stock: 20, category: 'Books' },
                ],
                totalPages: 1,
            },
        });

        renderWithRouter(<InventoryPage />);

        // Wait for initial data to load
        await waitFor(() => screen.getByText('Item A'));

        // Open form
        await userEvent.click(screen.getByText(/Add New Item/i));

        // Fill inputs (await each type for stability)
        await userEvent.type(screen.getByLabelText(/Name/i), 'Item C');
        await userEvent.type(screen.getByLabelText(/SKU/i), 'SKU003');
        await userEvent.type(screen.getByLabelText(/Price/i), '200');
        await userEvent.type(screen.getByLabelText(/Stock/i), '20');
        await userEvent.type(screen.getByLabelText(/Category/i), 'Books');

        // Find the Add button inside the form by role and text
        const addButton = screen.getByRole('button', { name: /^Add$/i });

        await userEvent.click(addButton);

        // Wait for API.post to be called
        await waitFor(() => {
            expect(API.post).toHaveBeenCalledTimes(1);
            expect(API.post).toHaveBeenCalledWith('/inventory', expect.objectContaining({
                name: 'Item C',
                sku: 'SKU003',
                price: 200,
                stock: 20,
                category: 'Books',
            }));
        });
    });

    it('adds stock to existing SKU instead of creating a new item', async () => {
        // Mock initial GET
        API.get.mockResolvedValueOnce({
            data: {
                items: [
                    { _id: '1', name: 'Item A', sku: 'SKU001', price: 100, stock: 10, category: 'Electronics' },
                ],
                totalPages: 1,
            },
        });

        // Mock PUT to update existing item with incremented stock
        API.put.mockResolvedValueOnce({
            data: {
                _id: '1',
                name: 'Item A',
                sku: 'SKU001',
                price: 100,
                stock: 15, // updated from 10 to 15
                category: 'Electronics',
            },
        });

        // Mock GET after update
        API.get.mockResolvedValueOnce({
            data: {
                items: [
                    { _id: '1', name: 'Item A', sku: 'SKU001', price: 100, stock: 15, category: 'Electronics' },
                ],
                totalPages: 1,
            },
        });

        renderWithRouter(<InventoryPage />);

        await waitFor(() => screen.getByText('Item A'));

        await userEvent.click(screen.getByText(/Add New Item/i));

        // Fill the form with same SKU but additional stock
        await userEvent.type(screen.getByLabelText(/Name/i), 'Item A');
        await userEvent.type(screen.getByLabelText(/SKU/i), 'SKU001'); // same SKU
        await userEvent.type(screen.getByLabelText(/Price/i), '100'); // same price
        await userEvent.type(screen.getByLabelText(/Stock/i), '5'); // additional stock
        await userEvent.type(screen.getByLabelText(/Category/i), 'Electronics');

        await userEvent.click(screen.getByRole('button', { name: /^Add$/i }));

        await waitFor(() => {
            expect(API.put).toHaveBeenCalledTimes(1);
            expect(API.put).toHaveBeenCalledWith(
                '/inventory/1',
                expect.objectContaining({
                    sku: 'SKU001',
                    stock: 15, // existing 10 + new 5
                })
            );
            expect(toast.success).toHaveBeenCalledWith('SKU exists - Stock added and item updated');
        });
    });

    it('shows error if POST fails for new item', async () => {
        API.get.mockResolvedValueOnce({
            data: {
                items: [], // No matching SKU
                totalPages: 1,
            },
        });

        API.post.mockRejectedValueOnce({
            response: {
                data: { message: 'Create failed' },
            },
        });

        renderWithRouter(<InventoryPage />);

        await waitFor(() => screen.getByText(/Add New Item/i));

        await userEvent.click(screen.getByText(/Add New Item/i));
        await userEvent.type(screen.getByLabelText(/Name/i), 'Item X');
        await userEvent.type(screen.getByLabelText(/SKU/i), 'SKU999');
        await userEvent.type(screen.getByLabelText(/Price/i), '123');
        await userEvent.type(screen.getByLabelText(/Stock/i), '8');
        await userEvent.type(screen.getByLabelText(/Category/i), 'Misc');

        await userEvent.click(screen.getByRole('button', { name: /^Add$/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Save failed: Create failed');
        });
    });

    it('shows error if POST fails for new item but no error is thrown', async () => {
        API.get.mockResolvedValueOnce({
            data: {
                items: [], // No matching SKU
                totalPages: 1,
            },
        });

        API.post.mockRejectedValueOnce({
            response: {
                data: ''
            },
        });

        renderWithRouter(<InventoryPage />);

        await waitFor(() => screen.getByText(/Add New Item/i));

        await userEvent.click(screen.getByText(/Add New Item/i));
        await userEvent.type(screen.getByLabelText(/Name/i), 'Item X');
        await userEvent.type(screen.getByLabelText(/SKU/i), 'SKU999');
        await userEvent.type(screen.getByLabelText(/Price/i), '123');
        await userEvent.type(screen.getByLabelText(/Stock/i), '8');
        await userEvent.type(screen.getByLabelText(/Category/i), 'Misc');

        await userEvent.click(screen.getByRole('button', { name: /^Add$/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Save failed: Unknown error');
        });
    });

    it('edits an existing item', async () => {
        // Mock initial GET inventory
        API.get.mockResolvedValueOnce({
            data: {
                items: [
                    {
                        _id: '1',
                        name: 'Item A',
                        sku: 'SKU001',
                        price: 100,
                        stock: 10,
                        category: 'Electronics',
                    },
                ],
                totalPages: 1,
            },
        });

        // Mock PUT request for update
        API.put.mockResolvedValueOnce({
            data: {
                _id: '1',
                name: 'Item A Updated',
                sku: 'SKU001',
                price: 120,
                stock: 15,
                category: 'Electronics',
            },
        });

        // Mock second GET after PUT to reflect updated item
        API.get.mockResolvedValueOnce({
            data: {
                items: [
                    {
                        _id: '1',
                        name: 'Item A Updated',
                        sku: 'SKU001',
                        price: 120,
                        stock: 15,
                        category: 'Electronics',
                    },
                ],
                totalPages: 1,
            },
        });

        renderWithRouter(<InventoryPage />);

        // Wait for the item to appear
        await waitFor(() => screen.getByText('Item A'));

        // Click the first Edit button
        await userEvent.click(screen.getAllByText(/Edit/i)[0]);

        // Update the name input
        const nameInput = screen.getByLabelText(/Name/i);
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Item A Updated');

        // Update the price input
        const priceInput = screen.getByLabelText(/Price/i);
        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, '120');

        // Update the stock input
        const stockInput = screen.getByLabelText(/Stock/i);
        await userEvent.clear(stockInput);
        await userEvent.type(stockInput, '15');

        // Click the Update button
        await userEvent.click(screen.getByRole('button', { name: /Update/i }));

        // Assert API.put was called correctly
        await waitFor(() => {
            expect(API.put).toHaveBeenCalledTimes(1);
            expect(API.put).toHaveBeenCalledWith(
                '/inventory/1',
                expect.objectContaining({
                    name: 'Item A Updated',
                    sku: 'SKU001',
                    price: 120,
                    stock: 15,
                    category: 'Electronics',
                })
            );
        });

        // Verify updated name appears in UI
        await waitFor(() => {
            expect(screen.getByText('Item A Updated')).toBeInTheDocument();
        });
    });

    it('shows error if SKU exists but PUT fails', async () => {
        API.get.mockResolvedValueOnce({
            data: {
                items: [{ _id: '1', name: 'Item A', sku: 'SKU001', price: 100, stock: 5, category: 'Toys' }],
                totalPages: 1,
            },
        });

        API.put.mockRejectedValueOnce({
            response: {
                data: { message: 'Update failed due to server error' },
            },
        });

        renderWithRouter(<InventoryPage />);

        await waitFor(() => screen.getByText('Item A'));

        await userEvent.click(screen.getByText(/Add New Item/i));
        await userEvent.type(screen.getByLabelText(/Name/i), 'Item A');
        await userEvent.type(screen.getByLabelText(/SKU/i), 'SKU001');
        await userEvent.type(screen.getByLabelText(/Price/i), '100');
        await userEvent.type(screen.getByLabelText(/Stock/i), '10');
        await userEvent.type(screen.getByLabelText(/Category/i), 'Toys');

        await userEvent.click(screen.getByRole('button', { name: /^Add$/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Save failed: Update failed due to server error');
        });
    });

    it('deletes an item after confirmation', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        API.delete.mockResolvedValue({});

        renderWithRouter(<InventoryPage />);

        await waitFor(() => screen.getByText('Item A'));

        userEvent.click(screen.getAllByText(/Delete/i)[0]);

        await waitFor(() => {
            expect(API.delete).toHaveBeenCalledWith('/inventory/1');
        });

        window.confirm.mockRestore();
    });

    it('does not delete if confirmation is cancelled', async () => {
        window.confirm = vi.fn(() => false); // Simulate user clicking "Cancel"

        API.get.mockResolvedValueOnce({
            data: { items: [{ _id: '1', name: 'Item A', sku: 'SKU001', stock: 10, price: 100, category: 'Toys' }], totalPages: 1 }
        });

        renderWithRouter(<InventoryPage />);

        await waitFor(() => screen.getByText('Item A'));

        const deleteBtn = screen.getByRole('button', { name: /delete/i });
        await userEvent.click(deleteBtn);

        expect(API.delete).not.toHaveBeenCalled();
        expect(toast.success).not.toHaveBeenCalled();
    });

    it('shows error toast on delete failure', async () => {
        window.confirm = vi.fn(() => true);

        API.get.mockResolvedValueOnce({
            data: { items: [{ _id: '1', name: 'Item A', sku: 'SKU001', stock: 10, price: 100, category: 'Toys' }], totalPages: 1 }
        });

        API.delete.mockRejectedValueOnce(new Error('Server error'));

        renderWithRouter(<InventoryPage />);

        await waitFor(() => screen.getByText('Item A'));

        const deleteBtn = screen.getByRole('button', { name: /delete/i });
        await userEvent.click(deleteBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Delete failed');
        });
    });

    it('handles delete gracefullty when no error is thrown', async () => {
        window.confirm = vi.fn(() => true);

        API.get.mockResolvedValueOnce({
            data: { items: [{ _id: '1', name: 'Item A', sku: 'SKU001', stock: 10, price: 100, category: 'Toys' }], totalPages: 1 }
        });

        API.delete.mockRejectedValueOnce();

        renderWithRouter(<InventoryPage />);

        await waitFor(() => screen.getByText('Item A'));

        const deleteBtn = screen.getByRole('button', { name: /delete/i });
        await userEvent.click(deleteBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Unknown error occurred');
        });
    });

    it('filters items using search inputs', async () => {
        renderWithRouter(<InventoryPage />);

        await waitFor(() => screen.getByText('Item A'));

        const searchInput = screen.getByPlaceholderText(/Search by name/i);
        fireEvent.change(searchInput, { target: { value: 'Laptop' } });

        await waitFor(() => {
            expect(API.get).toHaveBeenCalledWith('/inventory', expect.objectContaining({
                params: expect.objectContaining({ search: 'Laptop' }),
            }));
        });
    });

    it('filters items by category input', async () => {
        renderWithRouter(<InventoryPage />);

        await waitFor(() => screen.getByText('Item A'));

        const categoryInput = screen.getByPlaceholderText(/Category/i);
        fireEvent.change(categoryInput, { target: { value: 'Electronics' } });

        await waitFor(() => {
            expect(API.get).toHaveBeenCalledWith(
                '/inventory',
                expect.objectContaining({
                    params: expect.objectContaining({ category: 'Electronics' }),
                })
            );
        });
    });

    it('filters items by minStock and maxStock inputs', async () => {
        renderWithRouter(<InventoryPage />);

        await waitFor(() => screen.getByText('Item A'));

        const minStockInput = screen.getByPlaceholderText(/Min Stock/i);
        const maxStockInput = screen.getByPlaceholderText(/Max Stock/i);

        // Change minStock input
        fireEvent.change(minStockInput, { target: { value: '5' } });

        // Change maxStock input
        fireEvent.change(maxStockInput, { target: { value: '20' } });

        await waitFor(() => {
            expect(API.get).toHaveBeenCalledWith(
                '/inventory',
                expect.objectContaining({
                    params: expect.objectContaining({ minStock: '5', maxStock: '20' }),
                })
            );
        });
    });

    it('updates existing items and creates new items from Excel upload', async () => {
        // Mock API.put and API.post for updating/creating inventory
        API.put.mockResolvedValue({
            data: { _id: '1', sku: 'SKU001', stock: 15, name: 'Item A', price: 100, category: 'Electronics' },
        });

        API.post.mockResolvedValue({
            data: { _id: '3', sku: 'SKU003', stock: 7, name: 'Item C', price: 30, category: 'Books' },
        });

        // Mock XLSX.read and sheet_to_json
        XLSX.read.mockReturnValue({
            SheetNames: ['Sheet1'],
            Sheets: {
                Sheet1: 'mockSheet',
            },
        });

        XLSX.utils.sheet_to_json.mockReturnValue([
            { sku: 'SKU001', stock: 5, name: 'Item A', price: 100, category: 'Electronics' }, // existing SKU001, update stock +5
            { sku: 'SKU003', stock: 7, name: 'Item C', price: 30, category: 'Books' },       // new SKU003, create
        ]);

        // Render component
        renderWithRouter(<InventoryPage />);

        // Wait for initial load (API.get)
        await waitFor(() => {
            expect(API.get).toHaveBeenCalled();
            expect(screen.getByText('Item A')).toBeInTheDocument();
            expect(screen.getByText('Item B')).toBeInTheDocument();
        });

        // Get file input and create mock file
        const fileInput = screen.getByTestId('excel-upload-input');
        const file = new File(['dummy'], 'inventory.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        file.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8));

        // Simulate uploading Excel file
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Wait for API calls from Excel upload
        await waitFor(() => {
            // Update existing SKU001
            expect(API.put).toHaveBeenCalledWith(
                expect.stringContaining('/inventory/1'),
                expect.objectContaining({
                    sku: 'SKU001',
                    stock: 15, // original 10 + 5 from Excel
                })
            );

            // Create new SKU003
            expect(API.post).toHaveBeenCalledWith(
                '/inventory',
                expect.objectContaining({
                    sku: 'SKU003',
                    stock: 7,
                })
            );

            // Toast success called
            expect(toast.success).toHaveBeenCalledWith('Inventory updated from Excel');
        });
    });

    it('shows unknown error toast if error is falsy', async () => {
        API.get.mockRejectedValueOnce(undefined);

        renderWithRouter(<InventoryPage />);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Unknown error occurred');
        });
    });

    it('shows error toast if Excel parsing fails', async () => {
        // Make XLSX.read throw an error
        XLSX.read.mockImplementation(() => {
            throw new Error('Invalid Excel file');
        });

        // Create mock file
        const file = new File(['dummy'], 'bad.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        file.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8));

        // Render component
        renderWithRouter(<InventoryPage />);

        // Wait for initial load
        await waitFor(() => expect(API.get).toHaveBeenCalled());

        // Upload the bad file
        const fileInput = screen.getByTestId('excel-upload-input');
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Wait for error toast
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Invalid Excel file');
        });
    });

    it('paginates items correctly', async () => {
        const mockItemsPage1 = Array.from({ length: 5 }, (_, i) => ({ _id: `id${i + 1}`, name: `Item ${i + 1}` }));
        const mockItemsPage2 = Array.from({ length: 5 }, (_, i) => ({ _id: `id${i + 6}`, name: `Item ${i + 6}` }));

        // Mock first page response
        API.get.mockResolvedValueOnce({
            data: { items: mockItemsPage1, totalPages: 2 }
        });

        renderWithRouter(<InventoryPage />);

        // Wait for first page items to appear
        await waitFor(() => expect(screen.getByText('Item 1')).toBeInTheDocument());

        // Verify page 1 info and button states
        expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /Next/i })).toBeEnabled();

        // Mock second page response when Next is clicked
        API.get.mockResolvedValueOnce({
            data: { items: mockItemsPage2, totalPages: 2 }
        });

        // Click Next page button
        fireEvent.click(screen.getByRole('button', { name: /Next/i }));

        // Wait for second page items
        await waitFor(() => expect(screen.getByText('Item 6')).toBeInTheDocument());

        // Verify page 2 info and button states
        expect(screen.getByText(/Page 2 of 2/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Previous/i })).toBeEnabled();
        expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();

        // Mock first page response again when Previous is clicked
        API.get.mockResolvedValueOnce({
            data: { items: mockItemsPage1, totalPages: 2 }
        });

        // Click Previous page button
        fireEvent.click(screen.getByRole('button', { name: /Previous/i }));

        // Wait for first page items again
        await waitFor(() => expect(screen.getByText('Item 1')).toBeInTheDocument());

        // Verify back to page 1
        expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /Next/i })).toBeEnabled();
    });
});