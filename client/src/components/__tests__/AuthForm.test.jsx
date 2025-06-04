import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AuthForm from '../AuthForm';

describe('AuthForm', () => {
  it('renders login form correctly', () => {
    const mockSubmit = vi.fn();
    render(
      <MemoryRouter>
        <AuthForm title="Login" onSubmit={mockSubmit} />
      </MemoryRouter>
    );

    // Role selector should not be present
    expect(screen.queryByLabelText(/^Role \*$/i)).not.toBeInTheDocument();

    // Email and Password fields must be present
    expect(screen.getByLabelText(/^Email \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password \*$/i)).toBeInTheDocument();

    // Confirm Password, Name, Phone, Store Name, Address should not appear
    expect(screen.queryByLabelText(/^Confirm Password \*$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Name \*$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Phone Number \*$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Store Name \*$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Address \*$/i)).not.toBeInTheDocument();

    // Submit button text
    expect(screen.getByRole('button', { name: /^Login$/i })).toBeInTheDocument();

    // Navigation prompt
    expect(screen.getByText(/Don’t have an account\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Register$/i })).toBeInTheDocument();
  });

  it('renders register form with admin fields by default', () => {
    const mockSubmit = vi.fn();
    render(
      <MemoryRouter>
        <AuthForm title="Register" onSubmit={mockSubmit} />
      </MemoryRouter>
    );

    // Role selector is present
    expect(screen.getByLabelText(/^Role \*$/i)).toBeInTheDocument();

    // Admin fields: Store Name and Address
    expect(screen.getByLabelText(/^Store Name \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Address \*$/i)).toBeInTheDocument();

    // Always-present register fields: Name, Phone, Confirm Password, Email, Password
    expect(screen.getByLabelText(/^Name \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Phone Number \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm Password \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password \*$/i)).toBeInTheDocument();

    // Submit button text
    expect(screen.getByRole('button', { name: /^Register$/i })).toBeInTheDocument();

    // Navigation prompt
    expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Login$/i })).toBeInTheDocument();
  });

  it('switches to staff fields when role changes to staff', () => {
    const mockSubmit = vi.fn();
    render(
      <MemoryRouter>
        <AuthForm title="Register" onSubmit={mockSubmit} />
      </MemoryRouter>
    );

    // Change role from admin → staff
    const roleSelect = screen.getByLabelText(/^Role \*$/i);
    fireEvent.change(roleSelect, { target: { value: 'staff' } });

    // Admin-only fields should disappear
    expect(screen.queryByLabelText(/^Store Name \*$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Address \*$/i)).not.toBeInTheDocument();

    // Staff-only fields (Name, Phone, Confirm Password, Email, Password) remain
    expect(screen.getByLabelText(/^Name \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Phone Number \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm Password \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password \*$/i)).toBeInTheDocument();
  });

  it('calls onSubmit with correct data for login form', () => {
    const mockSubmit = vi.fn();
    render(
      <MemoryRouter>
        <AuthForm title="Login" onSubmit={mockSubmit} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/^Email \*$/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/^Password \*$/i), { target: { value: 'pass123' } });
    fireEvent.submit(screen.getByRole('button', { name: /^Login$/i }));

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@test.com',
        password: 'pass123',
      })
    );
  });

  it('calls onSubmit with correct data for register form as admin', () => {
    const mockSubmit = vi.fn();
    render(
      <MemoryRouter>
        <AuthForm title="Register" onSubmit={mockSubmit} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/^Name \*$/i), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText(/^Phone Number \*$/i), { target: { value: '+1987654321' } });
    fireEvent.change(screen.getByLabelText(/^Store Name \*$/i), { target: { value: 'Bob Store' } });
    fireEvent.change(screen.getByLabelText(/^Address \*$/i), { target: { value: '456 Market St' } });
    fireEvent.change(screen.getByLabelText(/^Email \*$/i), { target: { value: 'bob@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password \*$/i), { target: { value: 'mypassword' } });
    fireEvent.change(screen.getByLabelText(/^Confirm Password \*$/i), { target: { value: 'mypassword' } });
    fireEvent.submit(screen.getByRole('button', { name: /^Register$/i }));

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'admin',
        name: 'Bob',
        phone: '+1987654321',
        storeName: 'Bob Store',
        address: '456 Market St',
        email: 'bob@example.com',
        password: 'mypassword',
        confirmPassword: 'mypassword',
      })
    );
  });

  it('calls onSubmit with correct data for register form as staff', () => {
    const mockSubmit = vi.fn();
    render(
      <MemoryRouter>
        <AuthForm title="Register" onSubmit={mockSubmit} />
      </MemoryRouter>
    );

    // Switch to staff
    fireEvent.change(screen.getByLabelText(/^Role \*$/i), { target: { value: 'staff' } });

    fireEvent.change(screen.getByLabelText(/^Name \*$/i), { target: { value: 'Carol' } });
    fireEvent.change(screen.getByLabelText(/^Phone Number \*$/i), { target: { value: '+12223334444' } });
    fireEvent.change(screen.getByLabelText(/^Email \*$/i), { target: { value: 'carol@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password \*$/i), { target: { value: 'secret987' } });
    fireEvent.change(screen.getByLabelText(/^Confirm Password \*$/i), { target: { value: 'secret987' } });
    fireEvent.submit(screen.getByRole('button', { name: /^Register$/i }));

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'staff',
        name: 'Carol',
        phone: '+12223334444',
        storeName: '',
        address: '',
        email: 'carol@example.com',
        password: 'secret987',
        confirmPassword: 'secret987',
      })
    );
  });

  it('shows correct navigation prompt on register form', () => {
    render(
      <MemoryRouter>
        <AuthForm title="Register" onSubmit={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Login$/i })).toBeInTheDocument();
  });

  it('shows correct navigation prompt on login form', () => {
    render(
      <MemoryRouter>
        <AuthForm title="Login" onSubmit={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Don’t have an account\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Register$/i })).toBeInTheDocument();
  });
});
