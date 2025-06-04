import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminJoinRequests from '../AdminJoinRequests';
import { BrowserRouter } from 'react-router-dom';
import API from '../../utils/api';
import { toast } from 'react-toastify';

// Mock API and toast
vi.mock('../../utils/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

const mockData = [
  {
    _id: 'req1',
    staffId: { name: 'Alice', email: 'alice@example.com' },
    message: 'Please approve me!',
  },
];

describe('AdminJoinRequests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state initially', async () => {
    API.get.mockReturnValue(new Promise(() => {})); // never resolves
    renderWithRouter(<AdminJoinRequests />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays no requests message if list is empty', async () => {
    API.get.mockResolvedValue({ data: [] });
    renderWithRouter(<AdminJoinRequests />);

    await waitFor(() => {
      expect(screen.getByText('No pending requests.')).toBeInTheDocument();
    });
  });

  it('displays requests in a table', async () => {
    API.get.mockResolvedValue({ data: mockData });
    renderWithRouter(<AdminJoinRequests />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('Please approve me!')).toBeInTheDocument();
    });
  });

  it('calls API.put when approving a request', async () => {
    API.get.mockResolvedValue({ data: mockData });
    API.put.mockResolvedValue({});

    renderWithRouter(<AdminJoinRequests />);

    await waitFor(() => screen.getByText('Approve'));
    fireEvent.click(screen.getByText('Approve'));

    await waitFor(() => {
      expect(API.put).toHaveBeenCalledWith('/join-requests/req1/status', {
        status: 'approved',
      });
      expect(toast.success).toHaveBeenCalledWith('Request approved successfully');
    });
  });

  it('calls API.put when rejecting a request', async () => {
    API.get.mockResolvedValue({ data: mockData });
    API.put.mockResolvedValue({});

    renderWithRouter(<AdminJoinRequests />);

    await waitFor(() => screen.getByText('Reject'));
    fireEvent.click(screen.getByText('Reject'));

    await waitFor(() => {
      expect(API.put).toHaveBeenCalledWith('/join-requests/req1/status', {
        status: 'rejected',
      });
      expect(toast.success).toHaveBeenCalledWith('Request rejected successfully');
    });
  });

  it('handles API.get failure gracefully', async () => {
    API.get.mockRejectedValue({
      response: { data: { message: 'Failed to load' } },
    });

    renderWithRouter(<AdminJoinRequests />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load');
    });
  });

  it('handles API.put failure gracefully', async () => {
    API.get.mockResolvedValue({ data: mockData });
    API.put.mockRejectedValue({
      response: { data: { message: 'Failed to approve' } },
    });

    renderWithRouter(<AdminJoinRequests />);
    await waitFor(() => screen.getByText('Approve'));
    fireEvent.click(screen.getByText('Approve'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to approve');
    });
  });
});
