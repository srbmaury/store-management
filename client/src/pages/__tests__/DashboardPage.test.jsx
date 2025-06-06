import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '../DashboardPage';
import API from '../../utils/api';
import { toast } from 'react-toastify';

// Mock subcomponents (simplify test focus)
vi.mock('../helper/DashboardLayout', () => ({
    default: ({ children }) => <div data-testid="dashboard-layout">{children}</div>,
}));

vi.mock('../charts/KPICards', () => ({
    default: () => <div data-testid="kpi-cards" />,
}));

vi.mock('../charts/RecentSalesTable', () => ({
    default: () => <div data-testid="recent-sales-table" />,
}));

vi.mock('../charts/LowStockAlert', () => ({
    default: () => <div data-testid="low-stock-alert" />,
}));

vi.mock('../charts/Chart', () => ({
    default: () => <div data-testid="chart" />,
}));

vi.mock('../../utils/Spinner', () => ({
    default: ({ text }) => <div data-testid="spinner">{text}</div>,
}));

vi.mock('../../utils/api');
vi.mock('react-toastify', () => ({
    toast: { error: vi.fn() },
}));

describe('DashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading spinner initially', () => {
        // Ensure API.get is unresolved to simulate loading
        API.get.mockImplementation(() => new Promise(() => { }));
        render(<DashboardPage />);
        expect(screen.getByTestId('spinner')).toHaveTextContent('Loading Dashboard...');
    });

    it('fetches inventory and sales data and renders subcomponents', async () => {
        const mockInventory = { items: [{ _id: 'i1', stock: 10, category: 'Cat1' }] };
        const mockSales = {
            sales: [
                {
                    _id: 's1',
                    totalAmount: 100,
                    createdAt: new Date().toISOString(),
                    date: new Date().toISOString(),
                    items: [{ item: { _id: 'i1', name: 'Item1', category: 'Cat1', price: 50 }, quantity: 2 }],
                },
            ],
        };

        API.get.mockImplementation((url) => {
            if (url === '/inventory') return Promise.resolve({ data: mockInventory });
            if (url === '/sales') return Promise.resolve({ data: mockSales });
            return Promise.reject(new Error('Unknown endpoint'));
        });

        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
        });

        // Check main layout and subcomponents rendered
        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
        expect(screen.getByTestId('kpi-cards')).toBeInTheDocument();
        expect(screen.getByTestId('recent-sales-table')).toBeInTheDocument();
        expect(screen.getByTestId('low-stock-alert')).toBeInTheDocument();
        expect(screen.getAllByTestId('chart').length).toBe(5); // 5 charts rendered
    });

    it('handles API failure and shows toast error', async () => {
        API.get.mockRejectedValue(new Error('Failed to fetch'));
        render(<DashboardPage />);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to fetch');
        });

        // Spinner disappears after error
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    });

    it('handles API failure gracefully when no error is thrown', async () => {
        API.get.mockRejectedValue();
        render(<DashboardPage />);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to fetch dashboard data');
        });

        // Spinner disappears after error
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    });
});
