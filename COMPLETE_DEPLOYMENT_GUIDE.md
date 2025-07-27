# 🌾 SRI LAKSHMI ENTERPRISES - Complete Deployment Guide

## 📋 System Overview

This is a complete inventory management system with role-based access control for agricultural businesses. The system includes:

- **Admin Dashboard**: Full analytics, user management, sales tracking
- **Salesperson Dashboard**: Sales recording, stock alerts, receipt generation
- **Payment Tracking**: Comprehensive payment status management
- **Receipt Generation**: PDF receipts with payment status
- **Weekly Reports**: Customer and date-based PDF reports
- **User Management**: Admin and salesperson roles with authentication

## 🛠️ Prerequisites

### System Requirements
- **Operating System**: Linux, macOS, or Windows
- **Python**: 3.8 or higher
- **PostgreSQL**: 12 or higher
- **Git**: Latest version
- **Web Browser**: Chrome, Firefox, Safari, or Edge

### Hardware Requirements
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: Minimum 2GB free space
- **Network**: Internet connection for initial setup

## 📥 Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Ram2669/stockinventorymanagement_system.git

# Navigate to project directory
cd stockinventorymanagement_system

# Check project structure
ls -la
```

## 🐘 Step 2: PostgreSQL Installation & Setup

### On Ubuntu/Debian:
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check PostgreSQL status
sudo systemctl status postgresql
```

### On CentOS/RHEL:
```bash
# Install PostgreSQL
sudo yum install postgresql-server postgresql-contrib

# Initialize database
sudo postgresql-setup initdb

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### On macOS:
```bash
# Using Homebrew
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Or using MacPorts
sudo port install postgresql12-server
```

### On Windows:
1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the 'postgres' user
4. Add PostgreSQL bin directory to your PATH environment variable

## 🔧 Step 3: Database Configuration

### Create Database and User
```bash
# Switch to postgres user (Linux/macOS)
sudo -u postgres psql

# Or connect directly (Windows/macOS with Homebrew)
psql -U postgres
```

```sql
-- Create database
CREATE DATABASE stockinventory;

-- Create user with password
CREATE USER stockuser WITH PASSWORD 'stockpass123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE stockinventory TO stockuser;

-- Exit PostgreSQL
\q
```

### Test Database Connection
```bash
# Test connection
psql -h localhost -U stockuser -d stockinventory

# If successful, you should see:
# stockinventory=>

# Exit
\q
```

## 🐍 Step 4: Python Environment Setup

### Create Virtual Environment
```bash
# Navigate to project directory
cd stockinventorymanagement_system

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Verify activation (should show project path)
which python
```

### Install Dependencies
```bash
# Upgrade pip
pip install --upgrade pip

# Install required packages
pip install flask flask-sqlalchemy flask-migrate flask-cors
pip install psycopg2-binary reportlab python-dotenv
pip install werkzeug sqlalchemy

# Verify installations
pip list
```

## ⚙️ Step 5: Environment Configuration

### Create Environment File
```bash
# Create .env file in project root
touch .env

# Edit .env file (use nano, vim, or any text editor)
nano .env
```

### Add Configuration to .env:
```env
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
```

## 🗄️ Step 6: Database Migration

### Run Migration Script
```bash
# Navigate to backend directory
cd backend

# Make migration script executable (Linux/macOS)
chmod +x migrate_user_system.py

# Run database migration
python migrate_user_system.py

# You should see:
# ✅ User management tables created successfully!
```

### Initialize Sample Data (Optional)
```bash
# Create sample stock data
python -c "
from app import app, db
from models import Stock

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
    print('✅ Sample stock data added successfully!')
"
```

## 🚀 Step 7: Start the Application

### Start Backend Server
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment if not already active
source ../venv/bin/activate  # Linux/macOS
# or
..\venv\Scripts\activate     # Windows

# Start Flask server
python app.py

# You should see:
# * Running on http://127.0.0.1:5001
# * Debug mode: on
```

### Test Backend API
```bash
# Open new terminal and test API
curl http://localhost:5001/api/stock

# Should return JSON with stock data
```

### Access Frontend
```bash
# Open your web browser and navigate to:
file:///path/to/your/project/stockinventorymanagement_system/docs/login.html

# Or use a simple HTTP server:
cd docs
python -m http.server 8000

# Then access: http://localhost:8000/login.html
```

## 👤 Step 8: Initial User Setup

### Register First Admin User
1. **Open Login Page**: Navigate to login.html in your browser
2. **Click "Register First Admin"**: Should be prominently displayed
3. **Fill Registration Form**:
   - Full Name: Your Name
   - Username: admin
   - Email: admin@yourdomain.com
   - Password: admin123 (change in production)
4. **Submit**: Admin account will be created

### Login and Test System
1. **Login as Admin**: Use the credentials you just created
2. **Explore Dashboard**: Check analytics, user management, reports
3. **Create Salesperson**: Use "Add Salesperson" to create sales accounts
4. **Test Features**: Record sales, generate receipts, download reports

## 🎯 Step 9: System Features Testing

### Test Admin Dashboard
- [ ] Login with admin credentials
- [ ] View business analytics and KPIs
- [ ] Check customer analysis data
- [ ] Download weekly reports (by customer and date)
- [ ] Generate receipts by entering sale ID
- [ ] Add new salesperson users
- [ ] Test logout functionality

