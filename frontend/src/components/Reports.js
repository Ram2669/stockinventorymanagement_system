import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Reports() {
  const [weeklySales, setWeeklySales] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWeeklySales();
  }, []);

  const fetchWeeklySales = async () => {
    try {
      const response = await axios.get('/api/sales/weekly');
      setWeeklySales(response.data);
    } catch (error) {
      toast.error('Error fetching weekly sales');
    }
  };

  const downloadCustomerReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reports/weekly/customer', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `weekly_report_by_customer_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Customer report downloaded successfully');
    } catch (error) {
      toast.error('Error downloading customer report');
    }
    setLoading(false);
  };

  const downloadDateReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reports/weekly/date', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `weekly_report_by_date_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Date report downloaded successfully');
    } catch (error) {
      toast.error('Error downloading date report');
    }
    setLoading(false);
  };

  const totalWeeklyRevenue = weeklySales.reduce((sum, sale) => sum + sale.sale_amount, 0);
  const totalWeeklySales = weeklySales.length;

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>Weekly Reports</h2>
        
        <div className="stats-grid" style={{ marginBottom: '30px' }}>
          <div className="stat-card">
            <h3>{totalWeeklySales}</h3>
            <p>Sales This Week</p>
          </div>
          <div className="stat-card">
            <h3>₹{totalWeeklyRevenue.toFixed(2)}</h3>
            <p>Revenue This Week</p>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px', color: '#2d3748' }}>Download PDF Reports</h3>
          <button
            className="btn btn-primary"
            onClick={downloadCustomerReport}
            disabled={loading}
            style={{ marginRight: '15px' }}
          >
            {loading ? 'Generating...' : 'Download Report by Customer'}
          </button>
          <button
            className="btn btn-success"
            onClick={downloadDateReport}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Download Report by Date'}
          </button>
        </div>

        <div>
          <h3 style={{ marginBottom: '15px', color: '#2d3748' }}>Weekly Sales Summary</h3>
          {weeklySales.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Company</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {weeklySales
                  .sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date))
                  .map((sale) => (
                    <tr key={sale.id}>
                      <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                      <td>{sale.customer_name}</td>
                      <td>{sale.product_name}</td>
                      <td>{sale.company_name}</td>
                      <td>{sale.quantity_sold}</td>
                      <td>₹{sale.sale_amount.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p>No sales recorded this week</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
