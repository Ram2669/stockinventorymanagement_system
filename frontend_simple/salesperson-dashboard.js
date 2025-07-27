// Global variables
let currentUser = null;
let stockData = [];
let lastSaleId = null;
let allProducts = [];

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
        loadStockData(),
        loadProducts()
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

// Load products for search functionality
async function loadProducts() {
    try {
        const response = await axios.get(`${API_BASE}/stock`);
        allProducts = response.data;
        setupProductSearch();

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Setup product search functionality
function setupProductSearch() {
    const productSearch = document.getElementById('productSearch');
    const suggestions = document.getElementById('productSuggestions');
    const selectedProductId = document.getElementById('selectedProductId');

    if (!productSearch) return; // Element might not exist yet

    productSearch.addEventListener('input', function() {
        const query = this.value.toLowerCase();

        if (query.length < 1) {
            suggestions.style.display = 'none';
            selectedProductId.value = '';
            return;
        }

        const filteredProducts = allProducts.filter(product =>
            product.product_name.toLowerCase().includes(query) ||
            product.company_name.toLowerCase().includes(query)
        );

        if (filteredProducts.length > 0) {
            suggestions.innerHTML = filteredProducts.map(product => `
                <div class="suggestion-item" onclick="selectProduct(${product.id}, '${product.product_name}', '${product.company_name}', ${product.quantity}, ${product.unit_price || 0})">
                    <strong>${product.product_name}</strong> (${product.company_name})
                    <div class="product-info">Available: ${product.quantity} | Price: Rs.${product.unit_price || 'Not Set'}</div>
                </div>
            `).join('');
            suggestions.style.display = 'block';
        } else {
            suggestions.innerHTML = '<div class="suggestion-item">No products found</div>';
            suggestions.style.display = 'block';
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!productSearch.contains(e.target) && !suggestions.contains(e.target)) {
            suggestions.style.display = 'none';
        }
    });
}

// Select product from suggestions
function selectProduct(id, productName, companyName, quantity, unitPrice) {
    const productSearch = document.getElementById('productSearch');
    const suggestions = document.getElementById('productSuggestions');
    const selectedProductId = document.getElementById('selectedProductId');

    productSearch.value = `${productName} (${companyName})`;
    selectedProductId.value = id;
    suggestions.style.display = 'none';

    // Auto-fill unit price if available
    const unitPriceField = document.getElementById('unitPrice');
    if (unitPriceField && unitPrice > 0) {
        unitPriceField.value = unitPrice;
        updateTotalAmount(); // Calculate total if quantity is already entered
    }
}

// Update total amount when quantity changes
function updateTotalAmount() {
    const quantityField = document.getElementById('quantity');
    const unitPriceField = document.getElementById('unitPrice');
    const totalAmountField = document.getElementById('totalAmount');

    if (quantityField && unitPriceField && totalAmountField) {
        const quantity = parseFloat(quantityField.value) || 0;
        const unitPrice = parseFloat(unitPriceField.value) || 0;
        const total = quantity * unitPrice;

        totalAmountField.value = total.toFixed(2);
    }
}

function showRecordSale() {
    document.getElementById('recordSaleModal').style.display = 'block';
    // Setup product search when modal opens
    if (allProducts.length > 0) {
        setupProductSearch();
    }
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

function showReceiptOptions() {
    // Show receipt input modal
    document.getElementById('saleDetails').innerHTML = `
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h4 style="color: #2e7d32; margin: 0 0 15px 0;">📄 Receipt Generator</h4>
            <div style="margin-bottom: 15px;">
                <label for="receiptSaleIdInput" style="display: block; margin-bottom: 5px; font-weight: bold; color: #2e7d32;">Enter Sale ID:</label>
                <input type="number" id="receiptSaleIdInput" placeholder="Enter sale ID (e.g., 1, 2, 3...)"
                       style="width: 80%; padding: 10px; border: 2px solid #32CD32; border-radius: 5px; font-size: 16px; text-align: center;"
                       value="${lastSaleId || ''}">
            </div>
            <p style="margin: 0; font-size: 0.9em; color: #666;">Enter any sale ID to download or print its receipt</p>
        </div>
    `;

    document.getElementById('saleSuccessModal').style.display = 'block';
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
    const selectedProductId = formData.get('selectedProductId');

    if (!selectedProductId) {
        showMessage('Please select a product from the search suggestions', 'error');
        return;
    }

    // Find the selected product to get its details
    const selectedProduct = allProducts.find(p => p.id == selectedProductId);
    if (!selectedProduct) {
        showMessage('Selected product not found', 'error');
        return;
    }

    // Check if admin has set unit price
    if (!selectedProduct.unit_price || selectedProduct.unit_price <= 0) {
        showMessage('Unit price not set by admin for this product. Please contact admin.', 'error');
        return;
    }

    const quantity = parseInt(formData.get('quantity_sold'));

    // Validate stock availability
    if (selectedProduct.quantity < quantity) {
        showMessage('Insufficient stock available', 'error');
        return;
    }

    const saleData = {
        product_name: selectedProduct.product_name,
        company_name: selectedProduct.company_name,
        customer_name: formData.get('customer_name'),
        quantity_sold: quantity,
        unit_price: selectedProduct.unit_price, // Use admin-set price
        payment_status: formData.get('payment_status'),
        payment_method: formData.get('payment_method') || null
    };

    // Calculate sale amount using admin-set price
    saleData.sale_amount = quantity * selectedProduct.unit_price;

    try {
        const response = await axios.post(`${API_BASE}/sales`, saleData);

        // Store the sale ID for receipt generation
        lastSaleId = response.data.sale_id;

        // Show success modal with sale details
        showSaleSuccessModal(response.data);

        // Close record sale modal and reload data
        closeRecordSaleModal();
        loadDashboardData(); // Reload to update stock alerts

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

// Show sale success modal
function showSaleSuccessModal(saleData) {
    const saleDetails = document.getElementById('saleDetails');
    saleDetails.innerHTML = `
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h4 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 1.3em;">✅ Sale Recorded Successfully!</h4>
            <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                <p><strong>Customer:</strong> ${saleData.customer_name}</p>
                <p><strong>Product:</strong> ${saleData.product_name} (${saleData.company_name})</p>
                <p><strong>Quantity:</strong> ${saleData.quantity_sold}</p>
                <p><strong>Unit Price:</strong> Rs.${saleData.unit_price}</p>
                <p style="font-size: 1.2em; color: #2e7d32;"><strong>Total Amount: Rs.${saleData.sale_amount}</strong></p>
                <p><strong>Payment Status:</strong> ${saleData.payment_status === 'paid' ? '✅ Paid' : '💰 Unpaid'}</p>
                ${saleData.payment_method ? `<p><strong>Payment Method:</strong> ${saleData.payment_method.toUpperCase()}</p>` : ''}
            </div>
            <p style="color: #2e7d32; font-weight: bold; margin: 0;">📄 Download or Print Receipt Below</p>
        </div>
    `;

    document.getElementById('saleSuccessModal').style.display = 'block';
}

function closeSaleSuccessModal() {
    document.getElementById('saleSuccessModal').style.display = 'none';
}

// Download receipt
async function downloadReceipt() {
    // Try to get sale ID from input field first, then fallback to lastSaleId
    const inputElement = document.getElementById('receiptSaleIdInput');
    const saleId = inputElement ? inputElement.value : lastSaleId;

    if (!saleId) {
        alert('Please enter a sale ID or record a sale first');
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

// Print receipt
async function printReceipt() {
    // Try to get sale ID from input field first, then fallback to lastSaleId
    const inputElement = document.getElementById('receiptSaleIdInput');
    const saleId = inputElement ? inputElement.value : lastSaleId;

    if (!saleId) {
        alert('Please enter a sale ID or record a sale first');
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

// Close modal when clicking outside
window.onclick = function(event) {
    const recordModal = document.getElementById('recordSaleModal');
    const successModal = document.getElementById('saleSuccessModal');

    if (event.target === recordModal) {
        closeRecordSaleModal();
    }

    if (event.target === successModal) {
        closeSaleSuccessModal();
    }
}
