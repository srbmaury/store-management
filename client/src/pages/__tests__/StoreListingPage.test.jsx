import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StoreListingPage from '../StoreListingPage';
import { AuthContext } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import API from '../../utils/api';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';

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
vi.spyOn(toast, 'error').mockImplementation(() => { });

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
            if (url === '/stores') {
                return Promise.resolve({
                    data: [
                        {
                            _id: '1',
                            name: 'Store 1',
                            address: 'Address 1',
                            owner: { _id: 'owner1', name: 'Owner 1', email: 'owner1@email.com' },
                        },
                        {
                            _id: '2',
                            name: 'Store 2',
                            address: 'Address 2',
                            owner: { _id: 'owner2', name: 'Owner 2', email: 'owner2@email.com' },
                        },
                        {
                            _id: '3',
                            name: 'Store 3',
                            address: 'Address 3',
                            owner: { _id: 'owner3', name: 'Owner 3', email: 'owner3@email.com' },
                        },
                        {
                            _id: '4',
                            name: 'Store 4',
                            address: 'Address 4',
                            owner: { _id: 'owner4', name: 'Owner 4', email: 'owner4@email.com' },
                        }, // No join request (status: 'none')
                    ],
                });
            }

            if (url === '/join-requests/my-requests') {
                return Promise.resolve({
                    data: [
                        { storeId: '1', status: 'pending' },
                        { storeId: '2', status: 'approved' },
                        { storeId: '3', status: 'rejected' },
                    ],
                });
            }

            return Promise.resolve({ data: [] });
        });

        renderComponent();

        // Wait until all stores are rendered
        await waitFor(() => {
            expect(screen.getByText('Store 1')).toBeInTheDocument();
            expect(screen.getByText('Store 2')).toBeInTheDocument();
            expect(screen.getByText('Store 3')).toBeInTheDocument();
            expect(screen.getByText('Store 4')).toBeInTheDocument();
        });

        // Check for owner names
        expect(screen.getByText('Owner: Owner 1')).toBeInTheDocument();
        expect(screen.getByText('Owner: Owner 2')).toBeInTheDocument();
        expect(screen.getByText('Owner: Owner 3')).toBeInTheDocument();
        expect(screen.getByText('Owner: Owner 4')).toBeInTheDocument();

        // Check for join statuses
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Approved')).toBeInTheDocument();
        expect(screen.getByText('Rejected')).toBeInTheDocument();

        // For approved store (Store 2), "Join Store" button should exist
        expect(screen.getByRole('button', { name: /join store/i })).toBeInTheDocument();

        // For store with no request (Store 4), it should show "Request to Join"
        expect(screen.getByRole('button', { name: /request to join/i })).toBeInTheDocument();
    });


    it('clicking "Request to Join" sends request and updates UI', async () => {
        // Mock /stores response
        API.get
            .mockResolvedValueOnce({
                data: [
                    {
                        _id: '1',
                        name: 'Store 1',
                        address: 'Address 1',
                        owner: { _id: 'owner1', name: 'Owner 1', email: 'o1@email.com' },
                    },
                ],
            })
            // Mock /join-requests/my-requests response (no existing requests)
            .mockResolvedValueOnce({ data: [] });

        // Mock POST /join-requests response
        API.post.mockResolvedValueOnce({ data: { message: 'Request sent!' } });

        renderComponent();

        // Wait for store name to appear
        await waitFor(() => screen.getByText('Store 1'));

        // Check "Request to Join" button is rendered
        const requestBtn = screen.getByRole('button', { name: /request to join/i });
        expect(requestBtn).toBeInTheDocument();

        // Click it
        await userEvent.click(requestBtn);

        // Ensure correct POST request is made
        await waitFor(() => {
            expect(API.post).toHaveBeenCalledWith('/join-requests', { storeId: '1' });
        });

        // After sending, the status should update to "Pending"
        await waitFor(() => {
            expect(screen.getByText(/pending/i)).toBeInTheDocument();
        });
    });


    it('clicking "Join Store" calls API, updates UI, and navigates', async () => {
        // Mock /stores and /join-requests/my-requests
        API.get
            .mockResolvedValueOnce({
                data: [
                    {
                        _id: '1',
                        name: 'Store 1',
                        address: 'Address 1',
                        owner: { _id: 'owner1', name: 'Owner 1', email: 'o1@email.com' },
                    },
                ],
            })
            .mockResolvedValueOnce({
                data: [
                    {
                        storeId: '1',
                        status: 'approved',
                    },
                ],
            });

        // Mock POST /staff/join
        API.post.mockResolvedValueOnce({ data: { message: 'Joined store!' } });

        renderComponent();

        // Wait for store to render
        await waitFor(() => screen.getByText('Store 1'));

        // Check if the "Join Store" button is there
        const joinBtn = screen.getByRole('button', { name: /join store/i });
        expect(joinBtn).toBeInTheDocument();

        // Click the join button
        await userEvent.click(joinBtn);

        await waitFor(() => {
            // ✅ Ensure correct API call is made
            expect(API.post).toHaveBeenCalledWith('/staff/join', { storeId: '1' });

            // ✅ Ensure updateUser was called with storeId
            expect(mockUpdateUser).toHaveBeenCalledWith({ storeId: '1' });

            // ✅ Ensure navigation happens to correct route
            expect(mockNavigate).toHaveBeenCalledWith('/sales/1');
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

    it('shows error toast if /staff/join fails', async () => {
        API.get
            .mockResolvedValueOnce({
                data: [
                    {
                        _id: '1',
                        name: 'Store 1',
                        address: 'Address 1',
                        owner: { _id: 'owner1', name: 'Owner 1' },
                    },
                ],
            })
            .mockResolvedValueOnce({
                data: [{ storeId: '1', status: 'approved' }],
            });

        API.post.mockRejectedValueOnce({
            response: {
                data: { message: 'Join failed' },
            },
        });

        renderComponent();

        await waitFor(() => screen.getByText('Store 1'));

        const joinBtn = screen.getByRole('button', { name: /join store/i });
        await userEvent.click(joinBtn);

        await waitFor(() => {
            expect(API.post).toHaveBeenCalledWith('/staff/join', { storeId: '1' });
            expect(toast.error).toHaveBeenCalledWith('Join failed');
        });
    });

    it('shows error toast if /staff/join fails and no error is thrown', async () => {
        API.get
            .mockResolvedValueOnce({
                data: [
                    {
                        _id: '1',
                        name: 'Store 1',
                        address: 'Address 1',
                        owner: { _id: 'owner1', name: 'Owner 1' },
                    },
                ],
            })
            .mockResolvedValueOnce({
                data: [{ storeId: '1', status: 'approved' }],
            });

        API.post.mockRejectedValueOnce({
            response: {
                data: '',
            },
        });

        renderComponent();

        await waitFor(() => screen.getByText('Store 1'));

        const joinBtn = screen.getByRole('button', { name: /join store/i });
        await userEvent.click(joinBtn);

        await waitFor(() => {
            expect(API.post).toHaveBeenCalledWith('/staff/join', { storeId: '1' });
            expect(toast.error).toHaveBeenCalledWith('Failed to join store');
        });
    });

    it('shows error toast if /join-requests fails', async () => {
        API.get
            .mockResolvedValueOnce({
                data: [
                    {
                        _id: '2',
                        name: 'Store 2',
                        address: 'Address 2',
                        owner: { _id: 'owner2', name: 'Owner 2' },
                    },
                ],
            })
            .mockResolvedValueOnce({
                data: [],
            });

        API.post.mockRejectedValueOnce({
            response: {
                data: { message: 'Request failed' },
            },
        });

        renderComponent();

        await waitFor(() => screen.getByText('Store 2'));

        const requestBtn = screen.getByRole('button', { name: /request to join/i });
        await userEvent.click(requestBtn);

        await waitFor(() => {
            expect(API.post).toHaveBeenCalledWith('/join-requests', { storeId: '2' });
            expect(toast.error).toHaveBeenCalledWith('Request failed');
        });
    });

    it('shows error toast if /join-requests fails and no error is thrown', async () => {
        API.get
            .mockResolvedValueOnce({
                data: [
                    {
                        _id: '2',
                        name: 'Store 2',
                        address: 'Address 2',
                        owner: { _id: 'owner2', name: 'Owner 2' },
                    },
                ],
            })
            .mockResolvedValueOnce({
                data: [],
            });

        API.post.mockRejectedValueOnce({
            response: {
                data: '',
            },
        });

        renderComponent();

        await waitFor(() => screen.getByText('Store 2'));

        const requestBtn = screen.getByRole('button', { name: /request to join/i });
        await userEvent.click(requestBtn);

        await waitFor(() => {
            expect(API.post).toHaveBeenCalledWith('/join-requests', { storeId: '2' });
            expect(toast.error).toHaveBeenCalledWith( 'Failed to send request');
        });
    });
});
