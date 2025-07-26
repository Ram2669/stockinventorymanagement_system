// Configuration for SRI LAKSHMI ENTERPRISES Stock Management System

// API Configuration
const CONFIG = {
    // Local development API URL
    LOCAL_API_URL: 'http://localhost:5001/api',

    // Production API URL (your local machine's IP address)
    // Replace 'YOUR_LOCAL_IP' with your actual local IP address
    // You can find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)
    // NOTE: This only works for users on the same network as your computer
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
    },

    // Check if API is accessible
    async checkConnection() {
        try {
            const response = await fetch(this.getApiUrl().replace('/api', ''), {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
};

// Export the API base URL
window.API_BASE = CONFIG.getApiUrl();
window.CONFIG = CONFIG;

console.log('🌾 SRI LAKSHMI ENTERPRISES - API Configuration');
console.log('Current environment:', window.location.hostname);
console.log('API Base URL:', window.API_BASE);

// Check connection on page load
window.addEventListener('DOMContentLoaded', async function() {
    const isConnected = await CONFIG.checkConnection();
    if (!isConnected && window.location.hostname.includes('github.io')) {
        // Show connection warning for GitHub Pages users
        showConnectionWarning();
    }
});

function showConnectionWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.id = 'connection-warning';
    warningDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #ff6b6b, #ffa500);
        color: white;
        padding: 15px;
        text-align: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    warningDiv.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto;">
            <h3 style="margin: 0 0 10px 0;">⚠️ Backend Server Not Accessible</h3>
            <p style="margin: 0; font-size: 14px;">
                This system requires a local backend server to function.
                <strong>For full functionality:</strong><br>
                1. The system owner must start their local server<br>
                2. You must be on the same network as the server<br>
                3. Or use the local version: <a href="#" style="color: #fff; text-decoration: underline;" onclick="showLocalInstructions()">Click here for instructions</a>
            </p>
            <button onclick="document.getElementById('connection-warning').style.display='none'"
                    style="margin-top: 10px; padding: 5px 15px; background: rgba(255,255,255,0.2); border: 1px solid white; color: white; border-radius: 3px; cursor: pointer;">
                Dismiss
            </button>
        </div>
    `;
    document.body.insertBefore(warningDiv, document.body.firstChild);
}

function showLocalInstructions() {
    alert(`To run this system locally:

1. Download the code from: https://github.com/Ram2669/stockinventorymanagement_system
2. Follow the setup guide in FULL_SYSTEM_SETUP.txt
3. Start the backend server: python backend/app.py
4. Open frontend_simple/index.html in your browser

This will give you full access to all features with your own local database.`);
}
