// Global variables
let currentPeriod = 30;
let currentUser = null;

// Check authentication on page load
window.addEventListener('DOMContentLoaded', async () => {
    await checkAuthentication();
    await loadDashboardData();
});

async function checkAuthentication() {
    const sessionToken = localStorage.getItem('session_token');
    const userData = localStorage.getItem('user_data');
    
    if (!sessionToken || !userData) {
        window.location.href = 'login.html';
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
        loadUsers(),
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

async function logout() {
    try {
        const sessionToken = localStorage.getItem('session_token');
        if (sessionToken) {
            await axios.post(`${API_BASE}/auth/logout`, { session_token: sessionToken });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear all session data
        localStorage.removeItem('session_token');
        localStorage.removeItem('user_data');
        sessionStorage.clear();

        // Clear browser cache and prevent back button access
        if (window.history && window.history.pushState) {
            window.history.pushState(null, null, 'login.html');
            window.history.pushState(null, null, 'login.html');
            window.onpopstate = function() {
                window.history.go(1);
            };
        }

        // Redirect to login
        window.location.replace('login.html');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('addUserModal');
    if (event.target === modal) {
        closeAddUserModal();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('addUserModal');
    if (event.target === modal) {
        closeAddUserModal();
    }
}
