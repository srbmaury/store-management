import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SalesHistoryPage from '../SalesHistoryPage';
import API from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { SalesContext } from '../../context/SalesContext';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';

// Create a jest-style mock for navigate
const navigateMock = vi.fn();

// Mock API.get
vi.mock('../../utils/api', () => ({
    default: {
        get: vi.fn(),
    },
}));

// Mock react-router-dom, preserving actual exports (including MemoryRouter)
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useSearchParams: () => [{ get: () => '2' }],
        useNavigate: () => navigateMock,
        useParams: () => ({ storeId: 'test-store' }),
    };
});

// Mock useDebounce to return its input immediately
vi.mock('../../utils/useDebounce', () => ({
    useDebounce: (val) => val,
}));

// Mock SalesHistory child component
vi.mock('../helper/SalesHistory', () => ({
    default: ({ salesHistory }) => (
        <div data-testid="sales-list">{JSON.stringify(salesHistory)}</div>
    ),
}));

vi.spyOn(toast, 'error').mockImplementation(() => {});

describe('SalesHistoryPage', () => {
    const mockSalesData = {
        sales: [
            { _id: 'a1', customer: 'Alice', total: 100 },
            { _id: 'b2', customer: 'Bob', total: 50 },
        ],
        totalPages: 3,
    };

    let mockSetSalesHistory;
    let mockSetSalesPage;
    let mockSetSalesTotalPages;
    let mockSetCustomerSearch;

    beforeEach(() => {
        vi.clearAllMocks();

        // Spies for SalesContext setters
        mockSetSalesHistory = vi.fn();
        mockSetSalesPage = vi.fn();
        mockSetSalesTotalPages = vi.fn();
        mockSetCustomerSearch = vi.fn();

        // API.get resolves with mockSalesData
        API.get.mockResolvedValue({ data: mockSalesData });
    });

    const renderWithContexts = (userRole = 'staff') => {
        const authValue = { user: { role: userRole } };
        const salesContextValue = {
            salesHistory: [],
            setSalesHistory: mockSetSalesHistory,
            salesPage: 2, // initial from useSearchParams()
            setSalesPage: mockSetSalesPage,
            salesLimit: 10,
            salesTotalPages: 5,
            setSalesTotalPages: mockSetSalesTotalPages,
            customerSearch: '',
            setCustomerSearch: mockSetCustomerSearch,
        };

        return render(
            <AuthContext.Provider value={authValue}>
                <SalesContext.Provider value={salesContextValue}>
                    <MemoryRouter>
                        <SalesHistoryPage />
                    </MemoryRouter>
                </SalesContext.Provider>
            </AuthContext.Provider>
        );
    };

    it('shows loading spinner then loads and displays sales data', async () => {
        API.get.mockResolvedValueOnce({ data: mockSalesData });

        // Use state in test to simulate context behavior
        function Wrapper() {
            const [salesHistory, setSalesHistory] = useState([]);
            const [salesPage, setSalesPage] = useState(1);
            const [salesTotalPages, setSalesTotalPages] = useState(1);
            const [customerSearch, setCustomerSearch] = useState('');
            const salesLimit = 10;

            return (
                <AuthContext.Provider value={{ user: { role: 'staff' } }}>
                    <SalesContext.Provider
                        value={{
                            salesHistory,
                            setSalesHistory,
                            salesPage,
                            setSalesPage,
                            salesLimit,
                            salesTotalPages,
                            setSalesTotalPages,
                            customerSearch,
                            setCustomerSearch,
                        }}
                    >
                        <MemoryRouter>
                            <SalesHistoryPage />
                        </MemoryRouter>
                    </SalesContext.Provider>
                </AuthContext.Provider>
            );
        }

        render(<Wrapper />);

        // Wait for spinner to disappear
        await waitFor(() =>
            expect(screen.queryByText('Loading Sales...')).not.toBeInTheDocument()
        );
        // Wait for loading spinner to disappear and sales list to appear
        await waitFor(() => {
            expect(screen.getByTestId('sales-list')).toBeInTheDocument();
        });

        expect(screen.getByTestId('sales-list')).toHaveTextContent('Alice');
    });

    it('shows error toast when fetchSales fails', async () => {
        API.get.mockRejectedValueOnce({
            response: { data: { message: 'Mock error fetching sales' } },
        });

        renderWithContexts('admin');

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Mock error fetching sales');
        });
    });

    it('shows error toast when fetchSales fails with no error message', async () => {
        API.get.mockRejectedValueOnce({
            response: { data: '' },
        });

        renderWithContexts('admin');

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Server error');
        });
    });

    it('navigates back to dashboard for admin, sales page for staff', async () => {
        renderWithContexts('admin');
        await waitFor(() => expect(API.get).toHaveBeenCalled());

        const backAdmin = screen.getByRole('button', { name: /← Back to Dashboard/i });
        fireEvent.click(backAdmin);
        expect(navigateMock).toHaveBeenCalledWith('/dashboard/test-store'); // <-- UPDATED

        vi.clearAllMocks();

        renderWithContexts('staff');
        await waitFor(() => expect(API.get).toHaveBeenCalled());

        const backStaff = screen.getByRole('button', { name: /← Sales Page/i });
        fireEvent.click(backStaff);
        expect(navigateMock).toHaveBeenCalledWith('/sales/test-store'); // <-- UPDATED
    });

    it('updates search input and calls setCustomerSearch', async () => {
        renderWithContexts();
        await waitFor(() => expect(API.get).toHaveBeenCalled());

        const searchInput = screen.getByPlaceholderText('Search customer...');
        fireEvent.change(searchInput, { target: { value: 'Charlie' } });

        expect(mockSetCustomerSearch).toHaveBeenCalledWith('Charlie');
    });

    it('prev/next buttons call setSalesPage correctly', async () => {
        renderWithContexts();
        await waitFor(() => expect(API.get).toHaveBeenCalled());

        // Previous page button (current page = 2)
        const prevButton = screen.getByRole('button', { name: /⬅ Prev/i });
        fireEvent.click(prevButton);
        expect(mockSetSalesPage).toHaveBeenCalledWith(expect.any(Function));

        // Next page button
        const nextButton = screen.getByRole('button', { name: /Next ➡/i });
        fireEvent.click(nextButton);
        expect(mockSetSalesPage).toHaveBeenCalledWith(expect.any(Function));
    });
});
