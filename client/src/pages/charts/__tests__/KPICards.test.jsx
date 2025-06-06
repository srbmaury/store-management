import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KPICards from '../KPICards';

describe('KPICards', () => {
	const defaultProps = {
		totalSalesCount: 100,
		totalRevenue: 12345.67,
		totalInventoryItems: 50,
		lowStockItems: ['item1', 'item2'],
	};

	it('renders all KPI labels and values correctly', () => {
		render(<KPICards {...defaultProps} />);

		expect(screen.getByText('Total Sales')).toBeInTheDocument();
		expect(screen.getByText('100')).toBeInTheDocument();

		expect(screen.getByText('Total Revenue')).toBeInTheDocument();
		expect(screen.getByText('₹12345.67')).toBeInTheDocument();

		expect(screen.getByText('Inventory Items')).toBeInTheDocument();
		expect(screen.getByText('50')).toBeInTheDocument();

		expect(screen.getByText('Low Stock Items')).toBeInTheDocument();
		expect(screen.getByText('2')).toBeInTheDocument();

		// Check style of Low Stock Items count (should be red)
		const lowStockElement = screen.getByText('2');
		expect(lowStockElement).toHaveStyle({ color: 'rgb(255, 0, 0)' });
	});

	it('renders Low Stock Items count without red style when zero', () => {
		render(
			<KPICards
				{...defaultProps}
				lowStockItems={[]}
			/>
		);

		expect(screen.getByText('0')).toBeInTheDocument();

		const lowStockElement = screen.getByText('0');
		expect(lowStockElement).not.toHaveStyle({ color: 'rgb(255, 0, 0)' });
	});
});
