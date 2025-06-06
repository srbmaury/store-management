import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { AuthContext } from '../../../context/AuthContext';
import API from '../../../utils/api';
import { toast } from 'react-toastify';

// Mock useNavigate and useParams
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
		useParams: () => ({ storeId: '123' }),
	};
});

// Mock API
vi.mock('../../../utils/api', () => ({
	default: {
		post: vi.fn(),
	},
}));

vi.mock('react-toastify', () => ({
	toast: {
		error: vi.fn(),
	},
}));

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

describe('DashboardLayout', () => {
	beforeEach(() => {
		mockNavigate.mockClear();
		mockLogout.mockClear();
		API.post.mockReset();
	});

	const renderComponent = (user = { name: 'Alice' }) => {
		return render(
			<AuthContext.Provider value={{ user, logout: mockLogout }}>
				<MemoryRouter initialEntries={['/dashboard/123']}>
					<Routes>
						<Route path="/dashboard/:storeId" element={
							<DashboardLayout>
								<div>Page Content</div>
							</DashboardLayout>
						} />
					</Routes>
				</MemoryRouter>
			</AuthContext.Provider>
		);
	};

	it('renders fallback welcome message', () => {
		renderComponent(null);
		expect(screen.getByText(/Welcome, User!/)).toBeInTheDocument();
	});

	it('renders welcome message with user name', () => {
		renderComponent({ name: 'Alice' });
		expect(screen.getByText(/Welcome, Alice!/)).toBeInTheDocument();
	});

	it('displays loading store message initially', () => {
		renderComponent();
		expect(screen.getByText(/Loading store/i)).toBeInTheDocument();
	});

	it('fetches and displays store name', async () => {
		API.post.mockResolvedValueOnce({ data: { name: 'Test Store' } });
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText('Test Store')).toBeInTheDocument();
		});
	});

	it('calls logout and navigates to /login on logout', () => {
		renderComponent();
		fireEvent.click(screen.getByText('Logout'));
		expect(mockLogout).toHaveBeenCalled();
		expect(mockNavigate).toHaveBeenCalledWith('/login');
	});

	it('navigates to Inventory with storeId', () => {
		renderComponent();
		fireEvent.click(screen.getByText('Inventory'));
		expect(mockNavigate).toHaveBeenCalledWith('/inventory/123');
	});

	it('navigates to Sales with storeId', () => {
		renderComponent();
		fireEvent.click(screen.getByText('Sales'));
		expect(mockNavigate).toHaveBeenCalledWith('/sales/123');
	});

	it('navigates to Sales History with storeId', () => {
		renderComponent();
		fireEvent.click(screen.getByText('Sales History'));
		expect(mockNavigate).toHaveBeenCalledWith('/sales-history/123');
	});

	it('navigates to Join Requests with storeId', () => {
		renderComponent();
		fireEvent.click(screen.getByText('Join Requests'));
		expect(mockNavigate).toHaveBeenCalledWith('/joinRequests/123');
	});

	it('navigates to Staff with storeId', () => {
		renderComponent();
		fireEvent.click(screen.getByText('Staff'));
		expect(mockNavigate).toHaveBeenCalledWith('/staff/123');
	});

	it('navigates to My Stores', () => {
		renderComponent();
		fireEvent.click(screen.getByText('My Stores'));
		expect(mockNavigate).toHaveBeenCalledWith('/myStores');
	});

	it('shows toast error if store fetch fails', async () => {
		API.post.mockRejectedValueOnce(new Error('Network Error'));
		renderComponent();

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Failed to fetch store', expect.any(Error));
		});
	});
});
