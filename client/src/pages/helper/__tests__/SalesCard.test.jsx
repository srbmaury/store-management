import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SaleCard from '../SaleCard';
import { AuthContext } from '../../../context/AuthContext';

vi.mock('../../../utils/generateInvoiceHtml', () => ({
    generateInvoiceHtml: vi.fn(() => '<html><body>Invoice</body></html>'),
}));

const mockSale = {
    date: '2024-06-01T12:00:00Z',
    totalAmount: 1000,
    customerName: 'John Doe',
    createdBy: { name: 'Admin User' },
    store: {
        owner: { _id: 'store123' },
    },
    items: [
        {
            item: { _id: 'item1', name: 'Apple' },
            quantity: 2,
            price: 50,
        },
        {
            item: { _id: 'item2', name: 'Banana' },
            quantity: 5,
            price: 20,
        },
    ],
};

describe('SaleCard', () => {
    const mockUser = { _id: 'store123' };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders sale details', () => {
        render(
            <AuthContext.Provider value={{ user: mockUser }}>
                <SaleCard sale={mockSale} />
            </AuthContext.Provider>
        );

        expect(screen.getByText(/Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Total:/).parentElement).toHaveTextContent('₹1000.00');
        expect(screen.getByText(/Customer:/).parentElement).toHaveTextContent('John Doe');
        expect(screen.getByText(/Apple - Qty: 2 @ ₹50 each/)).toBeInTheDocument();
        expect(screen.getByText(/Banana - Qty: 5 @ ₹20 each/)).toBeInTheDocument();
        expect(screen.getByText(/Created by:/)).toHaveTextContent('Admin User');
        expect(screen.getByRole('button', { name: /Print Invoice/i })).toBeInTheDocument();
    });

    it('does not show "Created by" if user is not store owner', () => {
        const anotherUser = { _id: 'not-owner' };
        render(
            <AuthContext.Provider value={{ user: anotherUser }}>
                <SaleCard sale={mockSale} />
            </AuthContext.Provider>
        );

        expect(screen.queryByText(/Created by:/)).not.toBeInTheDocument();
    });

    it('opens print window and writes invoice HTML', () => {
        const writeMock = vi.fn();
        const closeMock = vi.fn();

        const openMock = vi.fn(() => ({
            document: {
                write: writeMock,
                close: closeMock,
            },
        }));
        vi.stubGlobal('window', { ...window, open: openMock });

        render(
            <AuthContext.Provider value={{ user: mockUser }}>
                <SaleCard sale={mockSale} />
            </AuthContext.Provider>
        );

        const button = screen.getByRole('button', { name: /Print Invoice/i });
        fireEvent.click(button);

        expect(openMock).toHaveBeenCalledWith('', '_blank', 'width=800,height=600');
        expect(writeMock).toHaveBeenCalledWith('<html><body>Invoice</body></html>');
        expect(closeMock).toHaveBeenCalled();
    });
});
