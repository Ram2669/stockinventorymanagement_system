import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function SalesManagement({ stocks, refreshData }) {
  const [formData, setFormData] = useState({
    product_name: '',
    company_name: '',
    quantity_sold: '',
    customer_name: '',
    sale_amount: ''
  });
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProductSelect = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
      const [productName, companyName] = selectedValue.split('|');
      const stock = stocks.find(s => s.product_name === productName && s.company_name === companyName);
      setSelectedProduct(stock);
      setFormData({
        ...formData,
        product_name: productName,
        company_name: companyName
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        ...formData,
        product_name: '',
        company_name: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    if (parseInt(formData.quantity_sold) > selectedProduct.quantity) {
      toast.error('Insufficient stock available');
      return;
    }

    try {
      await axios.post('/api/sales', formData);
      toast.success('Sale recorded successfully');
      setFormData({
        product_name: '',
        company_name: '',
        quantity_sold: '',
        customer_name: '',
        sale_amount: ''
      });
      setSelectedProduct(null);
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error recording sale');
    }
  };

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>Record New Sale</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Select Product</label>
              <select
                onChange={handleProductSelect}
                value={selectedProduct ? `${selectedProduct.product_name}|${selectedProduct.company_name}` : ''}
                required
              >
                <option value="">Select a product...</option>
                {stocks.filter(stock => stock.quantity > 0).map((stock) => (
                  <option 
                    key={stock.id} 
                    value={`${stock.product_name}|${stock.company_name}`}
                  >
                    {stock.product_name} - {stock.company_name} (Available: {stock.quantity})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Quantity to Sell</label>
              <input
                type="number"
                name="quantity_sold"
                value={formData.quantity_sold}
                onChange={handleInputChange}
                min="1"
                max={selectedProduct ? selectedProduct.quantity : 0}
                required
              />
              {selectedProduct && (
                <small style={{ color: '#666' }}>
                  Available: {selectedProduct.quantity}
                </small>
              )}
            </div>
            <div className="form-group">
              <label>Sale Amount (₹)</label>
              <input
                type="number"
                name="sale_amount"
                value={formData.sale_amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-success">
            Record Sale
          </button>
        </form>
      </div>

      {selectedProduct && (
        <div className="card" style={{ backgroundColor: '#f0fff4' }}>
          <h3 style={{ color: '#2d3748', marginBottom: '10px' }}>Selected Product Details</h3>
          <p><strong>Product:</strong> {selectedProduct.product_name}</p>
          <p><strong>Company:</strong> {selectedProduct.company_name}</p>
          <p><strong>Available Quantity:</strong> {selectedProduct.quantity}</p>
          <p><strong>Last Updated:</strong> {new Date(selectedProduct.date_added).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}

export default SalesManagement;
