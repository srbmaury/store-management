export default function KPICards({ totalSalesCount, totalRevenue, totalInventoryItems, lowStockItems }) {
    return (
        <div>
            <div className="slds-grid slds-wrap slds-m-bottom_large" style={{ gap: '1rem' }}>
                {[
                    { label: 'Total Sales', value: totalSalesCount },
                    { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(2)}` },
                    { label: 'Inventory Items', value: totalInventoryItems },
                    {
                        label: 'Low Stock Items',
                        value: lowStockItems.length,
                        style: { color: lowStockItems.length > 0 ? 'red' : 'inherit' },
                    },
                ].map(({ label, value, style }, i) => (
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