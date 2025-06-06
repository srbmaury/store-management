import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import PrivateRoute from '../PrivateRoute';

function renderWithAuthContext({ user, initialEntries }) {
	return render(
		<AuthContext.Provider value={{ user }}>
			<MemoryRouter initialEntries={initialEntries}>
				<Routes>
					<Route
						path="/myStores"
						element={
							<PrivateRoute allowedRoles={['admin']}>
								<div>My Stores Page</div>
							</PrivateRoute>
						}
					/>
					<Route
						path="/dashboard/123"
						element={
							<PrivateRoute allowedRoles={['admin']}>
								<div>Dashboard Page</div>
							</PrivateRoute>
						}
					/>
					<Route
						path="/inventory/123"
						element={
							<PrivateRoute allowedRoles={['admin']}>
								<div>Inventory Page</div>
							</PrivateRoute>
						}
					/>
					<Route
						path="/sales/123"
						element={
							<PrivateRoute allowedRoles={['admin', 'staff']}>
								<div>Sales Page</div>
							</PrivateRoute>
						}
					/>
					<Route
						path="/storeListing"
						element={
							<PrivateRoute allowedRoles={['staff']}>
								<div>Store Listing Page</div>
							</PrivateRoute>
						}
					/>
					<Route path="/login" element={<div>Login Page</div>} />
					<Route path="*" element={<Navigate to="/login" replace />} />
				</Routes>
			</MemoryRouter>
		</AuthContext.Provider>
	);
}

describe('PrivateRoute', () => {
	it('redirects to /login if user is not logged in', () => {
		renderWithAuthContext({
			user: null,
			initialEntries: ['/dashboard/123'],
		});
		expect(screen.getByText('Login Page')).toBeInTheDocument();
	});

	it('redirects to /login if user.token is falsy', () => {
		renderWithAuthContext({
			user: { role: 'admin', token: '' },
			initialEntries: ['/dashboard/123'],
		});
		expect(screen.getByText('Login Page')).toBeInTheDocument();
	});

	it('redirects to /myStores if user role is not allowed and role is admin', () => {
		renderWithAuthContext({
			user: { role: 'admin', token: 'token123' },
			initialEntries: ['/storeListing'], // storeListing is staff only
		});
		expect(screen.getByText('My Stores Page')).toBeInTheDocument();
	});

	it('redirects to /login if user role is not allowed and role is staff', () => {
		renderWithAuthContext({
			user: { role: 'staff', token: 'token123', storeId: 's1' },
			initialEntries: ['/dashboard/123'], // dashboard admin only
		});
		expect(screen.getByText('Login Page')).toBeInTheDocument();
	});

	it('forbids staff without storeId from accessing routes except /storeListing', () => {
		renderWithAuthContext({
			user: { role: 'staff', token: 'token123', storeId: null },
			initialEntries: ['/sales/123'], // sales allowed but staff must have storeId
		});
		expect(screen.getByText('Store Listing Page')).toBeInTheDocument();
	});

	it('forbids staff with storeId from accessing /storeListing', () => {
		renderWithAuthContext({
			user: { role: 'staff', token: 'token123', storeId: '123' },
			initialEntries: ['/storeListing'], // should redirect to sales page
		});
		// The sales page is /sales/:storeId, so check text accordingly
		expect(screen.getByText('Sales Page')).toBeInTheDocument();
	});

	it('renders children for admin with correct role and token', () => {
		renderWithAuthContext({
			user: { role: 'admin', token: 'token123' },
			initialEntries: ['/dashboard/123'],
		});
		expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
	});

	it('renders children for staff with storeId accessing allowed route', () => {
		renderWithAuthContext({
			user: { role: 'staff', token: 'token123', storeId: '123' },
			initialEntries: ['/sales/123'],
		});
		expect(screen.getByText('Sales Page')).toBeInTheDocument();
	});
});
