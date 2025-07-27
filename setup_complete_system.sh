#!/bin/bash

# 🌾 SRI LAKSHMI ENTERPRISES - Complete System Setup Script
# This script automates the entire setup process

echo "🌾 SRI LAKSHMI ENTERPRISES - Complete System Setup"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Step 1: Check prerequisites
print_info "Step 1: Checking prerequisites..."

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_status "Python found: $PYTHON_VERSION"
else
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    POSTGRES_VERSION=$(psql --version | cut -d' ' -f3)
    print_status "PostgreSQL found: $POSTGRES_VERSION"
else
    print_error "PostgreSQL is not installed. Please install PostgreSQL 12 or higher."
    exit 1
fi

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    print_status "Git found: $GIT_VERSION"
else
    print_error "Git is not installed. Please install Git."
    exit 1
fi

# Step 2: Create virtual environment
print_info "Step 2: Setting up Python virtual environment..."

if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_status "Virtual environment created"
else
    print_warning "Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate
print_status "Virtual environment activated"

# Step 3: Install Python dependencies
print_info "Step 3: Installing Python dependencies..."

pip install --upgrade pip
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    print_status "Python dependencies installed successfully"
else
    print_error "Failed to install Python dependencies"
    exit 1
fi

# Step 4: Database setup
print_info "Step 4: Setting up PostgreSQL database..."

# Check if database exists
DB_EXISTS=$(sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -w stockinventory)

if [ -z "$DB_EXISTS" ]; then
    print_info "Creating database and user..."
    
    # Create database and user
    sudo -u postgres psql << EOF
CREATE DATABASE stockinventory;
CREATE USER stockuser WITH PASSWORD 'stockpass123';
GRANT ALL PRIVILEGES ON DATABASE stockinventory TO stockuser;
ALTER USER stockuser CREATEDB;
\q
EOF

    if [ $? -eq 0 ]; then
        print_status "Database and user created successfully"
    else
        print_error "Failed to create database and user"
        exit 1
    fi
else
    print_warning "Database 'stockinventory' already exists"
fi

# Step 5: Test database connection
print_info "Step 5: Testing database connection..."

PGPASSWORD=stockpass123 psql -h localhost -U stockuser -d stockinventory -c "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_status "Database connection successful"
else
    print_error "Database connection failed"
    exit 1
fi

# Step 6: Create environment file
print_info "Step 6: Creating environment configuration..."

if [ ! -f ".env" ]; then
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://stockuser:stockpass123@localhost:5432/stockinventory
POSTGRES_USER=stockuser
POSTGRES_PASSWORD=stockpass123
POSTGRES_DB=stockinventory
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Flask Configuration
FLASK_APP=backend/app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here-change-this-in-production

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,file://

# API Configuration
API_BASE_URL=http://localhost:5001/api
EOF
    print_status "Environment file created"
else
    print_warning "Environment file already exists"
fi

# Step 7: Run database migrations
print_info "Step 7: Running database migrations..."

cd backend
python migrate_user_system.py

if [ $? -eq 0 ]; then
    print_status "Database migrations completed successfully"
else
    print_error "Database migrations failed"
    exit 1
fi

cd ..

# Step 8: Add sample data (optional)
print_info "Step 8: Adding sample stock data..."

python << EOF
from backend.app import app, db
from backend.models import Stock

with app.app_context():
    # Create sample stock items
    sample_items = [
        Stock(product_name='Urea', company_name='nagarjuna', quantity=100),
        Stock(product_name='20:20 Fertilizer', company_name='gromor', quantity=50),
        Stock(product_name='Wheat Seeds', company_name='AgriSeeds Ltd', quantity=200),
        Stock(product_name='Organic Compost', company_name='EcoFarm', quantity=75),
        Stock(product_name='Irrigation Pipes', company_name='AquaTech', quantity=30)
    ]
    
    for item in sample_items:
        existing = Stock.query.filter_by(product_name=item.product_name, company_name=item.company_name).first()
        if not existing:
            db.session.add(item)
    
    db.session.commit()
    print('Sample stock data added successfully!')
EOF

if [ $? -eq 0 ]; then
    print_status "Sample data added successfully"
else
    print_warning "Sample data addition failed (this is optional)"
fi

# Step 9: Create startup script
print_info "Step 9: Creating startup script..."

cat > start_system.sh << 'EOF'
#!/bin/bash

echo "🌾 Starting SRI LAKSHMI ENTERPRISES System..."

# Activate virtual environment
source venv/bin/activate

# Start backend server
cd backend
echo "Starting Flask server on http://localhost:5001"
python app.py &

# Store the PID
FLASK_PID=$!
echo $FLASK_PID > ../flask.pid

echo "✅ System started successfully!"
echo "📊 Admin Dashboard: file://$(pwd)/../docs/admin-dashboard.html"
echo "👤 Salesperson Dashboard: file://$(pwd)/../docs/salesperson-dashboard.html"
echo "🔑 Login Page: file://$(pwd)/../docs/login.html"
echo ""
echo "To stop the system, run: kill $(cat ../flask.pid)"

# Wait for Flask to start
sleep 2

# Test API
if curl -s http://localhost:5001/api/stock > /dev/null; then
    echo "✅ API is responding correctly"
else
    echo "⚠️  API might not be ready yet, please wait a moment"
fi

cd ..
EOF

chmod +x start_system.sh
print_status "Startup script created"

# Step 10: Create stop script
cat > stop_system.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping SRI LAKSHMI ENTERPRISES System..."

if [ -f "flask.pid" ]; then
    PID=$(cat flask.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        rm flask.pid
        echo "✅ System stopped successfully"
    else
        echo "⚠️  System was not running"
        rm flask.pid
    fi
else
    echo "⚠️  No PID file found, system might not be running"
fi
EOF

chmod +x stop_system.sh
print_status "Stop script created"

# Final success message
echo ""
echo "🎉 SETUP COMPLETED SUCCESSFULLY! 🎉"
echo "=================================="
echo ""
print_status "SRI LAKSHMI ENTERPRISES system is ready to use!"
echo ""
echo "📋 Next Steps:"
echo "1. Start the system: ./start_system.sh"
echo "2. Open your browser and go to: file://$(pwd)/docs/login.html"
echo "3. Register your first admin user"
echo "4. Start managing your agricultural business!"
echo ""
echo "📚 Documentation:"
echo "- Complete Setup Guide: COMPLETE_DEPLOYMENT_GUIDE.md"
echo "- GitHub Repository: https://github.com/Ram2669/stockinventorymanagement_system"
echo ""
echo "🔧 System Management:"
echo "- Start system: ./start_system.sh"
echo "- Stop system: ./stop_system.sh"
echo "- Backend API: http://localhost:5001"
echo ""
print_status "Happy farming! 🌾"
