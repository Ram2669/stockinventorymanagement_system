#!/bin/bash

# 🌾 SRI LAKSHMI ENTERPRISES - Stock Inventory Management System
# Automated Setup Script for Linux/macOS

echo "🌾 Setting up SRI LAKSHMI ENTERPRISES Stock Inventory Management System..."
echo "=================================================================="

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "   macOS: brew install postgresql"
    exit 1
fi

echo "✅ PostgreSQL found"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️ Creating .env configuration file..."
    cat > .env << EOL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_management
DB_USER=inventory_user
DB_PASSWORD=change_this_password
EOL
    echo "📝 Please edit .env file with your database credentials!"
fi

# Make the script executable
chmod +x setup.sh

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your PostgreSQL credentials"
echo "2. Create PostgreSQL database and user (see SETUP_GUIDE.md)"
echo "3. Run: python app.py"
echo "4. Open docs/login.html in your browser"
echo ""
echo "📖 For detailed instructions, see SETUP_GUIDE.md"
echo ""
