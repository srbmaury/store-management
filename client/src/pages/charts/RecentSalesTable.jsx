export default function RecentSalesTable({ recentSales }) {
    return (
        <section className="slds-m-bottom_large">
            <h2 className="slds-text-heading_medium slds-m-bottom_small">Recent Sales</h2>
            {recentSales.length === 0 ? (
                <p>No recent sales.</p>
            ) : (
                <table
                    className="slds-table slds-table_bordered slds-table_cell-buffer slds-m-bottom_small"
                    style={{ width: '100%' }}
                >
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentSales.map(sale => (
                            <tr key={sale._id}>
                                <td>{sale.date ? new Date(sale.date).toLocaleString() : 'N/A'}</td>
                                <td>{sale.customerName || 'N/A'}</td>
                                <td>₹{(sale.totalAmount || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}