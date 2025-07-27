// Global variables
let stocks = [];
let sales = [];
let selectedStock = null;
let lastSaleId = null;
let filteredStocks = [];
let searchTimeout = null;

// API base URL is now loaded from config.js
// const API_BASE is available globally from config.js

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Stock form
    document.getElementById('stockForm').addEventListener('submit', handleStockSubmit);

    // Sales form
    document.getElementById('salesForm').addEventListener('submit', handleSalesSubmit);

    // Product select change
    document.getElementById('productSelect').addEventListener('change', handleProductSelect);

    // Auto-calculate total amount when quantity or unit price changes
    document.getElementById('quantitySold').addEventListener('input', calculateTotalAmount);
    document.getElementById('unitPrice').addEventListener('input', calculateTotalAmount);

    // Show/hide payment method based on payment status
    document.getElementById('paymentStatus').addEventListener('change', handlePaymentStatusChange);
}

// Tab switching with enhanced animations
function showTab(tabName) {
    // Hide all tabs with fade out
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        if (tab.classList.contains('active')) {
            tab.style.opacity = '0';
            tab.style.transform = 'translateY(20px)';
            setTimeout(() => {
                tab.classList.remove('active');
            }, 200);
        }
    });

    // Remove active class from all nav tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => tab.classList.remove('active'));

    // Show selected tab with fade in
    setTimeout(() => {
        const selectedTab = document.getElementById(tabName);
        selectedTab.classList.add('active');
        selectedTab.style.opacity = '0';
        selectedTab.style.transform = 'translateY(20px)';

        setTimeout(() => {
            selectedTab.style.opacity = '1';
            selectedTab.style.transform = 'translateY(0)';
        }, 50);
    }, 200);

    // Add active class to clicked nav tab
    event.target.classList.add('active');

    // Load data when switching to certain tabs
    setTimeout(() => {
        if (tabName === 'dashboard') {
            updateDashboard();
        } else if (tabName === 'search') {
            initializeSearch();
        } else if (tabName === 'sales') {
            updateProductSelect();
        } else if (tabName === 'reports') {
            loadWeeklySales();
        }
    }, 250);
}

// Load initial data
async function loadData() {
    try {
        await Promise.all([loadStocks(), loadSales(), loadPaymentData()]);
        updateDashboard();
        updateStockList();
        updateProductSelect();
    } catch (error) {
        showToast('Error loading data', 'error');
    }
}

// Load stocks from API
async function loadStocks() {
    try {
        const response = await axios.get(`${API_BASE}/stock`);
        stocks = response.data;
    } catch (error) {
        console.error('Error loading stocks:', error);
        showToast('Error loading stocks', 'error');
    }
}

// Load sales from API
async function loadSales() {
    try {
        const response = await axios.get(`${API_BASE}/sales`);
        sales = response.data;
    } catch (error) {
        console.error('Error loading sales:', error);
        showToast('Error loading sales', 'error');
    }
}

// Handle stock form submission
async function handleStockSubmit(e) {
    e.preventDefault();
    
    const formData = {
        product_name: document.getElementById('productName').value,
        company_name: document.getElementById('companyName').value,
        quantity: parseInt(document.getElementById('quantity').value)
    };
    
    try {
        await axios.post(`${API_BASE}/stock`, formData);
        showToast('Stock added successfully', 'success');
        
        // Reset form
        document.getElementById('stockForm').reset();
        
        // Reload data
        await loadData();
    } catch (error) {
        showToast('Error adding stock', 'error');
    }
}

// Calculate total amount automatically
function calculateTotalAmount() {
    const quantity = parseFloat(document.getElementById('quantitySold').value) || 0;
    const unitPrice = parseFloat(document.getElementById('unitPrice').value) || 0;
    const totalAmount = quantity * unitPrice;

    document.getElementById('totalAmount').value = totalAmount.toFixed(2);
}

// Handle payment status change
function handlePaymentStatusChange() {
    const paymentStatus = document.getElementById('paymentStatus').value;
    const paymentMethodGroup = document.getElementById('paymentMethodGroup');

    if (paymentStatus === 'paid') {
        paymentMethodGroup.style.display = 'block';
        document.getElementById('paymentMethod').required = true;
    } else {
        paymentMethodGroup.style.display = 'none';
        document.getElementById('paymentMethod').required = false;
        document.getElementById('paymentMethod').value = '';
    }
}

