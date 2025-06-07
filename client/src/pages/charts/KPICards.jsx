import { useTranslation } from 'react-i18next';

export default function KPICards({ totalSalesCount, totalRevenue, totalInventoryItems, lowStockItems }) {
    const { t } = useTranslation();

    const cards = [
        { label: t('totalSales', 'Total Sales'), value: totalSalesCount },
        { label: t('totalRevenue', 'Total Revenue'), value: `₹${totalRevenue.toFixed(2)}` },
        { label: t('inventoryItems', 'Inventory Items'), value: totalInventoryItems },
        {
            label: t('lowStockItems', 'Low Stock Items'),
            value: lowStockItems.length,
            style: { color: lowStockItems.length > 0 ? 'red' : 'inherit' },
        },
    ];

    return (
        <div>
            <div className="slds-grid slds-wrap slds-m-bottom_large" style={{ gap: '1rem' }}>
                {cards.map(({ label, value, style }, i) => (
                    <div
                        key={i}
                        className="slds-box slds-size_1-of-1 slds-medium-size_1-of-4"
                        style={{ textAlign: 'center', ...style }}
                    >
                        <h3>{label}</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
