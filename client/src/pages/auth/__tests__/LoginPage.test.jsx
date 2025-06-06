import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../LoginPage';
import { AuthContext } from '../../../context/AuthContext';
import API from '../../../utils/api';
import { BrowserRouter } from 'react-router-dom';
import * as toastify from 'react-toastify';
import userEvent from '@testing-library/user-event';

// Mock API.post
// Mock the API module with a default export
vi.mock('../../../utils/api', () => ({
    default: {
        post: vi.fn(),
    },
}));

// Mock react-router-dom's useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

// Spy on toast methods individually
const toastSuccessSpy = vi.spyOn(toastify.toast, 'success').mockImplementation(() => { });
const toastErrorSpy = vi.spyOn(toastify.toast, 'error').mockImplementation(() => { });

function renderLoginPage(loginMock) {
        render(
            <AuthContext.Provider value={{ login: loginMock }}>
                <BrowserRouter>
                    <LoginPage />
                </BrowserRouter>
            </AuthContext.Provider>
        );
}

describe('LoginPage', () => {
    const loginMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('handles successful login', async () => {
        API.post.mockResolvedValueOnce({ data: { role: 'admin', token: 'abc' } });
        renderLoginPage(loginMock)

        // Simulate user input
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        await userEvent.type(emailInput, 'admin@example.com');
        await userEvent.type(passwordInput, 'password123');
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(API.post).toHaveBeenCalled();
            const [url, submittedData] = API.post.mock.calls[0];
            expect(url).toBe('/auth/login');
            expect(submittedData.email).toBe('admin@example.com');
            expect(submittedData.password).toBe('password123');

            expect(loginMock).toHaveBeenCalledWith({ role: 'admin', token: 'abc' });
            expect(mockedNavigate).toHaveBeenCalledWith('/myStores');
            expect(toastSuccessSpy).toHaveBeenCalledWith('Login successful! Welcome back 😊');
        });
    });

    it('handles staff login and navigates to /storeListing', async () => {
        API.post.mockResolvedValueOnce({ data: { role: 'staff', token: 'xyz' } });
        renderLoginPage(loginMock)

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        await userEvent.type(emailInput, 'staff@example.com');
        await userEvent.type(passwordInput, 'password456');
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(API.post).toHaveBeenCalled();
            expect(loginMock).toHaveBeenCalledWith({ role: 'staff', token: 'xyz' });
            expect(mockedNavigate).toHaveBeenCalledWith('/storeListing');
            expect(toastSuccessSpy).toHaveBeenCalledWith('Login successful! Welcome back 😊');
        });
    });

    it('handles login failure with error message', async () => {
        API.post.mockRejectedValueOnce({ response: { data: { message: 'Invalid credentials' } } });
        renderLoginPage(loginMock)

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        await userEvent.type(emailInput, 'admin@example.com');
        await userEvent.type(passwordInput, 'wrongpassword');
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(toastErrorSpy).toHaveBeenCalledWith('Invalid credentials');
        });
    });

    it('handles login failure without error message', async () => {
        API.post.mockRejectedValueOnce({ response: '' });
        renderLoginPage(loginMock)

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        await userEvent.type(emailInput, 'admin@example.com');
        await userEvent.type(passwordInput, 'wrongpassword');
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(toastErrorSpy).toHaveBeenCalledWith('Login failed');
        });
    });
});