// Handle sales form submission
async function handleSalesSubmit(e) {
    e.preventDefault();
    
    if (!selectedStock) {
        showToast('Please select a product', 'error');
        return;
    }
    
    const quantitySold = parseInt(document.getElementById('quantitySold').value);
    
    if (quantitySold > selectedStock.quantity) {
        showToast('Insufficient stock available', 'error');
        return;
    }
    
    const unitPrice = parseFloat(document.getElementById('unitPrice').value);
    const totalAmount = unitPrice * quantitySold;

    const formData = {
        product_name: selectedStock.product_name,
        company_name: selectedStock.company_name,
        quantity_sold: quantitySold,
        customer_name: document.getElementById('customerName').value,
        unit_price: unitPrice,
        payment_status: document.getElementById('paymentStatus').value,
        payment_method: document.getElementById('paymentMethod').value || null
    };
    
    try {
        const response = await axios.post(`${API_BASE}/sales`, formData);
        lastSaleId = response.data.sale_id;

        // Show success modal with sale details
        showSaleSuccessModal(formData);

        // Reset form
        document.getElementById('salesForm').reset();
        document.getElementById('selectedProductInfo').style.display = 'none';
        selectedStock = null;

        // Reload data
        await loadData();
    } catch (error) {
        const errorMsg = error.response?.data?.error || 'Error recording sale';
        showToast(errorMsg, 'error');
    }
}

// Handle product selection
function handleProductSelect(e) {
    const selectedValue = e.target.value;
    
    if (selectedValue) {
        const [productName, companyName] = selectedValue.split('|');
        selectedStock = stocks.find(s => s.product_name === productName && s.company_name === companyName);
        
        if (selectedStock) {
            // Update quantity input max value
            document.getElementById('quantitySold').max = selectedStock.quantity;
            document.getElementById('availableQty').textContent = `Available: ${selectedStock.quantity}`;
            
            // Show product details
            document.getElementById('productDetails').innerHTML = `
                <p><strong>Product:</strong> ${selectedStock.product_name}</p>
                <p><strong>Company:</strong> ${selectedStock.company_name}</p>
                <p><strong>Available Quantity:</strong> ${selectedStock.quantity}</p>
                <p><strong>Last Updated:</strong> ${new Date(selectedStock.date_added).toLocaleDateString()}</p>
            `;
            document.getElementById('selectedProductInfo').style.display = 'block';
        }
    } else {
        selectedStock = null;
        document.getElementById('selectedProductInfo').style.display = 'none';
        document.getElementById('availableQty').textContent = '';
    }
}

// Update dashboard
function updateDashboard() {
    const totalProducts = stocks.length;
    const totalStock = stocks.reduce((sum, stock) => sum + stock.quantity, 0);
    const totalSalesCount = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.sale_amount, 0);

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalStock').textContent = totalStock;
    document.getElementById('totalSales').textContent = totalSalesCount;
    document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;

    // Recent sales
    const recentSales = sales
        .sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date))
        .slice(0, 5);

    if (recentSales.length > 0) {
        const recentSalesHtml = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentSales.map(sale => `
                        <tr>
                            <td>${new Date(sale.sale_date).toLocaleDateString()}</td>
                            <td>${sale.customer_name}</td>
                            <td>${sale.product_name}</td>
                            <td>₹${sale.sale_amount.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('recentSales').innerHTML = recentSalesHtml;
    } else {
        document.getElementById('recentSales').innerHTML = '<p>No recent sales</p>';
    }

    // Low stock items
    const lowStockItems = stocks.filter(stock => stock.quantity < 10);

    if (lowStockItems.length > 0) {
        const lowStockHtml = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Company</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    ${lowStockItems.map(stock => `
                        <tr style="background-color: #fed7d7;">
                            <td>${stock.product_name}</td>
                            <td>${stock.company_name}</td>
                            <td>${stock.quantity}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('lowStock').innerHTML = lowStockHtml;
    } else {
        document.getElementById('lowStock').innerHTML = '<p style="color: #38a169;">All products have sufficient stock</p>';
    }
}

// Update stock list
function updateStockList() {
    displayStockList(stocks);
}

// Update product select dropdown
function updateProductSelect() {
    const productSelect = document.getElementById('productSelect');
    productSelect.innerHTML = '<option value="">Select a product...</option>';

    stocks.filter(stock => stock.quantity > 0).forEach(stock => {
        const option = document.createElement('option');
        option.value = `${stock.product_name}|${stock.company_name}`;
        option.textContent = `${stock.product_name} - ${stock.company_name} (Available: ${stock.quantity})`;
        productSelect.appendChild(option);
    });
}

