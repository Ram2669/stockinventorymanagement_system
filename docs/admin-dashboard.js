// Global variables
let currentPeriod = 30;
let currentUser = null;

// Check authentication on page load
window.addEventListener('DOMContentLoaded', async () => {
    await checkAuthentication();
    await loadDashboardData();
});

async function checkAuthentication() {
    // Check if user was logged out
    if (localStorage.getItem('logged_out') === 'true') {
        localStorage.removeItem('logged_out');
        window.location.replace('login.html');
        return;
    }

    const sessionToken = localStorage.getItem('session_token');
    const userData = localStorage.getItem('user_data');

    if (!sessionToken || !userData) {
        window.location.replace('login.html');
        return;
    }
    
    try {
        const response = await axios.post(`${API_BASE}/auth/verify-session`, {
            session_token: sessionToken
        });
        
        currentUser = response.data.user;
        
        if (currentUser.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'login.html';
            return;
        }
        
    } catch (error) {
        console.error('Authentication failed:', error);
        localStorage.removeItem('session_token');
        localStorage.removeItem('user_data');
        window.location.href = 'login.html';
    }
}

async function loadDashboardData() {
    await Promise.all([
        loadDashboardStats(),
        loadStockInventory(),
        loadUsers(),
        loadDailySales(),
        loadAnalytics()
    ]);
}

async function loadDashboardStats() {
    try {
        const response = await axios.get(`${API_BASE}/analytics/dashboard-stats`);
        const stats = response.data;
        
        const statsGrid = document.getElementById('statsGrid');
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="icon"><i class="fas fa-shopping-cart"></i></div>
                <h3>${stats.total_stats.total_sales}</h3>
                <p>Total Sales</p>
            </div>
            <div class="stat-card revenue">
                <div class="icon"><i class="fas fa-rupee-sign"></i></div>
                <h3>₹${stats.total_stats.total_revenue.toLocaleString()}</h3>
                <p>Total Revenue</p>
            </div>
            <div class="stat-card payment">
                <div class="icon"><i class="fas fa-credit-card"></i></div>
                <h3>${stats.payment_stats.payment_rate.toFixed(1)}%</h3>
                <p>Payment Rate</p>
            </div>
            <div class="stat-card stock">
                <div class="icon"><i class="fas fa-exclamation-triangle"></i></div>
                <h3>${stats.total_stats.low_stock_items}</h3>
                <p>Low Stock Items</p>
            </div>
            <div class="stat-card">
                <div class="icon"><i class="fas fa-calendar-day"></i></div>
                <h3>₹${stats.today_stats.revenue.toLocaleString()}</h3>
                <p>Today's Revenue</p>
            </div>
            <div class="stat-card">
                <div class="icon"><i class="fas fa-calendar-week"></i></div>
                <h3>₹${stats.weekly_stats.revenue.toLocaleString()}</h3>
                <p>Weekly Revenue</p>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        document.getElementById('statsGrid').innerHTML = 
            '<div class="error">Failed to load dashboard statistics</div>';
    }
}

