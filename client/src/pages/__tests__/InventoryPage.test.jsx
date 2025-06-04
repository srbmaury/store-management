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
});