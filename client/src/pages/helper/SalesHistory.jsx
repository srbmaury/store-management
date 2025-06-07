import { useTranslation } from 'react-i18next';
import SaleCard from './SaleCard';

export default function SalesHistory({ salesHistory = [] }) {
	const { t } = useTranslation();

	return (
		<section className="slds-m-bottom_large">
			{salesHistory.length === 0 ? (
				<p>{t('noSalesHistory')}</p>
			) : (
				<div className="sales-history-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
					{salesHistory.map((sale) => (
						<SaleCard sale={sale} key={sale._id} />
					))}
				</div>
			)}
		</section>
	);
}