async function loadUsers() {
    try {
        const response = await axios.get(`${API_BASE}/auth/users`);
        const users = response.data.users;
        
        const usersList = document.getElementById('usersList');
        
        if (users.length === 0) {
            usersList.innerHTML = '<p>No users found.</p>';
            return;
        }
        
        const tableHTML = `
            <table class="user-table">
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created</th>
                        <th>Last Login</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.full_name}</td>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td><span class="role-badge ${user.role}">${user.role.toUpperCase()}</span></td>
                            <td>${new Date(user.created_at).toLocaleDateString()}</td>
                            <td>${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                            <td>${user.is_active ? '✅ Active' : '❌ Inactive'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        usersList.innerHTML = tableHTML;
        
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersList').innerHTML =
            '<div class="error">Failed to load users</div>';
    }
}

// Load daily sales
async function loadDailySales() {
    try {
        console.log('Loading daily sales...');
        const response = await axios.get(`${API_BASE}/sales/daily?t=${Date.now()}`); // Add timestamp to prevent caching
        const data = response.data;
        console.log('Daily sales loaded:', data.sales.length, 'sales today');

        // Update daily sales summary
        const summaryElement = document.getElementById('dailySalesSummary');
        summaryElement.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-shopping-cart"></i></div>
                <div class="stat-info">
                    <h3>${data.summary.total_sales}</h3>
                    <p>Total Sales Today</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-rupee-sign"></i></div>
                <div class="stat-info">
                    <h3>Rs.${data.summary.total_revenue.toFixed(2)}</h3>
                    <p>Today's Revenue</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                <div class="stat-info">
                    <h3>${data.summary.paid_sales}</h3>
                    <p>Paid Sales</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-clock"></i></div>
                <div class="stat-info">
                    <h3>${data.summary.unpaid_sales}</h3>
                    <p>Unpaid Sales</p>
                </div>
            </div>
        `;

        // Update daily sales list
        const salesList = document.getElementById('dailySalesList');

        if (data.sales.length === 0) {
            salesList.innerHTML = '<div class="no-data">No sales recorded today</div>';
            return;
        }

        salesList.innerHTML = `
            <div class="sales-table">
                <table>
                    <thead>
                        <tr>
                            <th>Sale ID</th>
                            <th>Time</th>
                            <th>Customer</th>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Amount</th>
                            <th>Payment</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.sales.map(sale => `
                            <tr>
                                <td>#${sale.id}</td>
                                <td>${new Date(sale.sale_date).toLocaleTimeString()}</td>
                                <td>${sale.customer_name}</td>
                                <td>${sale.product_name} (${sale.company_name})</td>
                                <td>${sale.quantity_sold}</td>
                                <td>Rs.${sale.sale_amount.toFixed(2)}</td>
                                <td>
                                    <span class="payment-status ${sale.payment_status}">
                                        ${sale.payment_status === 'paid' ? '✅ Paid' : '💰 Unpaid'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

    } catch (error) {
        console.error('Error loading daily sales:', error);
        document.getElementById('dailySalesSummary').innerHTML = '<div class="error">Error loading daily sales summary</div>';
        document.getElementById('dailySalesList').innerHTML = '<div class="error">Error loading daily sales</div>';
    }
}

async function loadAnalytics() {
    await Promise.all([
        loadTopProducts(),
        loadTopCustomers(),
        loadStockMovement(),
        loadStockAlerts()
    ]);
}

async function loadTopProducts() {
    try {
        const response = await axios.get(`${API_BASE}/analytics/top-selling-products?days=${currentPeriod}&limit=5`);
        const data = response.data;
        
        const topProducts = document.getElementById('topProducts');
        
        if (data.top_by_revenue.length === 0) {
            topProducts.innerHTML = '<p>No sales data available for this period.</p>';
            return;
        }
        
        topProducts.innerHTML = data.top_by_revenue.map(product => `
            <div class="product-item">
                <div class="product-info">
                    <h4>${product.product_name}</h4>
                    <p>${product.company_name} • ${product.sale_count} sales</p>
                </div>
                <div class="product-stats">
                    <div class="revenue">₹${product.total_revenue.toLocaleString()}</div>
                    <div class="quantity">${product.total_quantity} units</div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading top products:', error);
        document.getElementById('topProducts').innerHTML = 
            '<div class="error">Failed to load product data</div>';
    }
}

async function loadTopCustomers() {
    try {
        const response = await axios.get(`${API_BASE}/analytics/customer-analysis?days=${currentPeriod}&limit=5`);
        const data = response.data;
        
        const topCustomers = document.getElementById('topCustomers');
        
        if (data.top_customers.length === 0) {
            topCustomers.innerHTML = '<p>No customer data available for this period.</p>';
            return;
        }
        
        topCustomers.innerHTML = data.top_customers.map(customer => `
            <div class="product-item">
                <div class="product-info">
                    <h4>${customer.customer_name}</h4>
                    <p>${customer.purchase_count} purchases • ${customer.total_items} items</p>
                </div>
                <div class="product-stats">
                    <div class="revenue">₹${customer.total_spent.toLocaleString()}</div>
                    <div class="quantity">Avg: ₹${customer.avg_purchase.toFixed(0)}</div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading customer data:', error);
        document.getElementById('topCustomers').innerHTML = 
            '<div class="error">Failed to load customer data</div>';
    }
}

async function loadStockMovement() {
    try {
        const response = await axios.get(`${API_BASE}/analytics/stock-movement?days=${currentPeriod}`);
        const data = response.data;
        
        const stockMovement = document.getElementById('stockMovement');
        
        // Show top 5 fastest moving items
        const fastMoving = data.stock_movement
            .filter(item => item.sold_quantity > 0)
            .sort((a, b) => b.velocity_per_day - a.velocity_per_day)
            .slice(0, 5);
        
        if (fastMoving.length === 0) {
            stockMovement.innerHTML = '<p>No stock movement data available.</p>';
            return;
        }
        
        stockMovement.innerHTML = fastMoving.map(item => `
            <div class="product-item">
                <div class="product-info">
                    <h4>${item.product_name}</h4>
                    <p>${item.company_name} • ${item.current_stock} in stock</p>
                </div>
                <div class="product-stats">
                    <div class="revenue">${item.velocity_per_day}/day</div>
                    <div class="quantity">${item.sold_quantity} sold</div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading stock movement:', error);
        document.getElementById('stockMovement').innerHTML = 
            '<div class="error">Failed to load stock movement data</div>';
    }
}

async function loadStockAlerts() {
    try {
        const response = await axios.get(`${API_BASE}/analytics/low-stock-alerts`);
        const data = response.data;
        
        const stockAlerts = document.getElementById('stockAlerts');
        
        if (data.alerts.length === 0) {
            stockAlerts.innerHTML = '<p style="color: #28a745;">✅ All products are well stocked!</p>';
            return;
        }
        
        stockAlerts.innerHTML = data.alerts.map(alert => `
            <div class="product-item" style="border-left-color: ${alert.alert_level === 'danger' ? '#dc3545' : '#ffc107'}">
                <div class="product-info">
                    <h4>${alert.product_name}</h4>
                    <p>${alert.company_name}</p>
                </div>
                <div class="product-stats">
                    <div class="revenue" style="color: ${alert.alert_level === 'danger' ? '#dc3545' : '#ffc107'}">${alert.status}</div>
                    <div class="quantity">${alert.current_quantity} left</div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading stock alerts:', error);
        document.getElementById('stockAlerts').innerHTML = 
            '<div class="error">Failed to load stock alerts</div>';
    }
}

function changePeriod(days) {
    currentPeriod = days;
    
    // Update active button
    document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Reload analytics
    loadAnalytics();
}

function showAddUserModal() {
    document.getElementById('addUserModal').style.display = 'block';
}

function closeAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
    document.getElementById('addUserForm').reset();
    document.getElementById('addUserMessage').innerHTML = '';
}

// Add user form handler
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        full_name: formData.get('full_name'),
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        admin_id: currentUser.id
    };
    
    try {
        const response = await axios.post(`${API_BASE}/auth/register/salesperson`, userData);
        
        document.getElementById('addUserMessage').innerHTML = 
            '<div class="success-message">Salesperson added successfully!</div>';
        
        // Reload users list
        setTimeout(() => {
            closeAddUserModal();
            loadUsers();
        }, 2000);
        
    } catch (error) {
        const errorMessage = error.response?.data?.error || 'Failed to add salesperson';
        document.getElementById('addUserMessage').innerHTML = 
            `<div class="error-message">${errorMessage}</div>`;
    }
});

