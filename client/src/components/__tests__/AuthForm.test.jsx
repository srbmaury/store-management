import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AuthForm from '../AuthForm';

function renderAuthForm({ title = 'Register', onSubmit = () => { } } = {}) {
	return render(
		<MemoryRouter>
			<AuthForm title={title} onSubmit={onSubmit} />
		</MemoryRouter>
	);
}

describe('AuthForm', () => {
	it('renders login form correctly', () => {
		const mockSubmit = vi.fn();
		renderAuthForm({ title: 'Login', onSubmit: mockSubmit });

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

	it('renders correct fields', () => {
		const mockSubmit = vi.fn();
		renderAuthForm({ title: 'Register', onSubmit: mockSubmit });

		// Role selector is present
		expect(screen.getByLabelText(/^Role \*$/i)).toBeInTheDocument();

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

	it('calls onSubmit with correct data for login form', () => {
		const mockSubmit = vi.fn();
		renderAuthForm({ title: 'Login', onSubmit: mockSubmit });

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
		renderAuthForm({ title: 'Register', onSubmit: mockSubmit });

		fireEvent.change(screen.getByLabelText(/^Name \*$/i), { target: { value: 'Bob' } });
		fireEvent.change(screen.getByLabelText(/^Phone Number \*$/i), { target: { value: '+1987654321' } });
		fireEvent.change(screen.getByLabelText(/^Email \*$/i), { target: { value: 'bob@example.com' } });
		fireEvent.change(screen.getByLabelText(/^Password \*$/i), { target: { value: 'mypassword' } });
		fireEvent.change(screen.getByLabelText(/^Confirm Password \*$/i), { target: { value: 'mypassword' } });
		fireEvent.submit(screen.getByRole('button', { name: /^Register$/i }));

		expect(mockSubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				role: 'admin',
				name: 'Bob',
				phone: '+1987654321',
				email: 'bob@example.com',
				password: 'mypassword',
				confirmPassword: 'mypassword',
			})
		);
	});

	it('calls onSubmit with correct data for register form as staff', () => {
		const mockSubmit = vi.fn();
		renderAuthForm({ title: 'Register', onSubmit: mockSubmit });

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
				email: 'carol@example.com',
				password: 'secret987',
				confirmPassword: 'secret987',
			})
		);
	});

	it('shows correct navigation prompt on register form', () => {
		render(
			<MemoryRouter>
				<AuthForm title="Register" onSubmit={() => { }} />
			</MemoryRouter>
		);
		expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /^Login$/i })).toBeInTheDocument();
	});

	it('shows correct navigation prompt on login form', () => {
		render(
			<MemoryRouter>
				<AuthForm title="Login" onSubmit={() => { }} />
			</MemoryRouter>
		);
		expect(screen.getByText(/Don’t have an account\?/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /^Register$/i })).toBeInTheDocument();
	});

	it('resets form fields except role when role changes', () => {
		const mockSubmit = vi.fn();
		renderAuthForm({ title: 'Register', onSubmit: mockSubmit });

		// Fill some fields first
		fireEvent.change(screen.getByLabelText(/^Name \*$/i), { target: { value: 'Dave' } });
		fireEvent.change(screen.getByLabelText(/^Phone Number \*$/i), { target: { value: '+111222333' } });

		// Change role to staff, which should reset form except role
		fireEvent.change(screen.getByLabelText(/^Role \*$/i), { target: { value: 'staff' } });

		// Check role updated
		expect(screen.getByLabelText(/^Role \*$/i).value).toBe('staff');

		// Check other fields reset to empty
		expect(screen.getByLabelText(/^Name \*$/i).value).toBe('');
		expect(screen.getByLabelText(/^Phone Number \*$/i).value).toBe('');
	});
});
