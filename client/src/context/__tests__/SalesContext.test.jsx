import { render, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SalesProvider, { SalesContext } from '../SalesContext';

describe('SalesProvider', () => {
	it('provides default state values', () => {
		let contextValue;
		render(
			<SalesProvider>
				<SalesContext.Consumer>
					{(value) => {
						contextValue = value;
						return null;
					}}
				</SalesContext.Consumer>
			</SalesProvider>
		);

		expect(contextValue.salesHistory).toEqual([]);
		expect(contextValue.salesPage).toBe(1);
		expect(contextValue.salesLimit).toBe(10);
		expect(contextValue.customerSearch).toBe('');
		expect(contextValue.salesTotalPages).toBe(1);
	});

	it('updateSalesHistory updates salesHistory state', () => {
		let contextValue;
		render(
			<SalesProvider>
				<SalesContext.Consumer>
					{(value) => {
						contextValue = value;
						return null;
					}}
				</SalesContext.Consumer>
			</SalesProvider>
		);

		act(() => {
			contextValue.updateSalesHistory([{ id: 1, item: 'Test Sale' }]);
		});

		expect(contextValue.salesHistory).toEqual([{ id: 1, item: 'Test Sale' }]);
	});

	it('updatePagination updates salesPage when page is provided', () => {
		let contextValue;
		render(
			<SalesProvider>
				<SalesContext.Consumer>
					{(value) => {
						contextValue = value;
						return null;
					}}
				</SalesContext.Consumer>
			</SalesProvider>
		);

		act(() => {
			contextValue.updatePagination({ page: 3 });
		});

		expect(contextValue.salesPage).toBe(3);
	});

	it('updatePagination does not update salesPage if page is undefined', () => {
		let contextValue;
		render(
			<SalesProvider>
				<SalesContext.Consumer>
					{(value) => {
						contextValue = value;
						return null;
					}}
				</SalesContext.Consumer>
			</SalesProvider>
		);

		const initialPage = contextValue.salesPage;

		act(() => {
			contextValue.updatePagination({});
		});

		expect(contextValue.salesPage).toBe(initialPage);
	});

	it('updateSearch updates customerSearch and resets salesPage to 1', () => {
		let contextValue;
		render(
			<SalesProvider>
				<SalesContext.Consumer>
					{(value) => {
						contextValue = value;
						return null;
					}}
				</SalesContext.Consumer>
			</SalesProvider>
		);

		// First change page to 5 so we can check reset
		act(() => {
			contextValue.setSalesPage(5);
		});

		act(() => {
			contextValue.updateSearch('New Search');
		});

		expect(contextValue.customerSearch).toBe('New Search');
		expect(contextValue.salesPage).toBe(1);
	});
});