// Add user form handler
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const userData = {
        full_name: formData.get('full_name'),
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        admin_id: currentUser.id
    };

    try {
        const response = await axios.post(`${API_BASE}/auth/register/salesperson`, userData);

        document.getElementById('addUserMessage').innerHTML =
            '<div class="success-message">Salesperson added successfully!</div>';

        // Reload users list
        setTimeout(() => {
            closeAddUserModal();
            loadUsers();
        }, 2000);

    } catch (error) {
        const errorMessage = error.response?.data?.error || 'Failed to add salesperson';
        document.getElementById('addUserMessage').innerHTML =
            `<div class="error-message">${errorMessage}</div>`;
    }
});

function logout() {
    console.log('Logout function called');

    // Clear all session data immediately
    localStorage.removeItem('session_token');
    localStorage.removeItem('user_data');
    sessionStorage.clear();

    // Set a logout flag
    localStorage.setItem('logged_out', 'true');

    console.log('Session data cleared, redirecting...');

    // Use replace to prevent back button access
    window.location.replace('login.html');
}

// Download weekly report by customer
async function downloadWeeklyReportByCustomer() {
    try {
        const response = await axios.get(`${API_BASE}/reports/weekly/customer`, {
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

        alert('Weekly report by customer downloaded successfully!');
    } catch (error) {
        console.error('Error downloading report:', error);
        alert('Error downloading weekly report');
    }
}

// Download weekly report by date
async function downloadWeeklyReportByDate() {
    try {
        const response = await axios.get(`${API_BASE}/reports/weekly/date`, {
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

        alert('Weekly report by date downloaded successfully!');
    } catch (error) {
        console.error('Error downloading report:', error);
        alert('Error downloading weekly report');
    }
}

// Download receipt by ID
async function downloadReceiptById() {
    const saleId = document.getElementById('receiptSaleId').value;

    if (!saleId) {
        alert('Please enter a sale ID');
        return;
    }

    try {
        const response = await axios.get(`${API_BASE}/sales/${saleId}/receipt`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `receipt_${saleId}_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        alert('Receipt downloaded successfully!');
    } catch (error) {
        console.error('Error downloading receipt:', error);
        alert('Error downloading receipt. Please check if the sale ID exists.');
    }
}

// Print receipt by ID
async function printReceiptById() {
    const saleId = document.getElementById('receiptSaleId').value;

    if (!saleId) {
        alert('Please enter a sale ID');
        return;
    }

    try {
        const response = await axios.get(`${API_BASE}/sales/${saleId}/receipt`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const printWindow = window.open(url);
        printWindow.onload = function() {
            printWindow.print();
        };
    } catch (error) {
        console.error('Error printing receipt:', error);
        alert('Error printing receipt. Please check if the sale ID exists.');
    }
}

// Load stock inventory
async function loadStockInventory() {
    try {
        const response = await axios.get(`${API_BASE}/stock`);
        const stockItems = response.data;

        const stockList = document.getElementById('stockInventoryList');

        if (stockItems.length === 0) {
            stockList.innerHTML = '<p>No stock items found.</p>';
            return;
        }

        const tableHTML = `
            <table class="user-table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Company</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total Value</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${stockItems.map(item => `
                        <tr>
                            <td>${item.product_name}</td>
                            <td>${item.company_name}</td>
                            <td>${item.quantity}</td>
                            <td>Rs.${item.unit_price || 'Not Set'}</td>
                            <td>Rs.${item.unit_price ? (item.quantity * item.unit_price).toFixed(2) : 'N/A'}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editStock(${item.id})">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteStock(${item.id})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        stockList.innerHTML = tableHTML;

    } catch (error) {
        console.error('Error loading stock inventory:', error);
        document.getElementById('stockInventoryList').innerHTML = '<p>Error loading stock inventory.</p>';
    }
}

// Stock management functions
function showAddStockModal() {
    document.getElementById('addStockModal').style.display = 'block';
}

function closeAddStockModal() {
    document.getElementById('addStockModal').style.display = 'none';
    document.getElementById('addStockForm').reset();
    document.getElementById('addStockMessage').innerHTML = '';
}

function showEditStockModal() {
    document.getElementById('editStockModal').style.display = 'block';
}

function closeEditStockModal() {
    document.getElementById('editStockModal').style.display = 'none';
    document.getElementById('editStockForm').reset();
    document.getElementById('editStockMessage').innerHTML = '';
}

// Add stock form submission
document.getElementById('addStockForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const stockData = {
        product_name: formData.get('productName'),
        company_name: formData.get('companyName'),
        quantity: parseInt(formData.get('quantity')),
        unit_price: parseFloat(formData.get('unitPrice'))
    };

    try {
        const response = await axios.post(`${API_BASE}/stock`, stockData);

        document.getElementById('addStockMessage').innerHTML =
            '<div class="success-message">Product added successfully!</div>';

        setTimeout(() => {
            closeAddStockModal();
            loadStockInventory();
        }, 2000);

    } catch (error) {
        const errorMessage = error.response?.data?.error || 'Failed to add product';
        document.getElementById('addStockMessage').innerHTML =
            `<div class="error-message">${errorMessage}</div>`;
    }
});

// Edit stock form submission
document.getElementById('editStockForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const stockId = formData.get('stockId');
    const stockData = {
        product_name: formData.get('productName'),
        company_name: formData.get('companyName'),
        quantity: parseInt(formData.get('quantity')),
        unit_price: parseFloat(formData.get('unitPrice'))
    };

    try {
        const response = await axios.put(`${API_BASE}/stock/${stockId}`, stockData);

        document.getElementById('editStockMessage').innerHTML =
            '<div class="success-message">Product updated successfully!</div>';

        setTimeout(() => {
            closeEditStockModal();
            loadStockInventory();
        }, 2000);

    } catch (error) {
        const errorMessage = error.response?.data?.error || 'Failed to update product';
        document.getElementById('editStockMessage').innerHTML =
            `<div class="error-message">${errorMessage}</div>`;
    }
});

// Edit stock function
async function editStock(stockId) {
    try {
        console.log(`Loading stock item ${stockId}...`);
        const response = await axios.get(`${API_BASE}/stock/${stockId}`);
        const stock = response.data;

        console.log('Stock data loaded:', stock);

        document.getElementById('editStockId').value = stock.id;
        document.getElementById('editProductName').value = stock.product_name;
        document.getElementById('editCompanyName').value = stock.company_name;
        document.getElementById('editQuantity').value = stock.quantity;
        document.getElementById('editUnitPrice').value = stock.unit_price || '';

        showEditStockModal();

    } catch (error) {
        console.error('Error loading stock item:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Failed to load stock item details';
        alert(`Error loading stock item details: ${errorMessage}`);
    }
}

// Delete stock function
async function deleteStock(stockId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        await axios.delete(`${API_BASE}/stock/${stockId}`);
        alert('Product deleted successfully!');
        loadStockInventory();

    } catch (error) {
        alert('Error deleting product');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const addUserModal = document.getElementById('addUserModal');
    const addStockModal = document.getElementById('addStockModal');
    const editStockModal = document.getElementById('editStockModal');

    if (event.target === addUserModal) {
        closeAddUserModal();
    }

    if (event.target === addStockModal) {
        closeAddStockModal();
    }

    if (event.target === editStockModal) {
        closeEditStockModal();
    }
}