// Load weekly sales
async function loadWeeklySales() {
    try {
        const response = await axios.get(`${API_BASE}/sales/weekly`);
        const weeklySales = response.data;

        const totalWeeklySales = weeklySales.length;
        const totalWeeklyRevenue = weeklySales.reduce((sum, sale) => sum + sale.sale_amount, 0);

        document.getElementById('weeklySalesCount').textContent = totalWeeklySales;
        document.getElementById('weeklyRevenue').textContent = `₹${totalWeeklyRevenue.toFixed(2)}`;

        // Weekly sales list
        if (weeklySales.length > 0) {
            const weeklySalesHtml = `
                <table class="table">
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
                        ${weeklySales
                            .sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date))
                            .map(sale => `
                                <tr>
                                    <td>${new Date(sale.sale_date).toLocaleDateString()}</td>
                                    <td>${sale.customer_name}</td>
                                    <td>${sale.product_name}</td>
                                    <td>${sale.company_name}</td>
                                    <td>${sale.quantity_sold}</td>
                                    <td>₹${sale.sale_amount.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>
            `;
            document.getElementById('weeklySalesList').innerHTML = weeklySalesHtml;
        } else {
            document.getElementById('weeklySalesList').innerHTML = '<p>No sales recorded this week</p>';
        }
    } catch (error) {
        showToast('Error loading weekly sales', 'error');
    }
}

// Download reports
async function downloadReport(type) {
    try {
        const endpoint = type === 'customer' ? 'customer' : 'date';
        const response = await axios.get(`${API_BASE}/reports/weekly/${endpoint}`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `weekly_report_by_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded successfully`, 'success');
    } catch (error) {
        showToast(`Error downloading ${type} report`, 'error');
    }
}

// Show sale success modal
function showSaleSuccessModal(saleData) {
    const modal = document.getElementById('saleSuccessModal');
    const saleDetails = document.getElementById('saleDetails');

    // Calculate total amount from unit price and quantity
    const totalAmount = (saleData.unit_price * saleData.quantity_sold).toFixed(2);

    saleDetails.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left;">
            <div><strong>Customer:</strong> ${saleData.customer_name}</div>
            <div><strong>Product:</strong> ${saleData.product_name}</div>
            <div><strong>Company:</strong> ${saleData.company_name}</div>
            <div><strong>Quantity:</strong> ${saleData.quantity_sold}</div>
            <div><strong>Unit Price:</strong> ₹${saleData.unit_price}</div>
            <div style="grid-column: 1 / -1; font-size: 1.1em; color: #28a745;"><strong>Total Amount:</strong> ₹${totalAmount}</div>
        </div>
    `;

    modal.style.display = 'block';

    // Auto close after 10 seconds
    setTimeout(() => {
        if (modal.style.display === 'block') {
            closeSaleModal();
        }
    }, 10000);
}

// Close sale modal
function closeSaleModal() {
    document.getElementById('saleSuccessModal').style.display = 'none';
}

// Download receipt
async function downloadReceipt(saleId = null) {
    const receiptSaleId = saleId || lastSaleId;

    if (!receiptSaleId) {
        showToast('No sale ID available for receipt', 'error');
        return;
    }

    try {
        const response = await axios.get(`${API_BASE}/sales/${receiptSaleId}/receipt`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `receipt_${receiptSaleId}_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        showToast('Receipt downloaded successfully', 'success');
        closeSaleModal();
    } catch (error) {
        showToast('Error downloading receipt', 'error');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const backgroundColor = type === 'success' ? '#48bb78' :
                           type === 'error' ? '#f56565' : '#4299e1';

    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: backgroundColor,
        stopOnFocus: true
    }).showToast();
}

// Search Functions
function initializeSearch() {
    filteredStocks = [...stocks];
    displaySearchResults(filteredStocks);
}

function performSearch() {
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    // Debounce search for better performance
    searchTimeout = setTimeout(() => {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        const filter = document.getElementById('searchFilter').value;
        const sortBy = document.getElementById('sortBy').value;

        // Start with all stocks
        let results = [...stocks];

        // Apply text search
        if (searchTerm) {
            results = results.filter(stock =>
                stock.product_name.toLowerCase().includes(searchTerm) ||
                stock.company_name.toLowerCase().includes(searchTerm) ||
                (stock.product_name + ' ' + stock.company_name).toLowerCase().includes(searchTerm)
            );
        }

        // Apply filters
        switch (filter) {
            case 'in-stock':
                results = results.filter(stock => stock.quantity > 0);
                break;
            case 'low-stock':
                results = results.filter(stock => stock.quantity > 0 && stock.quantity < 10);
                break;
            case 'out-of-stock':
                results = results.filter(stock => stock.quantity === 0);
                break;
        }

        // Apply sorting
        results.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.product_name.localeCompare(b.product_name);
                case 'company':
                    return a.company_name.localeCompare(b.company_name);
                case 'quantity':
                    return b.quantity - a.quantity;
                case 'date':
                    return new Date(b.date_added) - new Date(a.date_added);
                default:
                    return 0;
            }
        });

        filteredStocks = results;
        displaySearchResults(results, searchTerm);
    }, 300);
}

function displaySearchResults(results, searchTerm = '') {
    const resultsContainer = document.getElementById('searchResultsList');
    const countElement = document.getElementById('searchCount');

    countElement.textContent = `${results.length} product${results.length !== 1 ? 's' : ''} found`;

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search terms or filters</p>
            </div>
        `;
        return;
    }

    const resultsHtml = results.map(stock => {
        const quantityClass = getQuantityClass(stock.quantity);
        const highlightedName = highlightSearchTerm(stock.product_name, searchTerm);
        const highlightedCompany = highlightSearchTerm(stock.company_name, searchTerm);

        return `
            <div class="search-result-item">
                <div class="search-result-header">
                    <div class="search-result-title">${highlightedName}</div>
                    <div class="search-result-quantity ${quantityClass}">
                        ${stock.quantity} units
                    </div>
                </div>
                <div class="search-result-details">
                    <div class="search-result-detail">
                        <i class="fas fa-building"></i>
                        <span>${highlightedCompany}</span>
                    </div>
                    <div class="search-result-detail">
                        <i class="fas fa-calendar"></i>
                        <span>Added: ${new Date(stock.date_added).toLocaleDateString()}</span>
                    </div>
                    <div class="search-result-detail">
                        <i class="fas fa-barcode"></i>
                        <span>ID: ${stock.id}</span>
                    </div>
                    <div class="search-result-detail">
                        <i class="fas fa-info-circle"></i>
                        <span>${getStockStatus(stock.quantity)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    resultsContainer.innerHTML = resultsHtml;
}

function getQuantityClass(quantity) {
    if (quantity === 0) return 'quantity-zero';
    if (quantity < 10) return 'quantity-low';
    if (quantity < 50) return 'quantity-medium';
    return 'quantity-high';
}

function getStockStatus(quantity) {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    if (quantity < 50) return 'Medium Stock';
    return 'High Stock';
}

function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

function quickSearch(type) {
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('searchFilter');
    const sortSelect = document.getElementById('sortBy');

    // Clear search input
    searchInput.value = '';

    switch (type) {
        case 'low-stock':
            filterSelect.value = 'low-stock';
            sortSelect.value = 'quantity';
            break;
        case 'high-stock':
            filterSelect.value = 'in-stock';
            sortSelect.value = 'quantity';
            break;
        case 'out-of-stock':
            filterSelect.value = 'out-of-stock';
            sortSelect.value = 'name';
            break;
        case 'recent':
            filterSelect.value = 'all';
            sortSelect.value = 'date';
            break;
    }

    performSearch();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchFilter').value = 'all';
    document.getElementById('sortBy').value = 'name';
    performSearch();
}

// Stock page search
function searchStock() {
    const searchTerm = document.getElementById('stockSearchInput').value.toLowerCase().trim();

    if (!searchTerm) {
        updateStockList();
        return;
    }

    const filteredStocks = stocks.filter(stock =>
        stock.product_name.toLowerCase().includes(searchTerm) ||
        stock.company_name.toLowerCase().includes(searchTerm)
    );

    displayStockList(filteredStocks, searchTerm);
}

function displayStockList(stocksToDisplay, searchTerm = '') {
    const stockListElement = document.getElementById('stockList');

    if (stocksToDisplay.length > 0) {
        const stockListHtml = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Company Name</th>
                        <th>Quantity</th>
                        <th>Date Added</th>
                    </tr>
                </thead>
                <tbody>
                    ${stocksToDisplay.map(stock => `
                        <tr>
                            <td>${highlightSearchTerm(stock.product_name, searchTerm)}</td>
                            <td>${highlightSearchTerm(stock.company_name, searchTerm)}</td>
                            <td><span class="search-result-quantity ${getQuantityClass(stock.quantity)}">${stock.quantity}</span></td>
                            <td>${new Date(stock.date_added).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        stockListElement.innerHTML = stockListHtml;
    } else {
        stockListElement.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>No products found matching your search</p></div>';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('saleSuccessModal');
    if (event.target === modal) {
        closeSaleModal();
    }
}

// Load payment data
async function loadPaymentData() {
    try {
        const [paidResponse, unpaidResponse, summaryResponse] = await Promise.all([
            axios.get(`${API_BASE}/sales/paid`),
            axios.get(`${API_BASE}/sales/unpaid`),
            axios.get(`${API_BASE}/sales/payment-summary`)
        ]);

        window.paidSales = paidResponse.data;
        window.unpaidSales = unpaidResponse.data;
        window.paymentSummary = summaryResponse.data;

        updatePaymentTables();
        updatePaymentSummary();
    } catch (error) {
        console.error('Error loading payment data:', error);
        showToast('Error loading payment data', 'error');
    }
}

// Update payment summary cards
function updatePaymentSummary() {
    if (!window.paymentSummary) return;

    const summary = window.paymentSummary;

    document.getElementById('paidAmount').textContent = `Rs.${summary.paid_amount.toFixed(2)}`;
    document.getElementById('paidCount').textContent = `${summary.paid_count} transactions`;

    document.getElementById('unpaidAmount').textContent = `Rs.${summary.unpaid_amount.toFixed(2)}`;
    document.getElementById('unpaidCount').textContent = `${summary.unpaid_count} transactions`;

    document.getElementById('paymentPercentage').textContent = `${summary.payment_percentage.toFixed(1)}%`;
}

// Update payment tables
function updatePaymentTables() {
    updatePaidSalesTable();
    updateUnpaidSalesTable();
}

// Update paid sales table
function updatePaidSalesTable() {
    const tbody = document.querySelector('#paidSalesTable tbody');
    tbody.innerHTML = '';

    if (!window.paidSales || window.paidSales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #666;">No paid sales found</td></tr>';
        return;
    }

    window.paidSales.forEach(sale => {
        const row = document.createElement('tr');
        const paymentDate = sale.payment_date ? new Date(sale.payment_date).toLocaleDateString() : 'N/A';

        row.innerHTML = `
            <td>${new Date(sale.sale_date).toLocaleDateString()}</td>
            <td>${sale.customer_name}</td>
            <td>${sale.product_name}</td>
            <td>${sale.quantity_sold}</td>
            <td>Rs.${sale.unit_price.toFixed(2)}</td>
            <td style="font-weight: bold; color: #28a745;">Rs.${sale.sale_amount.toFixed(2)}</td>
            <td><span class="payment-method">${sale.payment_method ? sale.payment_method.toUpperCase() : 'N/A'}</span></td>
            <td>${paymentDate}</td>
            <td><button class="btn btn-sm btn-primary" onclick="downloadReceipt(${sale.id})">📄 Receipt</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Update unpaid sales table
function updateUnpaidSalesTable() {
    const tbody = document.querySelector('#unpaidSalesTable tbody');
    tbody.innerHTML = '';

    if (!window.unpaidSales || window.unpaidSales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #666;">No unpaid sales found</td></tr>';
        return;
    }

    window.unpaidSales.forEach(sale => {
        const row = document.createElement('tr');
        const saleDate = new Date(sale.sale_date);
        const daysPending = Math.floor((new Date() - saleDate) / (1000 * 60 * 60 * 24));

        row.innerHTML = `
            <td>${saleDate.toLocaleDateString()}</td>
            <td>${sale.customer_name}</td>
            <td>${sale.product_name}</td>
            <td>${sale.quantity_sold}</td>
            <td>Rs.${sale.unit_price.toFixed(2)}</td>
            <td style="font-weight: bold; color: #dc3545;">Rs.${sale.sale_amount.toFixed(2)}</td>
            <td><span class="days-pending">${daysPending} days</span></td>
            <td>
                <button class="btn btn-sm btn-success" onclick="markAsPaid(${sale.id})">✅ Mark Paid</button>
            </td>
            <td><button class="btn btn-sm btn-primary" onclick="downloadReceipt(${sale.id})">📄 Receipt</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Mark sale as paid
async function markAsPaid(saleId) {
    const paymentMethod = prompt('Payment method (cash/card/upi/bank_transfer/cheque):');
    if (!paymentMethod) return;

    try {
        await axios.put(`${API_BASE}/sales/${saleId}/payment`, {
            payment_status: 'paid',
            payment_method: paymentMethod.toLowerCase()
        });

        showToast('Payment status updated successfully!', 'success');
        await loadPaymentData(); // Reload payment data
    } catch (error) {
        console.error('Error updating payment status:', error);
        showToast('Error updating payment status', 'error');
    }
}
