import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterPage from '../RegisterPage';
import { AuthContext } from '../../../context/AuthContext';
import API from '../../../utils/api';
import { BrowserRouter } from 'react-router-dom';
import * as toastify from 'react-toastify';
import userEvent from '@testing-library/user-event';

vi.mock('../../../utils/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const toastSuccessSpy = vi.spyOn(toastify.toast, 'success').mockImplementation(() => {});
const toastErrorSpy = vi.spyOn(toastify.toast, 'error').mockImplementation(() => {});

describe('RegisterPage', () => {
  const loginMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles successful registration', async () => {
    API.post.mockResolvedValueOnce({ data: { role: 'admin', token: 'xyz' } });

    render(
      <AuthContext.Provider value={{ login: loginMock }}>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // Fill all fields required for registration (admin role)
    await userEvent.selectOptions(screen.getByLabelText('Role *'), ['admin']);
    await userEvent.type(screen.getByLabelText('Name *'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Phone Number *'), '+1234567890');
    await userEvent.type(screen.getByLabelText('Store Name *'), 'My Store');
    await userEvent.type(screen.getByLabelText('Address *'), '123 Main St');
    await userEvent.type(screen.getByLabelText('Email *'), 'admin@example.com');
    await userEvent.type(screen.getByLabelText('Password *'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password *'), 'password123');

    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith('/auth/register', {
        role: 'admin',
        name: 'John Doe',
        phone: '+1234567890',
        storeName: 'My Store',
        address: '123 Main St',
        email: 'admin@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(loginMock).toHaveBeenCalledWith({ role: 'admin', token: 'xyz' });
      expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
      expect(toastSuccessSpy).toHaveBeenCalledWith('Registration successful! Welcome 😊');
    });
  });

  it('handles registration failure', async () => {
    API.post.mockRejectedValueOnce({ response: { data: { message: 'Email already in use' } } });

    render(
      <AuthContext.Provider value={{ login: loginMock }}>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // Fill all fields
    await userEvent.selectOptions(screen.getByLabelText('Role *'), ['admin']);
    await userEvent.type(screen.getByLabelText('Name *'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Phone Number *'), '+1234567890');
    await userEvent.type(screen.getByLabelText('Store Name *'), 'My Store');
    await userEvent.type(screen.getByLabelText('Address *'), '123 Main St');
    await userEvent.type(screen.getByLabelText('Email *'), 'admin@example.com');
    await userEvent.type(screen.getByLabelText('Password *'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password *'), 'password123');

    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(toastErrorSpy).toHaveBeenCalledWith('Email already in use');
    });
  });
});
