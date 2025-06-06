import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { it, expect, describe, beforeEach, vi } from 'vitest';
import MyStoresPage from '../MyStores';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../utils/api');
vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    }
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await import('react-router-dom');
    return {
        __esModule: true,
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockLogout = vi.fn();

const renderComponent = (user = { name: 'John Doe' }) => {
    return render(
        <AuthContext.Provider value={{ user, logout: mockLogout }}>
            <MemoryRouter>
                <MyStoresPage />
            </MemoryRouter>
        </AuthContext.Provider>
    );
};

describe('MyStoresPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows loading spinner initially and fetches stores successfully', async () => {
        API.get.mockResolvedValueOnce({
            data: {
                stores: [
                    { _id: '1', name: 'Store 1', address: 'Addr 1' },
                    { _id: '2', name: 'Store 2', address: 'Addr 2' },
                ],
            },
        });

        renderComponent();

        expect(screen.getByRole('status')).toBeInTheDocument(); // loading spinner

        await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });

        expect(screen.getByText('Store Name: Store 1')).toBeInTheDocument();
        expect(screen.getByText('Address: Addr 1')).toBeInTheDocument();
        expect(screen.getByText('Store Name: Store 2')).toBeInTheDocument();
    });

    it('shows error toast if fetch stores fails', async () => {
        API.get.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'Unauthorized access',
                },
            },
        });

        renderComponent();

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Unauthorized access');
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });
    });

    it('shows error toast if fetch stores fails and no error is thrown', async () => {
        API.get.mockRejectedValueOnce();

        renderComponent();

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to load stores');
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });
    });

    it('displays user name and logout button, clicking logout calls logout and navigates', async () => {
        API.get.mockResolvedValueOnce({ data: { stores: [] } });

        renderComponent();

        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        expect(screen.getByText(/Welcome, John Doe/i)).toBeInTheDocument();

        const logoutBtn = screen.getByRole('button', { name: /logout/i });
        fireEvent.click(logoutBtn);

        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('toggles create store form when create store button is clicked', async () => {
        API.get.mockResolvedValueOnce({ data: { stores: [] } });

        renderComponent();

        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        const toggleBtn = screen.getByRole('button', { name: /create store/i });
        expect(screen.queryByRole('form')).not.toBeInTheDocument();

        fireEvent.click(toggleBtn);

        expect(screen.getByLabelText(/Store Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Address/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();

        // Cancel toggles form off
        fireEvent.click(toggleBtn);
        expect(screen.queryByRole('form')).not.toBeInTheDocument();
    });

    it('successfully creates a store and resets form', async () => {
        API.get.mockResolvedValueOnce({ data: { stores: [] } });
        API.post.mockResolvedValueOnce({
            data: { _id: '3', name: 'New Store', address: 'New Addr' },
        });

        renderComponent();

        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        // Open create form
        fireEvent.click(screen.getByRole('button', { name: /create store/i }));

        // Fill form inputs
        fireEvent.change(screen.getByLabelText(/store name/i), { target: { value: 'New Store' } });
        fireEvent.change(screen.getByLabelText(/address/i), { target: { value: 'New Addr' } });

        fireEvent.click(screen.getByRole('button', { name: /submit/i }));

        await waitFor(() => {
            expect(API.post).toHaveBeenCalledWith('/stores', {
                name: 'New Store',
                address: 'New Addr',
            });
            expect(toast.success).toHaveBeenCalledWith('Store created successfully!');
        });

        // Form closed and inputs cleared
        expect(screen.queryByLabelText(/store name/i)).not.toBeInTheDocument();

        // New store is in the list
        expect(screen.getByText(/store name: new store/i)).toBeInTheDocument();
    });

    it('shows error toast on create store failure', async () => {
        API.get.mockResolvedValueOnce({ data: { stores: [] } });
        API.post.mockRejectedValueOnce({
            response: { data: { message: 'Creation error' } },
        });

        renderComponent();

        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: /create store/i }));

        fireEvent.change(screen.getByLabelText(/store name/i), { target: { value: 'Fail Store' } });
        fireEvent.change(screen.getByLabelText(/address/i), { target: { value: 'Fail Addr' } });

        fireEvent.click(screen.getByRole('button', { name: /submit/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Creation error');
        });
    });

    it('shows error toast on create store failure when no error is thrown', async () => {
        API.get.mockResolvedValueOnce({ data: { stores: [] } });
        API.post.mockRejectedValueOnce({
            response: { data: '' },
        });

        renderComponent();

        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: /create store/i }));

        fireEvent.change(screen.getByLabelText(/store name/i), { target: { value: 'Fail Store' } });
        fireEvent.change(screen.getByLabelText(/address/i), { target: { value: 'Fail Addr' } });

        fireEvent.click(screen.getByRole('button', { name: /submit/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to create store.');
        });
    });

    it('shows "No stores found." if stores list is empty', async () => {
        API.get.mockResolvedValueOnce({ data: { stores: [] } });

        renderComponent();

        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        expect(screen.getByText(/no stores found\./i)).toBeInTheDocument();
    });

    it('navigates to dashboard when clicking a store', async () => {
        API.get.mockResolvedValueOnce({
            data: {
                stores: [{ _id: '123', name: 'Clickable Store', address: 'Addr 123' }],
            },
        });

        renderComponent();

        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        fireEvent.click(screen.getByText(/store name: clickable store/i).closest('div'));

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/123');
    });

    it('shows "User" if user name is not present', async () => {
        API.get.mockResolvedValueOnce({ data: { stores: [] } });

        render(
            <AuthContext.Provider value={{ user: null, logout: mockLogout }}>
                <MemoryRouter>
                    <MyStoresPage />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        expect(screen.getByText(/welcome, user/i)).toBeInTheDocument();
    });
});
