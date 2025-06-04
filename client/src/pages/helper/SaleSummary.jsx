export default function SaleSummary({
	selectedItems,
	inventory,
	handleQuantityChange,
	totalAmount,
	customerName,
	setCustomerName,
	handleSubmit,
	clearCart
}) {
	return (
		<>
			<h3 className="slds-text-heading_small slds-m-top_large slds-m-bottom_small">Selected Items</h3>

			{selectedItems.length === 0 ? (
				<p>No items selected.</p>
			) : (
				<table className="slds-table slds-table_cell-buffer slds-table_bordered slds-m-bottom_medium">
					<thead>
						<tr>
							<th>Item</th>
							<th>Quantity</th>
							<th>Price</th>
							<th>Total</th>
						</tr>
					</thead>
					<tbody>
						{selectedItems.map((i) => {
							const itemStock = inventory.find(inv => inv._id === i.item)?.stock || 0;
							return (
								<tr key={i.item}>
									<td>{i.name}</td>
									<td>
										<input
											type="number"
											min="0"
											max={itemStock}
											value={i.quantity}
											onChange={(e) => handleQuantityChange(i.item, e.target.value)}
											className="slds-input"
											style={{ maxWidth: '80px' }}
										/>
									</td>
									<td>₹{i.price}</td>
									<td>₹{(i.price * i.quantity).toFixed(2)}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			)}

			<div className="slds-m-bottom_large" style={{ fontWeight: '700', fontSize: '1.25rem' }}>
				Total: ₹{totalAmount.toFixed(2)}
			</div>

			<label className="slds-form-element__label" htmlFor="customerName">
				Customer Name
			</label>
			<input
				id="customerName"
				className="slds-input slds-m-bottom_medium"
				placeholder="Enter customer name"
				value={customerName}
				onChange={(e) => setCustomerName(e.target.value)}
			/>

			<button
				className="slds-button slds-button_brand"
				onClick={handleSubmit}
				disabled={selectedItems.length === 0}
			>
				Submit Sale
			</button>

			<button
				className="slds-button slds-button_neutral"
				onClick={clearCart}
				disabled={selectedItems.length === 0}
			>
				Clear Cart
			</button>
		</>
	);
}