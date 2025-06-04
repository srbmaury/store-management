export default function LowStockAlert({ lowStockItems }) {
    return (
        <section className="slds-m-bottom_large">
            <h2 className="slds-text-heading_medium slds-m-bottom_small">Low Stock Alerts</h2>
            {lowStockItems.length === 0 ? (
                <p>All inventory items are sufficiently stocked.</p>
            ) : (
                <ul>
                    {lowStockItems.map(item => (
                        <li key={item._id} style={{ color: 'red' }}>
                            {item.name} — Only {item.stock} left!
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
