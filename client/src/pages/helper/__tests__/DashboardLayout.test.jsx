import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { AuthContext } from '../../../context/AuthContext';
import { vi } from 'vitest';

// Mock useNavigate from react-router-dom
vi.mock('react-router-dom', async () => {
  // import actual react-router-dom for other stuff
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockNavigate = vi.fn();

describe('DashboardLayout', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockLogout.mockClear();
  });

  const renderComponent = (user) => {
    return render(
      <AuthContext.Provider value={{ user, logout: mockLogout }}>
        <MemoryRouter>
          <DashboardLayout>
            <div>Page Content</div>
          </DashboardLayout>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it('renders welcome message with user name', () => {
    renderComponent({ name: 'Alice' });
    expect(screen.getByText(/Welcome, Alice!/)).toBeInTheDocument();
  });

  it('renders welcome message with fallback name', () => {
    renderComponent(null);
    expect(screen.getByText(/Welcome, User!/)).toBeInTheDocument();
  });

  it('navigates to Inventory on Inventory button click', () => {
    renderComponent({ name: 'Alice' });
    fireEvent.click(screen.getByText('Inventory'));
    expect(mockNavigate).toHaveBeenCalledWith('/inventory');
  });

  it('calls logout and navigates to /login on Logout button click', () => {
    renderComponent({ name: 'Alice' });
    fireEvent.click(screen.getByText('Logout'));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
