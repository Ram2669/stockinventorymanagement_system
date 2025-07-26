#!/usr/bin/env python3
"""
Production server runner for SRI LAKSHMI ENTERPRISES
This script runs the Flask application with proper configuration
"""

import os
from app import create_app

def run_server():
    """Run the Flask application"""
    # Get configuration from environment
    config_name = os.getenv('FLASK_ENV', 'development')
    
    # Create the application
    app, db, Stock, Sale = create_app(config_name)
    
    # Get host and port from environment or use defaults
    host = os.getenv('FLASK_HOST', '0.0.0.0')  # 0.0.0.0 allows external connections
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    print("🌾 Starting SRI LAKSHMI ENTERPRISES API Server")
    print(f"🌐 Server will be available at: http://{host}:{port}")
    print(f"🔧 Environment: {config_name}")
    print(f"🐛 Debug mode: {debug}")
    
    # Run the application
    app.run(host=host, port=port, debug=debug)

if __name__ == "__main__":
    run_server()
