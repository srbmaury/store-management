import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StoreListingPage from '../StoreListingPage';
import { AuthContext } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import API from '../../utils/api';
import userEvent from '@testing-library/user-event';

vi.mock('../../utils/api');

const mockLogout = vi.fn();
const mockUpdateUser = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('react-toastify', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

function renderComponent() {
    return render(
        <AuthContext.Provider value={{ logout: mockLogout, updateUser: mockUpdateUser }}>
            <MemoryRouter>
                <StoreListingPage />
            </MemoryRouter>
        </AuthContext.Provider>
    );
}

describe('StoreListingPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        // We don't mock API.get to delay here, so component shows loading immediately
        renderComponent();
        expect(screen.getByText(/loading stores/i)).toBeInTheDocument();
    });

    it('renders message when no stores available', async () => {
        API.get.mockImplementation((url) => {
            if (url === '/stores/available') {
                return Promise.resolve({ data: [] });
            }
            if (url === '/join-requests/my-requests') {
                return Promise.resolve({ data: [] });
            }
            return Promise.resolve({ data: [] });
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/no stores available right now/i)).toBeInTheDocument();
        });
    });

    it('renders stores with correct status badges and buttons', async () => {
        API.get.mockImplementation((url) => {
            if (url === '/stores/available') {
                return Promise.resolve({
                    data: [
                        { _id: '1', storeName: 'Store 1', name: 'Owner 1', address: 'Address 1', storeOwnerId: 'owner1' },
                        { _id: '2', storeName: 'Store 2', name: 'Owner 2', address: 'Address 2', storeOwnerId: 'owner2' },
                        { _id: '3', storeName: 'Store 3', name: 'Owner 3', address: 'Address 3', storeOwnerId: 'owner3' },
                    ],
                });
            }
            if (url === '/join-requests/my-requests') {
                return Promise.resolve({
                    data: [
                        { storeOwnerId: '1', status: 'pending' },
                        { storeOwnerId: '2', status: 'approved' },
                        { storeOwnerId: '3', status: 'rejected' },
                    ],
                });
            }
            return Promise.resolve({ data: [] });
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Store 1')).toBeInTheDocument();
            expect(screen.getByText('Store 2')).toBeInTheDocument();
            expect(screen.getByText('Store 3')).toBeInTheDocument();
        });

        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Approved')).toBeInTheDocument();
        expect(screen.getByText('Rejected')).toBeInTheDocument();

        // "Join Store" button should appear for approved status store
        expect(screen.getByRole('button', { name: /join store/i })).toBeInTheDocument();

        // Store with no status "none" should have "Request to Join" button (simulate it)
    });

    it('clicking "Request to Join" sends request and updates UI', async () => {
        API.get.mockResolvedValueOnce({ data: [{ _id: '1', storeName: 'Store 1', name: 'Owner 1', address: 'Address 1', storeOwnerId: 'owner1' }] });
        API.get.mockResolvedValueOnce({ data: [] });
        API.post.mockResolvedValueOnce({ data: { message: 'Request sent!' } });

        renderComponent();

        await waitFor(() => screen.getByText('Store 1'));

        const requestBtn = screen.getByRole('button', { name: /request to join/i });
        expect(requestBtn).toBeInTheDocument();

        await userEvent.click(requestBtn);

        await waitFor(() => {
            expect(API.post).toHaveBeenCalledWith('/join-requests', { storeOwnerId: '1' });
            expect(screen.getByText(/pending/i)).toBeInTheDocument();
        });
    });

    it('clicking "Join Store" calls API and updates UI and navigates', async () => {
        API.get.mockResolvedValueOnce({ data: [{ _id: '1', storeName: 'Store 1', name: 'Owner 1', address: 'Address 1', storeOwnerId: 'owner1' }] });
        API.get.mockResolvedValueOnce({ data: [{ storeOwnerId: '1', status: 'approved' }] });
        API.post.mockResolvedValueOnce({ data: { message: 'Joined store!' } });

        renderComponent();

        await waitFor(() => screen.getByText('Store 1'));

        const joinBtn = screen.getByRole('button', { name: /join store/i });
        expect(joinBtn).toBeInTheDocument();

        await userEvent.click(joinBtn);

        await waitFor(() => {
            expect(API.post).toHaveBeenCalledWith('/auth/join', { storeOwnerId: 'owner1' });
            expect(mockUpdateUser).toHaveBeenCalledWith({ storeOwnerId: 'owner1' });
            expect(mockNavigate).toHaveBeenCalledWith('/sales');
        });
    });

    it('clicking Logout calls logout and navigates to login', async () => {
        API.get.mockResolvedValueOnce({ data: [] });
        API.get.mockResolvedValueOnce({ data: [] });

        renderComponent();

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.queryByText(/loading stores/i)).not.toBeInTheDocument();
        });

        const logoutBtn = screen.getByRole('button', { name: /logout/i });

        fireEvent.click(logoutBtn);

        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});
