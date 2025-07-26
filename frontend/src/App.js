import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StockManagement from './components/StockManagement';
import SalesManagement from './components/SalesManagement';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stocks, setStocks] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetchStocks();
    fetchSales();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await axios.get('/api/stock');
      setStocks(response.data);
    } catch (error) {
      toast.error('Error fetching stocks');
    }
  };

  const fetchSales = async () => {
    try {
      const response = await axios.get('/api/sales');
      setSales(response.data);
    } catch (error) {
      toast.error('Error fetching sales');
    }
  };

  const refreshData = () => {
    fetchStocks();
    fetchSales();
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stocks={stocks} sales={sales} />;
      case 'stock':
        return <StockManagement stocks={stocks} refreshData={refreshData} />;
      case 'sales':
        return <SalesManagement stocks={stocks} refreshData={refreshData} />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard stocks={stocks} sales={sales} />;
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>SRI LAKSHMI ENTERPRISES</h1>
        <p>Stock Management System</p>
      </div>

      <div className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`nav-tab ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          Stock Management
        </button>
        <button
          className={`nav-tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Sales Management
        </button>
        <button
          className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      {renderActiveTab()}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
