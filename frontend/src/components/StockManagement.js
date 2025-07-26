import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function StockManagement({ stocks, refreshData }) {
  const [formData, setFormData] = useState({
    product_name: '',
    company_name: '',
    quantity: ''
  });
  const [editingStock, setEditingStock] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStock) {
        await axios.put(`/api/stock/${editingStock.id}`, formData);
        toast.success('Stock updated successfully');
        setEditingStock(null);
      } else {
        await axios.post('/api/stock', formData);
        toast.success('Stock added successfully');
      }
      setFormData({ product_name: '', company_name: '', quantity: '' });
      refreshData();
    } catch (error) {
      toast.error('Error saving stock');
    }
  };

  const handleEdit = (stock) => {
    setEditingStock(stock);
    setFormData({
      product_name: stock.product_name,
      company_name: stock.company_name,
      quantity: stock.quantity.toString()
    });
  };

  const handleDelete = async (stockId) => {
    if (window.confirm('Are you sure you want to delete this stock item?')) {
      try {
        await axios.delete(`/api/stock/${stockId}`);
        toast.success('Stock deleted successfully');
        refreshData();
      } catch (error) {
        toast.error('Error deleting stock');
      }
    }
  };

  const cancelEdit = () => {
    setEditingStock(null);
    setFormData({ product_name: '', company_name: '', quantity: '' });
  };

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>
          {editingStock ? 'Edit Stock' : 'Add New Stock'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
          </div>
          <div>
            <button type="submit" className="btn btn-primary">
              {editingStock ? 'Update Stock' : 'Add Stock'}
            </button>
            {editingStock && (
              <button type="button" className="btn btn-danger" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>Current Stock</h2>
        {stocks.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Company Name</th>
                <th>Quantity</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr key={stock.id}>
                  <td>{stock.product_name}</td>
                  <td>{stock.company_name}</td>
                  <td>{stock.quantity}</td>
                  <td>{new Date(stock.date_added).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEdit(stock)}
                      style={{ marginRight: '10px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(stock.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No stock items found</p>
        )}
      </div>
    </div>
  );
}

export default StockManagement;
