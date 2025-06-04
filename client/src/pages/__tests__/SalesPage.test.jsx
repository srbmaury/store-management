import { render } from '@testing-library/react';
import SalesPage from '../SalesPage';
import { AuthContext } from '../../context/AuthContext';
import { SalesContext } from '../../context/SalesContext';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import API from '../../utils/api';

export function renderSalesPage({
    authValue = { user: { role: 'admin' }, logout: vi.fn() },
    salesValue = {
        setSalesHistory: vi.fn(),
        salesPage: 1,
        setSalesPage: vi.fn(),
        salesLimit: 10,
        setSalesTotalPages: vi.fn(),
    },
} = {}) {
    return render(
        <AuthContext.Provider value={authValue}>
            <SalesContext.Provider value={salesValue}>
                <MemoryRouter>
                    <SalesPage />
                </MemoryRouter>
            </SalesContext.Provider>
        </AuthContext.Provider>
    );
}

vi.mock('../../utils/api', () => ({
    __esModule: true,
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

vi.mock('react-toastify', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
        info: vi.fn(),
    },
}));

// helper delay function for async mocking
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('SalesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading spinner initially', async () => {
        // Mock API.get to simulate delayed response
        API.get.mockImplementation((url) => {
            if (url.startsWith('/inventory')) {
                return delay(100).then(() => ({
                    data: { items: [] }
                }));
            }
            if (url.startsWith('/sales')) {
                return delay(100).then(() => ({
                    data: { sales: [], totalPages: 1 }
                }));
            }
            return Promise.resolve({ data: {} });
        });

        renderSalesPage();

        expect(screen.getByText(/loading sales/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText(/loading sales/i)).not.toBeInTheDocument();
        });

        expect(screen.getByText(/sales entry/i)).toBeInTheDocument();
    });

    it('renders after loading with admin user', async () => {
        API.get.mockResolvedValueOnce({ data: { items: [] } });
        API.get.mockResolvedValueOnce({ data: { sales: [], totalPages: 1 } });

        renderSalesPage();

        await waitFor(() =>
            expect(screen.queryByText(/loading sales/i)).not.toBeInTheDocument()
        );

        expect(screen.getByText(/back to dashboard/i)).toBeInTheDocument();
    });

    it('renders staff buttons when role is staff', async () => {
        API.get.mockResolvedValueOnce({ data: { items: [] } });
        API.get.mockResolvedValueOnce({ data: { sales: [], totalPages: 1 } });

        renderSalesPage({
            authValue: {
                user: { role: 'staff' },
                logout: vi.fn(),
            },
        });

        await waitFor(() =>
            expect(screen.queryByText(/loading sales/i)).not.toBeInTheDocument()
        );

        expect(screen.getByText(/sales history/i)).toBeInTheDocument();
        expect(screen.getByText(/logout/i)).toBeInTheDocument();
    });
});
