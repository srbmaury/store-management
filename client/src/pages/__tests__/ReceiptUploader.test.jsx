// src/pages/__tests__/ReceiptUploader.test.jsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReceiptUploader from '../ReceiptUploader';
import Tesseract from 'tesseract.js';
import stringSimilarity from 'string-similarity';

vi.mock('tesseract.js', () => ({
  default: {
    recognize: vi.fn(),
    PSM: { SINGLE_BLOCK: 6 },
  },
}));

vi.mock('string-similarity', () => ({
  default: {
    findBestMatch: vi.fn(),
  },
}));

describe('ReceiptUploader', () => {
  const mockInventory = [
    { _id: '1', name: 'Milk', stock: 10 },
    { _id: '2', name: 'Bread', stock: 5 },
    { _id: '3', name: 'Cookies', stock: 8 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders file input and extract button', () => {
    render(<ReceiptUploader inventory={mockInventory} onCartUpdate={vi.fn()} />);
    expect(screen.getByLabelText(/Receipt Image/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Extract from Receipt/i })).toBeInTheDocument();
  });

  it('disables extract button when no image is uploaded', () => {
    render(<ReceiptUploader inventory={mockInventory} onCartUpdate={vi.fn()} />);
    const button = screen.getByRole('button', { name: /Extract from Receipt/i });
    expect(button).toBeDisabled();
  });

  it('enables extract button after image upload', () => {
    render(<ReceiptUploader inventory={mockInventory} onCartUpdate={vi.fn()} />);
    const fileInput = screen.getByLabelText(/Receipt Image/i);
    fireEvent.change(fileInput, {
      target: { files: [new File(['dummy'], 'receipt.png', { type: 'image/png' })] },
    });
    const button = screen.getByRole('button', { name: /Extract from Receipt/i });
    expect(button).not.toBeDisabled();
  });

  it('extracts items using OCR and renders matched items', async () => {
    const mockText = 'Milk 2\nBread 1\nCookies 3';

    // Mock Tesseract.recognize to return our text
    Tesseract.recognize.mockResolvedValue({
      data: { text: mockText },
    });

    // Mock stringSimilarity.findBestMatch to match rawName exactly
    stringSimilarity.findBestMatch.mockImplementation((rawName, targets) => {
      const lowerTargets = targets.map((t) => t.toLowerCase());
      const idx = lowerTargets.indexOf(rawName.toLowerCase());
      return {
        bestMatch: {
          rating: idx !== -1 ? 1 : 0,
          target: idx !== -1 ? targets[idx].toLowerCase() : '',
        },
      };
    });

    render(<ReceiptUploader inventory={mockInventory} onCartUpdate={vi.fn()} />);

    // Upload a fake image file
    const fileInput = screen.getByLabelText(/Receipt Image/i);
    const fakeFile = new File(['dummy'], 'receipt.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [fakeFile] } });

    // Click the Extract button
    const extractButton = screen.getByRole('button', { name: /Extract from Receipt/i });
    expect(extractButton).not.toBeDisabled();
    fireEvent.click(extractButton);

    // Wait for OCR and matching, then verify matched items
    await waitFor(() => {
      expect(screen.getByText('Matched Items')).toBeInTheDocument();
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
      expect(screen.getByText('Cookies')).toBeInTheDocument();
    });
  });
});
