import React from 'react';

function Dashboard({ stocks, sales }) {
  const totalProducts = stocks.length;
  const totalStock = stocks.reduce((sum, stock) => sum + stock.quantity, 0);
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.sale_amount, 0);

  // Get recent sales (last 5)
  const recentSales = sales
    .sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date))
    .slice(0, 5);

  // Get low stock items (quantity < 10)
  const lowStockItems = stocks.filter(stock => stock.quantity < 10);

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{totalProducts}</h3>
          <p>Total Products</p>
        </div>
        <div className="stat-card">
          <h3>{totalStock}</h3>
          <p>Total Stock Quantity</p>
        </div>
        <div className="stat-card">
          <h3>{totalSales}</h3>
          <p>Total Sales</p>
        </div>
        <div className="stat-card">
          <h3>₹{totalRevenue.toFixed(2)}</h3>
          <p>Total Revenue</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>Recent Sales</h2>
          {recentSales.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                    <td>{sale.customer_name}</td>
                    <td>{sale.product_name}</td>
                    <td>₹{sale.sale_amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No recent sales</p>
          )}
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>Low Stock Alert</h2>
          {lowStockItems.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Company</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((stock) => (
                  <tr key={stock.id} style={{ backgroundColor: '#fed7d7' }}>
                    <td>{stock.product_name}</td>
                    <td>{stock.company_name}</td>
                    <td>{stock.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#38a169' }}>All products have sufficient stock</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
