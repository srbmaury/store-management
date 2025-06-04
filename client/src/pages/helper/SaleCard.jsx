import { generateInvoiceHtml } from '../../utils/generateInvoiceHtml';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function SaleCard({ sale }) {
	const { user } = useContext(AuthContext);

	const handlePrint = () => {
		const printWindow = window.open('', '_blank', 'width=800,height=600');
		if (printWindow) {
			printWindow.document.write(generateInvoiceHtml(sale));
			printWindow.document.close();
		}
	};

	return (
		<div className="sale-card slds-box slds-box_x-small slds-theme_default" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '1rem', position: 'relative' }}>
			{/* Sale summary */}
			<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
				<div>
					<strong>Date:</strong> {sale.date ? new Date(sale.date).toLocaleString() : 'N/A'}
				</div>
				<div>
					<strong>Total:</strong> ₹{sale.totalAmount?.toFixed(2) || 0}
				</div>
			</div>

			<div style={{ marginBottom: '0.5rem' }}>
				<strong>Customer:</strong> {sale.customerName || 'N/A'}
			</div>

			<div>
				<strong>Items Sold:</strong>
				<ul style={{ marginTop: '0.25rem', paddingLeft: '1rem' }}>
					{sale.items.map(({ item, quantity, price }) => {
						const itemName = item?.name || 'Unknown Item';
						return (
							<li key={item?._id || Math.random()}>
								{itemName} - Qty: {quantity} @ ₹{price} each = ₹{(quantity * price).toFixed(2)}
							</li>
						);
					})}
				</ul>
			</div>
			{user._id === sale.storeOwnerId && (
				<p
					className="slds-text-color_weak slds-m-bottom_none"
					style={{ margin: 0, opacity: 0.5 }}
				>
					Created by: {sale.createdBy?.name || 'Unknown'}
				</p>
			)}
			<button
				onClick={handlePrint}
				className="slds-button slds-button_neutral"
				style={{
					position: 'absolute',
					bottom: '10px',
					right: '10px',
				}}
			>
				Print Invoice
			</button>
		</div>
	);
}
