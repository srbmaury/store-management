import { generateInvoiceHtml } from '../../utils/generateInvoiceHtml';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function SaleCard({ sale }) {
	const { user } = useContext(AuthContext);
	const { t } = useTranslation();

	const handlePrint = () => {
		const printWindow = window.open('', '_blank', 'width=800,height=600');
		if (printWindow) {
			printWindow.document.write(generateInvoiceHtml(sale));
			printWindow.document.close();
		}
	};

	return (
		<div
			className="sale-card slds-box slds-box_x-small slds-theme_default"
			style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '1rem', position: 'relative' }}
		>
			{/* Sale summary */}
			<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
				<div>
					<strong>{t('dateLabel')}:</strong> {sale.date ? new Date(sale.date).toLocaleString() : t('notAvailable')}
				</div>
				<div>
					<strong>{t('totalLabel')}:</strong> ₹{sale.totalAmount?.toFixed(2) || '0.00'}
				</div>
			</div>

			<div style={{ marginBottom: '0.5rem' }}>
				<strong>{t('customerLabel')}:</strong> {sale.customerName || t('notAvailable')}
			</div>

			<div>
				<strong>{t('itemsSoldLabel')}:</strong>
				<ul style={{ marginTop: '0.25rem', paddingLeft: '1rem' }}>
					{sale.items.map(({ item, quantity, price }) => {
						const itemName = item?.name || t('unknownItem');
						return (
							<li key={item?._id || Math.random()}>
								{itemName} - {t('quantityShort')}: {quantity} @ ₹{price} {t('each')} = ₹{(quantity * price).toFixed(2)}
							</li>
						);
					})}
				</ul>
			</div>

			{user._id === sale.store.owner._id && (
				<p className="slds-text-color_weak slds-m-bottom_none" style={{ margin: 0, opacity: 0.5 }}>
					{t('createdBy')}: {sale.createdBy?.name || t('unknown')}
				</p>
			)}

			<button
				onClick={handlePrint}
				className="slds-button slds-button_neutral"
				style={{ position: 'absolute', bottom: '10px', right: '10px' }}
			>
				{t('printInvoice')}
			</button>
		</div>
	);
}
