// Configuration for SRI LAKSHMI ENTERPRISES Stock Management System

// API Configuration
const CONFIG = {
    // Local development API URL
    LOCAL_API_URL: 'http://localhost:5001/api',

    // Production API URL (your local machine's IP address)
    // Replace 'YOUR_LOCAL_IP' with your actual local IP address
    // You can find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)
    PRODUCTION_API_URL: 'http://192.168.1.29:5001/api',
    
    // Determine which API URL to use
    getApiUrl: function() {
        // Check if we're running on GitHub Pages
        if (window.location.hostname.includes('github.io')) {
            return this.PRODUCTION_API_URL;
        }
        // Check if we're running locally
        else if (window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' ||
                 window.location.protocol === 'file:') {
            return this.LOCAL_API_URL;
        }
        // Default to local for development
        else {
            return this.LOCAL_API_URL;
        }
    }
};

// Export the API base URL
window.API_BASE = CONFIG.getApiUrl();

console.log('🌾 SRI LAKSHMI ENTERPRISES - API Configuration');
console.log('Current environment:', window.location.hostname);
console.log('API Base URL:', window.API_BASE);
