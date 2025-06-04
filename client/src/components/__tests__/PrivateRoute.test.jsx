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
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <div>Dashboard</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/sales"
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
                <div>StoreListing</div>
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
      initialEntries: ['/dashboard'],
    });

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to /login if user.token is falsy', () => {
    renderWithAuthContext({
      user: { role: 'admin', token: '' },
      initialEntries: ['/dashboard'],
    });

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

    it('redirects to /dashboard if user.role is not in allowedRoles and role is not "staff"', () => {
    renderWithAuthContext({
        user: { role: 'admin', token: 'abc123' },
        initialEntries: ['/storeListing'],  // Try to access storeListing (staff only)
    });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

  it('redirects to /storeListing if user.role is "staff" but not allowed in allowedRoles', () => {
    renderWithAuthContext({
      user: { role: 'staff', token: 'abc123', _id: 's1', storeOwnerId: 's1' },
      initialEntries: ['/dashboard'], // staff tries to access admin-only route
    });

    expect(screen.getByText('StoreListing')).toBeInTheDocument();
  });

  it('renders the protected component if role is allowed and token is present', () => {
    renderWithAuthContext({
      user: { role: 'admin', token: 'xyz789' },
      initialEntries: ['/dashboard'],
    });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  describe('staff-specific edge cases', () => {
    it('forces staff-without-storeOwnerId (storeOwnerId === _id) to /storeListing if they try to access other pages', () => {
      renderWithAuthContext({
        user: { role: 'staff', token: 'token123', _id: 's123', storeOwnerId: 's123' },
        initialEntries: ['/sales'],
      });

      expect(screen.getByText('StoreListing')).toBeInTheDocument();
    });

    it('forces staff-with-storeOwnerId to /sales if they try to visit /storeListing', async () => {
      renderWithAuthContext({
        user: { role: 'staff', token: 'tok456', _id: 'staff1', storeOwnerId: 'owner42' },
        initialEntries: ['/storeListing'],
      });

      expect(await screen.findByText('Sales Page')).toBeInTheDocument();
    });

    it('renders children for staff with storeOwnerId !== _id if path is not /storeListing', () => {
      renderWithAuthContext({
        user: { role: 'staff', token: 'tok999', _id: 'staff2', storeOwnerId: 'owner007' },
        initialEntries: ['/sales'],
      });

      expect(screen.getByText('Sales Page')).toBeInTheDocument();
    });
  });
});
