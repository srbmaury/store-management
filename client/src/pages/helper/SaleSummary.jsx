import { useTranslation } from "react-i18next";

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
	const { t } = useTranslation();
	return (
		<>
			<h3 className="slds-text-heading_small slds-m-top_large slds-m-bottom_small">{t('selectedItems')}</h3>

			{selectedItems.length === 0 ? (
				<p>{t('noItemsSelected')}</p>
			) : (
				<table className="slds-table slds-table_cell-buffer slds-table_bordered slds-m-bottom_medium">
					<thead>
						<tr>
							<th>{t('item')}</th>
							<th>{t('quantity')}</th>
							<th>{t('price')}</th>
							<th>{t('total')}</th>
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
				{t('total')}: ₹{totalAmount.toFixed(2)}
			</div>

			<label className="slds-form-element__label" htmlFor="customerName">
				{t('customerName')}
			</label>
			<input
				id="customerName"
				className="slds-input slds-m-bottom_medium"
				placeholder={t('enterCustomerName')}
				value={customerName}
				onChange={(e) => setCustomerName(e.target.value)}
			/>

			<button
				className="slds-button slds-button_brand"
				onClick={handleSubmit}
				disabled={selectedItems.length === 0}
			>
				{t('submitSale')}
			</button>

			<button
				className="slds-button slds-button_neutral"
				onClick={clearCart}
				disabled={selectedItems.length === 0}
			>
				{t('clearCart')}
			</button>
		</>
	);
}