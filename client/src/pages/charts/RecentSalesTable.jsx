import { useTranslation } from 'react-i18next';

export default function RecentSalesTable({ recentSales }) {
    const { t } = useTranslation();

    return (
        <section className="slds-m-bottom_large">
            <h2 className="slds-text-heading_medium slds-m-bottom_small">{t('recentSales')}</h2>
            {recentSales.length === 0 ? (
                <p>{t('noRecentSales')}</p>
            ) : (
                <table
                    className="slds-table slds-table_bordered slds-table_cell-buffer slds-m-bottom_small"
                    style={{ width: '100%' }}
                >
                    <thead>
                        <tr>
                            <th>{t('date')}</th>
                            <th>{t('customer')}</th>
                            <th>{t('totalAmount')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentSales.map(sale => (
                            <tr key={sale._id}>
                                <td>{sale.date ? new Date(sale.date).toLocaleString() : t('na')}</td>
                                <td>{sale.customerName || t('na')}</td>
                                <td>₹{(sale.totalAmount || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}