### Test Salesperson Dashboard
- [ ] Login with salesperson credentials
- [ ] Record new sales transactions
- [ ] View stock alerts for low inventory
- [ ] Download/print receipts after sales
- [ ] Access weekly reports
- [ ] Test receipt generator with sale ID input
- [ ] Test logout functionality

### Test Security Features
- [ ] Logout and press back button (should redirect to login)
- [ ] Try accessing dashboard without login (should redirect)
- [ ] Test role-based access (salesperson can't access admin features)

## 🔧 Step 10: Production Configuration

### Security Settings
```bash
# Generate secure secret key
python -c "import secrets; print(secrets.token_hex(32))"

# Update .env file with secure settings
```

Update .env for production:
```env
FLASK_ENV=production
SECRET_KEY=your-generated-secure-key-here
CORS_ORIGINS=https://yourdomain.com
```

### Database Security
```sql
-- Connect to PostgreSQL as admin
sudo -u postgres psql

-- Create production user with limited privileges
CREATE USER produser WITH PASSWORD 'secure-production-password';
GRANT CONNECT ON DATABASE stockinventory TO produser;
GRANT USAGE ON SCHEMA public TO produser;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO produser;
```

## 📊 Step 11: Verification & Testing

### System Health Check
```bash
# Test all API endpoints
curl http://localhost:5001/api/stock
curl http://localhost:5001/api/sales
curl http://localhost:5001/api/auth/check-admin-exists

# Test database connection
python -c "
from backend.app import app, db
with app.app_context():
    try:
        db.engine.execute('SELECT 1')
        print('✅ Database connection successful')
    except Exception as e:
        print(f'❌ Database connection failed: {e}')
"
```

### Feature Testing Checklist
- [ ] Admin login works
- [ ] Salesperson registration works
- [ ] Sales recording works
- [ ] Receipt generation works
- [ ] Weekly reports download
- [ ] Payment tracking works
- [ ] Stock alerts display
- [ ] Logout security works

## 🚨 Troubleshooting

### Common Issues & Solutions

#### Database Connection Error
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check database exists
psql -U postgres -l
```

#### Python Module Not Found
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall requirements
pip install flask flask-sqlalchemy flask-migrate flask-cors psycopg2-binary reportlab python-dotenv werkzeug sqlalchemy
```

#### Port Already in Use
```bash
# Find process using port 5001
lsof -i :5001

# Kill process if needed
kill -9 <PID>

# Or use different port
export FLASK_RUN_PORT=5002
```

#### Permission Denied
```bash
# Fix file permissions
chmod +x backend/migrate_user_system.py
chmod -R 755 stockinventorymanagement_system/
```

## 📞 Support & Maintenance

### Regular Maintenance
```bash
# Backup database
pg_dump -U stockuser stockinventory > backup_$(date +%Y%m%d).sql

# Update system
git pull origin main
pip install --upgrade flask flask-sqlalchemy flask-migrate flask-cors psycopg2-binary reportlab python-dotenv werkzeug sqlalchemy

# Restart services
sudo systemctl restart postgresql
```

### Monitoring
- Check logs regularly: `tail -f backend/app.log`
- Monitor database size: `SELECT pg_size_pretty(pg_database_size('stockinventory'));`
- Check system resources: `htop` or `top`

## 🎉 Congratulations!

Your SRI LAKSHMI ENTERPRISES inventory management system is now fully deployed and ready for use!

### System Features Available:
✅ **Complete User Management** - Admin and salesperson roles
✅ **Inventory Tracking** - Stock management with alerts
✅ **Sales Recording** - With payment status tracking
✅ **Receipt Generation** - PDF receipts with company branding
✅ **Weekly Reports** - Customer and date-based analytics
✅ **Payment Tracking** - Comprehensive payment management
✅ **Security Features** - Secure authentication and session management

### Access Points:
- **Admin Dashboard**: Full system control and analytics
- **Salesperson Dashboard**: Sales recording and stock alerts
- **Receipt Generation**: Download/print receipts for any sale
- **Weekly Reports**: Business intelligence and reporting

### Default Test Accounts:
After initial setup, create your admin account through the registration interface.

### Live System:
- **GitHub Repository**: https://github.com/Ram2669/stockinventorymanagement_system
- **GitHub Pages Demo**: https://ram2669.github.io/stockinventorymanagement_system/login.html

**Your agricultural business management system is ready for production use!** 🌾📊

## 📋 Quick Commands Summary

```bash
# Clone and setup
git clone https://github.com/Ram2669/stockinventorymanagement_system.git
cd stockinventorymanagement_system

# Database setup
sudo -u postgres psql
CREATE DATABASE stockinventory;
CREATE USER stockuser WITH PASSWORD 'stockpass123';
GRANT ALL PRIVILEGES ON DATABASE stockinventory TO stockuser;
\q

# Python environment
python3 -m venv venv
source venv/bin/activate
pip install flask flask-sqlalchemy flask-migrate flask-cors psycopg2-binary reportlab python-dotenv werkzeug sqlalchemy

# Database migration
cd backend
python migrate_user_system.py

# Start application
python app.py

# Access system
# Open browser: file:///path/to/project/docs/login.html
```

**Perfect deployment guide for any system! 🚀**
