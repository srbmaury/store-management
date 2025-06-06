import { describe, it, expect } from 'vitest';
import { generateInvoiceHtml } from '../generateInvoiceHtml';

describe('generateInvoiceHtml', () => {
	const sampleSale = {
		date: '2025-06-01T10:00:00Z',
		customerName: 'John Doe',
		totalAmount: 500,
		items: [
			{ item: { name: 'Apple' }, quantity: 2, price: 50 },
			{ item: { name: 'Banana' }, quantity: 5, price: 20 },
		]
	};

	it('should include customer name and formatted date', () => {
		const html = generateInvoiceHtml(sampleSale);
		expect(html).toContain('John Doe');
		expect(html).toContain(new Date(sampleSale.date).toLocaleString());
	});

	it('should render all items with correct quantities and prices', () => {
		const html = generateInvoiceHtml(sampleSale);
		expect(html).toContain('Apple');
		expect(html).toContain('Banana');
		expect(html).toContain('₹50.00');
		expect(html).toContain('₹100.00'); // 2 * 50
		expect(html).toContain('₹20.00');
		expect(html).toContain('₹100.00'); // 5 * 20
	});

	it('should render the total amount correctly', () => {
		const html = generateInvoiceHtml(sampleSale);
		expect(html).toContain('Total: ₹500.00');
	});

	it('should handle missing customer name', () => {
		const html = generateInvoiceHtml({ ...sampleSale, customerName: '' });
		expect(html).toContain('Customer:</strong> N/A');
	});

	it('should print and close window in script', () => {
		const html = generateInvoiceHtml(sampleSale);
		expect(html).toContain('window.print()');
		expect(html).toContain('window.close()');
	});
});
