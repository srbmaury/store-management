export function generateInvoiceHtml(sale) {
    return `
    <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: Arial; padding: 1rem; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          th, td { border-bottom: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f9f9f9; }
          h2, h3 { text-align: center; }
        </style>
      </head>
      <body>
        <h2>Invoice</h2>
        <p><strong>Date:</strong> ${new Date(sale.date).toLocaleString()}</p>
        <p><strong>Customer:</strong> ${sale.customerName || 'N/A'}</p>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map(({ item, quantity, price }) => `
              <tr>
                <td>${item?.name || 'Unnamed Item'}</td>
                <td style="text-align:center;">${quantity}</td>
                <td style="text-align:center;">₹${price.toFixed(2)}</td>
                <td style="text-align:center;">₹${(quantity * price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 style="text-align:right;">Total: ₹${sale.totalAmount?.toFixed(2) || 0}</h3>
        <script>
          window.onload = function () {
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
      </body>
    </html>
  `;
}