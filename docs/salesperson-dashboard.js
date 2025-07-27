// Global variables
let currentUser = null;
let stockData = [];

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
        
        if (currentUser.role !== 'salesperson') {
            alert('Access denied. Salesperson privileges required.');
            window.location.href = 'login.html';
            return;
        }
        
        // Update welcome message
        document.getElementById('welcomeMessage').textContent = 
            `Welcome back, ${currentUser.full_name}!`;
        
    } catch (error) {
        console.error('Authentication failed:', error);
        localStorage.removeItem('session_token');
        localStorage.removeItem('user_data');
        window.location.href = 'login.html';
    }
}

async function loadDashboardData() {
    await Promise.all([
        loadStockAlerts(),
        loadStockData()
    ]);
}

async function loadStockAlerts() {
    try {
        const response = await axios.get(`${API_BASE}/analytics/low-stock-alerts`);
        const data = response.data;
        
        const stockAlerts = document.getElementById('stockAlerts');
        
        if (data.alerts.length === 0) {
            stockAlerts.innerHTML = `
                <div class="no-alerts">
                    <i class="fas fa-check-circle" style="font-size: 2em; margin-bottom: 10px;"></i>
                    <div>✅ All products are well stocked!</div>
                    <div style="font-size: 0.9em; margin-top: 5px;">No low stock alerts at this time.</div>
                </div>
            `;
            return;
        }
        
        stockAlerts.innerHTML = data.alerts.map(alert => `
            <div class="alert-item ${alert.alert_level}">
                <div class="alert-info">
                    <h4>${alert.product_name}</h4>
                    <p>${alert.company_name}</p>
                </div>
                <div class="alert-status">
                    <div class="status ${alert.alert_level === 'danger' ? 'critical' : 'low'}">${alert.status}</div>
                    <div class="quantity">${alert.current_quantity} units left</div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading stock alerts:', error);
        document.getElementById('stockAlerts').innerHTML = 
            '<div class="error">Failed to load stock alerts</div>';
    }
}

async function loadStockData() {
    try {
        const response = await axios.get(`${API_BASE}/stock`);
        stockData = response.data;
        
        // Populate product dropdown
        const productSelect = document.getElementById('productSelect');
        productSelect.innerHTML = '<option value="">Select a product...</option>';
        
        stockData.forEach(item => {
            if (item.quantity > 0) { // Only show products with stock
                productSelect.innerHTML += `
                    <option value="${item.product_name}|${item.company_name}" data-stock="${item.quantity}">
                        ${item.product_name} (${item.company_name}) - ${item.quantity} available
                    </option>
                `;
            }
        });
        
    } catch (error) {
        console.error('Error loading stock data:', error);
    }
}

function showRecordSale() {
    document.getElementById('recordSaleModal').style.display = 'block';
}

function closeRecordSaleModal() {
    document.getElementById('recordSaleModal').style.display = 'none';
    document.getElementById('recordSaleForm').reset();
    document.getElementById('saleMessage').innerHTML = '';
    document.getElementById('paymentMethodGroup').style.display = 'none';
}

function showStockAlerts() {
    // Scroll to stock alerts section
    document.querySelector('.alerts-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Calculate total amount when quantity or unit price changes
document.getElementById('quantity').addEventListener('input', calculateTotal);
document.getElementById('unitPrice').addEventListener('input', calculateTotal);

function calculateTotal() {
    const quantity = parseFloat(document.getElementById('quantity').value) || 0;
    const unitPrice = parseFloat(document.getElementById('unitPrice').value) || 0;
    const total = quantity * unitPrice;
    
    document.getElementById('totalAmount').value = total > 0 ? `Rs.${total.toFixed(2)}` : '';
}

// Show/hide payment method based on payment status
document.getElementById('paymentStatus').addEventListener('change', function() {
    const paymentMethodGroup = document.getElementById('paymentMethodGroup');
    const paymentMethod = document.getElementById('paymentMethod');
    
    if (this.value === 'paid') {
        paymentMethodGroup.style.display = 'block';
        paymentMethod.required = true;
    } else {
        paymentMethodGroup.style.display = 'none';
        paymentMethod.required = false;
        paymentMethod.value = '';
    }
});

// Validate stock availability when product is selected
document.getElementById('productSelect').addEventListener('change', function() {
    const quantityInput = document.getElementById('quantity');
    
    if (this.value) {
        const availableStock = parseInt(this.selectedOptions[0].dataset.stock);
        quantityInput.max = availableStock;
        quantityInput.placeholder = `Max: ${availableStock}`;
    } else {
        quantityInput.max = '';
        quantityInput.placeholder = '';
    }
});

// Record sale form handler
document.getElementById('recordSaleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productInfo = formData.get('product').split('|');
    
    if (productInfo.length !== 2) {
        showMessage('Please select a valid product', 'error');
        return;
    }
    
    const saleData = {
        product_name: productInfo[0],
        company_name: productInfo[1],
        customer_name: formData.get('customer_name'),
        quantity_sold: parseInt(formData.get('quantity_sold')),
        unit_price: parseFloat(formData.get('unit_price')),
        payment_status: formData.get('payment_status'),
        payment_method: formData.get('payment_method') || null
    };
    
    // Validate stock availability
    const selectedProduct = stockData.find(item => 
        item.product_name === saleData.product_name && 
        item.company_name === saleData.company_name
    );
    
    if (!selectedProduct || selectedProduct.quantity < saleData.quantity_sold) {
        showMessage('Insufficient stock available', 'error');
        return;
    }
    
    try {
        const response = await axios.post(`${API_BASE}/sales`, saleData);
        
        showMessage('Sale recorded successfully!', 'success');
        
        // Reset form and reload data
        setTimeout(() => {
            closeRecordSaleModal();
            loadDashboardData(); // Reload to update stock alerts
        }, 2000);
        
    } catch (error) {
        const errorMessage = error.response?.data?.error || 'Failed to record sale';
        showMessage(errorMessage, 'error');
    }
});

function showMessage(message, type) {
    const messageDiv = document.getElementById('saleMessage');
    messageDiv.innerHTML = `<div class="${type}-message">${message}</div>`;
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}

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
    const modal = document.getElementById('recordSaleModal');
    if (event.target === modal) {
        closeRecordSaleModal();
    }
}
