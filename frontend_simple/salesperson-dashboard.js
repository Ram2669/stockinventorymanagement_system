// Global variables
let currentUser = null;
let stockData = [];
let lastSaleId = null;
let allProducts = [];

// EMERGENCY DEBUG
console.log('🚨 EMERGENCY: Salesperson dashboard JavaScript loaded!');
console.log('🚨 API_BASE:', typeof API_BASE !== 'undefined' ? API_BASE : 'UNDEFINED');
console.log('🚨 axios available:', typeof axios !== 'undefined');

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
        loadProducts(),
        loadDailySales()
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

// Load daily sales for salesperson
async function loadDailySales() {
    try {
        console.log('Loading daily sales...');
        const response = await axios.get(`${API_BASE}/sales/daily?t=${Date.now()}`); // Add timestamp to prevent caching
        const data = response.data;
        console.log('Daily sales loaded:', data.sales.length, 'sales today');

        // Update daily sales summary with action cards
        const summaryElement = document.getElementById('dailySalesSummary');
        summaryElement.innerHTML = `
            <div class="action-card" style="background: linear-gradient(135deg, #28a745, #20c997);">
                <div class="icon"><i class="fas fa-shopping-cart"></i></div>
                <h3>${data.summary.total_sales}</h3>
                <p>Sales Today</p>
            </div>
            <div class="action-card" style="background: linear-gradient(135deg, #ffc107, #fd7e14);">
                <div class="icon"><i class="fas fa-rupee-sign"></i></div>
                <h3>Rs.${data.summary.total_revenue.toFixed(0)}</h3>
                <p>Revenue Today</p>
            </div>
            <div class="action-card" style="background: linear-gradient(135deg, #17a2b8, #6f42c1);">
                <div class="icon"><i class="fas fa-check-circle"></i></div>
                <h3>${data.summary.paid_sales}</h3>
                <p>Paid Sales</p>
            </div>
            <div class="action-card" style="background: linear-gradient(135deg, #dc3545, #e83e8c);">
                <div class="icon"><i class="fas fa-clock"></i></div>
                <h3>${data.summary.unpaid_sales}</h3>
                <p>Unpaid Sales</p>
            </div>
        `;

        // Update daily sales list
        const salesList = document.getElementById('dailySalesList');

        if (data.sales.length === 0) {
            salesList.innerHTML = `
                <div class="no-alerts">
                    <i class="fas fa-calendar-day" style="font-size: 2em; margin-bottom: 10px;"></i>
                    <div>📅 No sales recorded today</div>
                    <div style="font-size: 0.9em; margin-top: 5px;">Start recording sales to see them here!</div>
                </div>
            `;
            return;
        }

        salesList.innerHTML = `
            <div class="sales-list">
                ${data.sales.map(sale => `
                    <div class="alert-item">
                        <div class="alert-info">
                            <h4>#${sale.id} - ${sale.customer_name}</h4>
                            <p>${sale.product_name} (${sale.company_name}) • Qty: ${sale.quantity_sold}</p>
                            <small>${new Date(sale.sale_date).toLocaleTimeString()}</small>
                        </div>
                        <div class="alert-status">
                            <div class="status ${sale.payment_status === 'paid' ? 'paid' : 'unpaid'}">
                                ${sale.payment_status === 'paid' ? '✅ Paid' : '💰 Unpaid'}
                            </div>
                            <div class="quantity">Rs.${sale.sale_amount.toFixed(2)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

    } catch (error) {
        console.error('Error loading daily sales:', error);
        document.getElementById('dailySalesSummary').innerHTML = '<div class="error">Error loading daily sales summary</div>';
        document.getElementById('dailySalesList').innerHTML = '<div class="error">Error loading daily sales</div>';
    }
}

async function loadStockData() {
    try {
        console.log('Loading stock data...');
        const response = await axios.get(`${API_BASE}/stock?t=${Date.now()}`); // Add timestamp to prevent caching
        stockData = response.data;
        console.log('Stock data loaded:', stockData.length, 'items');
        
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
        console.log('Loading products for search...');
        const response = await axios.get(`${API_BASE}/stock?t=${Date.now()}`); // Add timestamp to prevent caching
        allProducts = response.data;
        console.log('Products loaded for search:', allProducts.length, 'products');
        setupProductSearch();

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// CRITICAL FIX: Force refresh all UI elements that display stock quantities
async function forceRefreshAllStockUI() {
    try {
        console.log('🔄 Force refreshing all stock UI elements...');

        // 1. Reload fresh stock data from server
        const response = await axios.get(`${API_BASE}/stock?refresh=${Date.now()}`);
        const freshStockData = response.data;
        console.log('✅ Fresh stock data loaded:', freshStockData.length, 'items');

        // 2. Update global variables
        stockData = freshStockData;
        allProducts = freshStockData;

        // 3. Force refresh product search suggestions if visible
        const suggestions = document.getElementById('productSuggestions');
        if (suggestions && suggestions.style.display === 'block') {
            console.log('🔄 Refreshing product search suggestions...');
            setupProductSearch();
        }

        // 4. Force refresh product dropdown
        console.log('🔄 Refreshing product dropdown...');
        const productSelect = document.getElementById('productSelect');
        if (productSelect) {
            productSelect.innerHTML = '<option value="">Select a product...</option>';
            freshStockData.forEach(item => {
                if (item.quantity > 0) {
                    productSelect.innerHTML += `
                        <option value="${item.product_name}|${item.company_name}" data-stock="${item.quantity}">
                            ${item.product_name} (${item.company_name}) - ${item.quantity} available
                        </option>
                    `;
                }
            });
        }

        // 5. Clear any selected product to force re-selection with fresh data
        const selectedProductId = document.getElementById('selectedProductId');
        if (selectedProductId) {
            selectedProductId.value = '';
        }

        // 6. Clear product search input to force fresh search
        const productSearch = document.getElementById('productSearch');
        if (productSearch && productSearch.value) {
            console.log('🔄 Clearing product search to force refresh...');
            productSearch.value = '';
            suggestions.style.display = 'none';
        }

        console.log('✅ All stock UI elements refreshed successfully!');

    } catch (error) {
        console.error('❌ Error force refreshing stock UI:', error);
    }
}

// CRITICAL FIX: Force refresh daily sales UI immediately
async function forceRefreshDailySalesUI() {
    try {
        console.log('🔄 Force refreshing daily sales UI...');

        // Force reload daily sales with fresh timestamp
        const response = await axios.get(`${API_BASE}/sales/daily?refresh=${Date.now()}`);
        const freshDailySales = response.data;
        console.log('✅ Fresh daily sales loaded:', freshDailySales.sales.length, 'sales today');

        // Update daily sales summary cards immediately
        const summaryElement = document.getElementById('dailySalesSummary');
        if (summaryElement) {
            summaryElement.innerHTML = `
                <div class="action-card" style="background: linear-gradient(135deg, #28a745, #20c997);">
                    <div class="icon"><i class="fas fa-shopping-cart"></i></div>
                    <h3>${freshDailySales.summary.total_sales}</h3>
                    <p>Sales Today</p>
                </div>
                <div class="action-card" style="background: linear-gradient(135deg, #ffc107, #fd7e14);">
                    <div class="icon"><i class="fas fa-rupee-sign"></i></div>
                    <h3>Rs.${freshDailySales.summary.total_revenue.toFixed(0)}</h3>
                    <p>Revenue Today</p>
                </div>
                <div class="action-card" style="background: linear-gradient(135deg, #17a2b8, #6f42c1);">
                    <div class="icon"><i class="fas fa-check-circle"></i></div>
                    <h3>${freshDailySales.summary.paid_sales}</h3>
                    <p>Paid Sales</p>
                </div>
                <div class="action-card" style="background: linear-gradient(135deg, #dc3545, #e83e8c);">
                    <div class="icon"><i class="fas fa-clock"></i></div>
                    <h3>${freshDailySales.summary.unpaid_sales}</h3>
                    <p>Unpaid Sales</p>
                </div>
            `;
            console.log('✅ Daily sales summary cards updated');
        }

        // Update daily sales list immediately
        const salesList = document.getElementById('dailySalesList');
        if (salesList) {
            if (freshDailySales.sales.length === 0) {
                salesList.innerHTML = `
                    <div class="no-alerts">
                        <i class="fas fa-calendar-day" style="font-size: 2em; margin-bottom: 10px;"></i>
                        <div>📅 No sales recorded today</div>
                        <div style="font-size: 0.9em; margin-top: 5px;">Start recording sales to see them here!</div>
                    </div>
                `;
            } else {
                salesList.innerHTML = `
                    <div class="sales-list">
                        ${freshDailySales.sales.map(sale => `
                            <div class="alert-item">
                                <div class="alert-info">
                                    <h4>#${sale.id} - ${sale.customer_name}</h4>
                                    <p>${sale.product_name} (${sale.company_name}) • Qty: ${sale.quantity_sold}</p>
                                    <small>${new Date(sale.sale_date).toLocaleTimeString()}</small>
                                </div>
                                <div class="alert-status">
                                    <div class="status ${sale.payment_status === 'paid' ? 'paid' : 'unpaid'}">
                                        ${sale.payment_status === 'paid' ? '✅ Paid' : '💰 Unpaid'}
                                    </div>
                                    <div class="quantity">Rs.${sale.sale_amount.toFixed(2)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            console.log('✅ Daily sales list updated');
        }

        console.log('✅ Daily sales UI refreshed successfully!');

    } catch (error) {
        console.error('❌ Error force refreshing daily sales UI:', error);
    }
}

// Show refresh notification to user
function showRefreshNotification(message, type = 'info') {
    // Remove any existing notification
    const existingNotification = document.getElementById('refreshNotification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'refreshNotification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10001;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        max-width: 300px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #28a745, #20c997)' : 'linear-gradient(135deg, #17a2b8, #6f42c1)'};
    `;
    notification.innerHTML = message;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 3 seconds for success, 2 seconds for info
    setTimeout(() => {
        if (notification) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, type === 'success' ? 3000 : 2000);
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
                <div class="suggestion-item" onclick="selectProduct(${product.id}, '${product.product_name.replace(/'/g, "\\'")}', '${product.company_name.replace(/'/g, "\\'")}', ${product.quantity}, ${product.unit_price || 0})">
                    <div class="product-name"><strong>${product.product_name}</strong> (${product.company_name})</div>
                    <div class="product-info">
                        <span class="stock-info">📦 Available: ${product.quantity}</span> |
                        <span class="price-info">💰 Price: Rs.${product.unit_price ? product.unit_price.toFixed(2) : 'Not Set by Admin'}</span>
                    </div>
                </div>
            `).join('');
            suggestions.style.display = 'block';
        } else {
            suggestions.innerHTML = '<div class="suggestion-item no-results">No products found</div>';
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
    const unitPriceField = document.getElementById('unitPrice');

    // Set the search field value
    productSearch.value = `${productName} (${companyName})`;
    selectedProductId.value = id;
    suggestions.style.display = 'none';

    // Auto-fill unit price and show admin-set price
    if (unitPriceField) {
        if (unitPrice > 0) {
            unitPriceField.value = unitPrice.toFixed(2);
            unitPriceField.style.color = '#28a745';
            unitPriceField.style.fontWeight = 'bold';
        } else {
            unitPriceField.value = '';
            unitPriceField.placeholder = 'Price not set by admin';
            unitPriceField.style.color = '#dc3545';
        }
        updateTotalAmount(); // Calculate total if quantity is already entered
    }

    // Show success message for price loading
    if (unitPrice > 0) {
        showMessage(`Product selected! Admin price: Rs.${unitPrice.toFixed(2)}`, 'success');
    } else {
        showMessage('Warning: Price not set by admin for this product', 'warning');
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

// EMERGENCY SIMPLE SALE RECORDING FUNCTION
async function recordSaleEmergency() {
    try {
        console.log('🚨 EMERGENCY: Starting simple sale recording...');

        // Get form values directly
        const productSearch = document.getElementById('productSearch').value.trim();
        const customerName = document.getElementById('customer_name').value.trim();
        const quantity = parseInt(document.getElementById('quantity_sold').value);
        const paymentStatus = document.getElementById('payment_status').value;
        const paymentMethod = document.getElementById('payment_method').value;

        console.log('Form values:', { productSearch, customerName, quantity, paymentStatus, paymentMethod });

        // Basic validation
        if (!productSearch || !customerName || !quantity) {
            alert('❌ Please fill all required fields: Product, Customer Name, and Quantity');
            return;
        }

        // Find product by name (simple search)
        let selectedProduct = null;
        if (allProducts && allProducts.length > 0) {
            selectedProduct = allProducts.find(p =>
                p.product_name.toLowerCase().includes(productSearch.toLowerCase()) ||
                productSearch.toLowerCase().includes(p.product_name.toLowerCase())
            );
        }

        if (!selectedProduct) {
            alert('❌ Product not found. Available products: ' + (allProducts ? allProducts.map(p => p.product_name).join(', ') : 'None loaded'));
            return;
        }

        console.log('Selected product:', selectedProduct);

        // Use default unit price if not set
        const unitPrice = selectedProduct.unit_price || 100; // Default price

        const saleData = {
            product_name: selectedProduct.product_name,
            company_name: selectedProduct.company_name,
            customer_name: customerName,
            quantity_sold: quantity,
            unit_price: unitPrice,
            payment_status: paymentStatus || 'unpaid',
            payment_method: paymentMethod || null
        };

        console.log('🚨 EMERGENCY: Submitting sale data:', saleData);

        // Submit sale
        const response = await axios.post(`${API_BASE}/sales`, saleData);
        console.log('✅ EMERGENCY: Sale recorded successfully!', response.data);

        // Show success
        alert('✅ SALE RECORDED SUCCESSFULLY!\nSale ID: ' + response.data.sale_id + '\nAmount: Rs.' + response.data.sale_amount);

        // Close modal and refresh
        closeRecordSaleModal();
        await loadDashboardData();

    } catch (error) {
        console.error('❌ EMERGENCY: Sale recording failed:', error);
        alert('❌ SALE RECORDING FAILED!\nError: ' + (error.response?.data?.error || error.message));
    }
}

// EMERGENCY TEST FUNCTION - Direct sale recording
async function emergencyTestSale() {
    try {
        console.log('🚨 EMERGENCY TEST: Starting direct sale recording...');

        // Get available products
        const response = await axios.get(`${API_BASE}/stock`);
        const products = response.data;
        console.log('Available products:', products);

        if (!products || products.length === 0) {
            alert('❌ No products available in stock!');
            return;
        }

        // Find a product with stock
        const availableProduct = products.find(p => p.quantity > 0);
        if (!availableProduct) {
            alert('❌ No products with available stock!');
            return;
        }

        console.log('Using product for test:', availableProduct);

        // Create test sale data
        const testSaleData = {
            product_name: availableProduct.product_name,
            company_name: availableProduct.company_name,
            customer_name: 'EMERGENCY TEST CUSTOMER',
            quantity_sold: 1,
            unit_price: availableProduct.unit_price || 100,
            payment_status: 'paid',
            payment_method: 'cash'
        };

        console.log('🚨 EMERGENCY TEST: Submitting test sale:', testSaleData);

        // Submit test sale
        const saleResponse = await axios.post(`${API_BASE}/sales`, testSaleData);
        console.log('✅ EMERGENCY TEST: Sale recorded successfully!', saleResponse.data);

        // Show success
        alert('✅ EMERGENCY TEST SUCCESSFUL!\n' +
              'Sale ID: ' + saleResponse.data.sale_id + '\n' +
              'Product: ' + testSaleData.product_name + '\n' +
              'Amount: Rs.' + saleResponse.data.sale_amount + '\n' +
              'Stock should be updated automatically!');

        // Refresh dashboard
        await loadDashboardData();

    } catch (error) {
        console.error('❌ EMERGENCY TEST FAILED:', error);
        alert('❌ EMERGENCY TEST FAILED!\nError: ' + (error.response?.data?.error || error.message));
    }
}

// Record sale form handler
document.getElementById('recordSaleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('🚨 Form submitted - calling emergency function...');
    await recordSaleEmergency();
});

// BACKUP: Original complex form handler (commented out for debugging)
/*
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
*/

    try {
        console.log('Submitting sale data:', saleData);
        const response = await axios.post(`${API_BASE}/sales`, saleData);
        console.log('Sale response:', response.data);

        // Store the sale ID for receipt generation
        lastSaleId = response.data.sale_id;
        console.log('Sale ID stored:', lastSaleId);

        // Close record sale modal FIRST
        closeRecordSaleModal();

        // Show immediate refresh notification
        showRefreshNotification('🔄 Updating inventory and sales data...');

        // Show success modal with sale details immediately
        console.log('About to show success modal...');
        showSaleSuccessModal(response.data);

        // Immediately reload data to update stock and daily sales
        console.log('Reloading dashboard data immediately...');
        await loadDashboardData(); // Reload to update stock alerts and daily sales

        // Force refresh all UI elements that display stock quantities
        console.log('Force refreshing all UI elements...');
        await forceRefreshAllStockUI();

        // Force refresh daily sales UI immediately
        console.log('Force refreshing daily sales UI...');
        await forceRefreshDailySalesUI();

        // Show success notification
        showRefreshNotification('✅ Sale recorded! Inventory and sales updated successfully!', 'success');
        console.log('All UI elements refreshed successfully');

    } catch (error) {
        console.error('Sale submission error:', error);
        const errorMessage = error.response?.data?.error || 'Failed to record sale';
        showMessage(errorMessage, 'error');
    }
});

function showMessage(message, type) {
    // Create or get message container
    let messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'messageContainer';
        messageContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(messageContainer);
    }

    // Create message element
    const messageElement = document.createElement('div');
    const bgColor = type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#dc3545';
    const textColor = type === 'warning' ? '#212529' : 'white';

    messageElement.style.cssText = `
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 6px;
        color: ${textColor};
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        background-color: ${bgColor};
        border-left: 4px solid ${type === 'success' ? '#155724' : type === 'warning' ? '#856404' : '#721c24'};
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
    `;

    messageElement.innerHTML = `
        <div style="display: flex; align-items: center;">
            <span style="margin-right: 8px; font-size: 1.2em;">
                ${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌'}
            </span>
            <span>${message}</span>
        </div>
    `;

    messageContainer.appendChild(messageElement);

    // Animate in
    setTimeout(() => {
        messageElement.style.transform = 'translateX(0)';
    }, 10);

    // Remove message after 4 seconds
    setTimeout(() => {
        messageElement.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 300);
    }, 4000);
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
    console.log('Showing sale success modal with data:', saleData);

    const saleDetails = document.getElementById('saleDetails');
    if (!saleDetails) {
        console.error('saleDetails element not found!');
        return;
    }

    saleDetails.innerHTML = `
        <div style="background: linear-gradient(135deg, #e8f5e8, #f0f8f0); padding: 25px; border-radius: 12px; text-align: center; border: 3px solid #4CAF50;">
            <div style="background: #4CAF50; color: white; padding: 15px; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-check-circle" style="font-size: 2.5em;"></i>
            </div>
            <h4 style="color: #2e7d32; margin: 0 0 20px 0; font-size: 1.5em;">🎉 Sale Recorded Successfully!</h4>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="background: #4CAF50; color: white; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                    <h3 style="margin: 0; font-size: 1.2em;">📄 SALE ID: ${saleData.sale_id}</h3>
                </div>

                <div style="text-align: left; font-size: 1.1em; line-height: 1.6;">
                    <p><strong>👤 Customer:</strong> ${saleData.customer_name}</p>
                    <p><strong>📦 Product:</strong> ${saleData.product_name} (${saleData.company_name})</p>
                    <p><strong>🔢 Quantity:</strong> ${saleData.quantity_sold}</p>
                    <p><strong>💰 Unit Price:</strong> Rs.${saleData.unit_price}</p>
                    <p style="font-size: 1.3em; color: #2e7d32; background: #e8f5e8; padding: 10px; border-radius: 5px; text-align: center;">
                        <strong>💵 Total Amount: Rs.${saleData.sale_amount}</strong>
                    </p>
                    <p><strong>💳 Payment Status:</strong> ${saleData.payment_status === 'paid' ? '✅ Paid' : '💰 Unpaid'}</p>
                    ${saleData.payment_method ? `<p><strong>🏦 Payment Method:</strong> ${saleData.payment_method.toUpperCase()}</p>` : ''}
                </div>
            </div>
        </div>
    `;

    const modal = document.getElementById('saleSuccessModal');
    if (!modal) {
        console.error('saleSuccessModal element not found!');
        return;
    }

    modal.style.display = 'block';
    console.log('Sale success modal displayed');
}

function closeSaleSuccessModal() {
    document.getElementById('saleSuccessModal').style.display = 'none';
}



// Fix the function name for the Record Sale button
function showRecordSale() {
    showRecordSaleModal();
}

// Show record sale modal
function showRecordSaleModal() {
    console.log('Opening record sale modal...');
    document.getElementById('recordSaleModal').style.display = 'block';
    loadProducts(); // Load products for search
}

// Close record sale modal
function closeRecordSaleModal() {
    console.log('Closing record sale modal...');
    document.getElementById('recordSaleModal').style.display = 'none';
    document.getElementById('recordSaleForm').reset();
    document.getElementById('productSuggestions').style.display = 'none';
    document.getElementById('selectedProductId').value = '';
}

// Show receipt options (for the Download Receipt button)
function showReceiptOptions() {
    // Show receipt input modal with better UI
    document.getElementById('saleDetails').innerHTML = `
        <div style="background: linear-gradient(135deg, #e8f5e8, #f0f8f0); padding: 25px; border-radius: 12px; margin-bottom: 20px; text-align: center; border: 3px solid #4CAF50;">
            <div style="background: #4CAF50; color: white; padding: 15px; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-file-pdf" style="font-size: 2.5em;"></i>
            </div>
            <h4 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 1.4em;">📄 Receipt Generator</h4>
            <p style="color: #2e7d32; margin-bottom: 20px; font-size: 1.1em;">Enter any Sale ID to download or print its receipt</p>

            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <label for="receiptSaleIdInput" style="display: block; margin-bottom: 10px; font-weight: bold; color: #2e7d32; font-size: 1.1em;">Sale ID:</label>
                <input type="number" id="receiptSaleIdInput" placeholder="Enter sale ID (e.g., 1, 2, 3...)"
                       style="width: 80%; padding: 15px; border: 2px solid #4CAF50; border-radius: 8px; font-size: 18px; text-align: center; margin-bottom: 15px;"
                       value="${lastSaleId || ''}">
                <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin-top: 10px;">
                    <small style="color: #856404;">💡 Tip: The last recorded sale ID is automatically filled</small>
                </div>
            </div>
        </div>
    `;

    document.getElementById('saleSuccessModal').style.display = 'block';
}

// Download receipt
async function downloadReceipt() {
    console.log('Download receipt called, lastSaleId:', lastSaleId);

    // Try to get sale ID from input field first, then fallback to lastSaleId
    const inputElement = document.getElementById('receiptSaleIdInput');
    const saleId = inputElement ? inputElement.value : lastSaleId;

    console.log('Using sale ID:', saleId);

    if (!saleId) {
        showMessage('Please enter a sale ID or record a sale first', 'error');
        return;
    }

    try {
        console.log('Requesting receipt for sale ID:', saleId);

        // Show loading message
        showMessage('Generating receipt PDF...', 'success');

        const response = await axios.get(`${API_BASE}/sales/${saleId}/receipt`, {
            responseType: 'blob',
            timeout: 30000 // 30 second timeout
        });

        console.log('Receipt response received, size:', response.data.size);

        // Create blob and download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `SRI_LAKSHMI_RECEIPT_${saleId}_${new Date().toISOString().split('T')[0]}.pdf`);
        link.style.display = 'none';
        document.body.appendChild(link);

        // Trigger download
        link.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);

        showMessage(`Receipt downloaded successfully! Sale ID: ${saleId}`, 'success');

    } catch (error) {
        console.error('Error downloading receipt:', error);
        let errorMsg = 'Error downloading receipt.';

        if (error.code === 'ECONNABORTED') {
            errorMsg = 'Request timeout. Please try again.';
        } else if (error.response?.status === 404) {
            errorMsg = `Sale ID ${saleId} not found.`;
        } else if (error.response?.data?.error) {
            errorMsg = error.response.data.error;
        }

        showMessage(errorMsg, 'error');
    }
}

// Print receipt
async function printReceipt() {
    console.log('Print receipt called, lastSaleId:', lastSaleId);

    // Try to get sale ID from input field first, then fallback to lastSaleId
    const inputElement = document.getElementById('receiptSaleIdInput');
    const saleId = inputElement ? inputElement.value : lastSaleId;

    console.log('Using sale ID for print:', saleId);

    if (!saleId) {
        showMessage('Please enter a sale ID or record a sale first', 'error');
        return;
    }

    try {
        console.log('Requesting receipt for printing, sale ID:', saleId);

        // Show loading message
        showMessage('Preparing receipt for printing...', 'success');

        const response = await axios.get(`${API_BASE}/sales/${saleId}/receipt`, {
            responseType: 'blob',
            timeout: 30000
        });

        console.log('Receipt response received for printing, size:', response.data.size);

        // Create blob URL
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        // Open in new window for printing
        const printWindow = window.open(url, '_blank');

        if (printWindow) {
            printWindow.onload = function() {
                // Small delay to ensure PDF loads
                setTimeout(() => {
                    printWindow.print();
                }, 500);
            };
            showMessage(`Receipt opened for printing! Sale ID: ${saleId}`, 'success');
        } else {
            // Fallback if popup blocked
            showMessage('Popup blocked. Please allow popups and try again.', 'error');
        }

    } catch (error) {
        console.error('Error printing receipt:', error);
        let errorMsg = 'Error printing receipt.';

        if (error.code === 'ECONNABORTED') {
            errorMsg = 'Request timeout. Please try again.';
        } else if (error.response?.status === 404) {
            errorMsg = `Sale ID ${saleId} not found.`;
        } else if (error.response?.data?.error) {
            errorMsg = error.response.data.error;
        }

        showMessage(errorMsg, 'error');
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
